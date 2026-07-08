import { FastifyRequest, FastifyReply } from 'fastify';
import { Prisma, StatusOrcamento } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { Params, AddItemData, ApplyDiscountData, CreateBudgetData, UpdateBudgetData, UpdateBudgetItemData, BudgetItemParams, BudgetListQuery } from '../../utils/types';
import { z } from 'zod';
import utils from '../products/ProductUtilController';

const ELEVATED_ROLES = ['ADMIN', 'MANAGER'] as const;
const SELF_DISCOUNT_LIMIT = 10;

// Schemas de validação com Zod mais robustos
const createBudgetSchema = z.object({
  clientId: z.number({ required_error: 'ID do cliente é obrigatório' }).int().positive('ID do cliente deve ser positivo'),
  totalPrice: z.number().nonnegative('Preço total não pode ser negativo').optional(),
});

const addItemSchema = z.object({
  budgetId: z.number({ required_error: 'ID do orçamento é obrigatório' }).int().positive(),
  productId: z.number().int().positive().nullable(),
  serviceId: z.number().int().positive().nullable(),
  quantity: z.number({ required_error: 'Quantidade é obrigatória' }).positive('Quantidade deve ser maior que zero'),
  discount: z.number().min(0).max(100, 'Desconto não pode ser maior que 100%').default(0),
  totalPrice: z.number().nonnegative().default(0),
}).refine(data => data.productId !== null || data.serviceId !== null, {
  message: 'Pelo menos um produto ou serviço deve ser especificado',
  path: ['productId', 'serviceId'],
});

const updateItemSchema = z.object({
  quantity: z.number().positive('Quantidade deve ser maior que zero').optional(),
  discount: z.number().min(0).max(100, 'Desconto não pode ser maior que 100%').optional(),
}).refine(data => data.quantity !== undefined || data.discount !== undefined, {
  message: 'Informe ao menos quantidade ou desconto para atualizar',
});

const applyDiscountSchema = z.object({
  budgetId: z.number().int().positive('ID do orçamento deve ser positivo'),
  discount: z.number().min(0, 'Desconto não pode ser negativo').max(100, 'Desconto não pode ser maior que 100%'),
});

const updateBudgetSchema = z.object({
  isApproved: z.boolean({ required_error: 'Status de aprovação é obrigatório' }),
});

