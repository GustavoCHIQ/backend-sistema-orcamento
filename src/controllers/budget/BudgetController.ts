import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import utils from '../products/utils';

const prisma = new PrismaClient();

// Interfaces para tipagem
interface CreateBudgetData {
  userId: number;
  clientId: number;
  totalPrice?: number;
}

interface AddItemData {
  budgetId: number;
  productId?: number | null;
  serviceId?: number | null;
  quantity: number;
  discount?: number;
  totalPrice?: number;
}

interface ApplyDiscountData {
  budgetId: number;
  discount: number;
}

interface UpdateBudgetData {
  isApproved: boolean;
}

// Schemas de validação com Zod
const createBudgetSchema = z.object({
  userId: z.number(),
  clientId: z.number(),
  totalPrice: z.number().optional(),
});

const addItemSchema = z.object({
  budgetId: z.number(),
  productId: z.number().nullable(),
  serviceId: z.number().nullable(),
  quantity: z.number().min(1),
  discount: z.number().default(0),
  totalPrice: z.number().default(0),
});

const applyDiscountSchema = z.object({
  budgetId: z.number(),
  discount: z.number().min(0),
});

const updateBudgetSchema = z.object({
  isApproved: z.boolean({ required_error: 'Approved is required' }),
});

export default class BudgetController {
  async createBudget(req: Request, res: Response): Promise<Response> {
    try {
      createBudgetSchema.parseAsync(req.body);
      const { userId, clientId, totalPrice = 0 }: CreateBudgetData = req.body;

      const newBudget = await prisma.orcamentos.create({
        data: {
          userId,
          clientId,
          totalPrice, // Inicialmente 0, será calculado ao adicionar itens
          discount: 0, // Inicialmente 0, pode ser atualizado posteriormente
        },
      });

      return res.status(201).json(newBudget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Method to add an item to a budget
  async addItem(req: Request, res: Response): Promise<Response> {
    try {
      await addItemSchema.parseAsync(req.body);
      const { budgetId, productId, serviceId, quantity, discount = 0 }: AddItemData = req.body;

      const itemPrice = await utils.getItemPrice(productId, serviceId);
      const totalItemPrice = (itemPrice * quantity) * (1 - discount / 100);

      const newItem = await prisma.orcamentoItens.create({
        data: {
          budgetId,
          productId,
          serviceId,
          quantity,
          discount,
          totalPrice: totalItemPrice,
        },
      });

      // Recalcular o preço total do orçamento
      await utils.recalculateBudgetTotal(budgetId);

      return res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Method to apply a discount to a budget
  async applyDiscount(req: Request, res: Response): Promise<Response> {
    try {
      await applyDiscountSchema.parseAsync(req.body);
      const { budgetId, discount }: ApplyDiscountData = req.body;

      await prisma.orcamentos.update({
        where: {
          id: budgetId,
        },
        data: {
          discount,
        },
      });

      // Recalcular o preço total do orçamento
      await utils.recalculateBudgetTotal(budgetId);

      return res.status(200).json({ message: 'Discount applied successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Method to list all budgets and their items
  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const budgets = await prisma.orcamentos.findMany({
        select: {
          id: true,
          userId: true,
          clientId: true,
          totalPrice: true,
          discount: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              productId: true,
              serviceId: true,
              quantity: true,
              discount: true,
              totalPrice: true,
              produtos: {
                select: { id: true, name: true, price: true },
              },
            },
          },
        },
      });

      return res.status(200).json(budgets);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Method to find a budget by id
  async findById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      const budget = await prisma.orcamentos.findUnique({
        where: {
          id: Number(id),
        },
        select: {
          id: true,
          userId: true,
          clientId: true,
          totalPrice: true,
          discount: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              productId: true,
              serviceId: true,
              quantity: true,
              discount: true,
              totalPrice: true,
              produtos: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
      }

      return res.status(200).json(budget);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Method to update a budget
  async approveBudget(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { isApproved }: UpdateBudgetData = req.body;

    try {
      await updateBudgetSchema.parseAsync(req.body);
      const budget = await prisma.orcamentos.update({
        where: {
          id: Number(id),
        },
        data: {
          isApproved,
        },
      });

      return res.status(200).json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}