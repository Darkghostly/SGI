/**
 * ============================================================
 *  SISTEMA DE GESTÃO DE INVENTÁRIO
 *  Projeto Acadêmico — Node.js puro (sem dependências externas)
 *  Armazenamento: memória | Interface: web (HTML/CSS/JS)
 * ============================================================
 *
 *  Como executar:
 *    node inventario.js
 *  Depois abra no navegador:
 *    http://localhost:3000
 * ============================================================
 */

const http = require('http');
const url  = require('url');

// ============================================================
//  MODELAGEM DE DADOS
//  Usamos classes para representar cada entidade do sistema.
//  Em um projeto real, essas classes mapeariam tabelas de banco.
// ============================================================

/**
 * Classe Produto — representa um item do inventário.
 * Campos: id, nome, categoria, quantidade, preco, criadoEm
 */
class Produto {
  constructor(nome, categoria, quantidade, preco) {
    this.id        = ++contadorId;                  // ID auto-incrementado
    this.nome      = nome.trim();
    this.categoria = categoria.trim();
    this.quantidade = parseInt(quantidade, 10);     // sempre número inteiro
    this.preco     = parseFloat(preco);             // sempre número decimal
    this.criadoEm  = new Date().toLocaleDateString('pt-BR');
  }
}

/**
 * Classe Movimentacao — registra cada entrada ou saída de estoque.
 * Associada a um Produto pelo campo produtoId.
 */
class Movimentacao {
  constructor(produtoId, nomeProduto, tipo, quantidade, observacao) {
    this.id          = ++contadorMovId;
    this.produtoId   = produtoId;
    this.nomeProduto = nomeProduto;
    this.tipo        = tipo;        // 'entrada' ou 'saida'
    this.quantidade  = parseInt(quantidade, 10);
    this.observacao  = observacao || '—';
    this.data        = new Date().toLocaleString('pt-BR');
  }
}

// ============================================================
//  BANCO DE DADOS EM MEMÓRIA
//  Arrays simples funcionam como "tabelas".
//  Os dados são perdidos ao reiniciar o servidor.
// ============================================================
let produtos       = [];   // "tabela" de produtos
let movimentacoes  = [];   // "tabela" de movimentações
let contadorId     = 0;    // simula AUTO_INCREMENT de banco
let contadorMovId  = 0;

// ============================================================
//  CAMADA DE NEGÓCIO (Business Logic)
//  Funções puras que encapsulam as regras do sistema.
// ============================================================

/**
 * Cadastra um novo produto no inventário.
 * Valida os campos obrigatórios antes de persistir.
 */
function cadastrarProduto(dados) {
  const { nome, categoria, quantidade, preco } = dados;

  // Validação básica — todos os campos são obrigatórios
  if (!nome || !categoria || quantidade === undefined || !preco) {
    throw new Error('Todos os campos são obrigatórios.');
  }
  if (isNaN(quantidade) || parseInt(quantidade) < 0) {
    throw new Error('Quantidade deve ser um número ≥ 0.');
  }
  if (isNaN(preco) || parseFloat(preco) <= 0) {
    throw new Error('Preço deve ser um número positivo.');
  }

  const produto = new Produto(nome, categoria, quantidade, preco);
  produtos.push(produto);   // "INSERT INTO produtos ..."
  return produto;
}

/**
 * Registra uma movimentação de estoque (entrada ou saída).
 * Atualiza diretamente a quantidade do produto afetado.
 */
function registrarMovimentacao(produtoId, tipo, quantidade, observacao) {
  // Busca o produto pelo ID — equivale a "SELECT * WHERE id = ?"
  const produto = produtos.find(p => p.id === parseInt(produtoId));
  if (!produto) throw new Error('Produto não encontrado.');

  const qtd = parseInt(quantidade, 10);
  if (isNaN(qtd) || qtd <= 0) throw new Error('Quantidade deve ser positiva.');
  if (!['entrada', 'saida'].includes(tipo)) throw new Error('Tipo inválido.');

  // Regra de negócio: não permite saldo negativo
  if (tipo === 'saida' && produto.quantidade < qtd) {
    throw new Error(`Estoque insuficiente. Disponível: ${produto.quantidade} unidade(s).`);
  }

  // Atualiza o saldo do produto
  produto.quantidade += (tipo === 'entrada' ? qtd : -qtd);

  // Registra o histórico da movimentação
  const mov = new Movimentacao(produto.id, produto.nome, tipo, qtd, observacao);
  movimentacoes.push(mov);
  return mov;
}

