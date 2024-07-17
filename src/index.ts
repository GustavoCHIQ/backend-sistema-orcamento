import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import { routes } from './routes'
const server = fastify({ logger: false })

server.register(routes, { prefix: '/api/v1' })
server.register(fastifyJwt, { secret: process.env.JWT_SECRET || '' })
server.listen({
  host: '0.0.0.0',
  port: process.env.PORT ? Number(process.env.PORT) : 3000
}).then(() => {
  console.log("Server running")
})