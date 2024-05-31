import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const createServiceSchema = z.object({
  name: z.string({ required_error: 'Name is required' }),
  description: z.string({ required_error: 'Description is required' }),
  price: z.number({ required_error: 'Price is required' }),
  categoryId: z.number({ required_error: 'Category ID is required' }),
});

const updateServiceSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  categoryId: z.number().optional(),
});

export default class ServiceController {
  async create(req: Request, res: Response): Promise<Response> {
    const { name, description, price, categoryId } = req.body;
    try {
      createServiceSchema.parseAsync(req.body);
      const newService = await prisma.servicos.create({
        data: {
          name,
          description,
          price,
          categoryId,
        },
      });

      return res.status(201).json({ message: 'Service created successfully', service: newService });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const services = await prisma.servicos.findMany();

      return res.json(services);

    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const service = await prisma.servicos.findUnique({
        where: { id: Number(id) },
      });
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      return res.json(service);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { name, description, price, categoryId } = req.body;

    try {
      updateServiceSchema.parseAsync(req.body);
      const existingService = await prisma.servicos.findUnique({
        where: { id: Number(id) },
      });

      if (!existingService) {
        return res.status(404).json({ error: 'Service not found' });
      }

      const updatedService = await prisma.servicos.update({
        where: { id: Number(id) },
        data: {
          name: name ?? existingService.name,
          description: description ?? existingService.description,
          price: price ?? existingService.price,
          categoryId: categoryId ?? existingService.categoryId,
        },
      });

      return res.json({ message: 'Service updated successfully', service: updatedService });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response): Promise<any> {
    const { id } = req.params;

    try {
      const existingService = await prisma.servicos.findUnique({
        where: { id: Number(id) },
      });

      if (!existingService) {
        return res.status(404).json({ error: 'Service not found' });
      }

      await prisma.servicos.delete({
        where: { id: Number(id) },
      });

      return res.json({ message: 'Service deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
