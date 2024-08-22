import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class utils {
  // Método auxiliar para obter o preço de um item (produto ou serviço)
  public static async getItemPrice(productId?: number | null, serviceId?: number | null): Promise<number> {
    if (productId !== null && productId !== undefined) {
      const product = await prisma.produtos.findUnique({ where: { id: productId } });
      return product?.price || 0;
    }
    if (serviceId !== null && serviceId !== undefined) {
      const service = await prisma.servicos.findUnique({ where: { id: serviceId } });
      return service?.price || 0;
    }
    return 0;
  }

  // Método auxiliar para recalcular o preço total do orçamento
  public static async recalculateBudgetTotal(budgetId: number): Promise<void> {
    const items = await prisma.orcamentoItens.findMany({ where: { budgetId } });
    const budget = await prisma.orcamentos.findUnique({ where: { id: budgetId } });

    if (!budget) {
      throw new Error(`Budget with id ${budgetId} not found`);
    }

    const totalItemsPrice = await items.reduce(async (totalPromise, item) => {
      const total = await totalPromise;
      const itemPrice = await this.getItemPrice(item.productId, item.serviceId);
      return total + (itemPrice * item.quantity) * (1 - item.discount / 100);
    }, Promise.resolve(0) as Promise<number>);

    const totalPrice = totalItemsPrice * (1 - budget.discount / 100);

    await prisma.orcamentos.update({
      where: { id: budgetId },
      data: { totalPrice },
    });
  }
}