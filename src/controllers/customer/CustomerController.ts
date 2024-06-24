import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, TipoCliente } from '@prisma/client';
import { Params } from '../../utils/types';
import { z } from 'zod';

const prisma = new PrismaClient();

export default new class CustomerController {
  async create(req: FastifyRequest, reply: FastifyReply): Promise<any> {
    const createCustomerSchema = z.object({
      name: z.string({ required_error: 'Name is required' }),
      email: z.string({ required_error: 'Email is required' }).email(),
      phone: z.string({ required_error: 'Phone is required' }),
      type: z.nativeEnum(TipoCliente, { required_error: 'Type is required' }),
      cpfOrCnpj: z.string({ required_error: 'CPF or CNPJ is required' }),
      rgOrIe: z.string({ required_error: 'RG or IE is required' }),
      cityId: z.number({ required_error: 'City ID is required' }),
      address: z.string({ required_error: 'Address is required' })
    });

    try {
      const data = createCustomerSchema.parse(req.body);
      await prisma.clientes.create({
        data
      })

      return reply.status(201).send();
    } catch (error) {
      return reply.status(400).send({ error: 'Error creating client' });
    }
  }

  async findAll(req: FastifyRequest, reply: FastifyReply): Promise<any> {
    try {
      const clients = await prisma.clientes.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          cpfOrCnpj: true,
          rgOrIe: true,
          cidades: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      return reply.send(clients);
    } catch (error) {
      return reply.status(400).send({ error: 'Error loading clients' });
    }
  }

  async findById(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    const { id } = req.params;
    try {
      const client = await prisma.clientes.findUnique({
        where: {
          id: parseInt(id)
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          cpfOrCnpj: true,
          rgOrIe: true,
          cityId: true,
          address: true
        }
      });

      if (!client) {
        return reply.status(404).send({ error: 'Client not found' });
      }

      return reply.send(client);
    } catch (error) {
      return reply.status(400).send({ error: 'Error loading client' });
    }
  }

  async update(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    const { id } = req.params;
    const updateClientSchema = z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      type: z.nativeEnum(TipoCliente).optional(),
      cpfOrCnpj: z.string().optional(),
      rgOrIe: z.string().optional(),
      cityId: z.number().optional(),
      address: z.string().optional()
    });

    const data = updateClientSchema.parse(req.body);

    try {
      await prisma.clientes.update({
        where: {
          id: parseInt(id)
        },
        data
      });

      return reply.status(204).send();
    } catch (error) {
      return reply.status(400).send({ error: 'Error updating client' });
    }
  }

  async delete(req: FastifyRequest<{ Params: Params }>, res: FastifyReply): Promise<any> {
    const { id } = req.params;

    try {
      prisma.clientes.delete({
        where: {
          id: parseInt(id)
        }
      });

      return res.send({ message: 'Client deleted successfully' });
    } catch (error) {
      return res.status(400).send({ error: 'Error deleting client' });
    }
  }
}