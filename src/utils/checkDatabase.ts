import { prisma } from '../lib/prisma';

export async function checkDatabase(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Banco de dados conectado com sucesso 🎆✨ \n');
  } catch (error) {
    throw new Error('Erro ao conectar com o banco de dados');
  }
}
