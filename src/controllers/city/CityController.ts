import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import * as yup from 'yup';

const prisma = new PrismaClient();

const createCitySchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  state: yup.string().required('State is required'),
  country: yup.string().required('Country is required'),
  cep: yup.string().required('Cep is required'),
});

const updateCitySchema = yup.object().shape({
  name: yup.string().optional(),
  state: yup.string().optional(),
  country: yup.string().optional(),
  cep: yup.string().optional(),
});

export default class CityController {
  async create(req: Request, res: Response) {
    const { name, state, country, cep } = req.body;

    try {
      await createCitySchema.validate(req.body, { abortEarly: false });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({ error: error.errors });
      }
    }

    try {
      const city = await prisma.cidades.create({
        data: {
          name,
          state,
          country,
          cep
        }
      });

      return res.json({ "message": "City created with success" });
    } catch (error) {
      return res.status(400).json({ error: 'Error to create city' });
    }
  }

  async update(req: Request, res: Response) {
    const { name, state, country, cep } = req.body;
    const { id } = req.params;

    try {
      await updateCitySchema.validate(req.body, { abortEarly: false });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({ error: error.errors });
      }
    }

    try {
      const city = await prisma.cidades.update({
        where: {
          id: Number(id)
        },
        data: {
          name,
          state,
          country,
          cep
        }
      });

      return res.json({ "message": "City updated with success" });
    } catch (error) {
      return res.status(400).json({ error: 'Error to update city' });
    }
  }

  async findAll(req: Request, res: Response) {
    const cities = await prisma.cidades.findMany();
    return res.json(cities);
  }

  async findById(req: Request, res: Response) {
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

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.cidades.delete({
        where: {
          id: Number(id)
        }
      });

      return res.json({ "message": "City deleted with success" });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(400).json({ error: 'City not found' });
        } else if (error.code === 'P2003') {
          return res.status(400).json({ error: 'City has a relationship' });
        }
      }
    }
  }
}