import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export default class CategoryController {
  async create(req: Request, res: Response): Promise<Response> {
    const createCategorySchema = z.object({
      name: z.string({ required_error: 'Name is required' }),
    });

    try {
      const data = createCategorySchema.parse(req.body);
      await prisma.categorias.create({
        data,
      });
    } catch (error) {
      return res.status(400).json({ error: 'Error to create category' });
    }

    return res.status(201);
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    const categories = await prisma.categorias.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return res.json(categories);
  }

  async findById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const category = await prisma.categorias.findUnique({
      where: {
        id: Number(id),
      },
    });
    return res.json(category);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const updateCategorySchema = z.object({
      name: z.string().optional(),
    });

    const data = updateCategorySchema.parse(req.body);
    try {
      await prisma.categorias.update({
        where: {
          id: Number(id),
        },
        data,
      });
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: 'Error to update category' });
    }
  }

  async delete(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    try {
      await prisma.categorias.delete({
        where: {
          id: Number(id),
        },
      });
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}