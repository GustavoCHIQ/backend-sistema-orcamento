/**
 * Fragmentos de JSON Schema usados apenas para gerar a documentação OpenAPI/Swagger.
 * A validação em tempo de execução continua feita pelos schemas Zod dentro de cada controller
 * (ver src/index.ts: validatorCompiler/serializerCompiler são no-op de propósito, para que
 * anexar `schema` às rotas não altere nenhum comportamento já existente da API).
 */

export const emptyResponseSchema = {
  type: 'object',
  description: 'Sem conteúdo relevante no corpo da resposta',
};

export const errorResponseSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    message: { type: 'string' },
    details: {},
  },
};

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', description: 'Identificador numérico do recurso' },
  },
};

export const budgetItemParamsSchema = {
  type: 'object',
  required: ['budgetId', 'itemId'],
  properties: {
    budgetId: { type: 'string', description: 'ID do orçamento' },
    itemId: { type: 'string', description: 'ID do item do orçamento' },
  },
};

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'string', description: 'Número da página (padrão 1)' },
    limit: { type: 'string', description: 'Itens por página (padrão 20, máximo 100)' },
    search: { type: 'string', description: 'Busca textual (case-insensitive) nos campos principais do recurso' },
  },
};

export const paginationMetaSchema = {
  type: 'object',
  properties: {
    page: { type: 'integer' },
    limit: { type: 'integer' },
    total: { type: 'integer' },
    pages: { type: 'integer' },
  },
};

function paginatedResponse(itemsSchema: object) {
  return {
    type: 'object',
    properties: {
      data: { type: 'array', items: itemsSchema },
      pagination: paginationMetaSchema,
    },
  };
}

// ---------- Auth ----------
export const loginBodySchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' },
  },
};

// ---------- City ----------
export const citySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    state: { type: 'string', maxLength: 2 },
    country: { type: 'string' },
    cep: { type: 'string', minLength: 8, maxLength: 8 },
  },
};

export const createCityBodySchema = {
  type: 'object',
  required: ['name', 'state', 'country', 'cep'],
  properties: {
    name: { type: 'string' },
    state: { type: 'string', maxLength: 2 },
    country: { type: 'string' },
    cep: { type: 'string', minLength: 8 },
  },
};

export const updateCityBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    state: { type: 'string', maxLength: 2 },
    country: { type: 'string' },
    cep: { type: 'string' },
  },
};

export const cityListResponseSchema = paginatedResponse(citySchema);

// ---------- Company ----------
export const companySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    cnpj: { type: 'string' },
    phone: { type: 'string' },
    ie: { type: 'string' },
    pngLogo: { type: 'string' },
    email: { type: 'string', format: 'email' },
    address: { type: 'string' },
    city: { type: 'string' },
  },
};

export const createCompanyBodySchema = {
  type: 'object',
  required: ['name', 'cnpj', 'phone', 'ie', 'email', 'address', 'city'],
  properties: {
    name: { type: 'string' },
    cnpj: { type: 'string' },
    phone: { type: 'string' },
    ie: { type: 'string' },
    pngLogo: { type: 'string' },
    email: { type: 'string', format: 'email' },
    address: { type: 'string' },
    city: { type: 'string' },
  },
};

export const updateCompanyBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    cnpj: { type: 'string' },
    phone: { type: 'string' },
    ie: { type: 'string' },
    pngLogo: { type: 'string' },
    email: { type: 'string', format: 'email' },
    address: { type: 'string' },
    city: { type: 'string' },
  },
};

// ---------- User ----------
export const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'USER'] },
    isActive: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

export const createUserBodySchema = {
  type: 'object',
  required: ['name', 'email', 'password'],
  properties: {
    name: { type: 'string', minLength: 3 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
  },
};

export const updateUserBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 5 },
    email: { type: 'string', format: 'email' },
  },
};

export const updatePasswordBodySchema = {
  type: 'object',
  required: ['previousPassword', 'password', 'confirmPassword'],
  properties: {
    previousPassword: { type: 'string' },
    password: { type: 'string', minLength: 6 },
    confirmPassword: { type: 'string', minLength: 6 },
  },
};

