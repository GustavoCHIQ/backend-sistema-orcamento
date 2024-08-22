import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Params, AddItemData, ApplyDiscountData, CreateBudgetData, UpdateBudgetData } from '../../utils/types';
import { z } from 'zod';
import utils from '../products/ProductUtilController';
const prisma = new PrismaClient();

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

export default new class BudgetController {
  async createBudget(req: FastifyRequest<{ Body: CreateBudgetData }>, reply: FastifyReply): Promise<any> {
    try {
      createBudgetSchema.parse(req.body);
      const { userId, clientId, totalPrice = 0 }: CreateBudgetData = req.body;


      // find user
      const user = await prisma.usuarios.findUnique({
        where: {
          id: userId,
        },
      });


      // find client
      const client = await prisma.clientes.findUnique({
        where: {
          id: clientId,
        },
      });

      if (!user || !client) {
        return reply.status(404).send({ error: 'User or client not found' });
      }

      await prisma.orcamentos.create({
        data: {
          userId,
          clientId,
          totalPrice,
          discount: 0, // Initially 0, can be updated later
        },
      });

      return reply.status(201).send();

    } catch (err) {
      if (err instanceof z.ZodError) {
        reply.status(400).send({ error: err.issues });
      }
    }
  }

  async addItem(req: FastifyRequest<{ Body: AddItemData }>, reply: FastifyReply): Promise<any> {
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

      // Recalculate the total price of the budget
      await utils.recalculateBudgetTotal(budgetId);

      return reply.status(201).send();
    } catch (error) {
      return reply.status(400).send({ error: 'Error adding item to budget' });
    }
  }

  async applyDiscount(req: FastifyRequest<{ Body: ApplyDiscountData }>, reply: FastifyReply): Promise<any> {
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

      // Recalculate the total price of the budget
      await utils.recalculateBudgetTotal(budgetId);

      return reply.status(200).send();
    } catch (error) {
      return reply.status(400).send(error);
    }
  }

  async findAll(req: FastifyRequest, reply: FastifyReply): Promise<any> {
    try {
      const budgets = await prisma.orcamentos.findMany({
        select: {
          id: true,
          totalPrice: true,
          status: true,
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
                  price: true
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return reply.status(200).send(budgets);
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async findById(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
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
        return reply.status(404).send({ error: 'Budget not found' });
      }

      return reply.status(200).send(budget);
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  async approveBudget(req: FastifyRequest<{ Params: Params; Body: UpdateBudgetData }>, reply: FastifyReply): Promise<any> {
    const { id } = req.params;
    const { isApproved }: UpdateBudgetData = req.body;

    try {
      updateBudgetSchema.parse(req.body);
      await prisma.orcamentos.update({
        where: {
          id: Number(id),
        },
        data: {
          isApproved,
        },
      });

      return reply.status(200).send();
    } catch (error) {
      return reply.status(400).send(error);
    }
  }
}
