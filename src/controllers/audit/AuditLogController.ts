import { FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AuditLogQuery } from '../../utils/types';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';

export default new class AuditLogController {
  /**
   * Lista o histórico de auditoria com paginação e filtros. Restrito a ADMIN (ver requireRole na rota) —
   * é o rastro de "quem fez o quê" e não deve ficar visível para vendedores/gestores comuns.
   */
  async findAll(req: FastifyRequest<{ Querystring: AuditLogQuery }>, reply: FastifyReply): Promise<any> {
    try {
      const pagination = parsePagination(req.query);
      const filter: Prisma.AuditLogWhereInput = {};

      if (req.query.userId) filter.userId = Number(req.query.userId);
      if (req.query.entity) filter.entity = req.query.entity;
      if (req.query.entityId) filter.entityId = Number(req.query.entityId);
      if (req.query.action) filter.action = req.query.action;

      const createdAtFilter: Prisma.DateTimeFilter = {};
      if (req.query.from) createdAtFilter.gte = new Date(req.query.from);
      if (req.query.to) createdAtFilter.lte = new Date(req.query.to);
      if (Object.keys(createdAtFilter).length > 0) filter.createdAt = createdAtFilter;

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where: filter,
          skip: pagination.skip,
          take: pagination.limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            action: true,
            entity: true,
            entityId: true,
            changes: true,
            ipAddress: true,
            createdAt: true,
            user: { select: { id: true, name: true, email: true } },
          },
        }),
        prisma.auditLog.count({ where: filter }),
      ]);

      return reply.status(200).send({ data: logs, pagination: buildPaginationMeta(total, pagination) });
    } catch (error) {
      console.error('Erro no AuditLogController:', error);
      return reply.status(500).send({ error: 'Erro interno do servidor' });
    }
  }
}