/**
 * Edita um produto existente pelo ID.
 * Permite atualizar nome, categoria, preço e quantidade diretamente.
 */
function editarProduto(id, dados) {
  const produto = produtos.find(p => p.id === parseInt(id));
  if (!produto) throw new Error('Produto não encontrado.');

  const { nome, categoria, quantidade, preco } = dados;
  if (!nome || !categoria) throw new Error('Nome e categoria são obrigatórios.');
  if (isNaN(quantidade) || parseInt(quantidade) < 0) throw new Error('Quantidade inválida.');
  if (isNaN(preco) || parseFloat(preco) <= 0) throw new Error('Preço inválido.');

  // Atualiza apenas os campos editáveis — o ID e criadoEm permanecem intactos
  produto.nome      = nome.trim();
  produto.categoria = categoria.trim();
  produto.quantidade = parseInt(quantidade, 10);
  produto.preco     = parseFloat(preco);
  return produto;
}

/**
 * Gera o relatório de inventário.
 * Retorna todos os produtos com campos calculados:
 *   - valorTotal: quantidade × preço
 *   - estoqueZero: flag para destacar produtos sem estoque
 */
function gerarRelatorio() {
  return produtos.map(p => ({
    ...p,
    valorTotal:  (p.quantidade * p.preco).toFixed(2),
    estoqueZero: p.quantidade === 0,
  }));
}

// ============================================================
//  DADOS INICIAIS (seed)
//  Pré-popula o sistema com exemplos para facilitar a demo.
// ============================================================
cadastrarProduto({ nome: 'Notebook Dell Inspiron', categoria: 'Eletrônicos',  quantidade: 8,  preco: 3499.90 });
cadastrarProduto({ nome: 'Mouse Logitech MX',      categoria: 'Periféricos',  quantidade: 0,  preco: 149.90  });
cadastrarProduto({ nome: 'Cadeira Gamer DXRacer',  categoria: 'Mobiliário',   quantidade: 3,  preco: 1290.00 });
cadastrarProduto({ nome: 'Monitor LG 27"',         categoria: 'Eletrônicos',  quantidade: 0,  preco: 1599.00 });
cadastrarProduto({ nome: 'Teclado Mecânico HyperX',categoria: 'Periféricos',  quantidade: 12, preco: 399.90  });

