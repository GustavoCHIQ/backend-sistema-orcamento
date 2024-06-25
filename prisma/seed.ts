import { log } from 'console';

(async () => {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  async function main() {
    const categorias = await prisma.categorias.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Câmeras',
      },
    });
    log("Categoria criada com sucesso 💡");

    const cidades = await prisma.cidades.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Naviraí',
        state: 'MS',
        country: 'Brasil',
        cep: '79950000',
      },
    });
    log("Cidade criada com sucesso 🏙️");

    const empresas = await prisma.empresa.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Usonet Telecom",
        cnpj: "01412262000126",
        phone: "123456789",
        ie: "123456789",
        email: "usonet@usonet.com.br",
        address: "Rua Jamil Selem, 51",
        city: "Naviraí",
      },
    });
    log("Empresa criada com sucesso 🏨");

    const usuarios = await prisma.usuarios.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Admin",
        password: "admin",
        email: "admin@usonet.com.br"
      },
    });

    const clientes = await prisma.clientes.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Luis Gustavo",
        email: "gustavochiqui@gmail.com",
        phone: "",
        type: 'PessoaFisica',
        cpfOrCnpj: "123456789",
        rgOrIe: "123456789",
        cityId: 1,
        address: "Rua Eldorado, 1674",
      }
    });
    log("Cliente criado com sucesso 🧑");

    const fornecedores = await prisma.fornecedores.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Canon",
        contactInfo: "67 99999-9999",
        email: "canon@canon.com.br",
        cnpj: "123456789",
      },
    });
    log("Fornecedor criado com sucesso 📦");

    const produtos = await prisma.produtos.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Câmera Canon",
        description: "Câmera Canon 5D Mark IV",
        price: 13947,
        categoryId: 1,
        supplierId: 1,
        units: 'UN'
      }
    });
    log("Produto criado com sucesso 📸");
  }

  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
})();
