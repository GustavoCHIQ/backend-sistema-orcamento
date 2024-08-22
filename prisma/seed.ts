import { log } from 'console';

(async () => {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  async function main() {
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

    const usuarios = await prisma.usuarios.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Admin",
        password: "admin",
        email: "admin@usonet.com.br"
      },
    });
    log("Usuário criado com sucesso 👤");
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
