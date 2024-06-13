import { Request, Response } from 'express';
import { PrismaClient, TipoCliente } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export default class CustomerController {
  async create(req: Request, res: Response): Promise<Response> {
    const createCustomerSchema = z.object({
      name: z.string({ required_error: 'Name is required' }),
      email: z.string({ required_error: 'Email is required' }).email(),
      phone: z.string({ required_error: 'Phone is required' }),
      type: z.nativeEnum(TipoCliente, { required_error: 'Type is required' }),
      cpfOrCnpj: z.string({ required_error: 'CPF or CNPJ is required' }),
      rgOrIe: z.string({ required_error: 'RG or IE is required' }),
      cityId: z.number({ required_error: 'City ID is required' }),
      address: z.string({ required_error: 'Address is required' })
    });

    try {
      const data = createCustomerSchema.parse(req.body);
      await prisma.clientes.create({
        data
      })

      return res.status(201).send();
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
    const updateClientSchema = z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      type: z.nativeEnum(TipoCliente).optional(),
      cpfOrCnpj: z.string().optional(),
      rgOrIe: z.string().optional(),
      cityId: z.number().optional(),
      address: z.string().optional()
    });

    const data = updateClientSchema.parse(req.body);

    try {
      await prisma.clientes.update({
        where: {
          id: parseInt(id)
        },
        data
      });

      return res.status(204).send();
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
      return res.status(400).json({ error: 'Error deleting client' });
    }
  }
}