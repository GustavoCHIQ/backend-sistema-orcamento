import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { Params, UpdatePasswordBody, CreateBudgetData, AddItemData, ApplyDiscountData, UpdateBudgetData, Login, ListQuery, BudgetItemParams, UpdateBudgetItemData, DashboardQuery, BudgetListQuery } from "./utils/types";
import CityController from "./controllers/city/CityController";
import ProductController from "./controllers/products/ProductController";
import CategoryController from "./controllers/category/CategoryController";
import BudgetController from "./controllers/budget/BudgetController";
import UserController from "./controllers/user/UserController";
import CompanyController from "./controllers/company/CompanyController";
import CustomerController from "./controllers/customer/CustomerController";
import SupplierController from "./controllers/supplier/SupplierController";
import ServiceController from "./controllers/service/ServiceController";
import UserAuthenticationController from "./controllers/auth/UserAuthenticationController";
import DashboardController from "./controllers/dashboard/DashboardController";

import { verifyJwt } from "./middlewares/JWTAuth";
import { requireRole, requireSelfOrRole } from "./middlewares/RBAC";
import * as docs from "./docs/schemas";

const managerOrAdmin = requireRole('MANAGER', 'ADMIN');
const adminOnly = requireRole('ADMIN');

const auth: Record<string, string[]>[] = [{ cookieAuth: [] }, { bearerAuth: [] }];

const errorResponses = {
  400: docs.errorResponseSchema,
  401: docs.errorResponseSchema,
  403: docs.errorResponseSchema,
  404: docs.errorResponseSchema,
};

