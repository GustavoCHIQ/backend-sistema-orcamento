/*
  Warnings:

  - You are about to alter the column `name` on the `Servicos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - Added the required column `categoryId` to the `Servicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Servicos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrcamentoItens" ADD COLUMN     "servicosId" INTEGER;

-- AlterTable
ALTER TABLE "Servicos" ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "description" VARCHAR(255) NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);

-- AddForeignKey
ALTER TABLE "Servicos" ADD CONSTRAINT "Servicos_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrcamentoItens" ADD CONSTRAINT "OrcamentoItens_servicosId_fkey" FOREIGN KEY ("servicosId") REFERENCES "Servicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
