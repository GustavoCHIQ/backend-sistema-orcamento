import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as yup from 'yup';

const Prisma = new PrismaClient();

const budgetItemSchema = yup.object().shape({
  budgetId: yup.number().required("Budget ID is required"),
  productId: yup.number().required("Product ID is required"),
  serviceId: yup.number().required("Service ID is required"),
  quantity: yup.number().required("Quantity is required")
});

const updateBudgetItemSchema = yup.object().shape({
  quantity: yup.number().required(),
});

export default class BudgetItemController {
  async create(request: Request, response: Response) {
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
      await budgetItemSchema.validate(request.body);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
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
      await updateBudgetItemSchema.validate(request.body);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
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