export default new class BudgetController {
  /**
   * Cria um novo orçamento em nome do usuário autenticado
   */
  async createBudget(req: FastifyRequest<{ Body: CreateBudgetData }>, reply: FastifyReply): Promise<any> {
    try {
      const validatedData = createBudgetSchema.parse(req.body);
      const { clientId, totalPrice = 0 } = validatedData;
      const userId = req.user.id;

      return await prisma.$transaction(async (tx) => {
        const client = await tx.clientes.findUnique({ where: { id: clientId } });

        if (!client) {
          throw { status: 404, message: 'Cliente não encontrado' };
        }

        const newBudget = await tx.orcamentos.create({
          data: {
            userId,
            clientId,
            totalPrice,
            discount: 0,
            status: 'negociacao',
          },
          select: {
            id: true,
            userId: true,
            clientId: true,
            totalPrice: true,
            discount: true,
            status: true,
            createdAt: true
          }
        });

        return reply.status(201).send(newBudget);
      });
    } catch (err) {
      return this.handleError(err, reply);
    }
  }

  /**
   * Adiciona um item ao orçamento (somente o dono do orçamento ou MANAGER/ADMIN)
   */
  async addItem(req: FastifyRequest<{ Body: AddItemData }>, reply: FastifyReply): Promise<any> {
    try {
      const validatedData = addItemSchema.parse(req.body);
      const { budgetId, productId, serviceId, quantity, discount = 0 } = validatedData;

      return await prisma.$transaction(async (tx) => {
        const budget = await tx.orcamentos.findUnique({ where: { id: budgetId } });

        if (!budget) {
          throw { status: 404, message: 'Orçamento não encontrado' };
        }

        this.assertCanAccessBudget(req, budget.userId);

        if (budget.isApproved) {
          throw { status: 400, message: 'Não é possível modificar um orçamento já aprovado' };
        }

        if (productId) {
          const product = await tx.produtos.findUnique({ where: { id: productId } });
          if (!product) {
            throw { status: 404, message: 'Produto não encontrado' };
          }
        }

        if (serviceId) {
          const service = await tx.servicos.findUnique({ where: { id: serviceId } });
          if (!service) {
            throw { status: 404, message: 'Serviço não encontrado' };
          }
        }

        const itemPrice = await utils.getItemPrice(productId, serviceId, tx);

        if (itemPrice <= 0) {
          throw { status: 400, message: 'Preço do item inválido' };
        }

        const totalItemPrice = (itemPrice * quantity) * (1 - discount / 100);

        const newItem = await tx.orcamentoItens.create({
          data: {
            budgetId,
            productId,
            serviceId,
            quantity,
            discount,
            totalPrice: totalItemPrice,
          },
          select: {
            id: true,
            budgetId: true,
            productId: true,
            serviceId: true,
            quantity: true,
            discount: true,
            totalPrice: true
          }
        });

        // Recalcula o total do orçamento dentro da mesma transação (enxerga o item recém-criado)
        await utils.recalculateBudgetTotal(budgetId, tx);

        return reply.status(201).send(newItem);
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * Atualiza quantidade/desconto de um item do orçamento (somente dono ou MANAGER/ADMIN)
   */
  async updateItem(req: FastifyRequest<{ Params: BudgetItemParams; Body: UpdateBudgetItemData }>, reply: FastifyReply): Promise<any> {
    try {
      const budgetId = Number(req.params.budgetId);
      const itemId = Number(req.params.itemId);

      if (!Number.isInteger(budgetId) || budgetId <= 0 || !Number.isInteger(itemId) || itemId <= 0) {
        throw { status: 400, message: 'ID de orçamento ou item inválido' };
      }

      const validatedData = updateItemSchema.parse(req.body);

      return await prisma.$transaction(async (tx) => {
        const budget = await tx.orcamentos.findUnique({ where: { id: budgetId } });

        if (!budget) {
          throw { status: 404, message: 'Orçamento não encontrado' };
        }

        this.assertCanAccessBudget(req, budget.userId);

        if (budget.isApproved) {
          throw { status: 400, message: 'Não é possível modificar um orçamento já aprovado' };
        }

        const item = await tx.orcamentoItens.findUnique({ where: { id: itemId } });

        if (!item || item.budgetId !== budgetId) {
          throw { status: 404, message: 'Item não encontrado neste orçamento' };
        }

        const quantity = validatedData.quantity ?? item.quantity;
        const discount = validatedData.discount ?? item.discount;
        const itemPrice = await utils.getItemPrice(item.productId, item.serviceId, tx);
        const totalPrice = (itemPrice * quantity) * (1 - discount / 100);

        const updatedItem = await tx.orcamentoItens.update({
          where: { id: itemId },
          data: { quantity, discount, totalPrice },
          select: {
            id: true,
            budgetId: true,
            productId: true,
            serviceId: true,
            quantity: true,
            discount: true,
            totalPrice: true
          }
        });

        await utils.recalculateBudgetTotal(budgetId, tx);

        return reply.status(200).send(updatedItem);
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * Remove um item do orçamento (somente dono ou MANAGER/ADMIN)
   */
  async removeItem(req: FastifyRequest<{ Params: BudgetItemParams }>, reply: FastifyReply): Promise<any> {
    try {
      const budgetId = Number(req.params.budgetId);
      const itemId = Number(req.params.itemId);

      if (!Number.isInteger(budgetId) || budgetId <= 0 || !Number.isInteger(itemId) || itemId <= 0) {
        throw { status: 400, message: 'ID de orçamento ou item inválido' };
      }

      return await prisma.$transaction(async (tx) => {
        const budget = await tx.orcamentos.findUnique({ where: { id: budgetId } });

        if (!budget) {
          throw { status: 404, message: 'Orçamento não encontrado' };
        }

        this.assertCanAccessBudget(req, budget.userId);

        if (budget.isApproved) {
          throw { status: 400, message: 'Não é possível modificar um orçamento já aprovado' };
        }

        const item = await tx.orcamentoItens.findUnique({ where: { id: itemId } });

        if (!item || item.budgetId !== budgetId) {
          throw { status: 404, message: 'Item não encontrado neste orçamento' };
        }

        await tx.orcamentoItens.delete({ where: { id: itemId } });
        await utils.recalculateBudgetTotal(budgetId, tx);

        return reply.status(204).send();
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * Aplica desconto ao orçamento.
   * Dono pode aplicar até SELF_DISCOUNT_LIMIT%; acima disso ou em orçamento alheio exige MANAGER/ADMIN.
   */
  async applyDiscount(req: FastifyRequest<{ Body: ApplyDiscountData }>, reply: FastifyReply): Promise<any> {
    try {
      const validatedData = applyDiscountSchema.parse(req.body);
      const { budgetId, discount } = validatedData;

      return await prisma.$transaction(async (tx) => {
        const budget = await tx.orcamentos.findUnique({ where: { id: budgetId } });

        if (!budget) {
          throw { status: 404, message: 'Orçamento não encontrado' };
        }

        if (budget.isApproved) {
          throw { status: 400, message: 'Não é possível modificar um orçamento já aprovado' };
        }

        const isOwner = budget.userId === req.user.id;
        const isElevated = ELEVATED_ROLES.includes(req.user.role as typeof ELEVATED_ROLES[number]);

        if (!isElevated && (!isOwner || discount > SELF_DISCOUNT_LIMIT)) {
          throw { status: 403, message: 'Permissão negada para aplicar este desconto' };
        }

        await tx.orcamentos.update({
          where: { id: budgetId },
          data: { discount }
        });

        await utils.recalculateBudgetTotal(budgetId, tx);

        const updatedBudget = await tx.orcamentos.findUnique({
          where: { id: budgetId },
          select: {
            id: true,
            totalPrice: true,
            discount: true,
            status: true
          }
        });

        return reply.status(200).send(updatedBudget);
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * Lista orçamentos com paginação e filtros.
   * USER só vê os próprios orçamentos; MANAGER/ADMIN veem todos e podem filtrar por userId.
   */
  async findAll(req: FastifyRequest<{ Querystring: BudgetListQuery }>, reply: FastifyReply): Promise<any> {
    try {
      const page = parseInt(req.query.page || '1');
      const limit = Math.min(parseInt(req.query.limit || '20'), 100); // Limita o tamanho máximo da página
      const skip = (page - 1) * limit;

      const filter: Prisma.OrcamentosWhereInput = {};

      if (req.query.status) {
        filter.status = req.query.status as StatusOrcamento;
      }

      if (req.query.clientId) {
        filter.clientId = parseInt(req.query.clientId);
      }

      const isElevated = ELEVATED_ROLES.includes(req.user.role as typeof ELEVATED_ROLES[number]);

      if (isElevated) {
        if (req.query.userId) {
          filter.userId = parseInt(req.query.userId);
        }
      } else {
        // Usuários comuns só podem ver os próprios orçamentos, independente do que pedirem na query
        filter.userId = req.user.id;
      }

      const [budgets, totalCount] = await Promise.all([
        prisma.orcamentos.findMany({
          where: filter,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            totalPrice: true,
            status: true,
            discount: true,
            createdAt: true,
            isApproved: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            client: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: { items: true }
            }
          },
        }),
        prisma.orcamentos.count({ where: filter })
      ]);

      return reply.status(200).send({
        data: budgets,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * Busca um orçamento pelo ID. USER só pode ver o próprio orçamento.
   */
  async findById(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply): Promise<any> {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id)) || Number(id) <= 0) {
        throw { status: 400, message: 'ID de orçamento inválido' };
      }

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
          status: true,
          isApproved: true,
          createdAt: true,
          updatedAt: true,
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
                  description: true,
                },
              },
              servicos: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  description: true,
                }
              }
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true,
            }
          }
        },
      });

      if (!budget) {
        throw { status: 404, message: 'Orçamento não encontrado' };
      }

      this.assertCanAccessBudget(req, budget.userId);

      return reply.status(200).send(budget);
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * Aprova ou rejeita um orçamento. Restrito a MANAGER/ADMIN pela rota (requireRole).
   */
  async approveBudget(req: FastifyRequest<{ Params: Params; Body: UpdateBudgetData }>, reply: FastifyReply): Promise<any> {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id)) || Number(id) <= 0) {
        throw { status: 400, message: 'ID de orçamento inválido' };
      }

      const validatedData = updateBudgetSchema.parse(req.body);
      const { isApproved } = validatedData;

      return await prisma.$transaction(async (tx) => {
        const budget = await tx.orcamentos.findUnique({
          where: { id: Number(id) },
          include: { items: true }
        });

        if (!budget) {
          throw { status: 404, message: 'Orçamento não encontrado' };
        }

        if (budget.items.length === 0) {
          throw { status: 400, message: 'Não é possível aprovar um orçamento sem itens' };
        }

        const updatedBudget = await tx.orcamentos.update({
          where: { id: Number(id) },
          data: {
            isApproved,
            status: isApproved ? 'aprovado' : 'cancelado',
            updatedAt: new Date()
          },
          select: {
            id: true,
            status: true,
            isApproved: true,
            updatedAt: true
          }
        });

        return reply.status(200).send(updatedBudget);
      });
    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * Garante que o usuário autenticado é dono do orçamento ou tem role elevada; lança 403 caso contrário.
   */
  private assertCanAccessBudget(req: FastifyRequest, budgetOwnerId: number): void {
    const isOwner = budgetOwnerId === req.user.id;
    const isElevated = ELEVATED_ROLES.includes(req.user.role as typeof ELEVATED_ROLES[number]);

    if (!isOwner && !isElevated) {
      throw { status: 403, message: 'Permissão negada para este orçamento' };
    }
  }

  /**
   * Manipulador de erros centralizado
   */
  private handleError(error: any, reply: FastifyReply): FastifyReply {
    console.error('Erro no BudgetController:', error);

    // Erros personalizados
    if (error.status && error.message) {
      return reply.status(error.status).send({
        error: error.message,
        details: error.details
      });
    }

    // Erros de validação Zod
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Erro de validação',
        details: error.issues
      });
    }

    // Erros do Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return reply.status(409).send({ error: 'Conflito de dados: registro duplicado' });
      }
      if (error.code === 'P2025') {
        return reply.status(404).send({ error: 'Registro não encontrado' });
      }
      return reply.status(400).send({ error: 'Erro no banco de dados', code: error.code });
    }

    // Erros genéricos
    return reply.status(500).send({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
