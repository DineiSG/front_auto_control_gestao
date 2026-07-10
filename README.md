# Auto Control Gestão

![Version](https://img.shields.io/badge/version-2.2.0-blue)
![React](https://img.shields.io/badge/React-19.x-61DAFB)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.x-7952B3)

## 📖 Sobre

O **Auto Control Gestão** é um sistema web desenvolvido para gerenciamento administrativo e operacional de empresas do setor automotivo.

A aplicação centraliza informações relacionadas a veículos, clientes, vendas, movimentações, usuários e indicadores gerenciais, oferecendo uma interface moderna e integrada com APIs REST e WebSocket.

---

# 🎯 Objetivos

- Centralizar o gerenciamento das operações da empresa.
- Reduzir processos manuais.
- Garantir rastreabilidade das movimentações.
- Disponibilizar indicadores para apoio à tomada de decisão.
- Facilitar a administração de veículos e clientes.

---

# 🚀 Principais Funcionalidades

## 🚗 Gestão de Veículos

Permite administrar toda a frota cadastrada no sistema.

Funcionalidades:

- Cadastro de veículos
- Consulta por placa
- Consulta por modelo
- Consulta por marca
- Alteração de dados
- Exclusão de veículos
- Controle de entrada e saída
- Situação atual do veículo

---

## 👤 Gestão de Clientes

Cadastro completo dos clientes da empresa.

Recursos:

- Cadastro
- Consulta
- Atualização
- Exclusão
- Pesquisa por nome
- Pesquisa por CPF/CNPJ

---

## 💰 Gestão de Vendas

Responsável pelo controle das vendas realizadas.

Funcionalidades:

- Registro de vendas
- Alteração de informações
- Consulta de vendas
- Histórico
- Integração com clientes
- Integração com veículos

---

## 🔄 Gestão de Movimentações

Controla todas as movimentações realizadas com veículos.

Inclui:

- Solicitação de movimentação
- Registro das movimentações
- Histórico completo
- Cancelamento de solicitações
- Rastreabilidade das operações

---

## 📦 Gestão de Baixas

Controla a retirada de veículos do estoque ou da operação.

Processo:

1. Localiza o veículo.
2. Registra as informações na tabela de baixas.
3. Remove o veículo do cadastro ativo.
4. Mantém o histórico para auditoria.

---

## 📊 Dashboard

Apresenta indicadores gerenciais em tempo real.

Indicadores disponíveis:

- Quantidade de veículos
- Quantidade de clientes
- Quantidade de vendas
- Estatísticas operacionais
- Gráficos comparativos
- Indicadores por período

---

## 👥 Gestão de Usuários

Controle de acesso ao sistema.

Permite:

- Cadastro de usuários
- Alteração de dados
- Exclusão
- Ativação e desativação
- Controle de autenticação

---

## 🔐 Controle de Perfis e Permissões

Gerencia os níveis de acesso da aplicação.

Exemplos:

- Administrador
- Gerente
- Operador
- Usuário comum

Cada perfil possui permissões específicas para acesso às funcionalidades do sistema.

---

## 📄 Relatórios

O sistema permite exportação de informações em diferentes formatos.

Suporta:

- PDF
- Excel (.xlsx)

---

## 📡 Comunicação em Tempo Real

A aplicação possui integração via WebSocket para atualização automática de informações sem necessidade de recarregar a página.

Tecnologias utilizadas:

- SockJS
- STOMP

---

# 🏗 Arquitetura

```
Frontend (React + Vite)
        │
        │ REST / WebSocket
        ▼
API de Autenticação
        │
        ▼
API de Negócio
        │
        ▼
Banco de Dados
```

---

# 🛠 Tecnologias Utilizadas

## Front-end

- React 19
- Vite
- React Router DOM

## Interface

- Bootstrap
- React Bootstrap
- Font Awesome
- Lucide React
- Flaticon UI Icons

## Gráficos

- Chart.js
- React ChartJS 2
- Recharts

## Comunicação

- SockJS
- STOMP

## Exportação

- jsPDF
- jsPDF AutoTable
- html2pdf.js
- XLSX

## Segurança

- JWT Decode
- Crypto.js

---

# 📁 Estrutura do Projeto

```
src/
│
├── assets/
├── components/
├── context/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── utils/
├── App.jsx
└── main.jsx
```

---

# ⚙️ Instalação

Clone o repositório:

```bash
git clone <repositorio>
```

Entre na pasta:

```bash
cd auto_control
```

Instale as dependências:

```bash
npm install
```

---

# ▶️ Executando

Modo desenvolvimento:

```bash
npm run dev
```

Build de produção:

```bash
npm run build
```

Visualizar a build:

```bash
npm run preview
```

Executar análise do código:

```bash
npm run lint
```

---

# 🔒 Autenticação

A autenticação utiliza **JWT (JSON Web Token)**.

Após o login, o token é armazenado pelo frontend e enviado automaticamente para todas as requisições autenticadas da API.

---

# 📈 Dashboards

Os gráficos são desenvolvidos utilizando:

- Chart.js
- React ChartJS 2
- Recharts

---

# 🧪 Desenvolvimento

Ferramentas utilizadas:

- ESLint
- Testing Library
- Express
- json-server
- concurrently

---

# 📌 Versão

Versão atual:

```
2.2.0
```

---

# 📄 Licença

Projeto privado.

Copyright © Auto Control Gestão.
Todos os direitos reservados.
