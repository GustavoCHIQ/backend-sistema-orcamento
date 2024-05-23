import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as yup from 'yup';

const prisma = new PrismaClient();

const createEmpresaSchema = yup.object().shape({
  name: yup.string().required(),
  cnpj: yup.string().required(),
  phone: yup.string().required(),
  ie: yup.string().optional(),
  email: yup.string().email().required(),
  address: yup.string().required(),
  city: yup.string().required(),
});

const updateEmpresaSchema = yup.object().shape({
  name: yup.string().optional(),
  cnpj: yup.string().optional(),
  phone: yup.string().optional(),
  ie: yup.string().optional(),
  email: yup.string().email().optional(),
  address: yup.string().optional(),
  city: yup.string().optional(),
});

export default class CompanyController {
  async create(req: Request, res: Response) {
    const { name, cnpj, phone, ie, email, address, city } = req.body;

    try {
      await createEmpresaSchema.validate({ name, cnpj, phone, ie, email, address, city });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
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

  async findAll(req: Request, res: Response) {
    const empresas = await prisma.empresa.findUnique({
      where: {
        id: 1,
      },
    });

    if (!empresas) {
      return res.status(404).json({ error: 'Company not found' });
    }

    return res.status(200).json(empresas);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, cnpj, phone, ie, email, address, city } = req.body;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Body is empty' });
    }

    try {
      await updateEmpresaSchema.validate({ name, cnpj, phone, ie, email, address, city });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
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