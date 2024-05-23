import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import * as yup from 'yup';

const prisma = new PrismaClient();

const createCategorySchema = yup.object().shape({
  name: yup.string().required('Name is required'),
});

const updateCategorySchema = yup.object().shape({
  name: yup.string().optional(),
});

export default class CategoryController {
  async create(req: Request, res: Response) {

    const categoryAlreadyExists = await prisma.categorias.findFirst({
      where: {
        name: req.body.name,
      },
    });

    if (categoryAlreadyExists) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    try {
      await createCategorySchema.validate(req.body, { abortEarly: false });

      const { name } = req.body;
      const category = await prisma.categorias.create({
        data: {
          name,
        },
      });
      return res.json({ message: "Category created", category });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        return res.status(400).json({ errors: err.errors });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async findAll(req: Request, res: Response) {
    const categories = await prisma.categorias.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return res.json(categories);
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;
    const category = await prisma.categorias.findUnique({
      where: {
        id: Number(id),
      },
    });
    return res.json(category);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await updateCategorySchema.validate(req.body, { abortEarly: false });

      const category = await prisma.categorias.update({
        where: {
          id: Number(id),
        },
        data: req.body,
      });
      return res.json({ message: "Category updated", category });
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
      await prisma.categorias.delete({
        where: {
          id: Number(id),
        },
      });
      return res.json({ message: "Category deleted" });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          return res.status(404).json({ error: 'Category not found' });
        } else if (err.code === 'P2003') {
          return res.status(400).json({ error: 'Category has dependencies' });
        }
      }
    }
  }
}