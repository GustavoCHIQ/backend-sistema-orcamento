import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export default class ProductController {
  async create(req: Request, res: Response): Promise<Response> {
    const createProductSchema = z.object({
      name: z.string({ required_error: 'Name is required' }),
      description: z.string({ required_error: 'Description is required' }),
      price: z.number({ required_error: 'Price is required' }),
      categoryId: z.number({ required_error: 'Category ID is required' }),
      supplierId: z.number({ required_error: 'Supplier ID is required' })
    });

    try {
      const data = createProductSchema.parse(req.body);
      await prisma.produtos.create({
        data,
      });

      return res.status(201).send();
    } catch (error) {
      return res.status(400).json({ error: 'Error creating product' });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    const products = await prisma.produtos.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        categorias: {
          select: {
            id: true,
            name: true
          }
        },
        fornecedores: {
          select: {
            id: true,
            name: true
          }
        }
      },
    });
    return res.json(products);
  }

  async findById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const product = await prisma.produtos.findUnique({
      where: {
        id: Number(id),
      },
    });
    return res.json(product);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const updateProductSchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.number().optional(),
      categoryId: z.number().optional(),
      supplierId: z.number().optional()
    });

    try {
      const data = updateProductSchema.parse(req.body);
      await prisma.produtos.update({
        where: {
          id: Number(id),
        },
        data,
      });
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: 'Error updating product' });
    }
  }

  async delete(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    try {
      await prisma.produtos.delete({
        where: {
          id: Number(id),
        },
      });

      return res.json({ message: "Product deleted" });
    } catch (err) {
      return res.status(400).json({ error: 'Error deleting product' });
    }
  }
}