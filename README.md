# 📦 SGI - Sistema de Gestão de Inventário

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Versão-1.0.0-blue?style=for-the-badge" alt="Versão">
  <img src="https://img.shields.io/github/license/Darkghostly/SGI?style=for-the-badge" alt="Licença">
</p>

> Projeto acadêmico desenvolvido para facilitar o controle de estoque, permitindo o registro de produtos, entradas e saídas de forma simplificada e intuitiva.

---

## 📑 Sumário
- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)

---

## 💡 Sobre o Projeto
O **SGI (Sistema de Gestão de Inventário)** surgiu da necessidade de uma ferramenta leve e direta para o controle de materiais. O foco principal é a lógica de movimentação de mercadorias, garantindo que o saldo de estoque seja atualizado em tempo real e evitando erros comuns, como a saída de itens inexistentes.

---

## 🎨 Protótipo do Projeto
Você pode visualizar o design da interface e o fluxo do usuário através do link abaixo:
> 🔗 **[Link para o Protótipo no Figma](https://www.figma.com/make/jMsdE2HRHBm8RGafUZB2CS/Admin-Dashboard-UI-Design?p=f&t=A76iHDBfb4uylDKk-0&fullscreen=1)**

---

## ✨ Funcionalidades
- [x] **Cadastro de Itens:** Registro completo de produtos com ID, nome e preço.
- [x] **Controle de Movimentação:** Registro de entradas e saídas de mercadorias.
- [x] **Dashboard Visual:** Interface para acompanhamento do saldo atual.
- [x] **Validação de Estoque:** Impede a retirada de produtos acima da quantidade disponível.
- [ ] **Relatórios (Em breve):** Exportação de histórico de movimentações.

---

## 🛠 Tecnologias Utilizadas
O projeto foi construído utilizando as tecnologias fundamentais da web para garantir leveza e compatibilidade:

- ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) - Estruturação de dados.
- ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=F7DF1E) - Lógica de negócio e cálculos.
- ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) - Design e estilização.

---

## 📂 Estrutura do Projeto
Para manter a organização acadêmica, o projeto está dividido da seguinte forma:

```bash
├── Dashboard.html   # Interface principal e visualização dos dados
└── Inventario.js    # Lógica de negócio, funções de CRUD e movimentação
