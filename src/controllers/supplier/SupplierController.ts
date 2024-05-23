import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as yup from 'yup';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

const createSupplierSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  contactInfo: yup.string().required('Contact Info is required'),
  email: yup.string().email().required('Email is required'),
  cnpj: yup.string().required('CNPJ is required')
});

const updateSupplierSchema = yup.object().shape({
  name: yup.string().optional(),
  contactInfo: yup.string().optional(),
  email: yup.string().email().optional(),
  cnpj: yup.string().optional()
});

export default class SupplierController {
  async create(req: Request, res: Response) {
    try {
      await createSupplierSchema.validate(req.body, { abortEarly: false });

      const { name, contactInfo, email, cnpj } = req.body;
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
      if (err instanceof yup.ValidationError) {
        return res.status(400).json({ errors: err.errors });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async findAll(req: Request, res: Response) {
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

  async findById(req: Request, res: Response) {
    const { id } = req.params;
    const supplier = await prisma.fornecedores.findUnique({
      where: {
        id: Number(id),
      },
    });
    return res.json(supplier);
  }

  async update(req: Request, res: Response) {
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
      await updateSupplierSchema.validate(req.body, { abortEarly: false });

      const supplier = await prisma.fornecedores.update({
        where: {
          id: Number(id),
        },
        data: req.body,
      });
      return res.json({ message: "Supplier updated", supplier });
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
      await prisma.fornecedores.delete({
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