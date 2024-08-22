import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import cookie, { FastifyCookieOptions } from '@fastify/cookie'
import { routes } from './routes';

const server = fastify({ logger: false });
const jwtSecret = process.env.JWT_SECRET || '';
const port = process.env.PORT || 4516;

server.register(fastifyJwt, { secret: jwtSecret });
server.register(cookie, {
  secret: process.env.COOKIE_SECRET || ''
} as FastifyCookieOptions);
server.register(routes, { prefix: '/api/v1' });

server.listen({
  host: '0.0.0.0',
  port: Number(port),
}).then(() => {
  console.log(`Server running on port ${port} 🚀`);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
