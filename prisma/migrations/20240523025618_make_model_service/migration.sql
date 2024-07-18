-- CreateTable
CREATE TABLE "Servicos" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Servicos_pkey" PRIMARY KEY ("id")
);
