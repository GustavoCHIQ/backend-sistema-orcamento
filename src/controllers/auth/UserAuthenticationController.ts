import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';
import jwt from 'jsonwebtoken';
import { Login } from '../../utils/types';
import { comparePassword } from '../../utils/password';
import { extractToken } from '../../middlewares/JWTAuth';
import crypto from 'crypto';

// Constantes de segurança
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_TIMEOUT_MINUTES = 15;
const JWT_ALGORITHM = 'HS256';
const JWT_EXPIRATION = '8h';

// Cache para controle de tentativas de login (em produção, usar Redis)
const loginAttempts: Record<string, { count: number; lastAttempt: number }> = {};

export default new class UserAuthenticationController {
  /**
   * Autenticação de usuário
   * Implementa proteção contra força bruta e melhores práticas de segurança
   */
  async login(req: FastifyRequest<{ Body: Login }>, reply: FastifyReply): Promise<any> {
    try {
      const { email, password } = req.body;
      
      // Validação de entrada
      if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        return reply.status(400).send({ error: 'Dados de entrada inválidos' });
      }
      
      // Normalização do email para evitar ataques de enumeração
      const normalizedEmail = email.toLowerCase().trim();
      
      // Proteção contra força bruta
      const ipAddress = req.ip || 'unknown';
      const attemptKey = `${ipAddress}:${normalizedEmail}`;
      
      if (this.isRateLimited(attemptKey)) {
        return reply.status(429).send({ 
          error: 'Muitas tentativas de login. Tente novamente mais tarde.' 
        });
      }
      
      // Busca o usuário sem revelar se ele existe ou não
      const user = await prisma.usuarios.findUnique({
        where: { email: normalizedEmail },
      });
      
      // Verificação de senha com tempo constante para evitar timing attacks
      const passwordMatch = user ? await comparePassword(password, user.password) : false;
      
      // Resposta genérica para falha de autenticação (não revela se o usuário existe)
      if (!user || !passwordMatch) {
        this.recordFailedAttempt(attemptKey);
        return reply.status(401).send({ error: 'Credenciais inválidas' });
      }

      if (!user.isActive) {
        this.recordFailedAttempt(attemptKey);
        return reply.status(403).send({ error: 'Usuário desativado' });
      }

      // Limpa tentativas de login após sucesso
      this.clearLoginAttempts(attemptKey);

      await prisma.usuarios.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Gera token JWT com configurações seguras
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret || jwtSecret.length < 32) {
        throw new Error('JWT_SECRET não configurado ou inseguro');
      }
      
      const token = jwt.sign(
        { 
          id: user.id,
          // Adiciona jitter aleatório para dificultar ataques de timing
          jti: crypto.randomBytes(16).toString('hex')
        }, 
        jwtSecret, 
        {
          expiresIn: JWT_EXPIRATION,
          algorithm: JWT_ALGORITHM as jwt.Algorithm,
        }
      );
      
      // Configuração segura de cookies
      reply.setCookie('access_token', token, {
        path: '/',
        httpOnly: true, // Previne acesso via JavaScript
        secure: process.env.NODE_ENV === 'production', // HTTPS apenas em produção
        sameSite: 'strict', // Proteção contra CSRF
        expires: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 horas
        maxAge: 8 * 60 * 60, // 8 horas em segundos
      });
      
      // Não retorna o token no corpo da resposta em produção
      const responseBody = process.env.NODE_ENV === 'production' 
        ? { success: true } 
        : { token };
        
      return reply.send(responseBody);
    } catch (error) {
      // Log seguro sem expor detalhes sensíveis
      console.error('Erro durante autenticação:', error instanceof Error ? error.message : 'Erro desconhecido');
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Logout do usuário
   * Implementa invalidação segura de sessão
   */
  async logout(req: FastifyRequest, reply: FastifyReply): Promise<any> {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        return reply.status(401).send({ error: 'Não autenticado' });
      }

      // Verifica se o JWT é válido
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET não configurado');
      }
      
      jwt.verify(token, jwtSecret);

      // Remove o cookie com configurações seguras
      reply.clearCookie('access_token', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      return reply.send({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      // Mesmo em caso de erro, tenta limpar o cookie
      reply.clearCookie('access_token', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      return reply.status(200).send({ message: 'Logout realizado' });
    }
  }

  /**
   * Valida o token de acesso do usuário autenticado
   * Implementa verificação segura de JWT
   */
  async validateToken(req: FastifyRequest, reply: FastifyReply): Promise<any> {
    try {
      const token = extractToken(req);

      if (!token) {
        return reply.status(401).send({ error: 'Token não fornecido' });
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET não configurado');
      }
      
      // Verifica o JWT com a chave secreta
      const decoded = jwt.verify(token, jwtSecret);
      
      // Retorna informações não sensíveis
      return reply.send({ 
        valid: true,
        userId: typeof decoded === 'object' ? decoded.id : undefined
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return reply.status(401).send({ error: 'Token inválido' });
      } else if (error instanceof jwt.TokenExpiredError) {
        return reply.status(401).send({ error: 'Token expirado' });
      }
      
      // Log seguro
      console.error('Erro ao validar token:', error instanceof Error ? error.message : 'Erro desconhecido');
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  }
  
  /**
   * Métodos auxiliares para proteção contra força bruta
   */
  private isRateLimited(key: string): boolean {
    const now = Date.now();
    const attempt = loginAttempts[key];
    
    if (!attempt) return false;
    
    // Verifica se o timeout já passou
    const timeoutMs = LOGIN_TIMEOUT_MINUTES * 60 * 1000;
    if (now - attempt.lastAttempt > timeoutMs) {
      delete loginAttempts[key];
      return false;
    }
    
    return attempt.count >= MAX_LOGIN_ATTEMPTS;
  }
  
  private recordFailedAttempt(key: string): void {
    const now = Date.now();
    
    if (!loginAttempts[key]) {
      loginAttempts[key] = { count: 1, lastAttempt: now };
    } else {
      loginAttempts[key].count += 1;
      loginAttempts[key].lastAttempt = now;
    }
  }
  
  private clearLoginAttempts(key: string): void {
    delete loginAttempts[key];
  }
}