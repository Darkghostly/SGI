const prisma = require('../services/prisma');

function parseDataBr(dataStr) {
  if (!dataStr) return new Date();
  const parts = dataStr.replace(',', '').split(' ');
  const dateParts = parts[0].split('/');
  if (dateParts.length !== 3) return new Date();
  const isoStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${parts[1] || '00:00:00'}`;
  return new Date(isoStr);
}

const getEvolucao = async (req, res) => {
  try {
    const { filtro, categoria } = req.query; 

    const produtos = await prisma.produto.findMany();
    const movimentacoes = await prisma.movimentacao.findMany({
      orderBy: { id: 'asc' },
      include: { produto: true }
    });

    let validProducts = produtos;
    let validMovimentacoes = movimentacoes;

    if (categoria && categoria !== 'Todas') {
      validProducts = produtos.filter(p => p.categoria === categoria);
      validMovimentacoes = validMovimentacoes.filter(m => m.produto.categoria === categoria);
    }

    // 1. Calculate Initial State (Before any movements)
    const initialStock = {};
    validProducts.forEach(p => {
      initialStock[p.id] = { qty: p.quantidade, preco: parseFloat(p.preco) };
    });

    // Roll backwards to find initial stock BEFORE the first recorded movement
    validMovimentacoes.forEach(m => {
       const prod = initialStock[m.produtoId];
       if (prod) {
          if (m.tipo.toLowerCase() === 'entrada') {
             prod.qty -= m.quantidade;
          } else {
             prod.qty += m.quantidade;
          }
       }
    });

    let runningUnits = 0;
    let runningValue = 0;
    Object.values(initialStock).forEach(p => {
       runningUnits += p.qty;
       runningValue += p.qty * p.preco;
    });

    // 2. Generate daily timeline
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    
    let startDate = new Date();
    if (filtro === 'mês') startDate.setDate(hoje.getDate() - 30);
    else if (filtro === 'bimestre') startDate.setDate(hoje.getDate() - 60);
    else if (filtro === 'semestre') startDate.setDate(hoje.getDate() - 180);
    else if (filtro === 'ano') startDate.setDate(hoje.getDate() - 365);
    else {
       let earliestDate = new Date(hoje);
       validProducts.forEach(p => {
          const d = parseDataBr(p.criadoEm);
          if (d < earliestDate) earliestDate = d;
       });

       if (validMovimentacoes.length > 0) {
          const earliestMovDate = parseDataBr(validMovimentacoes[0].data);
          if (earliestMovDate < earliestDate) earliestDate = earliestMovDate;
       }
       
       startDate = new Date(earliestDate);
       startDate.setDate(startDate.getDate() - 1);
    }
    
    startDate.setHours(0, 0, 0, 0);

    // Apply movements before start date
    const movementsBeforeStart = validMovimentacoes.filter(m => parseDataBr(m.data) < startDate);
    movementsBeforeStart.forEach(m => {
       const preco = parseFloat(m.produto.preco);
       if (m.tipo.toLowerCase() === 'entrada') {
          runningUnits += m.quantidade;
          runningValue += m.quantidade * preco;
       } else {
          runningUnits -= m.quantidade;
          runningValue -= m.quantidade * preco;
       }
    });

    const movementsInWindow = validMovimentacoes.filter(m => parseDataBr(m.data) >= startDate);
    const movsByMonth = {};
    movementsInWindow.forEach(m => {
       const d = parseDataBr(m.data);
       const monthStr = d.toISOString().substring(0, 7); // YYYY-MM
       if (!movsByMonth[monthStr]) movsByMonth[monthStr] = [];
       movsByMonth[monthStr].push(m);
    });

    const dataPoints = [];
    let currentDate = new Date(startDate);
    currentDate.setDate(1); // start at the first of the month
    
    while (currentDate <= hoje || (currentDate.getFullYear() === hoje.getFullYear() && currentDate.getMonth() === hoje.getMonth())) {
       const monthStr = currentDate.toISOString().substring(0, 7);
       
       if (movsByMonth[monthStr]) {
          movsByMonth[monthStr].forEach(m => {
             const preco = parseFloat(m.produto.preco);
             if (m.tipo.toLowerCase() === 'entrada') {
                runningUnits += m.quantidade;
                runningValue += m.quantidade * preco;
             } else {
                runningUnits -= m.quantidade;
                runningValue -= m.quantidade * preco;
             }
          });
       }

       const [yyyy, mm] = monthStr.split('-');
       dataPoints.push({
          date: `${mm}/${yyyy}`,
          units: runningUnits,
          value: runningValue
       });

       currentDate.setMonth(currentDate.getMonth() + 1);
    }

    res.json(dataPoints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar evolução' });
  }
};

module.exports = { getEvolucao };
