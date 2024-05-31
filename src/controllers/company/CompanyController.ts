import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const createEmpresaSchema = z.object({
  name: z.string({ required_error: 'Name is required' }),
  cnpj: z.string({ required_error: 'CNPJ is required' }),
  phone: z.string({ required_error: 'Phone is required' }),
  ie: z.string({ required_error: 'IE is required' }),
  email: z.string({ required_error: 'Email is required' }).email(),
  address: z.string({ required_error: 'Address is required' }),
  city: z.string({ required_error: 'City is required' }),
});

const updateEmpresaSchema = z.object({
  name: z.string().optional(),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  ie: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

export default class CompanyController {
  async create(req: Request, res: Response): Promise<Response> {
    const { name, cnpj, phone, ie, email, address, city } = req.body;

    try {
      createEmpresaSchema.parseAsync(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.message });
      }
    }

    const empresaExists = await prisma.empresa.findFirst({
      where: {
        cnpj,
      },
    });

    if (empresaExists) {
      return res.status(400).json({ error: 'Empresa already exists' });
    }

    const empresa = await prisma.empresa.create({
      data: {
        name,
        cnpj,
        phone,
        ie,
        email,
        address,
        city,
      },
    });

    return res.status(201).json({ message: 'Empresa created successfully' });
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    const empresas = await prisma.empresa.findUnique({
      where: {
        id: 1
      },
    });

    if (!empresas) {
      return res.status(404).json({ error: 'Company not found' });
    }

    return res.status(200).json(empresas);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { name, cnpj, phone, ie, email, address, city } = req.body;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Body is empty' });
    }

    try {
      await updateEmpresaSchema.parseAsync(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.message });
      }
    }

    const empresa = await prisma.empresa.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        cnpj,
        phone,
        ie,
        email,
        address,
        city,
      },
    });

    return res.status(200).json({ message: 'Company updated successfully' });
  }
}