// ============================================================
//  INTERFACE WEB (HTML/CSS/JS embutido no servidor)
//  Em vez de um arquivo .html separado, o HTML é uma string
//  servida pela rota GET /. Isso mantém tudo em um único arquivo.
// ============================================================
const paginaHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>StockOS — Gestão de Inventário</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    /* ── Variáveis de tema ───────────────────────────── */
    :root {
      --bg:        #0d0f12;
      --surface:   #151820;
      --border:    #252a35;
      --amber:     #f5a623;
      --amber-dim: #a86e14;
      --green:     #3dffc0;
      --red:       #ff4d6d;
      --text:      #c8cdd8;
      --muted:     #5a6278;
      --white:     #eef0f5;
      --radius:    6px;
      --mono:      'Space Mono', monospace;
      --sans:      'Syne', sans-serif;
    }

    /* ── Reset & Base ────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--sans);
      min-height: 100vh;
      line-height: 1.6;
    }

    /* ── Cabeçalho ───────────────────────────────────── */
    header {
      border-bottom: 1px solid var(--border);
      padding: 18px 40px;
      display: flex;
      align-items: center;
      gap: 16px;
      position: sticky;
      top: 0;
      background: rgba(13,15,18,.92);
      backdrop-filter: blur(12px);
      z-index: 100;
    }
    .logo-mark {
      width: 36px; height: 36px;
      background: var(--amber);
      display: grid; place-items: center;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .logo-mark svg { width: 20px; height: 20px; }
    .logo-text { font-family: var(--mono); font-weight: 700; font-size: 1rem; color: var(--white); letter-spacing: .06em; }
    .logo-text span { color: var(--amber); }
    .header-tag {
      margin-left: auto;
      font-family: var(--mono);
      font-size: .68rem;
      color: var(--muted);
      border: 1px solid var(--border);
      padding: 3px 10px;
      border-radius: 20px;
      letter-spacing: .08em;
    }

    /* ── Layout ──────────────────────────────────────── */
    main { max-width: 1200px; margin: 0 auto; padding: 36px 24px 60px; }

    /* ── Abas de navegação ───────────────────────────── */
    .tabs {
      display: flex;
      gap: 4px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 32px;
    }
    .tab-btn {
      font-family: var(--sans);
      font-size: .85rem;
      font-weight: 600;
      color: var(--muted);
      background: none;
      border: none;
      padding: 10px 20px 12px;
      cursor: pointer;
      position: relative;
      transition: color .2s;
      letter-spacing: .04em;
    }
    .tab-btn::after {
      content: '';
      position: absolute;
      bottom: -1px; left: 0; right: 0;
      height: 2px;
      background: var(--amber);
      transform: scaleX(0);
      transition: transform .2s;
    }
    .tab-btn.active { color: var(--amber); }
    .tab-btn.active::after { transform: scaleX(1); }
    .tab-btn:hover { color: var(--white); }

    /* ── Painel de aba ───────────────────────────────── */
    .tab-panel { display: none; }
    .tab-panel.active { display: block; animation: fadeUp .25s ease; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Título de seção ─────────────────────────────── */
    .section-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--white);
      margin-bottom: 6px;
    }
    .section-sub {
      font-family: var(--mono);
      font-size: .75rem;
      color: var(--muted);
      margin-bottom: 28px;
    }

    /* ── Card / formulário ───────────────────────────── */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 28px;
      margin-bottom: 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    .form-field { display: flex; flex-direction: column; gap: 6px; }
    .form-field label {
      font-family: var(--mono);
      font-size: .7rem;
      color: var(--muted);
      letter-spacing: .1em;
      text-transform: uppercase;
    }
    .form-field input,
    .form-field select {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--white);
      font-family: var(--mono);
      font-size: .85rem;
      padding: 10px 14px;
      outline: none;
      transition: border-color .2s;
    }
    .form-field input:focus,
    .form-field select:focus { border-color: var(--amber); }
    .form-field select option { background: var(--surface); }

    /* ── Botões ──────────────────────────────────────── */
    .btn {
      font-family: var(--sans);
      font-weight: 600;
      font-size: .85rem;
      letter-spacing: .04em;
      padding: 10px 24px;
      border: none;
      border-radius: var(--radius);
      cursor: pointer;
      transition: opacity .15s, transform .1s;
    }
    .btn:active { transform: scale(.97); }
    .btn-primary  { background: var(--amber); color: #000; }
    .btn-entrada  { background: var(--green); color: #000; }
    .btn-saida    { background: var(--red);   color: #fff; }
    .btn:disabled { opacity: .4; cursor: not-allowed; }

    /* ── Toast de feedback ───────────────────────────── */
    #toast {
      position: fixed;
      bottom: 28px; right: 28px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 4px solid var(--amber);
      color: var(--white);
      font-family: var(--mono);
      font-size: .8rem;
      padding: 14px 20px;
      border-radius: var(--radius);
      opacity: 0;
      transform: translateY(12px);
      transition: opacity .3s, transform .3s;
      z-index: 999;
      max-width: 340px;
    }
    #toast.show { opacity: 1; transform: translateY(0); }
    #toast.error { border-left-color: var(--red); }
    #toast.success { border-left-color: var(--green); }

    /* ── Tabela ──────────────────────────────────────── */
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: .85rem; }
    thead tr { border-bottom: 1px solid var(--border); }
    thead th {
      font-family: var(--mono);
      font-size: .68rem;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: var(--muted);
      padding: 10px 14px;
      text-align: left;
      white-space: nowrap;
    }
    tbody tr {
      border-bottom: 1px solid var(--border);
      transition: background .15s;
    }
    tbody tr:hover { background: rgba(255,255,255,.03); }
    tbody td {
      padding: 12px 14px;
      color: var(--text);
      font-family: var(--mono);
      font-size: .82rem;
    }
    /* Linha de estoque zero fica destacada */
    tbody tr.zero-stock { background: rgba(255,77,109,.07); }
    tbody tr.zero-stock:hover { background: rgba(255,77,109,.12); }

    /* ── Badges ──────────────────────────────────────── */
    .badge {
      display: inline-block;
      font-family: var(--mono);
      font-size: .65rem;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
      padding: 3px 9px;
      border-radius: 20px;
    }
    .badge-zero    { background: rgba(255,77,109,.15);  color: var(--red);   border: 1px solid rgba(255,77,109,.3); }
    .badge-ok      { background: rgba(61,255,192,.1);   color: var(--green); border: 1px solid rgba(61,255,192,.25); }
    .badge-entrada { background: rgba(61,255,192,.1);   color: var(--green); border: 1px solid rgba(61,255,192,.25); }
    .badge-saida   { background: rgba(255,77,109,.12);  color: var(--red);   border: 1px solid rgba(255,77,109,.25); }

    /* ── Cards de KPI ────────────────────────────────── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .kpi {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
    }
    .kpi-label {
      font-family: var(--mono);
      font-size: .65rem;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 8px;
    }
    .kpi-value {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--white);
      word-break: break-all;
      line-height: 1.2;
    }
    .kpi-value.warn { color: var(--red); }

    /* ── Estado vazio ────────────────────────────────── */
    .empty-state {
      text-align: center;
      padding: 50px 20px;
      color: var(--muted);
      font-family: var(--mono);
      font-size: .8rem;
    }
    .empty-state span { font-size: 2rem; display: block; margin-bottom: 10px; }
  </style>
</head>
<body>

<!-- ── Cabeçalho ─────────────────────────────────────────── -->
<header>
  <div class="logo-mark">
    <svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  </div>
  <div>
    <div class="logo-text">Stock<span>OS</span></div>
  </div>
  <div class="header-tag">v1.0 · em memória</div>
</header>

<!-- ── Conteúdo principal ─────────────────────────────────── -->
<main>

  <!-- Abas de navegação -->
  <nav class="tabs">
    <button class="tab-btn active" onclick="mudarAba('cadastro', this)">Cadastro de Produtos</button>
    <button class="tab-btn"        onclick="mudarAba('movimentacao', this)">Movimentação</button>
    <button class="tab-btn"        onclick="mudarAba('relatorio', this)">Relatório de Estoque</button>
    <button class="tab-btn"        onclick="mudarAba('historico', this)">Histórico</button>
  </nav>

  <!-- ── ABA 1: Cadastro ─────────────────────────────── -->
  <div id="aba-cadastro" class="tab-panel active">
    <h2 class="section-title">Cadastro de Produtos</h2>
    <p class="section-sub">// registrar novo item no inventário</p>

    <div class="card">
      <div class="form-grid">
        <div class="form-field">
          <label>Nome do Produto</label>
          <input id="c-nome" type="text" placeholder="Ex: Notebook Dell" />
        </div>
        <div class="form-field">
          <label>Categoria</label>
          <input id="c-categoria" type="text" placeholder="Ex: Eletrônicos" />
        </div>
        <div class="form-field">
          <label>Quantidade Inicial</label>
          <input id="c-quantidade" type="number" min="0" placeholder="0" />
        </div>
        <div class="form-field">
          <label>Preço Unitário (R$)</label>
          <input id="c-preco" type="number" min="0.01" step="0.01" placeholder="0,00" />
        </div>
      </div>
      <button class="btn btn-primary" onclick="cadastrarProduto()">+ Cadastrar Produto</button>
    </div>

    <!-- Tabela de produtos cadastrados -->
    <div class="card" style="padding:0;overflow:hidden;">
      <div class="table-wrap">
        <table id="tabela-produtos">
          <thead>
            <tr>
              <th>#ID</th><th>Nome</th><th>Categoria</th>
              <th>Qtd.</th><th>Preço Unit.</th><th>Cadastrado em</th><th>Ações</th>
            </tr>
          </thead>
          <tbody id="corpo-produtos"></tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- ── MODAL DE EDIÇÃO ─────────────────────────────────── -->
  <div id="modal-edicao" style="
    display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);
    z-index:500;align-items:center;justify-content:center;
  ">
    <div style="
      background:var(--surface);border:1px solid var(--border);border-radius:10px;
      padding:28px;width:100%;max-width:460px;animation:fadeUp .2s ease;
    ">
      <h3 style="color:var(--white);font-family:var(--sans);font-size:1.1rem;margin-bottom:4px">Editar Produto</h3>
      <p style="font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-bottom:20px">// alterações salvas imediatamente</p>
      <input type="hidden" id="e-id"/>
      <div class="form-grid">
        <div class="form-field"><label>Nome</label><input id="e-nome" type="text"/></div>
        <div class="form-field"><label>Categoria</label><input id="e-categoria" type="text"/></div>
        <div class="form-field"><label>Quantidade</label><input id="e-quantidade" type="number" min="0"/></div>
        <div class="form-field"><label>Preço (R$)</label><input id="e-preco" type="number" step="0.01" min="0.01"/></div>
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
        <button class="btn" style="background:var(--border);color:var(--text)" onclick="fecharEdicao()">Cancelar</button>
        <button class="btn btn-primary" onclick="salvarEdicao()">Salvar Alterações</button>
      </div>
    </div>
  </div>

  <!-- ── ABA 2: Movimentação ─────────────────────────── -->
  <div id="aba-movimentacao" class="tab-panel">
    <h2 class="section-title">Movimentação de Estoque</h2>
    <p class="section-sub">// registrar entrada ou saída de itens</p>

    <div class="card">
      <div class="form-grid">
        <div class="form-field">
          <label>Produto</label>
          <select id="m-produto"><option value="">Selecione...</option></select>
        </div>
        <div class="form-field">
          <label>Tipo</label>
          <select id="m-tipo">
            <option value="entrada">↑ Entrada</option>
            <option value="saida">↓ Saída</option>
          </select>
        </div>
        <div class="form-field">
          <label>Quantidade</label>
          <input id="m-quantidade" type="number" min="1" placeholder="1" />
        </div>
        <div class="form-field">
          <label>Observação (opcional)</label>
          <input id="m-obs" type="text" placeholder="Ex: Compra fornecedor X" />
        </div>
      </div>
      <div style="display:flex;gap:10px;">
        <button class="btn btn-entrada" onclick="registrarMovimentacao('entrada')">↑ Registrar Entrada</button>
        <button class="btn btn-saida"   onclick="registrarMovimentacao('saida')">↓ Registrar Saída</button>
      </div>
    </div>
  </div>

  <!-- ── ABA 3: Relatório ────────────────────────────── -->
  <div id="aba-relatorio" class="tab-panel">
    <h2 class="section-title">Relatório de Estoque</h2>
    <p class="section-sub">// saldo atual · itens com estoque zero destacados em vermelho</p>

    <!-- KPIs calculados via JS -->
    <div class="kpi-grid" id="kpis"></div>

    <div class="card" style="padding:0;overflow:hidden;">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#ID</th><th>Nome</th><th>Categoria</th>
              <th>Qtd. Atual</th><th>Preço Unit.</th>
              <th>Valor Total</th><th>Status</th>
            </tr>
          </thead>
          <tbody id="corpo-relatorio"></tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- ── ABA 4: Histórico ────────────────────────────── -->
  <div id="aba-historico" class="tab-panel">
    <h2 class="section-title">Histórico de Movimentações</h2>
    <p class="section-sub">// log completo de entradas e saídas</p>

    <div class="card" style="padding:0;overflow:hidden;">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Data</th><th>Produto</th>
              <th>Tipo</th><th>Quantidade</th><th>Observação</th>
            </tr>
          </thead>
          <tbody id="corpo-historico"></tbody>
        </table>
      </div>
    </div>
  </div>

