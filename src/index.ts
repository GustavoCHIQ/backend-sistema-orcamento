import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import cookie, { FastifyCookieOptions } from '@fastify/cookie';
import { routes } from './routes';
import { checkDatabase } from './utils/checkDatabase'; // Importe a função aqui

const server = fastify({ logger: false });
const jwtSecret = process.env.JWT_SECRET || '';
const port = process.env.PORT || 4516;

server.register(fastifyJwt, { secret: jwtSecret });
server.register(cookie, {
  secret: process.env.COOKIE_SECRET || ''
} as FastifyCookieOptions);
server.register(routes, { prefix: '/api/v1' });

checkDatabase().then(() => {
  server.listen({
    host: '0.0.0.0',
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
