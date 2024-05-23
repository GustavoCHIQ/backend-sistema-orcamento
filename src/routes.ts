import { Router } from "express";
import UserController from "./controllers/user/UserController";
import ProductController from "./controllers/products/ProductController";
import CategoryController from "./controllers/category/CategoryController";
import BudgetController from "./controllers/budget/BudgetController";
import CompanyController from "./controllers/company/CompanyController";
import CityController from "./controllers/city/CityController";
import ClientController from "./controllers/client/ClientController";
import SupplierController from "./controllers/supplier/SupplierController";
const routes = Router();

routes.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

// Routes for the Company entity
routes.post("/company", new CompanyController().create);
routes.get("/company", new CompanyController().findAll);
routes.put("/company/:id", new CompanyController().update);

// Routes for the User entity
routes.post("/users", new UserController().create);
routes.get("/users", new UserController().findAll);
routes.get("/users/:id", new UserController().findById);
routes.put("/users/:id", new UserController().update);
routes.patch("/users/:id", new UserController().updatePassword);
routes.delete("/users/:id", new UserController().delete);

// Routes for the City entity
routes.post("/cities", new CityController().create);
routes.get("/cities", new CityController().findAll);
routes.get("/cities/:id", new CityController().findById);
routes.put("/cities/:id", new CityController().update);
routes.delete("/cities/:id", new CityController().delete);

// Routes for the Client entity
routes.post("/clients", new ClientController().create);
routes.get("/clients", new ClientController().findAll);
routes.get("/clients/:id", new ClientController().findById);
routes.put("/clients/:id", new ClientController().update);
routes.delete("/clients/:id", new ClientController().delete);

// Routes for the Product entity
routes.post("/products", new ProductController().create);
routes.get("/products", new ProductController().findAll);
routes.get("/products/:id", new ProductController().findById);
routes.put("/products/:id", new ProductController().update);
routes.delete("/products/:id", new ProductController().delete);

// Routes for the Supplier entity
routes.post("/suppliers", new SupplierController().create);
routes.get("/suppliers", new SupplierController().findAll);
routes.get("/suppliers/:id", new SupplierController().findById);
routes.put("/suppliers/:id", new SupplierController().update);
routes.delete("/suppliers/:id", new SupplierController().delete);

//Routes for the Category entity
routes.post("/categories", new CategoryController().create);
routes.get("/categories", new CategoryController().findAll);
routes.get("/categories/:id", new CategoryController().findById);
routes.put("/categories/:id", new CategoryController().update);
routes.delete("/categories/:id", new CategoryController().delete);

//Routes for the Budget entity
routes.post("/budgets", new BudgetController().createBudget);
routes.post("/budgets/additem", new BudgetController().addItem);
routes.post("/budgets/applydiscount", new BudgetController().applyDiscount);
routes.get("/budgets", new BudgetController().findAll);
routes.get("/budgets/:id", new BudgetController().findById);
routes.patch("/budgets/:id", new BudgetController().approveBudget);

export default routes;