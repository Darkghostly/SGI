const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const prisma = require('./services/prisma');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

const PORT = process.env.PORT || 3000;

const bcrypt = require('bcryptjs');

async function seedDevUser() {
  const existingDev = await prisma.usuario.findFirst({
    where: { role: 'DEV' }
  });
  if (!existingDev) {
    const senhaHash = await bcrypt.hash('123456', 10);
    await prisma.usuario.create({
      data: {
        nome: 'Super Admin',
        email: 'dev@stockos.com',
        senhaHash,
        role: 'DEV'
      }
    });
    console.log('Usuário DEV padrão criado: dev@stockos.com / 123456');
  }
}

app.listen(PORT, async () => {
  console.log(`Servidor Express rodando na porta ${PORT}`);
  try {
    await prisma.$connect();
    console.log('Conectado ao Banco de Dados SQLite (via Prisma)');
    await seedDevUser();
  } catch (error) {
    console.error('Erro ao conectar no banco:', error);
  }
});
