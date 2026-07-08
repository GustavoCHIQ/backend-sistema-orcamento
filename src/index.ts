import 'dotenv/config';
import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import cookie, { FastifyCookieOptions } from '@fastify/cookie';
import { routes } from './routes';
import { checkDatabase } from './utils/checkDatabase';

const jwtSecret = process.env.JWT_SECRET;
const cookieSecret = process.env.COOKIE_SECRET;
const port = process.env.PORT || 4516;

if (!jwtSecret || jwtSecret.length < 32) {
  console.error('JWT_SECRET ausente ou fraco (mínimo 32 caracteres). Configure a variável de ambiente antes de iniciar o servidor.');
  process.exit(1);
}

if (!cookieSecret || cookieSecret.length < 32) {
  console.error('COOKIE_SECRET ausente ou fraco (mínimo 32 caracteres). Configure a variável de ambiente antes de iniciar o servidor.');
  process.exit(1);
}

const server = fastify({ logger: false });

// Sem CORS_ORIGIN configurado, requisições cross-origin ficam bloqueadas por padrão
// (nunca refletir '*' quando credentials:true está habilitado).
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : false;

server.register(helmet);
server.register(cors, {
  origin: corsOrigin,
  credentials: true,
});
server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});
server.register(cookie, {
  secret: cookieSecret,
} as FastifyCookieOptions);
server.register(routes, { prefix: '/api/v1' });

server.setErrorHandler((error, request, reply) => {
  server.log.error(error);
  const statusCode = error.statusCode ?? 500;

  reply.status(statusCode).send({
    error: statusCode === 500 ? 'Erro interno do servidor' : error.message,
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
});

checkDatabase().then(() => {
  server.listen({
    host: "::",
    port: Number(port),
  }).then(() => {
    console.log(`Servidor rodando na porta ${port}`);
  }).catch(err => {
    console.error('Erro ao iniciar o servidor: ', err);
    process.exit(1);
  });
}).catch(err => {
  console.error('Servidor não iniciado devido a erro de conexão com o banco de dados: ', err);
  process.exit(1);
});
