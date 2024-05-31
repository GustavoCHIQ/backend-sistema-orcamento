import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

const createClientSchema = z.object({
  name: z.string({ required_error: 'Name is required' }),
  email: z.string({ required_error: 'Email is required' }).email(),
  phone: z.string({ required_error: 'Phone is required' }),
  type: z.string({ required_error: 'Type is required' }),
  cpfOrCnpj: z.string({ required_error: 'CPF or CNPJ is required' }),
  rgOrIe: z.string({ required_error: 'RG or IE is required' }),
  cityId: z.number({ required_error: 'City ID is required' }),
  address: z.string({ required_error: 'Address is required' })
});

const updateClientSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  type: z.string().optional(),
  cpfOrCnpj: z.string().optional(),
  rgOrIe: z.string().optional(),
  cityId: z.number().optional(),
  address: z.string().optional()
});

export default class CustomerController {
  async create(req: Request, res: Response): Promise<Response> {
    const { name, email, phone, cpfOrCnpj, rgOrIe, cityId, address } = req.body;
    try {
      createClientSchema.parseAsync(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
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

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const clients = await prisma.clientes.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          cpfOrCnpj: true,
          rgOrIe: true,
          cidades: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      return res.json(clients);
    } catch (error) {
      return res.status(400).json({ error: 'Error loading clients' });
    }
  }

  async findById(req: Request, res: Response): Promise<Response> {
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

  async update(req: Request, res: Response): Promise<Response> {
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
      await updateClientSchema.parseAsync(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
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

  async delete(req: Request, res: Response): Promise<any> {
    const { id } = req.params;

    try {
      prisma.clientes.delete({
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