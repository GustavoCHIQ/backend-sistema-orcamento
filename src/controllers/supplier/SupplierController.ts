import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export default class SupplierController {
  async create(req: Request, res: Response): Promise<Response> {

    const createSupplierSchema = z.object({
      name: z.string({ required_error: 'Name is required' }),
      contactInfo: z.string({ required_error: 'Contact info is required' }),
      email: z.string({ required_error: 'Email is required' }).email(),
      cnpj: z.string({ required_error: 'CNPJ is required' })
    });

    try {
      const data = createSupplierSchema.parse(req.body);
      await prisma.fornecedores.create({
        data,
      });

      return res.status(201).send();
    } catch (error) {
      return res.status(400).json({ error: 'Error creating supplier' });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    const suppliers = await prisma.fornecedores.findMany({
      select: {
        id: true,
        name: true,
        contactInfo: true,
        email: true,
      },
    });
    return res.json(suppliers);
  }

  async findById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const supplier = await prisma.fornecedores.findUnique({
      where: {
        id: Number(id),
      },
    });
    return res.json(supplier);
  }

  async update(req: Request, res: Response): Promise<Response> {

    const updateSupplierSchema = z.object({
      name: z.string().optional(),
      contactInfo: z.string().optional(),
      email: z.string().email().optional(),
      cnpj: z.string().optional()
    });

    try {
      const { id } = req.params;
      const data = updateSupplierSchema.parse(req.body);
      await prisma.fornecedores.update({
        where: {
          id: Number(id),
        },
        data,
      });

      return res.send();
    } catch (error) {
      return res.status(400).json({ error: 'Error updating supplier' });
    }
  }

  async delete(req: Request, res: Response): Promise<any> {
    const { id } = req.params;

    try {
      prisma.fornecedores.delete({
        where: {
          id: Number(id),
        },
      });

      return res.json({ message: "Supplier deleted" });
    } catch (err) {
      return res.status(400).json({ error: 'Error deleting supplier' });
    }
  }
}