import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import * as yup from 'yup';
import bcrypt from 'bcryptjs';
require('dotenv').config();

const prisma = new PrismaClient();

const createUserSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(3, 'Name must have at least 3 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must have at least 6 characters'),
});

const updateUserSchema = yup.object().shape({
  name: yup.string().min(3, 'Name must have at least 3 characters').optional(),
  email: yup.string().email('Invalid email format').optional(),
});

export default class UserController {
  async create(req: Request, res: Response) {
    const { name, email, password } = req.body;

    try {
      await createUserSchema.validate({ name, email, password });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({ error: error.message });
      }
    }

    const userExists = await prisma.usuarios.findFirst({
      where: {
        email,
      },
    });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const user = await prisma.usuarios.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Return message to inform that the user was created
    return res.status(201).json({ message: 'User created successfully' });
  }

  async findAll(req: Request, res: Response) {
    const users = await prisma.usuarios.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    return res.json(users);
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;

    const user = await prisma.usuarios.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    });

    return res.json(user);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email } = req.body;

    const userNotExists = await prisma.usuarios.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
      }
    });

    if (id !== userNotExists?.id.toString()) {
      return res.status(404).json({ error: 'User not found' });
    }

    try {
      await updateUserSchema.validate({ name, email });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({ error: error.message });
      }
    }

    const user = await prisma.usuarios.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.usuarios.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true,
      }
    });

    return res.json({ message: 'User updated successfully', user: updatedUser });
  }

  async updatePassword(req: Request, res: Response) {
    const { id } = req.params;
    const { previousPassword, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 8);

    const user = await prisma.usuarios.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(previousPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const updatedUser = await prisma.usuarios.update({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true,
      },
      data: {
        password: hashedPassword,
      },
    });

    return res.json({ message: 'Password updated successfully' });
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const userNotExists = await prisma.usuarios.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
      },
    });

    if (id !== userNotExists?.id.toString()) {
      return res.status(404).json({ error: 'User not found' });
    }

    try {
      await prisma.usuarios.delete({
        where: {
          id: Number(id),
        },
      });

      return res.json({ message: 'User deleted successfully' });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({ error: 'User not found' });
        } else if (error.code === 'P2023') {
          return res.status(400).json({ error: 'User cannot be deleted' });
        }
      }
    }
  }
}
