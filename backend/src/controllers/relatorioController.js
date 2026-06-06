const prisma = require('../services/prisma');

const relatorioController = {
  gerar: async (req, res) => {
    try {
      const prods = await prisma.produto.findMany();
      const relatorio = prods.map(p => ({
        ...p,
        preco: parseFloat(p.preco),
        valorTotal: (p.quantidade * parseFloat(p.preco)).toFixed(2),
        estoqueZero: p.quantidade === 0,
      }));
      res.json(relatorio);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = relatorioController;
