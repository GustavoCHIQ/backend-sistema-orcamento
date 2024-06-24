import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Params } from '../../utils/types';
import { z } from 'zod';

const prisma = new PrismaClient();

export default new class ServiceController {
  async create(req: FastifyRequest, reply: FastifyReply): Promise<any> {
    const createServiceSchema = z.object({
      name: z.string({ required_error: 'Name is required' }),
      description: z.string({ required_error: 'Description is required' }),
      price: z.number({ required_error: 'Price is required' }),
      categoryId: z.number({ required_error: 'Category ID is required' }),
    });

    try {
      const data = createServiceSchema.parse(req.body);
      await prisma.servicos.create({
        data,
      });

      return reply.status(201).send();
    } catch (error) {
      return reply.status(400).send({ error: 'Error creating service' });
    }
  }

  async findAll(req: FastifyRequest, reply: FastifyReply): Promise<any> {
    try {
      const services = await prisma.servicos.findMany();

      return reply.send(services);

    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async findById(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    try {
      const { id } = req.params;
      const service = await prisma.servicos.findUnique({
        where: { id: Number(id) },
      });
      if (!service) {
        return reply.status(404).send({ error: 'Service not found' });
      }
      return reply.send(service);
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async update(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    const { id } = req.params;
    const updateServiceSchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.number().optional(),
      categoryId: z.number().optional(),
    });

    try {
      const data = updateServiceSchema.parse(req.body);
      await prisma.servicos.update({
        where: { id: Number(id) },
        data,
      });

      return reply.status(200).send();
    } catch (error) {
      return reply.status(400).send({ error: 'Error updating service' });
    }
  }

  async delete(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    const { id } = req.params;

    try {
      const existingService = await prisma.servicos.findUnique({
        where: { id: Number(id) },
      });

      if (!existingService) {
        return reply.status(404).send({ error: 'Service not found' });
      }

      await prisma.servicos.delete({
        where: { id: Number(id) },
      });

      return reply.send({ message: 'Service deleted successfully' });
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}