export const userListResponseSchema = paginatedResponse(userSchema);

// ---------- Client (Customer) ----------
export const clientSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    type: { type: 'string', enum: ['PessoaFisica', 'PessoaJuridica'] },
    cpfOrCnpj: { type: 'string' },
    rgOrIe: { type: 'string' },
    cityId: { type: 'integer' },
    address: { type: 'string' },
  },
};

export const createClientBodySchema = {
  type: 'object',
  required: ['name', 'email', 'phone', 'type', 'cpfOrCnpj', 'rgOrIe', 'cityId', 'address'],
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    type: { type: 'string', enum: ['PessoaFisica', 'PessoaJuridica'] },
    cpfOrCnpj: { type: 'string' },
    rgOrIe: { type: 'string' },
    cityId: { type: 'integer' },
    address: { type: 'string' },
  },
};

export const updateClientBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    type: { type: 'string', enum: ['PessoaFisica', 'PessoaJuridica'] },
    cpfOrCnpj: { type: 'string' },
    rgOrIe: { type: 'string' },
    cityId: { type: 'integer' },
    address: { type: 'string' },
  },
};

export const clientListResponseSchema = paginatedResponse(clientSchema);

// ---------- Product ----------
export const productSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    description: { type: 'string' },
    price: { type: 'number' },
    categoryId: { type: 'integer' },
    supplierId: { type: 'integer' },
  },
};

export const createProductBodySchema = {
  type: 'object',
  required: ['name', 'description', 'price', 'categoryId', 'supplierId'],
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    price: { type: 'number' },
    categoryId: { type: 'integer' },
    supplierId: { type: 'integer' },
  },
};

export const updateProductBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    price: { type: 'number' },
    categoryId: { type: 'integer' },
    supplierId: { type: 'integer' },
  },
};

export const productListResponseSchema = paginatedResponse(productSchema);

// ---------- Supplier ----------
export const supplierSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    contactInfo: { type: 'string' },
    email: { type: 'string', format: 'email' },
    cnpj: { type: 'string' },
  },
};

export const createSupplierBodySchema = {
  type: 'object',
  required: ['name', 'contactInfo', 'email', 'cnpj'],
  properties: {
    name: { type: 'string' },
    contactInfo: { type: 'string' },
    email: { type: 'string', format: 'email' },
    cnpj: { type: 'string' },
  },
};

export const updateSupplierBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    contactInfo: { type: 'string' },
    email: { type: 'string', format: 'email' },
    cnpj: { type: 'string' },
  },
};

export const supplierListResponseSchema = paginatedResponse(supplierSchema);

// ---------- Category ----------
export const categorySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
  },
};

export const createCategoryBodySchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string' },
  },
};

export const updateCategoryBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
};

export const categoryListResponseSchema = paginatedResponse(categorySchema);

// ---------- Service ----------
export const serviceSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    description: { type: 'string' },
    price: { type: 'number' },
    categoryId: { type: 'integer' },
  },
};

export const createServiceBodySchema = {
  type: 'object',
  required: ['name', 'description', 'price', 'categoryId'],
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    price: { type: 'number' },
    categoryId: { type: 'integer' },
  },
};

export const updateServiceBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    price: { type: 'number' },
    categoryId: { type: 'integer' },
  },
};

export const serviceListResponseSchema = paginatedResponse(serviceSchema);

// ---------- Budget ----------
const budgetStatusEnum = ['negociacao', 'aprovado', 'execucao', 'finalizado', 'cancelado', 'perdido'];

export const budgetItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    budgetId: { type: 'integer' },
    productId: { type: 'integer', nullable: true },
    serviceId: { type: 'integer', nullable: true },
    quantity: { type: 'integer' },
    discount: { type: 'number', description: 'Percentual de 0 a 100' },
    totalPrice: { type: 'number' },
  },
};

