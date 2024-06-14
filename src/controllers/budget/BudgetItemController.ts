import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const Prisma = new PrismaClient();

const budgetItemSchema = z.object({
  budgetId: z.number({ required_error: "Budget ID is required" }),
  productId: z.number({ required_error: "Product ID is required" }),
  serviceId: z.number({ required_error: "Service ID is required" }),
  quantity: z.number({ required_error: "Quantity is required" })
});

const updateBudgetItemSchema = z.object({
  quantity: z.number({ required_error: "Quantity is required" }),
});

export default class BudgetItemController {
  async create(request: Request, response: Response): Promise<Response> {
    const { budgetId, productId, serviceId, quantity } = request.body;

    if (!productId && !serviceId) {
      return response.status(400).json({ error: "Product ID or Service ID is required" });
    }

    const budgetItemAlreadyExists = await Prisma.orcamentoItens.findFirst({
      where: {
        budgetId,
        productId,
        serviceId
      }
    });

    if (budgetItemAlreadyExists) {
      return response.status(400).json({ error: "Budget item already exists" });
    }

    try {
      await budgetItemSchema.parse(request.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ error: error.errors[0] });
      }
    }

    const budgetItem = await Prisma.orcamentoItens.create({
      data: {
        budgetId,
        productId,
        serviceId,
        quantity
      }
    });

    return response.json(budgetItem);
  }

  async update(request: Request, response: Response) {
    const { id } = request.params;
    const { quantity } = request.body;

    try {
      await updateBudgetItemSchema.parse(request.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ error: error.errors[0] });
      }
    }

    const budgetItem = await Prisma.orcamentoItens.update({
      where: {
        id: Number(id)
      },
      data: {
        quantity
      }
    });

    return response.json(budgetItem);
  }

  async delete(request: Request, response: Response) {
    const { id } = request.params;

    await Prisma.orcamentoItens.delete({
      where: {
        id: Number(id)
      }
    });

    return response.status(204).send();
  }
}