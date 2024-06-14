# Sistema de Criação de Orçamentos - Backend CRUD

Bem-vindo ao repositório do backend do Sistema de Criação de Orçamentos! Este projeto é uma API RESTful desenvolvida em TypeScript, focada na gestão de orçamentos e seus respectivos dados, como empresas, usuários, clientes, produtos, fornecedores, categorias, cidades e serviços. A aplicação utiliza o Prisma como ORM para a gestão do banco de dados.

## Sumário

- [Instalação](#instalação)
- [Uso](#uso)
- [Rotas Disponíveis](#rotas-disponíveis)
- [Dependências](#dependências)
- [Contribuição](#contribuição)

## Instalação

1. Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/sistema-orcamentos-backend.git
    ```
2. Navegue até o diretório do projeto:
    ```bash
    cd sistema-orcamentos-backend
    ```
3. Instale as dependências:
    ```bash
    npm install
    ```
4. Configure o banco de dados no arquivo `.env`:
    ```env
    DATABASE_URL="seu_url_do_banco_de_dados"
    ```
5. Execute as migrações do banco de dados:
    ```bash
    npx prisma migrate dev
    ```
6. Inicie o servidor:
    ```bash
    npm run dev
    ```

## Uso

Após seguir os passos de instalação, o servidor estará rodando em `http://localhost:3000`. Utilize uma ferramenta como Postman ou Insomnia para interagir com as rotas disponíveis.

## Rotas Disponíveis

### Empresa (Company)
- **POST /company**: Criação de uma nova empresa.
- **GET /company**: Listagem de todas as empresas.
- **PUT /company/:id**: Atualização de uma empresa específica.

### Usuário (User)
- **POST /users**: Criação de um novo usuário.
- **GET /users**: Listagem de todos os usuários.
- **GET /users/:id**: Busca de um usuário específico.
- **PUT /users/:id**: Atualização de um usuário específico.
- **PATCH /users/:id**: Atualização da senha de um usuário específico.
- **DELETE /users/:id**: Exclusão de um usuário específico.

### Cidade (City)
- **POST /cities**: Criação de uma nova cidade.
- **GET /cities**: Listagem de todas as cidades.
- **GET /cities/:id**: Busca de uma cidade específica.
- **PUT /cities/:id**: Atualização de uma cidade específica.
- **DELETE /cities/:id**: Exclusão de uma cidade específica.

### Cliente (Client)
- **POST /clients**: Criação de um novo cliente.
- **GET /clients**: Listagem de todos os clientes.
- **GET /clients/:id**: Busca de um cliente específico.
- **PUT /clients/:id**: Atualização de um cliente específico.
- **DELETE /clients/:id**: Exclusão de um cliente específico.

### Produto (Product)
- **POST /products**: Criação de um novo produto.
- **GET /products**: Listagem de todos os produtos.
- **GET /products/:id**: Busca de um produto específico.
- **PUT /products/:id**: Atualização de um produto específico.
- **DELETE /products/:id**: Exclusão de um produto específico.

### Fornecedor (Supplier)
- **POST /suppliers**: Criação de um novo fornecedor.
- **GET /suppliers**: Listagem de todos os fornecedores.
- **GET /suppliers/:id**: Busca de um fornecedor específico.
- **PUT /suppliers/:id**: Atualização de um fornecedor específico.
- **DELETE /suppliers/:id**: Exclusão de um fornecedor específico.

### Categoria (Category)
- **POST /categories**: Criação de uma nova categoria.
- **GET /categories**: Listagem de todas as categorias.
- **GET /categories/:id**: Busca de uma categoria específica.
- **PUT /categories/:id**: Atualização de uma categoria específica.
- **DELETE /categories/:id**: Exclusão de uma categoria específica.

### Orçamento (Budget)
- **POST /budgets**: Criação de um novo orçamento.
- **POST /budgets/additem**: Adição de um item ao orçamento.
- **POST /budgets/applydiscount**: Aplicação de desconto ao orçamento.
- **GET /budgets**: Listagem de todos os orçamentos.
- **GET /budgets/:id**: Busca de um orçamento específico.
- **PATCH /budgets/:id**: Aprovação de um orçamento específico.

### Serviço (Service)
- **POST /services**: Criação de um novo serviço.
- **GET /services**: Listagem de todos os serviços.
- **GET /services/:id**: Busca de um serviço específico.
- **PUT /services/:id**: Atualização de um serviço específico.
- **DELETE /services/:id**: Exclusão de um serviço específico.

## Dependências

### Produção
- `express`: Framework web para Node.js.
- `prisma`: ORM para interagir com o banco de dados.

### Desenvolvimento
- `@types/bcryptjs`: Tipagem para a biblioteca bcryptjs.
- `@types/express`: Tipagem para a biblioteca express.
- `@types/node`: Tipagem para Node.js.
- `prisma`: ORM utilizado para o gerenciamento do banco de dados.
- `ts-node`: Executa código TypeScript diretamente no Node.js.
- `tsx`: Suporte ao ecossistema TypeScript.
- `typescript`: Linguagem utilizada no desenvolvimento do projeto.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests. Para grandes mudanças, por favor, abra uma issue primeiro para discutir o que você gostaria de mudar.

1. Fork o projeto.
2. Crie uma nova branch (`git checkout -b feature/nova-feature`).
3. Faça suas alterações e commit (`git commit -am 'Adiciona nova feature'`).
4. Faça o push para a branch (`git push origin feature/nova-feature`).
5. Abra um Pull Request.
