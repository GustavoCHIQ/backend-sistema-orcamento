import 'dotenv/config';
import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
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

// A validação de entrada continua sendo feita pelos schemas Zod dentro dos controllers.
// Os schemas JSON anexados às rotas (src/docs/schemas.ts) servem apenas para gerar a
// documentação Swagger, por isso o compilador de validação/serialização do próprio
// Fastify é neutralizado — anexar `schema` não deve mudar nenhum comportamento em runtime.
server.setValidatorCompiler(() => () => true);
server.setSerializerCompiler(() => (data) => JSON.stringify(data));

// Sem CORS_ORIGIN configurado, requisições cross-origin ficam bloqueadas por padrão
// (nunca refletir '*' quando credentials:true está habilitado).
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : false;

server.register(helmet, {
  // Content-Security-Policy padrão bloqueia o script inline que o Swagger UI usa para
  // inicializar a página; como /docs é uma ferramenta interna para desenvolvedores, a CSP
  // fica desligada e os demais headers de segurança do helmet continuam ativos.
  contentSecurityPolicy: false,
});
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

server.register(swagger, {
  openapi: {
    info: {
      title: 'API de Orçamentos',
      description: 'API para criação e gestão de orçamentos, clientes, produtos, serviços e usuários.',
      version: '1.0.0',
    },
    servers: [{ url: `http://localhost:${port}`, description: 'Servidor local' }],
    tags: [
      { name: 'Auth', description: 'Autenticação e sessão' },
      { name: 'Users', description: 'Gestão de usuários' },
      { name: 'Budgets', description: 'Orçamentos e seus itens' },
      { name: 'Clients', description: 'Clientes' },
      { name: 'Products', description: 'Produtos' },
      { name: 'Services', description: 'Serviços' },
      { name: 'Suppliers', description: 'Fornecedores' },
      { name: 'Categories', description: 'Categorias de produtos/serviços' },
      { name: 'Cities', description: 'Cidades' },
      { name: 'Company', description: 'Dados da empresa' },
      { name: 'Dashboard', description: 'Indicadores gerenciais' },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
          description: 'Cookie httpOnly definido em /users/login',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Alternativa ao cookie: envie o token como "Authorization: Bearer <token>"',
        },
      },
    },
  },
});
server.register(swaggerUi, {
  routePrefix: '/docs',
});

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
    console.log(`Documentação disponível em http://localhost:${port}/docs`);
  }).catch(err => {
    console.error('Erro ao iniciar o servidor: ', err);
    process.exit(1);
  });
}).catch(err => {
  console.error('Servidor não iniciado devido a erro de conexão com o banco de dados: ', err);
  process.exit(1);
});
