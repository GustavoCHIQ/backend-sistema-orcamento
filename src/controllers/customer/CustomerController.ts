import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as yup from 'yup';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

const createClientSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(3, 'Name must have at least 3 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  type: yup.string().optional(),
  cpfOrCnpj: yup.string().required('CpfOrCnpj is required'),
  rgOrIe: yup.string().optional(),
  cityId: yup.number().required('CityId is required'),
  address: yup.string().required('Address is required')
});

const updateClientSchema = yup.object().shape({
  name: yup.string().optional(),
  email: yup.string().email().optional(),
  phone: yup.string().optional(),
  type: yup.string().optional(),
  cpfOrCnpj: yup.string().optional(),
  rgOrIe: yup.string().optional(),
  cityId: yup.number().optional(),
  address: yup.string().optional()
});

export default class CustomerController {
  async create(req: Request, res: Response) {
    const { name, email, phone, cpfOrCnpj, rgOrIe, cityId, address } = req.body;

    try {
      await createClientSchema.validate(req.body, { abortEarly: false });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({ error: error.errors });
      }
    }

    try {
      const client = await prisma.clientes.create({
        data: {
          name,
          email,
          phone,
          cpfOrCnpj,
          rgOrIe,
          cityId,
          address
        }
      });

      return res.json(client);
    } catch (error) {
      return res.status(400).json({ error: 'Error creating client' });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const clients = await prisma.clientes.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          cpfOrCnpj: true,
          rgOrIe: true,
          cityId: true,
          address: true
        }
      });
      return res.json(clients);
    } catch (error) {
      return res.status(400).json({ error: 'Error loading clients' });
    }
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const client = await prisma.clientes.findUnique({
        where: {
          id: parseInt(id)
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          cpfOrCnpj: true,
          rgOrIe: true,
          cityId: true,
          address: true
        }
      });

      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      return res.json(client);
    } catch (error) {
      return res.status(400).json({ error: 'Error loading client' });
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email, phone, cpfOrCnpj, rgOrIe, cityId, address } = req.body;

    const clientNotExists = await prisma.clientes.findUnique({
      where: {
        id: parseInt(id)
      },
      select: {
        id: true
      }
    });

    if (id !== clientNotExists?.id.toString()) {
      return res.status(404).json({ error: 'Client not found' });
    }

    try {
      await updateClientSchema.validate(req.body, { abortEarly: false });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({ error: error.errors });
      }
    }

    try {
      const client = await prisma.clientes.update({
        where: {
          id: parseInt(id)
        },
        data: {
          name,
          email,
          phone,
          cpfOrCnpj,
          rgOrIe,
          cityId,
          address
        }
      });

      return res.json({ "message": "Client updated successfully" });
    } catch (error) {
      return res.status(400).json({ error: 'Error updating client' });
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.clientes.delete({
        where: {
          id: parseInt(id)
        }
      });

      return res.json({ message: 'Client deleted successfully' });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({ error: 'Client not found' });
        } else if (error.code === 'P2024') {
          return res.status(400).json({ error: 'Client has dependencies' });
        }
      }
      return res.status(400).json({ error: 'Error deleting client' });
    }
  }
}