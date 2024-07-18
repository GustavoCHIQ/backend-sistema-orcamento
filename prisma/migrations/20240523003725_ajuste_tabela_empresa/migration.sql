/*
  Warnings:

  - You are about to drop the column `cityId` on the `Empresa` table. All the data in the column will be lost.
  - Added the required column `city` to the `Empresa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Empresa" DROP COLUMN "cityId",
ADD COLUMN     "city" VARCHAR(30) NOT NULL;
