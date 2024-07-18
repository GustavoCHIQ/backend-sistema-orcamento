/*
  Warnings:

  - Added the required column `categoryId` to the `Servicos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Servicos" ADD COLUMN     "categoryId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Servicos" ADD CONSTRAINT "Servicos_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
