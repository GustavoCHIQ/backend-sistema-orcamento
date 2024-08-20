-- CreateEnum
CREATE TYPE "StatusOrcamento" AS ENUM ('negociacao', 'aprovado', 'execucao', 'finalizado', 'cancelado', 'perdido');

-- AlterTable
ALTER TABLE "Orcamentos" ADD COLUMN     "status" "StatusOrcamento" NOT NULL DEFAULT 'negociacao';
