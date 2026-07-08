import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

type DbClient = Prisma.TransactionClient | typeof prisma;

export default class utils {
  // Método auxiliar para obter o preço de um item (produto ou serviço)
  public static async getItemPrice(productId?: number | null, serviceId?: number | null, db: DbClient = prisma): Promise<number> {
    if (productId !== null && productId !== undefined) {
      const product = await db.produtos.findUnique({ where: { id: productId } });
      return product?.price || 0;
    }
    if (serviceId !== null && serviceId !== undefined) {
      const service = await db.servicos.findUnique({ where: { id: serviceId } });
      return service?.price || 0;
    }
    return 0;
  }

  // Método auxiliar para recalcular o preço total do orçamento
  // Recebe o client (ou a transação em andamento) para enxergar mudanças ainda não commitadas
  public static async recalculateBudgetTotal(budgetId: number, db: DbClient = prisma): Promise<void> {
    const [items, budget] = await Promise.all([
      db.orcamentoItens.findMany({ where: { budgetId } }),
      db.orcamentos.findUnique({ where: { id: budgetId } }),
    ]);

    if (!budget) {
      throw new Error(`Budget with id ${budgetId} not found`);
    }

    const productIds = items.map(i => i.productId).filter((id): id is number => id !== null);
    const serviceIds = items.map(i => i.serviceId).filter((id): id is number => id !== null);

    const [products, services] = await Promise.all([
      productIds.length ? db.produtos.findMany({ where: { id: { in: productIds } } }) : Promise.resolve([]),
      serviceIds.length ? db.servicos.findMany({ where: { id: { in: serviceIds } } }) : Promise.resolve([]),
    ]);

    const productPriceById = new Map(products.map(p => [p.id, p.price]));
    const servicePriceById = new Map(services.map(s => [s.id, s.price]));

    const totalItemsPrice = items.reduce((total, item) => {
      const itemPrice = (item.productId !== null ? productPriceById.get(item.productId) : undefined)
        ?? (item.serviceId !== null ? servicePriceById.get(item.serviceId) : undefined)
        ?? 0;
      return total + (itemPrice * item.quantity) * (1 - item.discount / 100);
    }, 0);

    const totalPrice = totalItemsPrice * (1 - budget.discount / 100);

    await db.orcamentos.update({
      where: { id: budgetId },
      data: { totalPrice },
    });
  }
}