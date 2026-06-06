const prisma = require('../services/prisma');

const movimentacaoController = {
  listar: async (req, res) => {
    try {
      const movs = await prisma.movimentacao.findMany({
        include: { produto: true }
      });
      const formatados = movs.map(m => ({
        id: m.id,
        produtoId: m.produtoId,
        nomeProduto: m.produto ? m.produto.nome : 'Desconhecido',
        tipo: m.tipo,
        quantidade: m.quantidade,
        observacao: m.observacao,
        data: m.data
      }));
      res.json(formatados);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  registrar: async (req, res) => {
    try {
      const { produtoId, tipo, quantidade, observacao } = req.body;
      
      const prod = await prisma.produto.findUnique({
        where: { id: parseInt(produtoId, 10) }
      });

      if (!prod) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      const qtd = parseInt(quantidade, 10);
      if (tipo === 'saida' && prod.quantidade < qtd) {
        return res.status(400).json({ error: 'Estoque insuficiente' });
      }

      const novaQtd = tipo === 'entrada' ? prod.quantidade + qtd : prod.quantidade - qtd;

      const [mov] = await prisma.$transaction([
        prisma.movimentacao.create({
          data: {
            produtoId: prod.id,
            tipo,
            quantidade: qtd,
            observacao,
            data: new Date().toLocaleString('pt-BR')
          }
        }),
        prisma.produto.update({
          where: { id: prod.id },
          data: { quantidade: novaQtd }
        })
      ]);

      res.status(201).json(mov);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = movimentacaoController;
