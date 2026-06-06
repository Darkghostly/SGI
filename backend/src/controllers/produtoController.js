const prisma = require('../services/prisma');

const produtoController = {
  listar: async (req, res) => {
    try {
      const prods = await prisma.produto.findMany();
      const formatados = prods.map(p => ({
        ...p,
        preco: parseFloat(p.preco)
      }));
      res.json(formatados);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  criar: async (req, res) => {
    try {
      const { nome, categoria, quantidade, preco, validade } = req.body;
      const novoProd = await prisma.produto.create({
        data: {
          nome,
          categoria,
          quantidade: parseInt(quantidade, 10),
          preco: parseFloat(preco),
          validade: validade || null,
          criadoEm: new Date().toLocaleDateString('pt-BR')
        }
      });
      res.status(201).json(novoProd);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  atualizar: async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { nome, categoria, quantidade, preco, validade } = req.body;
      const atualizado = await prisma.produto.update({
        where: { id },
        data: {
          nome,
          categoria,
          quantidade: parseInt(quantidade, 10),
          preco: parseFloat(preco),
          validade: validade || null
        }
      });
      res.json(atualizado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  deletar: async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await prisma.movimentacao.deleteMany({ where: { produtoId: id } });
      await prisma.produto.delete({ where: { id } });
      res.json({ message: 'Produto removido com sucesso' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = produtoController;
