import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { Params, UpdatePasswordBody, CreateBudgetData, AddItemData, ApplyDiscountData, UpdateBudgetData, Login } from "./utils/types";
import CityController from "./controllers/city/CityController";
import ProductController from "./controllers/products/ProductController";
import CategoryController from "./controllers/category/CategoryController";
import BudgetController from "./controllers/budget/BudgetController";
import UserController from "./controllers/user/UserController";
import CompanyController from "./controllers/company/CompanyController";
import CustomerController from "./controllers/customer/CustomerController";
import SupplierController from "./controllers/supplier/SupplierController";
import ServiceController from "./controllers/service/ServiceController";
import { verifyJwt } from "./middlewares/JWTAuth";

export async function routes(server: FastifyInstance) {
  // server for the City entity
  server.post('/cities', { onRequest: [verifyJwt] }, async (req: FastifyRequest, reply: FastifyReply) => { await CityController.create(req, reply) });
  server.get('/cities', { onRequest: [verifyJwt] }, async (req: FastifyRequest, reply: FastifyReply) => { await CityController.findAll(req, reply) });
  server.get<{ Params: Params }>('/cities/:id', { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CityController.findById(req, reply); });
  server.put<{ Params: Params }>('/cities/:id', { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CityController.update(req, reply); });
  server.delete<{ Params: Params }>('/cities/:id', { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CityController.delete(req, reply); });

  // server for the Company entity
  server.post("/company", { onRequest: [verifyJwt] }, async (req: FastifyRequest, reply: FastifyReply) => { await CompanyController.create(req, reply) });
  server.get("/company", { onRequest: [verifyJwt] }, async (req: FastifyRequest, reply: FastifyReply) => { await CompanyController.findAll(req, reply) });
  server.put<{ Params: Params }>("/company/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CompanyController.update(req, reply) });

  // server for the User entity
  server.post("/users", async (req: FastifyRequest, reply: FastifyReply) => { await UserController.create(req, reply) });
  server.get('/users', { onRequest: [verifyJwt] }, async (req: FastifyRequest, reply: FastifyReply) => { await UserController.findAll(req, reply); });
  server.get<{ Params: Params }>('/users/:id', { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await UserController.findById(req, reply); });
  server.put<{ Params: Params }>('/users/:id', { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await UserController.update(req, reply); });
  server.patch<{ Params: Params; Body: UpdatePasswordBody }>("/users/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params; Body: UpdatePasswordBody }>, reply: FastifyReply) => { await UserController.updatePassword(req, reply); });
  server.delete<{ Params: Params }>("/users/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await UserController.delete(req, reply); });
  server.post('/users/login', async (req: FastifyRequest<{ Params: Params; Body: Login }>, reply: FastifyReply) => { await UserController.login(req, reply); });
  server.delete('/users/logout', async (req: FastifyRequest, reply: FastifyReply) => { await UserController.logout(req, reply); });

  // server for the Client entity
  server.post("/clients", { onRequest: [verifyJwt] }, async (req: FastifyRequest, reply: FastifyReply) => { await CustomerController.create(req, reply) });
  server.get("/clients", { onRequest: [verifyJwt] }, async (req: FastifyRequest, reply: FastifyReply) => { await CustomerController.findAll(req, reply) });
  server.get<{ Params: Params }>("/clients/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CustomerController.findById(req, reply) });
  server.put<{ Params: Params }>("/clients/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CustomerController.update(req, reply) });
  server.delete<{ Params: Params }>("/clients/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CustomerController.delete(req, reply) });

  // server for the Product entity
  server.post("/products", { onRequest: [verifyJwt] }, async (req: FastifyRequest, reply: FastifyReply) => { await ProductController.create(req, reply) });
  server.get("/products", { onRequest: [verifyJwt] }, async (req: FastifyRequest, reply: FastifyReply) => { await ProductController.findAll(req, reply) });
  server.get<{ Params: Params }>("/products/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await ProductController.findById(req, reply) });
  server.put<{ Params: Params }>("/products/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await ProductController.update(req, reply) });
  server.delete<{ Params: Params }>("/products/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await ProductController.delete(req, reply) });

  // server for the Supplier entity
  server.post("/suppliers", { onRequest: [verifyJwt] }, async (req: FastifyRequest, reply: FastifyReply) => { await SupplierController.create(req, reply) });
  server.get("/suppliers", { onRequest: [verifyJwt] }, async (req: FastifyRequest, reply: FastifyReply) => { await SupplierController.findAll(req, reply) });
  server.get<{ Params: Params }>("/suppliers/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await SupplierController.findById(req, reply) });
  server.put<{ Params: Params }>("/suppliers/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await SupplierController.update(req, reply) });
  server.delete<{ Params: Params }>("/suppliers/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await SupplierController.delete(req, reply) });

  //server for the Category entity
  server.post("/categories", { onRequest: [verifyJwt] }, async (req: FastifyRequest, reply: FastifyReply) => { await CategoryController.create(req, reply) });
  server.get("/categories", { onRequest: [verifyJwt] }, async (req: FastifyRequest, reply: FastifyReply) => { await CategoryController.findAll(req, reply) });
  server.get<{ Params: Params }>("/categories/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CategoryController.findById(req, reply) });
  server.put<{ Params: Params }>("/categories/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CategoryController.update(req, reply) });
  server.delete<{ Params: Params }>("/categories/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CategoryController.delete(req, reply) });

  //server for the Budget entity
  server.post<{ Body: CreateBudgetData }>("/budgets", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Body: CreateBudgetData }>, reply: FastifyReply) => { await BudgetController.createBudget(req, reply) });
  server.post<{ Body: AddItemData }>("/budgets/additem", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Body: AddItemData }>, reply: FastifyReply) => { await BudgetController.addItem(req, reply) });
  server.post<{ Body: ApplyDiscountData }>("/budgets/applydiscount", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Body: ApplyDiscountData }>, reply: FastifyReply) => { await BudgetController.applyDiscount(req, reply) });
  server.get("/budgets", { onRequest: [verifyJwt] }, async (req: FastifyRequest, reply: FastifyReply) => { await BudgetController.findAll(req, reply) });
  server.get<{ Params: Params }>("/budgets/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await BudgetController.findById(req, reply) });
  server.patch<{ Params: Params; Body: UpdateBudgetData }>("/budgets/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params; Body: UpdateBudgetData }>, reply: FastifyReply) => { await BudgetController.approveBudget(req, reply) });
  // server for the Service entity
  server.post("/services", { onRequest: [verifyJwt] }, async (req: FastifyRequest, reply: FastifyReply) => { await ServiceController.create(req, reply) });
  server.get("/services", { onRequest: [verifyJwt] }, async (req: FastifyRequest, reply: FastifyReply) => { await ServiceController.findAll(req, reply) });
  server.get<{ Params: Params }>("/services/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await ServiceController.findById(req, reply) });
  server.put<{ Params: Params }>("/services/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await ServiceController.update(req, reply) });
  server.delete<{ Params: Params }>("/services/:id", { onRequest: [verifyJwt] }, async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await ServiceController.delete(req, reply) });

  // default route for the API
  server.get("/", async (req: FastifyRequest, reply: FastifyReply) => { reply.send({ message: "Welcome to the API" }) });

  // default route if cannot find any route
  server.setNotFoundHandler(async (req: FastifyRequest, reply: FastifyReply) => { reply.status(404).send({ message: "Route not found" }) });
}