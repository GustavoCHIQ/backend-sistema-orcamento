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
  userId: z.number({ required_error: 'User ID is required' }).min(1),
  clientId: z.number({ required_error: 'Client ID is required' }).min(1),
  totalPrice: z.number().optional(),
});

const addItemSchema = z.object({
  budgetId: z.number({ required_error: 'Budget ID is required' }),
  productId: z.number({ required_error: 'Product ID is required' }).nullable(),
  serviceId: z.number({ required_error: 'Service ID is required' }).nullable(),
  quantity: z.number({ required_error: 'Quantity is required' }).min(1),
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
      createBudgetSchema.parse(req.body);
      const { userId, clientId, totalPrice = 0 }: CreateBudgetData = req.body;

      const newBudget = await prisma.orcamentos.create({
        data: {
          userId,
          clientId,
          totalPrice,
          discount: 0, // Inicialmente 0, pode ser atualizado posteriormente
        },
      });

      return res.status(201).send();
    } catch (error) {
      return res.status(400).json({ error: 'Error creating budget' });
    }
  }

  // Method to add an item to a budget
  async addItem(req: Request, res: Response): Promise<Response> {
    try {
      await addItemSchema.parse(req.body);
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

      return res.status(201).send();
    } catch (error) {
      return res.status(400).json({ error: 'Error adding item to budget' });
    }
  }

  // Method to apply a discount to a budget
  async applyDiscount(req: Request, res: Response): Promise<Response> {
    try {
      await applyDiscountSchema.parse(req.body);
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

      return res.status(200).send();
    } catch (error) {
      return res.status(400).json(error);
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
      await updateBudgetSchema.parse(req.body);
      const budget = await prisma.orcamentos.update({
        where: {
          id: Number(id),
        },
        data: {
          isApproved,
        },
      });

      return res.status(200).send();
    } catch (error) {
      return res.status(400).json(error);
    }
  }
}