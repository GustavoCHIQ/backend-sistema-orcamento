-- CreateEnum
CREATE TYPE "TipoCliente" AS ENUM ('PessoaFisica', 'PessoaJuridica');

-- CreateEnum
CREATE TYPE "Unidades" AS ENUM ('UN', 'KG', 'M', 'M2', 'M3', 'L', 'ML', 'CM', 'CM2', 'CM3', 'MM', 'MM2', 'MM3', 'G', 'MG', 'T', 'TON', 'H', 'MIN', 'S', 'MS', 'KM', 'KM2', 'KM3', 'LITRO', 'MLITRO', 'M3LITRO', 'M2LITRO', 'M2MLITRO', 'M3MLITRO');

-- CreateTable
CREATE TABLE "Empresa" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "cnpj" VARCHAR(14) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "ie" VARCHAR(20) NOT NULL,
    "email" VARCHAR(60) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "pngLogo" VARCHAR(255) NOT NULL,
    "cityId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuarios" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "email" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clientes" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "email" TEXT NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "type" "TipoCliente" NOT NULL DEFAULT 'PessoaFisica',
    "cpfOrCnpj" VARCHAR(50) NOT NULL,
    "rgOrIe" VARCHAR(50) NOT NULL,
    "cityId" INTEGER NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cidades" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "country" VARCHAR(50) NOT NULL,
    "cep" VARCHAR(8) NOT NULL,

    CONSTRAINT "Cidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produtos" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "units" "Unidades" NOT NULL DEFAULT 'UN',

    CONSTRAINT "Produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categorias" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornecedores" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "contactInfo" VARCHAR(20) NOT NULL,
    "email" VARCHAR(60) NOT NULL,
    "cnpj" VARCHAR(14) NOT NULL,

    CONSTRAINT "Fornecedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orcamentos" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Orcamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrcamentoItens" (
    "id" SERIAL NOT NULL,
    "budgetId" INTEGER NOT NULL,
    "productId" INTEGER,
    "serviceId" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "OrcamentoItens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_email_key" ON "Usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Clientes_email_key" ON "Clientes"("email");

-- AddForeignKey
ALTER TABLE "Clientes" ADD CONSTRAINT "Clientes_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "Cidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produtos" ADD CONSTRAINT "Produtos_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produtos" ADD CONSTRAINT "Produtos_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Fornecedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orcamentos" ADD CONSTRAINT "Orcamentos_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orcamentos" ADD CONSTRAINT "Orcamentos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrcamentoItens" ADD CONSTRAINT "OrcamentoItens_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Orcamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrcamentoItens" ADD CONSTRAINT "OrcamentoItens_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
