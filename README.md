# 📦 SGI - Sistema de Gestão de Inventário

<p align="center">
  <img src="https://img.shields.io/badge/Status-Conclu%C3%ADdo-brightgreen?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Vers%C3%A3o-1.1.0-blue?style=for-the-badge" alt="Versão">
  <img src="https://img.shields.io/github/license/Darkghostly/SGI?style=for-the-badge" alt="Licença">
</p>

> **Projeto acadêmico** desenvolvido como parte da *Atividade Avaliativa Individual 03*. O sistema foi reestruturado para implementar uma arquitetura assíncrona com integração completa entre Front-end e Back-end, utilizando persistência em um banco de dados relacional robusto.

---

## 📑 Sumário
- [💡 Sobre o Projeto](#-sobre-o-projeto)
- [🎨 Protótipo no Figma](#-prot%C3%B3tipo-do-projeto)
- [✨ Funcionalidades (CRUD)](#-funcionalidades-crud)
- [🛠️ Tecnologias Utilizadas](#%EF%B8%8F-tecnologias-utilizadas)
- [📂 Estrutura do Projeto](#-estrutura-do-projeto)
- [⚙️ Configuração e Inicialização](#%EF%B8%8F-configura%C3%A7%C3%A3o-e-inicializa%C3%A7%C3%A3o)
- [🧪 Roteiro de Testes (Thunder Client)](#-roteiro-de-testes-thunder-client)

---

## 💡 Sobre o Projeto
O **SGI (Sistema de Gestão de Inventário)** surgiu da necessidade de uma ferramenta leve, direta e confiável para o controle de materiais. A lógica de negócio foi migrada de um modelo temporário em memória para operações SQL transacionais atômicas, garantindo consistência no saldo de estoque e integridade referencial para o histórico de auditoria.

---

## 🎨 Protótipo do Projeto
O design da interface e o mapeamento inicial do fluxo do usuário podem ser visualizados no link abaixo:
> 🔗 **[Link para o Protótipo no Figma](https://www.figma.com/make/jMsdE2HRHBm8RGafUZB2CS/Admin-Dashboard-UI-Design?p=f&t=A76iHDBfb4uylDKk-0&fullscreen=1)**

---

## ✨ Funcionalidades (CRUD)
- [x] **Leitura de Dados (GET):** Listagem em tempo real de produtos e histórico analítico.
- [x] **Cadastro de Itens (POST):** Registro completo de novos produtos com geração automática de chaves primárias.
- [x] **Atualização Cadastral (PUT):** Edição dinâmica de metadados como nome, categoria e preço.
- [x] **Exclusão Física (DELETE):** Remoção permanente de itens com propagação em cascata (`ON DELETE CASCADE`) para manter o banco íntegro.
- [x] **Controle Transacional de Estoque:** Lógica assíncrona (`START TRANSACTION / COMMIT / ROLLBACK`) que impede a saída de mercadorias acima do saldo disponível.

---

## 🛠️ Tecnologias Utilizadas
O ecossistema técnico do projeto foi planejado para equilibrar o desenvolvimento web nativo com a persistência de dados de nível corporativo:

* **Front-end:** HTML5, CSS3 estruturado moderno (Variáveis nativas, Flexbox/Grid) e JavaScript assíncrono puro (Fetch API).
* **Back-end:** Node.js (Servidor HTTP nativo, tratamento de rotas via Regex, sem dependências de frameworks de terceiros).
* **Banco de Dados:** MySQL Server (Persistência relacional, Pool de conexões e Integridade Referencial).
* **Ferramenta de Testes:** Thunder Client (Extensão integrada diretamente no VS Code).

---

## 📂 Estrutura do Projeto
O projeto está organizado de maneira modular para separar as camadas de apresentação, roteamento e persistência:

```bash
├── Dashboard.html   # Interface SPA (Single Page Application) e consumo da API
├── Inventario.js    # Servidor HTTP, Camada de negócio e queries MySQL (Promises)
├── package.json     # Gerenciamento de dependências (driver mysql2)
└── schema.sql       # Script de definição de dados (DDL) para o MySQL
