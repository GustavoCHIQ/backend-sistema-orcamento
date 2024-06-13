import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export default class CityController {
  async create(req: Request, res: Response): Promise<Response> {
    const createCitySchema = z.object({
      name: z.string({ required_error: 'Name is required' }),
      state: z.string({ required_error: 'State is required' }),
      country: z.string({ required_error: 'Country is required' }),
      cep: z.string({ required_error: 'CEP is required' }).min(8),
    });

    try {
      const data = createCitySchema.parse(req.body);
      await prisma.cidades.create({
        data,
      });

      return res.status(201).send();
    } catch (error) {
      return res.status(400).json({ error: 'Error to create city' });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const updateCitySchema = z.object({
      name: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      cep: z.string().optional(),
    });

    const data = updateCitySchema.parse(req.body);

    try {
      await prisma.cidades.update({
        where: {
          id: Number(id),
        },
        data,
      });
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: 'Error to update city' });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    const cities = await prisma.cidades.findMany();
    return res.json(cities);
  }

  async findById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    try {
      const city = await prisma.cidades.findUnique({
        where: {
          id: Number(id)
        }
      });

      if (!city) {
        return res.status(404).json({ error: 'City not found' });
      }

      return res.json(city);
    } catch (error) {
      return res.status(400).json({ error: 'Error to find city' });
    }
  }

  async delete(req: Request, res: Response): Promise<any> {
    const { id } = req.params;

    try {
      await prisma.cidades.delete({
        where: {
          id: Number(id)
        }
      });

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}