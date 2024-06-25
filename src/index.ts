import fastify from 'fastify'
import { routes } from './routes'
const server = fastify({ logger: false })

server.register(routes, { prefix: '/api/v1' })
server.listen({ port: 3045 }, (err, address) => { err ? console.error(err) : console.log(`🚀 Servidor rodando no endereço ${address}`) })