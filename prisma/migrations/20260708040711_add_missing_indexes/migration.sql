-- CreateIndex
CREATE INDEX "Clientes_cityId_idx" ON "Clientes"("cityId");

-- CreateIndex
CREATE INDEX "OrcamentoItens_budgetId_idx" ON "OrcamentoItens"("budgetId");

-- CreateIndex
CREATE INDEX "OrcamentoItens_productId_idx" ON "OrcamentoItens"("productId");

-- CreateIndex
CREATE INDEX "OrcamentoItens_serviceId_idx" ON "OrcamentoItens"("serviceId");

-- CreateIndex
CREATE INDEX "Orcamentos_userId_idx" ON "Orcamentos"("userId");

-- CreateIndex
CREATE INDEX "Orcamentos_clientId_idx" ON "Orcamentos"("clientId");

-- CreateIndex
CREATE INDEX "Orcamentos_status_idx" ON "Orcamentos"("status");

-- CreateIndex
CREATE INDEX "Produtos_categoryId_idx" ON "Produtos"("categoryId");

-- CreateIndex
CREATE INDEX "Produtos_supplierId_idx" ON "Produtos"("supplierId");

-- CreateIndex
CREATE INDEX "Servicos_categoryId_idx" ON "Servicos"("categoryId");

-- AddForeignKey
ALTER TABLE "OrcamentoItens" ADD CONSTRAINT "OrcamentoItens_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Servicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
