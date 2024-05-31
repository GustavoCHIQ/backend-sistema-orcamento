import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

const createSupplierSchema = z.object({
  name: z.string({ required_error: 'Name is required' }),
  contactInfo: z.string({ required_error: 'Contact info is required' }),
  email: z.string({ required_error: 'Email is required' }).email(),
  cnpj: z.string({ required_error: 'CNPJ is required' })
});

const updateSupplierSchema = z.object({
  name: z.string().optional(),
  contactInfo: z.string().optional(),
  email: z.string().email().optional(),
  cnpj: z.string().optional()
});

export default class SupplierController {
  async create(req: Request, res: Response): Promise<Response> {
    const { name, contactInfo, email, cnpj } = req.body;
    try {
      createSupplierSchema.parseAsync(req.body);
      const supplier = await prisma.fornecedores.create({
        data: {
          name,
          contactInfo,
          email,
          cnpj
        },
      });
      return res.json({ message: "Supplier created", supplier });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      return res.status(500).json({ error: "Internal server error" });
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
    const { id } = req.params;

    const supplierNotExists = await prisma.fornecedores.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
      },
    });

    if (id !== supplierNotExists?.id.toString()) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    try {
      await updateSupplierSchema.parseAsync(req.body);

      const supplier = await prisma.fornecedores.update({
        where: {
          id: Number(id),
        },
        data: req.body,
      });
      return res.json({ message: "Supplier updated", supplier });
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
      prisma.fornecedores.delete({
        where: {
          id: Number(id),
        },
      });

      return res.json({ message: "Supplier deleted" });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          return res.status(404).json({ error: 'Supplier not found' });
        } else if (err.code === 'P2003') {
          return res.status(400).json({ error: 'Supplier has products associated' });
        }
      }
    }
  }
}