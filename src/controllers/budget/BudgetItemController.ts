import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Params, Quantity, CreateBudgetItemBody } from '../../utils/types';
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
  async create(request: FastifyRequest<{ Body: CreateBudgetItemBody }>, reply: FastifyReply): Promise<any> {
    const { budgetId, productId, serviceId, quantity } = request.body;

    if (!productId && !serviceId) {
      return reply.status(400).send({ error: "Product ID or Service ID is required" });
    }

    const budgetItemAlreadyExists = await Prisma.orcamentoItens.findFirst({
      where: {
        budgetId: Number(budgetId),
        productId: Number(productId),
        serviceId: Number(serviceId)
      }
    });

    if (budgetItemAlreadyExists) {
      return reply.status(400).send({ error: "Budget item already exists" });
    }

    try {
      await budgetItemSchema.parse(request.body);
    } catch (error) {
      return reply.status(400).send("Error creating budget item");
    }

    const budgetItem = await Prisma.orcamentoItens.create({
      data: {
        budgetId: Number(budgetId),
        productId: Number(productId),
        serviceId: Number(serviceId),
        quantity: Number(quantity)
      }
    });

    return reply.send(budgetItem);
  }

  async update(request: FastifyRequest<{ Params: Params; Body: Quantity }>, reply: FastifyReply): Promise<any> {
    const { id } = request.params;
    const { quantity } = request.body;

    try {
      await updateBudgetItemSchema.parse(request.body);
    } catch (error) {
      return reply.status(400).send("Error updating budget item");
    }

    const budgetItem = await Prisma.orcamentoItens.update({
      where: {
        id: Number(id)
      },
      data: {
        quantity: Number(quantity)
      }
    });

    return reply.send(budgetItem);
  }

  async delete(request: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    const { id } = request.params;

    await Prisma.orcamentoItens.delete({
      where: {
        id: Number(id)
      }
    });

    return reply.status(204).send();
  }
}