</main>

<!-- Toast de feedback -->
<div id="toast"></div>

<!-- ================================================================
  JAVASCRIPT DO FRONTEND
  Responsável por:
    1. Chamar a API do servidor (fetch)
    2. Renderizar os dados nas tabelas
    3. Gerenciar as abas e o feedback visual
================================================================= -->
<script>
  // URL base da API — aponta para o próprio servidor Node.js
  const API = '';

  // ── Utilitários ─────────────────────────────────────────────

  // Exibe uma mensagem temporária de feedback (toast)
  function toast(msg, tipo = 'success') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'show ' + tipo;
    setTimeout(() => el.className = '', 3000);
  }

  // Formata valor em reais: 1234.5 → "R$ 1.234,50"
  function brl(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // Troca a aba ativa: esconde o painel atual, mostra o novo
  function mudarAba(nome, btn) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('aba-' + nome).classList.add('active');
    btn.classList.add('active');

    // Recarrega dados da aba que foi aberta
    if (nome === 'cadastro')     carregarProdutos();
    if (nome === 'movimentacao') carregarSelectProdutos();
    if (nome === 'relatorio')    carregarRelatorio();
    if (nome === 'historico')    carregarHistorico();
  }

  // ── FUNÇÃO 1: Cadastro ───────────────────────────────────────

  // Envia os dados do formulário para a API POST /api/produtos
  async function cadastrarProduto() {
    const dados = {
      nome:       document.getElementById('c-nome').value,
      categoria:  document.getElementById('c-categoria').value,
      quantidade: document.getElementById('c-quantidade').value,
      preco:      document.getElementById('c-preco').value,
    };

    try {
      const res  = await fetch(API + '/api/produtos', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(dados),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro);

      toast('Produto "' + json.nome + '" cadastrado com sucesso!', 'success');
      // Limpa os campos do formulário
      ['c-nome','c-categoria','c-quantidade','c-preco'].forEach(id => document.getElementById(id).value = '');
      carregarProdutos();
    } catch (e) {
      toast('Erro: ' + e.message, 'error');
    }
  }

  // Busca todos os produtos e renderiza na tabela
  async function carregarProdutos() {
    const res  = await fetch(API + '/api/produtos');
    const list = await res.json();
    const tbody = document.getElementById('corpo-produtos');

    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><span>📦</span>Nenhum produto cadastrado.</div></td></tr>';
      return;
    }

    tbody.innerHTML = list.map(p => \`
      <tr>
        <td style="color:var(--muted)">#\${p.id}</td>
        <td style="color:var(--white);font-weight:600">\${p.nome}</td>
        <td>\${p.categoria}</td>
        <td>\${p.quantidade}</td>
        <td>\${brl(p.preco)}</td>
        <td style="color:var(--muted)">\${p.criadoEm}</td>
        <td>
          <button
            onclick="abrirEdicao(\${p.id},'\${p.nome.replace(/'/g,"\\\\'")}','\${p.categoria.replace(/'/g,"\\\\'")}',\${p.quantidade},\${p.preco})"
            style="background:rgba(245,166,35,.12);color:var(--amber);border:1px solid rgba(245,166,35,.3);
                   font-family:var(--mono);font-size:.68rem;padding:4px 10px;border-radius:4px;cursor:pointer;">
            ✎ editar
          </button>
        </td>
      </tr>
    \`).join('');
  }

  // ── Funções do modal de edição ───────────────────────────────

  // Abre o modal preenchido com os dados atuais do produto
  function abrirEdicao(id, nome, categoria, quantidade, preco) {
    document.getElementById('e-id').value        = id;
    document.getElementById('e-nome').value      = nome;
    document.getElementById('e-categoria').value = categoria;
    document.getElementById('e-quantidade').value = quantidade;
    document.getElementById('e-preco').value     = preco;
    document.getElementById('modal-edicao').style.display = 'flex';
  }

  function fecharEdicao() {
    document.getElementById('modal-edicao').style.display = 'none';
  }

  // Envia PUT /api/produtos/:id com os dados editados
  async function salvarEdicao() {
    const id = document.getElementById('e-id').value;
    const dados = {
      nome:       document.getElementById('e-nome').value,
      categoria:  document.getElementById('e-categoria').value,
      quantidade: document.getElementById('e-quantidade').value,
      preco:      document.getElementById('e-preco').value,
    };

    try {
      const res  = await fetch(API + '/api/produtos/' + id, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(dados),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro);

      fecharEdicao();
      toast('Produto "' + json.nome + '" atualizado!', 'success');
      carregarProdutos();
    } catch (e) {
      toast('Erro: ' + e.message, 'error');
    }
  }

  // Fecha modal ao clicar fora dele
  document.getElementById('modal-edicao').addEventListener('click', e => {
    if (e.target === e.currentTarget) fecharEdicao();
  });

  // ── FUNÇÃO 2: Movimentação ───────────────────────────────────

  // Popula o <select> de produtos na aba de movimentação
  async function carregarSelectProdutos() {
    const res  = await fetch(API + '/api/produtos');
    const list = await res.json();
    const sel  = document.getElementById('m-produto');
    sel.innerHTML = '<option value="">Selecione...</option>' +
      list.map(p => \`<option value="\${p.id}">\${p.nome} (estoque: \${p.quantidade})</option>\`).join('');
  }

  // Envia a movimentação para a API POST /api/movimentacoes
  async function registrarMovimentacao(tipoForcado) {
    const dados = {
      produtoId:  document.getElementById('m-produto').value,
      tipo:       tipoForcado,
      quantidade: document.getElementById('m-quantidade').value,
      observacao: document.getElementById('m-obs').value,
    };

    try {
      const res  = await fetch(API + '/api/movimentacoes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(dados),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro);

      const label = tipoForcado === 'entrada' ? '↑ Entrada' : '↓ Saída';
      toast(label + ' de ' + json.quantidade + ' un. registrada!', 'success');
      document.getElementById('m-quantidade').value = '';
      document.getElementById('m-obs').value = '';
      carregarSelectProdutos(); // atualiza o estoque no select
    } catch (e) {
      toast('Erro: ' + e.message, 'error');
    }
  }

  // ── FUNÇÃO 3: Relatório ──────────────────────────────────────

  // Busca e renderiza o relatório com KPIs e tabela de saldo
  async function carregarRelatorio() {
    const res  = await fetch(API + '/api/relatorio');
    const list = await res.json();

    // Calcula KPIs
    const totalItens    = list.length;
    const estoqueZero   = list.filter(p => p.estoqueZero).length;
    const valorEstoque  = list.reduce((s, p) => s + parseFloat(p.valorTotal), 0);
    const totalUnidades = list.reduce((s, p) => s + p.quantidade, 0);

    // Renderiza os cartões de KPI
    document.getElementById('kpis').innerHTML = \`
      <div class="kpi"><div class="kpi-label">Total de Produtos</div><div class="kpi-value">\${totalItens}</div></div>
      <div class="kpi"><div class="kpi-label">Unidades em Estoque</div><div class="kpi-value">\${totalUnidades}</div></div>
      <div class="kpi"><div class="kpi-label">Valor Total (R$)</div><div class="kpi-value">\${brl(valorEstoque)}</div></div>
      <div class="kpi"><div class="kpi-label">Estoque Zero</div><div class="kpi-value warn">\${estoqueZero}</div></div>
    \`;

    // Renderiza tabela — linhas com estoque zero recebem classe especial
    const tbody = document.getElementById('corpo-relatorio');
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><span>📊</span>Nenhum dado ainda.</div></td></tr>';
      return;
    }

    tbody.innerHTML = list.map(p => \`
      <tr class="\${p.estoqueZero ? 'zero-stock' : ''}">
        <td style="color:var(--muted)">#\${p.id}</td>
        <td style="color:var(--white);font-weight:600">\${p.nome}</td>
        <td>\${p.categoria}</td>
        <td style="font-weight:700;color:\${p.estoqueZero ? 'var(--red)' : 'var(--green)'}">\${p.quantidade}</td>
        <td>\${brl(p.preco)}</td>
        <td>\${brl(p.valorTotal)}</td>
        <td>
          <span class="badge \${p.estoqueZero ? 'badge-zero' : 'badge-ok'}">
            \${p.estoqueZero ? '⚠ ZERO' : '✓ OK'}
          </span>
        </td>
      </tr>
    \`).join('');
  }

  // ── Histórico ────────────────────────────────────────────────

  async function carregarHistorico() {
    const res  = await fetch(API + '/api/movimentacoes');
    const list = await res.json();
    const tbody = document.getElementById('corpo-historico');

    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><span>📋</span>Nenhuma movimentação registrada.</div></td></tr>';
      return;
    }

    // Exibe em ordem decrescente (mais recente primeiro)
    tbody.innerHTML = [...list].reverse().map(m => \`
      <tr>
        <td style="color:var(--muted)">#\${m.id}</td>
        <td style="color:var(--muted)">\${m.data}</td>
        <td style="color:var(--white)">\${m.nomeProduto}</td>
        <td><span class="badge badge-\${m.tipo}">\${m.tipo === 'entrada' ? '↑ Entrada' : '↓ Saída'}</span></td>
        <td style="font-weight:700">\${m.quantidade}</td>
        <td style="color:var(--muted)">\${m.observacao}</td>
      </tr>
    \`).join('');
  }

  // ── Inicialização ────────────────────────────────────────────
  // Carrega os dados da aba inicial ao abrir a página
  carregarProdutos();
</script>
</body>
</html>`;

// ============================================================
//  ROTEADOR HTTP
//  Analisa o caminho (URL) e o método (GET/POST) de cada
//  requisição e direciona para a função correta.
// ============================================================

/**
 * Lê o corpo (body) de uma requisição POST e retorna como objeto JS.
 * É necessário porque o HTTP chega em fragmentos (chunks).
 */
function lerBody(req) {
  return new Promise((resolve, reject) => {
    let corpo = '';
    req.on('data',  chunk => corpo += chunk);
    req.on('end',   ()    => {
      try { resolve(JSON.parse(corpo)); }
      catch { reject(new Error('JSON inválido')); }
    });
    req.on('error', reject);
  });
}

/** Envia resposta JSON com o status informado. */
function responderJSON(res, status, dados) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(dados));
}

