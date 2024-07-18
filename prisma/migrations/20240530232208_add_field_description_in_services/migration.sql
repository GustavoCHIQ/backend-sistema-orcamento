/*
  Warnings:

  - You are about to drop the column `servicosId` on the `OrcamentoItens` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Servicos` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrcamentoItens" DROP CONSTRAINT "OrcamentoItens_servicosId_fkey";

-- DropForeignKey
ALTER TABLE "Servicos" DROP CONSTRAINT "Servicos_categoryId_fkey";

-- AlterTable
ALTER TABLE "OrcamentoItens" DROP COLUMN "servicosId";

-- AlterTable
ALTER TABLE "Servicos" DROP COLUMN "categoryId",
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "description" SET DATA TYPE TEXT;
