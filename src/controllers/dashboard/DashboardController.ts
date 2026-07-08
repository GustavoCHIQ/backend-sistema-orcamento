import { FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { DashboardQuery } from '../../utils/types';

export default new class DashboardController {
  /**
   * Resumo gerencial: totais por status, faturamento aprovado no período,
   * orçamentos pendentes e os clientes com maior valor orçado.
   * Restrito a MANAGER/ADMIN (ver requireRole na rota).
   */
  async summary(req: FastifyRequest<{ Querystring: DashboardQuery }>, reply: FastifyReply): Promise<any> {
    try {
      const createdAtFilter: Prisma.DateTimeFilter = {};
      if (req.query.from) createdAtFilter.gte = new Date(req.query.from);
      if (req.query.to) createdAtFilter.lte = new Date(req.query.to);
      const hasDateFilter = Object.keys(createdAtFilter).length > 0;

      const [statusCounts, approvedRevenue, pendingCount, topClientsRaw] = await Promise.all([
        prisma.orcamentos.groupBy({
          by: ['status'],
          _count: { _all: true },
          where: hasDateFilter ? { createdAt: createdAtFilter } : undefined,
        }),
        prisma.orcamentos.aggregate({
          _sum: { totalPrice: true },
          where: {
            status: 'aprovado',
            ...(hasDateFilter ? { createdAt: createdAtFilter } : {}),
          },
        }),
        prisma.orcamentos.count({ where: { status: 'negociacao' } }),
        prisma.orcamentos.groupBy({
          by: ['clientId'],
          _sum: { totalPrice: true },
          orderBy: { _sum: { totalPrice: 'desc' } },
          take: 5,
        }),
      ]);

      const clients = await prisma.clientes.findMany({
        where: { id: { in: topClientsRaw.map(c => c.clientId) } },
        select: { id: true, name: true },
      });
      const clientNameById = new Map(clients.map(c => [c.id, c.name]));

      return reply.status(200).send({
        budgetsByStatus: statusCounts.map(s => ({ status: s.status, count: s._count._all })),
        approvedRevenue: approvedRevenue._sum.totalPrice ?? 0,
        pendingApproval: pendingCount,
        topClients: topClientsRaw.map(c => ({
          clientId: c.clientId,
          name: clientNameById.get(c.clientId) ?? 'Desconhecido',
          totalValue: c._sum.totalPrice ?? 0,
        })),
      });
    } catch (error) {
      console.error('Erro no DashboardController:', error);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  }
}