// Cria e configura o servidor HTTP
const servidor = http.createServer(async (req, res) => {
  const { pathname } = url.parse(req.url, true);
  const metodo = req.method;

  // Cabeçalhos CORS — permite que o frontend faça requisições à API
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight CORS (requisição OPTIONS do navegador)
  if (metodo === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  try {
    // ── Rota raiz: serve a interface HTML ──────────────────
    if (pathname === '/' && metodo === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(paginaHTML);
      return;
    }

    // ── GET /api/produtos — lista todos os produtos ────────
    if (pathname === '/api/produtos' && metodo === 'GET') {
      return responderJSON(res, 200, produtos);
    }

    // ── POST /api/produtos — cadastra novo produto ─────────
    if (pathname === '/api/produtos' && metodo === 'POST') {
      const dados   = await lerBody(req);
      const produto = cadastrarProduto(dados);           // chama a camada de negócio
      return responderJSON(res, 201, produto);
    }

    // ── GET /api/movimentacoes — lista todas as movs. ──────
    if (pathname === '/api/movimentacoes' && metodo === 'GET') {
      return responderJSON(res, 200, movimentacoes);
    }

    // ── POST /api/movimentacoes — registra entrada/saída ───
    if (pathname === '/api/movimentacoes' && metodo === 'POST') {
      const { produtoId, tipo, quantidade, observacao } = await lerBody(req);
      const mov = registrarMovimentacao(produtoId, tipo, quantidade, observacao);
      return responderJSON(res, 201, mov);
    }

    // ── GET /api/relatorio — relatório de saldo atual ──────
    if (pathname === '/api/relatorio' && metodo === 'GET') {
      return responderJSON(res, 200, gerarRelatorio());
    }

    // ── PUT /api/produtos/:id — edita um produto existente ──
    const matchEditar = pathname.match(/^\/api\/produtos\/(\d+)$/);
    if (matchEditar && metodo === 'PUT') {
      const id     = matchEditar[1];
      const dados  = await lerBody(req);
      const produto = editarProduto(id, dados);
      return responderJSON(res, 200, produto);
    }

    // ── 404 — rota não encontrada ──────────────────────────
    responderJSON(res, 404, { erro: 'Rota não encontrada.' });

  } catch (erro) {
    // Erros de negócio (ex: estoque insuficiente) retornam 400
    responderJSON(res, 400, { erro: erro.message });
  }
});

// Inicia o servidor na porta 3000
const PORTA = 3000;
servidor.listen(PORTA, () => {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   StockOS — Sistema de Gestão de Estoque ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  Servidor rodando em:                    ║');
  console.log('║  http://localhost:' + PORTA + '                   ║');
  console.log('║                                          ║');
  console.log('║  Pressione Ctrl+C para encerrar.         ║');
  console.log('╚══════════════════════════════════════════╝');
});