export async function routes(server: FastifyInstance) {
  // server for the City entity (leitura para qualquer autenticado, escrita restrita a gestão)
  server.post('/cities', {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Cities'], summary: 'Cria uma cidade', security: auth, body: docs.createCityBodySchema, response: { 201: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest, reply: FastifyReply) => { await CityController.create(req, reply) });

  server.get<{ Querystring: ListQuery }>('/cities', {
    onRequest: [verifyJwt],
    schema: { tags: ['Cities'], summary: 'Lista cidades (paginado, com busca)', security: auth, querystring: docs.listQuerySchema, response: { 200: docs.cityListResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Querystring: ListQuery }>, reply: FastifyReply) => { await CityController.findAll(req, reply) });

  server.get<{ Params: Params }>('/cities/:id', {
    onRequest: [verifyJwt],
    schema: { tags: ['Cities'], summary: 'Busca cidade por ID', security: auth, params: docs.idParamSchema, response: { 200: docs.citySchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CityController.findById(req, reply); });

  server.put<{ Params: Params }>('/cities/:id', {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Cities'], summary: 'Atualiza cidade', security: auth, params: docs.idParamSchema, body: docs.updateCityBodySchema, response: { 204: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CityController.update(req, reply); });

  server.delete<{ Params: Params }>('/cities/:id', {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Cities'], summary: 'Remove cidade', security: auth, params: docs.idParamSchema, response: { 204: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CityController.delete(req, reply); });

  // server for the Company entity
  server.post("/company", {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Company'], summary: 'Cadastra os dados da empresa', security: auth, body: docs.createCompanyBodySchema, response: { 201: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest, reply: FastifyReply) => { await CompanyController.create(req, reply) });

  server.get("/company", {
    onRequest: [verifyJwt],
    schema: { tags: ['Company'], summary: 'Retorna os dados da empresa', security: auth, response: { 200: docs.companySchema, ...errorResponses } },
  }, async (req: FastifyRequest, reply: FastifyReply) => { await CompanyController.findAll(req, reply) });

  server.put<{ Params: Params }>("/company/:id", {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Company'], summary: 'Atualiza os dados da empresa', security: auth, params: docs.idParamSchema, body: docs.updateCompanyBodySchema, response: { 204: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CompanyController.update(req, reply) });

  // server for the User entity
  server.post("/users", {
    onRequest: [verifyJwt, adminOnly],
    schema: { tags: ['Users'], summary: 'Cria um usuário (somente ADMIN)', security: auth, body: docs.createUserBodySchema, response: { 201: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest, reply: FastifyReply) => { await UserController.create(req, reply) });

  server.get<{ Querystring: ListQuery }>('/users', {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Users'], summary: 'Lista usuários (MANAGER/ADMIN)', security: auth, querystring: docs.listQuerySchema, response: { 200: docs.userListResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Querystring: ListQuery }>, reply: FastifyReply) => { await UserController.findAll(req, reply); });

  server.get<{ Params: Params }>('/users/:id', {
    onRequest: [verifyJwt, requireSelfOrRole('MANAGER', 'ADMIN')],
    schema: { tags: ['Users'], summary: 'Busca usuário por ID (próprio usuário, MANAGER ou ADMIN)', security: auth, params: docs.idParamSchema, response: { 200: docs.userSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await UserController.findById(req, reply); });

  server.put<{ Params: Params }>('/users/:id', {
    onRequest: [verifyJwt, requireSelfOrRole('ADMIN')],
    schema: { tags: ['Users'], summary: 'Atualiza nome/email (próprio usuário ou ADMIN)', security: auth, params: docs.idParamSchema, body: docs.updateUserBodySchema, response: { 200: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await UserController.updateUser(req, reply); });

  server.patch<{ Params: Params; Body: UpdatePasswordBody }>("/users/:id", {
    onRequest: [verifyJwt, requireSelfOrRole()],
    schema: { tags: ['Users'], summary: 'Troca a própria senha', security: auth, params: docs.idParamSchema, body: docs.updatePasswordBodySchema, response: { 200: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params; Body: UpdatePasswordBody }>, reply: FastifyReply) => { await UserController.updatePassword(req, reply); });

  server.delete<{ Params: Params }>("/users/:id", {
    onRequest: [verifyJwt, adminOnly],
    schema: { tags: ['Users'], summary: 'Remove usuário (somente ADMIN)', security: auth, params: docs.idParamSchema, response: { 204: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await UserController.delete(req, reply); });

  // server for the Authentication entity
  server.post('/users/login', {
    schema: { tags: ['Auth'], summary: 'Autentica e define o cookie access_token', body: docs.loginBodySchema, response: { 200: docs.emptyResponseSchema, 401: docs.errorResponseSchema, 429: docs.errorResponseSchema } },
  }, async (req: FastifyRequest<{ Params: Params; Body: Login }>, reply: FastifyReply) => { await UserAuthenticationController.login(req, reply); });

  server.post('/users/checktoken', {
    schema: { tags: ['Auth'], summary: 'Valida o token atual (cookie ou header Authorization)', response: { 200: docs.emptyResponseSchema, 401: docs.errorResponseSchema } },
  }, async (req: FastifyRequest, reply: FastifyReply) => { await UserAuthenticationController.validateToken(req, reply); });

  server.delete('/users/logout', {
    onRequest: [verifyJwt],
    schema: { tags: ['Auth'], summary: 'Encerra a sessão (limpa o cookie)', security: auth, response: { 200: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest, reply: FastifyReply) => { await UserAuthenticationController.logout(req, reply); });

  // server for the Client entity
  server.post("/clients", {
    onRequest: [verifyJwt],
    schema: { tags: ['Clients'], summary: 'Cria um cliente', security: auth, body: docs.createClientBodySchema, response: { 201: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest, reply: FastifyReply) => { await CustomerController.create(req, reply) });

  server.get<{ Querystring: ListQuery }>("/clients", {
    onRequest: [verifyJwt],
    schema: { tags: ['Clients'], summary: 'Lista clientes (paginado, com busca)', security: auth, querystring: docs.listQuerySchema, response: { 200: docs.clientListResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Querystring: ListQuery }>, reply: FastifyReply) => { await CustomerController.findAll(req, reply) });

  server.get<{ Params: Params }>("/clients/:id", {
    onRequest: [verifyJwt],
    schema: { tags: ['Clients'], summary: 'Busca cliente por ID', security: auth, params: docs.idParamSchema, response: { 200: docs.clientSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CustomerController.findById(req, reply) });

  server.put<{ Params: Params }>("/clients/:id", {
    onRequest: [verifyJwt],
    schema: { tags: ['Clients'], summary: 'Atualiza cliente', security: auth, params: docs.idParamSchema, body: docs.updateClientBodySchema, response: { 204: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CustomerController.update(req, reply) });

  server.delete<{ Params: Params }>("/clients/:id", {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Clients'], summary: 'Remove cliente (MANAGER/ADMIN)', security: auth, params: docs.idParamSchema, response: { 200: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CustomerController.delete(req, reply) });

  // server for the Product entity (catálogo gerenciado por MANAGER/ADMIN, leitura livre para autenticados)
  server.post("/products", {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Products'], summary: 'Cria um produto (MANAGER/ADMIN)', security: auth, body: docs.createProductBodySchema, response: { 201: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest, reply: FastifyReply) => { await ProductController.create(req, reply) });

  server.get<{ Querystring: ListQuery }>("/products", {
    onRequest: [verifyJwt],
    schema: { tags: ['Products'], summary: 'Lista produtos (paginado, com busca)', security: auth, querystring: docs.listQuerySchema, response: { 200: docs.productListResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Querystring: ListQuery }>, reply: FastifyReply) => { await ProductController.findAll(req, reply) });

  server.get<{ Params: Params }>("/products/:id", {
    onRequest: [verifyJwt],
    schema: { tags: ['Products'], summary: 'Busca produto por ID', security: auth, params: docs.idParamSchema, response: { 200: docs.productSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await ProductController.findById(req, reply) });

  server.put<{ Params: Params }>("/products/:id", {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Products'], summary: 'Atualiza produto (MANAGER/ADMIN)', security: auth, params: docs.idParamSchema, body: docs.updateProductBodySchema, response: { 204: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await ProductController.update(req, reply) });

  server.delete<{ Params: Params }>("/products/:id", {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Products'], summary: 'Remove produto (MANAGER/ADMIN)', security: auth, params: docs.idParamSchema, response: { 200: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await ProductController.delete(req, reply) });

  // server for the Supplier entity
  server.post("/suppliers", {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Suppliers'], summary: 'Cria um fornecedor (MANAGER/ADMIN)', security: auth, body: docs.createSupplierBodySchema, response: { 201: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest, reply: FastifyReply) => { await SupplierController.create(req, reply) });

  server.get<{ Querystring: ListQuery }>("/suppliers", {
    onRequest: [verifyJwt],
    schema: { tags: ['Suppliers'], summary: 'Lista fornecedores (paginado, com busca)', security: auth, querystring: docs.listQuerySchema, response: { 200: docs.supplierListResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Querystring: ListQuery }>, reply: FastifyReply) => { await SupplierController.findAll(req, reply) });

  server.get<{ Params: Params }>("/suppliers/:id", {
    onRequest: [verifyJwt],
    schema: { tags: ['Suppliers'], summary: 'Busca fornecedor por ID', security: auth, params: docs.idParamSchema, response: { 200: docs.supplierSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await SupplierController.findById(req, reply) });

  server.put<{ Params: Params }>("/suppliers/:id", {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Suppliers'], summary: 'Atualiza fornecedor (MANAGER/ADMIN)', security: auth, params: docs.idParamSchema, body: docs.updateSupplierBodySchema, response: { 200: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await SupplierController.update(req, reply) });

  server.delete<{ Params: Params }>("/suppliers/:id", {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Suppliers'], summary: 'Remove fornecedor (MANAGER/ADMIN)', security: auth, params: docs.idParamSchema, response: { 200: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await SupplierController.delete(req, reply) });

  //server for the Category entity
  server.post("/categories", {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Categories'], summary: 'Cria uma categoria (MANAGER/ADMIN)', security: auth, body: docs.createCategoryBodySchema, response: { 201: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest, reply: FastifyReply) => { await CategoryController.create(req, reply) });

  server.get<{ Querystring: ListQuery }>("/categories", {
    onRequest: [verifyJwt],
    schema: { tags: ['Categories'], summary: 'Lista categorias (paginado, com busca)', security: auth, querystring: docs.listQuerySchema, response: { 200: docs.categoryListResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Querystring: ListQuery }>, reply: FastifyReply) => { await CategoryController.findAll(req, reply) });

  server.get<{ Params: Params }>("/categories/:id", {
    onRequest: [verifyJwt],
    schema: { tags: ['Categories'], summary: 'Busca categoria por ID', security: auth, params: docs.idParamSchema, response: { 200: docs.categorySchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CategoryController.findById(req, reply) });

  server.put<{ Params: Params }>("/categories/:id", {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Categories'], summary: 'Atualiza categoria (MANAGER/ADMIN)', security: auth, params: docs.idParamSchema, body: docs.updateCategoryBodySchema, response: { 204: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CategoryController.update(req, reply) });

  server.delete<{ Params: Params }>("/categories/:id", {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Categories'], summary: 'Remove categoria (MANAGER/ADMIN)', security: auth, params: docs.idParamSchema, response: { 204: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CategoryController.delete(req, reply) });

  //server for the Budget entity (dono do orçamento ou MANAGER/ADMIN — checagem fina feita no controller)
  server.post<{ Body: CreateBudgetData }>("/budgets", {
    onRequest: [verifyJwt],
    schema: { tags: ['Budgets'], summary: 'Cria um orçamento em nome do usuário autenticado', security: auth, body: docs.createBudgetBodySchema, response: { 201: docs.budgetSummarySchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Body: CreateBudgetData }>, reply: FastifyReply) => { await BudgetController.createBudget(req, reply) });

  server.post<{ Body: AddItemData }>("/budgets/additem", {
    onRequest: [verifyJwt],
    schema: { tags: ['Budgets'], summary: 'Adiciona um item (produto ou serviço) a um orçamento', security: auth, body: docs.addBudgetItemBodySchema, response: { 201: docs.budgetItemSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Body: AddItemData }>, reply: FastifyReply) => { await BudgetController.addItem(req, reply) });

  server.patch<{ Params: BudgetItemParams; Body: UpdateBudgetItemData }>("/budgets/:budgetId/items/:itemId", {
    onRequest: [verifyJwt],
    schema: { tags: ['Budgets'], summary: 'Atualiza quantidade/desconto de um item do orçamento', security: auth, params: docs.budgetItemParamsSchema, body: docs.updateBudgetItemBodySchema, response: { 200: docs.budgetItemSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: BudgetItemParams; Body: UpdateBudgetItemData }>, reply: FastifyReply) => { await BudgetController.updateItem(req, reply) });

  server.delete<{ Params: BudgetItemParams }>("/budgets/:budgetId/items/:itemId", {
    onRequest: [verifyJwt],
    schema: { tags: ['Budgets'], summary: 'Remove um item do orçamento', security: auth, params: docs.budgetItemParamsSchema, response: { 204: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: BudgetItemParams }>, reply: FastifyReply) => { await BudgetController.removeItem(req, reply) });

  server.post<{ Body: ApplyDiscountData }>("/budgets/applydiscount", {
    onRequest: [verifyJwt],
    schema: { tags: ['Budgets'], summary: 'Aplica desconto a um orçamento', security: auth, body: docs.applyDiscountBodySchema, response: { 200: docs.budgetSummarySchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Body: ApplyDiscountData }>, reply: FastifyReply) => { await BudgetController.applyDiscount(req, reply) });

  server.get<{ Querystring: BudgetListQuery }>("/budgets", {
    onRequest: [verifyJwt],
    schema: { tags: ['Budgets'], summary: 'Lista orçamentos (USER só vê os próprios; MANAGER/ADMIN veem todos)', security: auth, querystring: docs.budgetListQuerySchema, response: { 200: docs.budgetListResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Querystring: BudgetListQuery }>, reply: FastifyReply) => { await BudgetController.findAll(req, reply) });

  server.get<{ Params: Params }>("/budgets/:id", {
    onRequest: [verifyJwt],
    schema: { tags: ['Budgets'], summary: 'Busca orçamento por ID (dono ou MANAGER/ADMIN)', security: auth, params: docs.idParamSchema, response: { 200: docs.budgetDetailSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await BudgetController.findById(req, reply) });

  server.patch<{ Params: Params; Body: UpdateBudgetData }>("/budgets/:id", {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Budgets'], summary: 'Aprova ou rejeita um orçamento (MANAGER/ADMIN)', security: auth, params: docs.idParamSchema, body: docs.approveBudgetBodySchema, response: { 200: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params; Body: UpdateBudgetData }>, reply: FastifyReply) => { await BudgetController.approveBudget(req, reply) });

  // server for the Service entity
  server.post("/services", {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Services'], summary: 'Cria um serviço (MANAGER/ADMIN)', security: auth, body: docs.createServiceBodySchema, response: { 201: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest, reply: FastifyReply) => { await ServiceController.create(req, reply) });

  server.get<{ Querystring: ListQuery }>("/services", {
    onRequest: [verifyJwt],
    schema: { tags: ['Services'], summary: 'Lista serviços (paginado, com busca)', security: auth, querystring: docs.listQuerySchema, response: { 200: docs.serviceListResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Querystring: ListQuery }>, reply: FastifyReply) => { await ServiceController.findAll(req, reply) });

  server.get<{ Params: Params }>("/services/:id", {
    onRequest: [verifyJwt],
    schema: { tags: ['Services'], summary: 'Busca serviço por ID', security: auth, params: docs.idParamSchema, response: { 200: docs.serviceSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await ServiceController.findById(req, reply) });

  server.put<{ Params: Params }>("/services/:id", {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Services'], summary: 'Atualiza serviço (MANAGER/ADMIN)', security: auth, params: docs.idParamSchema, body: docs.updateServiceBodySchema, response: { 200: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await ServiceController.update(req, reply) });

  server.delete<{ Params: Params }>("/services/:id", {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Services'], summary: 'Remove serviço (MANAGER/ADMIN)', security: auth, params: docs.idParamSchema, response: { 200: docs.emptyResponseSchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await ServiceController.delete(req, reply) });

  // server for the Dashboard (visão gerencial)
  server.get<{ Querystring: DashboardQuery }>("/dashboard/summary", {
    onRequest: [verifyJwt, managerOrAdmin],
    schema: { tags: ['Dashboard'], summary: 'Indicadores gerenciais (MANAGER/ADMIN)', security: auth, querystring: docs.dashboardQuerySchema, response: { 200: docs.dashboardSummarySchema, ...errorResponses } },
  }, async (req: FastifyRequest<{ Querystring: DashboardQuery }>, reply: FastifyReply) => { await DashboardController.summary(req, reply) });

  // default route for the API
  server.get("/", { schema: { hide: true } }, async (req: FastifyRequest, reply: FastifyReply) => { reply.send({ message: "Welcome to the API" }) });

  // default route if cannot find any route
  server.setNotFoundHandler(async (req: FastifyRequest, reply: FastifyReply) => { reply.status(404).send({ message: "Route not found" }) });
}
