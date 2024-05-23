import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as yup from 'yup';

const prisma = new PrismaClient();

const createServiceSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().required('Price is required'),
  categoryId: yup.number().required('Category ID is required'),
});

const updateServiceSchema = yup.object().shape({
  name: yup.string().optional(),
  description: yup.string().optional(),
  price: yup.number().optional(),
  categoryId: yup.number().optional(),
});

export default class ServiceController {
  async create(req: Request, res: Response) {
    try {
      const { name, description, price, categoryId } = req.body;
      await createServiceSchema.validate(req.body, { abortEarly: false });
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
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({ errors: error.errors });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const services = await prisma.servicos.findMany();
      return res.json(services);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async findById(req: Request, res: Response) {
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

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, price, categoryId } = req.body;

      await updateServiceSchema.validate(req.body, { abortEarly: false });

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
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({ errors: error.errors });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

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
