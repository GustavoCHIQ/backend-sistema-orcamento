import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as yup from 'yup';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

const createProductSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().required('Price is required'),
  categoryId: yup.number().required('Category is required'),
  supplierId: yup.number().required('Supplier is required')
});

const updateProductSchema = yup.object().shape({
  name: yup.string().optional(),
  description: yup.string().optional(),
  price: yup.number().optional(),
  categoryId: yup.number().optional(),
  supplierId: yup.number().optional()
});

export default class ProductController {
  async create(req: Request, res: Response) {
    const { name, description, price, categoryId, supplierId } = req.body;

    try {
      await createProductSchema.validate(req.body, { abortEarly: false });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
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

  async findAll(req: Request, res: Response) {
    const products = await prisma.produtos.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        categoryId: true,
        supplierId: true
      },
    });
    return res.json(products);
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;
    const product = await prisma.produtos.findUnique({
      where: {
        id: Number(id),
      },
    });
    return res.json(product);
  }

  async update(req: Request, res: Response) {
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
      await updateProductSchema.validate(req.body);
      const product = await prisma.produtos.update({
        where: {
          id: Number(id),
        },
        data: req.body,
      });

      return res.json({ message: "Product updated", product });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        return res.status(400).json({ errors: err.errors });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async delete(req: Request, res: Response) {
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