import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as yup from 'yup';
import utils from '../products/utils';

const prisma = new PrismaClient();

const createBudgetSchema = yup.object().shape({
  userId: yup.number().required(),
  clientId: yup.number().required(),
  totalPrice: yup.number().default(0),
});

const addItemSchema = yup.object().shape({
  budgetId: yup.number().required(),
  productId: yup.number().nullable(),
  serviceId: yup.number().nullable(),
  quantity: yup.number().min(1).required(),
  discount: yup.number().default(0),
  totalPrice: yup.number().default(0),
});

const applyDiscountSchema = yup.object().shape({
  budgetId: yup.number().required(),
  discount: yup.number().min(0).required(),
});

const updateBudgetSchema = yup.object().shape({
  isApproved: yup.boolean().required("Status is required"),
});

export default class BudgetController {

  // Method to create a budget
  async createBudget(req: Request, res: Response) {
    try {
      await createBudgetSchema.validate(req.body);
      const { userId, clientId, discount } = req.body;

      const newBudget = await prisma.orcamentos.create({
        data: {
          userId,
          clientId,
          totalPrice: 0, // Inicialmente 0, será calculado ao adicionar itens
          discount,
        },
      });

      return res.status(201).json(newBudget);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({ error: error.message });
      }
    }
  }

  // Method to add an item to a budget
  async addItem(req: Request, res: Response) {
    try {
      await addItemSchema.validate(req.body);
      const { budgetId, productId, serviceId, quantity, discount } = req.body;

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
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({ error: error.message });
      }
    }
  }

  // Method to apply a discount to a budget
  async applyDiscount(req: Request, res: Response) {
    try {
      await applyDiscountSchema.validate(req.body);
      const { budgetId, discount } = req.body;

      await prisma.orcamentos.update({
        where: {
          id: budgetId
        },
        data: {
          discount
        },
      });

      // Recalcular o preço total do orçamento
      await utils.recalculateBudgetTotal(budgetId);

      return res.status(200).json({ message: 'Discount applied successfully' });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({ error: error.message });
      }
    }
  }

  // Method to list all budgets and their items
  async findAll(req: Request, res: Response) {
    const budgets = await prisma.orcamentos.findMany({
      select: {
        id: true, userId: true, clientId: true, totalPrice: true, discount: true, createdAt: true,
        items: {
          select: {
            id: true, productId: true, serviceId: true, quantity: true, discount: true, totalPrice: true,
            produtos: {
              select: { id: true, name: true, price: true },
            },
          },
        },
      },
    });

    return res.status(200).json(budgets);
  }

  // Method to find a budget by id
  async findById(req: Request, res: Response) {
    const { id } = req.params;
    const budget = await prisma.orcamentos.findUnique({
      where: {
        id: Number(id)
      },
      select: {
        id: true, userId: true, clientId: true, totalPrice: true, discount: true, createdAt: true,
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
  }

  // Method to update a budget
  async approveBudget(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    try {
      await updateBudgetSchema.validate({ isApproved: status });
      const budget = await prisma.orcamentos.update({
        where: {
          id: Number(id)
        },
        data: {
          isApproved: status
        },
      });

      return res.status(200).json(budget);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({ error: error.message });
      }
    }
  }
}