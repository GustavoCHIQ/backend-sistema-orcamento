import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export default class CompanyController {
  async create(req: Request, res: Response): Promise<Response> {
    const createEmpresaSchema = z.object({
      name: z.string({ required_error: 'Name is required' }),
      cnpj: z.string({ required_error: 'CNPJ is required' }),
      phone: z.string({ required_error: 'Phone is required' }),
      ie: z.string({ required_error: 'IE is required' }),
      pngLogo: z.string().optional(),
      email: z.string({ required_error: 'Email is required' }).email(),
      address: z.string({ required_error: 'Address is required' }).min(1, { message: 'Address is required' }),
      city: z.string({ required_error: 'City is required' }).min(1, { message: 'City is required' }),
    });


    try {
      const data = createEmpresaSchema.parse(req.body);
      await prisma.empresa.create({
        data,
      });

      return res.status(201).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      } else {
        return res.status(400).json({ error: 'Error to create company' });
      }
    }
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
    const updateEmpresaSchema = z.object({
      name: z.string().optional(),
      cnpj: z.string().optional(),
      phone: z.string().optional(),
      ie: z.string().optional(),
      pngLogo: z.string().optional(),
      email: z.string().email().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
    });

    try {
      const data = updateEmpresaSchema.parse(req.body);
      await prisma.empresa.update({
        where: {
          id: Number(id),
        },
        data,
      });
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: 'Error to update company' });
    }
  }
}