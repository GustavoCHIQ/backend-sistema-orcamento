import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { Params, UpdatePasswordBody, CreateBudgetData, AddItemData, ApplyDiscountData, UpdateBudgetData } from "./utils/types";
import CityController from "./controllers/city/CityController";
import ProductController from "./controllers/products/ProductController";
import CategoryController from "./controllers/category/CategoryController";
import BudgetController from "./controllers/budget/BudgetController";
import UserController from "./controllers/user/UserController";
import CompanyController from "./controllers/company/CompanyController";
import CustomerController from "./controllers/customer/CustomerController";
import SupplierController from "./controllers/supplier/SupplierController";
import ServiceController from "./controllers/service/ServiceController";

export async function routes(server: FastifyInstance) {
  // server for the City entity
  server.post('/cities', async (req: FastifyRequest, reply: FastifyReply) => { await CityController.create(req, reply) });
  server.get('/cities', async (req: FastifyRequest, reply: FastifyReply) => { await CityController.findAll(req, reply) });
  server.get('/cities/:id', async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CityController.findById(req, reply) });
  server.put('/cities/:id', async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CityController.update(req, reply) });
  server.delete("/cities/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CityController.delete(req, reply) });

  // server for the Company entity
  server.post("/company", async (req: FastifyRequest, reply: FastifyReply) => { await CompanyController.create(req, reply) });
  server.get("/company", async (req: FastifyRequest, reply: FastifyReply) => { await CompanyController.findAll(req, reply) });
  server.put("/company/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CompanyController.update(req, reply) });

  // server for the User entity
  server.post("/users", async (req: FastifyRequest, reply: FastifyReply) => { await UserController.create(req, reply) });
  server.get("/users", async (req: FastifyRequest, reply: FastifyReply) => { await UserController.findAll(req, reply) });
  server.get("/users/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await UserController.findById(req, reply) });
  server.put("/users/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await UserController.update(req, reply) });
  server.patch("/users/:id", async (req: FastifyRequest<{ Params: Params; Body: UpdatePasswordBody }>, reply: FastifyReply) => { await UserController.updatePassword(req, reply) });
  server.delete("/users/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await UserController.delete(req, reply) });

  // server for the Client entity
  server.post("/clients", async (req: FastifyRequest, reply: FastifyReply) => { await CustomerController.create(req, reply) });
  server.get("/clients", async (req: FastifyRequest, reply: FastifyReply) => { await CustomerController.findAll(req, reply) });
  server.get("/clients/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CustomerController.findById(req, reply) });
  server.put("/clients/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CustomerController.update(req, reply) });
  server.delete("/clients/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CustomerController.delete(req, reply) });

  // server for the Product entity
  server.post("/products", async (req: FastifyRequest, reply: FastifyReply) => { await ProductController.create(req, reply) });
  server.get("/products", async (req: FastifyRequest, reply: FastifyReply) => { await ProductController.findAll(req, reply) });
  server.get("/products/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await ProductController.findById(req, reply) });
  server.put("/products/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await ProductController.update(req, reply) });
  server.delete("/products/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await ProductController.delete(req, reply) });

  // server for the Supplier entity
  server.post("/suppliers", async (req: FastifyRequest, reply: FastifyReply) => { await SupplierController.create(req, reply) });
  server.get("/suppliers", async (req: FastifyRequest, reply: FastifyReply) => { await SupplierController.findAll(req, reply) });
  server.get("/suppliers/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await SupplierController.findById(req, reply) });
  server.put("/suppliers/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await SupplierController.update(req, reply) });
  server.delete("/suppliers/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await SupplierController.delete(req, reply) });

  //server for the Category entity
  server.post("/categories", async (req: FastifyRequest, reply: FastifyReply) => { await CategoryController.create(req, reply) });
  server.get("/categories", async (req: FastifyRequest, reply: FastifyReply) => { await CategoryController.findAll(req, reply) });
  server.get("/categories/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CategoryController.findById(req, reply) });
  server.put("/categories/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CategoryController.update(req, reply) });
  server.delete("/categories/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await CategoryController.delete(req, reply) });

  //server for the Budget entity
  server.post("/budgets", async (req: FastifyRequest<{ Body: CreateBudgetData }>, reply: FastifyReply) => { await BudgetController.createBudget(req, reply) });
  server.get("/budgets/additem", async (req: FastifyRequest<{ Body: AddItemData }>, reply: FastifyReply) => { await BudgetController.addItem(req, reply) });
  server.get("/budgets/applydiscount", async (req: FastifyRequest<{ Body: ApplyDiscountData }>, reply: FastifyReply) => { await BudgetController.applyDiscount(req, reply) });
  server.get("/budgets", async (req: FastifyRequest, reply: FastifyReply) => { await BudgetController.findAll(req, reply) });
  server.get("/budgets/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await BudgetController.findById(req, reply) });
  server.patch("/budgets/:id", async (req: FastifyRequest<{ Params: Params; Body: UpdateBudgetData }>, reply: FastifyReply) => { await BudgetController.approveBudget(req, reply) });

  // server for the Service entity
  server.post("/services", async (req: FastifyRequest, reply: FastifyReply) => { await ServiceController.create(req, reply) });
  server.get("/services", async (req: FastifyRequest, reply: FastifyReply) => { await ServiceController.findAll(req, reply) });
  server.get("/services/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await ServiceController.findById(req, reply) });
  server.put("/services/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await ServiceController.update(req, reply) });
  server.delete("/services/:id", async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => { await ServiceController.delete(req, reply) });

  // default route for the API
  server.get("/", async (req: FastifyRequest, reply: FastifyReply) => { reply.send({ message: "Welcome to the API" }) });

  // default route if cannot find any route
  server.setNotFoundHandler(async (req: FastifyRequest, reply: FastifyReply) => { reply.status(404).send({ message: "Route not found" }) });
}