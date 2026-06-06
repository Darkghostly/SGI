const prisma = require('../services/prisma');
const bcrypt = require('bcryptjs');

const adminController = {
  resetDatabase: async (req, res) => {
    try {
      // Must be enforced by requireDev middleware
      await prisma.$transaction([
        prisma.movimentacao.deleteMany({}),
        prisma.produto.deleteMany({})
      ]);
      res.json({ message: 'Banco de dados (Estoque e Movimentações) zerado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao zerar o banco de dados' });
    }
  },

  listarUsuarios: async (req, res) => {
    try {
      const users = await prisma.usuario.findMany({
        select: { id: true, nome: true, email: true, role: true }
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  },

  atualizarUsuario: async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { nome, email, senha } = req.body;
      
      const user = await prisma.usuario.findUnique({ where: { id } });
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
      
      let dataToUpdate = { nome, email };
      if (senha && senha.trim() !== '') {
        dataToUpdate.senhaHash = await bcrypt.hash(senha, 10);
      }
      
      const updatedUser = await prisma.usuario.update({
        where: { id },
        data: dataToUpdate,
        select: { id: true, nome: true, email: true, role: true }
      });
      
      res.json(updatedUser);
    } catch (error) {
      if (error.code === 'P2002') return res.status(400).json({ error: 'Email já cadastrado' });
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  },

  deletarUsuario: async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await prisma.usuario.findUnique({ where: { id } });
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
      if (user.role === 'DEV') return res.status(403).json({ error: 'Não é possível excluir o super administrador' });
      
      await prisma.usuario.delete({ where: { id } });
      res.json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
  }
};

module.exports = adminController;
