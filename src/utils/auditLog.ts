import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

type DbClient = Prisma.TransactionClient | typeof prisma;

/**
 * Ações auditadas. Mantido como união de literais (em vez de enum no banco) para não exigir
 * migration a cada novo tipo de evento — o filtro por `action` na consulta continua funcionando normalmente.
 */
export type AuditAction =
  | 'auth.login_success'
  | 'auth.login_failed'
  | 'auth.logout'
  | 'auth.password_reset_requested'
  | 'auth.password_reset_completed'
  | 'user.create'
  | 'user.update'
  | 'user.update_password'
  | 'user.delete'
  | 'budget.create'
  | 'budget.add_item'
  | 'budget.update_item'
  | 'budget.remove_item'
  | 'budget.apply_discount'
  | 'budget.approve'
  | 'budget.reject'
  | 'budget.duplicate'
  | 'budget.send_email';

export type RecordAuditInput = {
  /** Usuário autenticado que executou a ação. Nulo para eventos sem sessão válida (ex.: login que falhou). */
  userId?: number | null;
  action: AuditAction;
  /** Nome do modelo Prisma afetado (ex.: "Orcamentos", "Usuarios"). */
  entity: string;
  entityId?: number | null;
  /** Estado relevante da mudança (before/after, campos alterados, metadados). Nunca inclua senhas/tokens em texto puro. */
  changes?: Record<string, unknown>;
  ipAddress?: string | null;
};

/**
 * Grava um evento de auditoria. Aceita opcionalmente o client de uma transação em andamento
 * (`tx`) para que o registro fique fisicamente junto da mudança que ele descreve — se a
 * transação for revertida, nenhum log órfão fica gravado. Fora de uma transação, usa o client
 * global. Nunca lança erro: assim como o envio de e-mail, auditoria é best-effort e uma falha
 * aqui (ex.: banco fora do ar) não deve impedir a ação de negócio que está sendo registrada.
 */
export async function recordAudit(input: RecordAuditInput, db: DbClient = prisma): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        changes: input.changes as Prisma.InputJsonValue | undefined,
        ipAddress: input.ipAddress ?? null,
      },
    });
  } catch (error) {
    console.error('Falha ao registrar log de auditoria:', error instanceof Error ? error.message : 'Erro desconhecido');
  }
}