export const budgetSummarySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    userId: { type: 'integer' },
    clientId: { type: 'integer' },
    totalPrice: { type: 'number' },
    discount: { type: 'number' },
    status: { type: 'string', enum: budgetStatusEnum },
    isApproved: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

export const budgetDetailSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    userId: { type: 'integer' },
    clientId: { type: 'integer' },
    totalPrice: { type: 'number' },
    discount: { type: 'number' },
    status: { type: 'string', enum: budgetStatusEnum },
    isApproved: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    items: { type: 'array', items: budgetItemSchema },
    user: {
      type: 'object',
      properties: { id: { type: 'integer' }, name: { type: 'string' }, email: { type: 'string' } },
    },
    client: {
      type: 'object',
      properties: {
        id: { type: 'integer' }, name: { type: 'string' }, email: { type: 'string' },
        phone: { type: 'string' }, address: { type: 'string' },
      },
    },
  },
};

export const createBudgetBodySchema = {
  type: 'object',
  required: ['clientId'],
  properties: {
    clientId: { type: 'integer', minimum: 1 },
    totalPrice: { type: 'number', minimum: 0 },
  },
};

export const addBudgetItemBodySchema = {
  type: 'object',
  required: ['budgetId', 'quantity'],
  properties: {
    budgetId: { type: 'integer', minimum: 1 },
    productId: { type: 'integer', minimum: 1, nullable: true },
    serviceId: { type: 'integer', minimum: 1, nullable: true },
    quantity: { type: 'number', minimum: 0, exclusiveMinimum: true },
    discount: { type: 'number', minimum: 0, maximum: 100, default: 0 },
  },
  description: 'Informe productId OU serviceId (o outro deve ser null).',
};

export const updateBudgetItemBodySchema = {
  type: 'object',
  properties: {
    quantity: { type: 'number', minimum: 0, exclusiveMinimum: true },
    discount: { type: 'number', minimum: 0, maximum: 100 },
  },
  description: 'Informe ao menos um dos dois campos.',
};

export const applyDiscountBodySchema = {
  type: 'object',
  required: ['budgetId', 'discount'],
  properties: {
    budgetId: { type: 'integer', minimum: 1 },
    discount: { type: 'number', minimum: 0, maximum: 100 },
  },
  description: 'O dono do orçamento só pode aplicar até 10% sem ser MANAGER/ADMIN.',
};

export const approveBudgetBodySchema = {
  type: 'object',
  required: ['isApproved'],
  properties: {
    isApproved: { type: 'boolean' },
  },
};

export const budgetListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'string' },
    limit: { type: 'string' },
    status: { type: 'string', enum: budgetStatusEnum },
    clientId: { type: 'string' },
    userId: { type: 'string', description: 'Somente considerado para MANAGER/ADMIN; USER sempre vê apenas os próprios orçamentos.' },
  },
};

export const budgetListResponseSchema = paginatedResponse({
  allOf: [
    budgetSummarySchema,
    {
      type: 'object',
      properties: {
        user: { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' } } },
        client: { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' } } },
        _count: { type: 'object', properties: { items: { type: 'integer' } } },
      },
    },
  ],
});

// ---------- Dashboard ----------
export const dashboardQuerySchema = {
  type: 'object',
  properties: {
    from: { type: 'string', format: 'date-time', description: 'Filtra orçamentos criados a partir desta data (ISO 8601)' },
    to: { type: 'string', format: 'date-time', description: 'Filtra orçamentos criados até esta data (ISO 8601)' },
  },
};

export const dashboardSummarySchema = {
  type: 'object',
  properties: {
    budgetsByStatus: {
      type: 'array',
      items: {
        type: 'object',
        properties: { status: { type: 'string', enum: budgetStatusEnum }, count: { type: 'integer' } },
      },
    },
    approvedRevenue: { type: 'number' },
    pendingApproval: { type: 'integer' },
    topClients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          clientId: { type: 'integer' },
          name: { type: 'string' },
          totalValue: { type: 'number' },
        },
      },
    },
  },
};
