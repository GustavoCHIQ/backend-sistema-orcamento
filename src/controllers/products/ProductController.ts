import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

const createProductSchema = z.object({
  name: z.string({ required_error: 'Name is required' }),
  description: z.string({ required_error: 'Description is required' }),
  price: z.number({ required_error: 'Price is required' }),
  categoryId: z.number({ required_error: 'Category ID is required' }),
  supplierId: z.number({ required_error: 'Supplier ID is required' })
});

const updateProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  categoryId: z.number().optional(),
  supplierId: z.number().optional()
});

export default class ProductController {
  async create(req: Request, res: Response): Promise<Response> {
    const { name, description, price, categoryId, supplierId } = req.body;

    try {
      createProductSchema.parseAsync({ name, description, price, categoryId, supplierId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
    }

    try {
      const product = await prisma.produtos.create({
        data: {
          name,
          description,
          price,
          categoryId,
          supplierId
        }
      });

      return res.json(product);
    } catch (error) {
      return res.status(400).json({ 'Error creating product': error });
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

    const productNotExists = await prisma.produtos.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
      },
    });

    if (id !== productNotExists?.id.toString()) {
      return res.status(404).json({ error: "Product not found" });
    }

    try {
      await updateProductSchema.parseAsync(req.body);
      const product = await prisma.produtos.update({
        where: {
          id: Number(id),
        },
        data: req.body,
      });

      return res.json({ message: "Product updated", product });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      return res.status(500).json({ error: "Internal server error" });
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
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          return res.status(404).json({ error: "Product not found" });
        } else if (err.code === 'P2003') {
          return res.status(400).json({ error: "Product has dependencies" });
        }
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}