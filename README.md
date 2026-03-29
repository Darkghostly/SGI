# SGI - Sistema de Gestão de Inventário 
Este é um projeto de Sistema de Gestão de Inventário (SGI) desenvolvido para fins acadêmicos. O objetivo do sistema é permitir o controle simplificado de produtos, permitindo o gerenciamento de estoque através de uma interface web intuitiva. <br>
<br>

## Funcionalidades
Dashboard Visual: Visualização rápida do status do inventário.

Cadastro de Produtos: Adição de novos itens ao sistema com informações essenciais.

Controle de Estoque: Gestão de entradas e saídas de produtos.

Persistência Local: Utilização de tecnologias front-end para manipulação de dados em tempo real.<br>
<br>

## Tecnologias Utilizadas
O projeto foi construído utilizando tecnologias padrão de desenvolvimento web (Front-end):

HTML5: Estruturação das páginas e formulários.

JavaScript (ES6+): Lógica de manipulação de inventário e dinamismo da interface.

CSS3: Estilização e layout (conforme definido no arquivo HTML).<br>
<br>

## 📂 Estrutura do Projeto

```bash
├── Dashboard.html   # Interface principal e visualização dos dados
└── Inventario.js    # Lógica de negócio, funções de CRUD e movimentação
```

Como executar
Como o projeto é baseado em tecnologias front-end puras, não é necessário instalar dependências ou configurar servidores complexos.

Faça o clone do repositório:


```bash
git clone https://github.com/Darkghostly/SGI.git
```

Navegue até a pasta do projeto.

Abra o arquivo Dashboard.html em qualquer navegador moderno (Chrome, Firefox, Edge, etc.).

Regras de Negócio Implementadas (Acadêmico)
Validação de Saldo: O sistema impede a saída de produtos caso a quantidade solicitada seja maior que o saldo disponível.

Identificação Única: Cada produto possui um identificador para facilitar a busca e movimentação.<br>
<br>

### Autor
Darkghostly - Desenvolvedor Principal - [Meu Perfil](https://github.com/Darkghostly)
