# Teddy API

Este projeto é um desafio técnico para a vaga de Desenvolvedor Backend na Teddy Open Finance. A aplicação consiste em uma API REST que gerencia transações financeiras, permitindo a criação, consulta e análise de transações entre contas.

## Sobre o Projeto

A API fornece endpoints para:
- Gerenciamento de contas de usuários
- Processamento de transações financeiras
- Consulta de saldo e extrato
- Histórico de transações
- Relatórios e análises financeiras

## Pré-requisitos

- Docker e Docker Compose
- Node.js (versão recomendada: 18 ou superior)
- npm ou yarn

## Configuração do Ambiente

1. Clone o repositório
2. Copie os arquivos de ambiente:
   ```bash
   cp .env.development .env
   ```

## Rodando com Docker

### Ambiente de Desenvolvimento

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Ambiente de Produção

```bash
docker-compose up --build
```

## Rodando Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Execute as migrações do Prisma:
   ```bash
   npx prisma migrate dev
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor em modo de desenvolvimento
- `npm run build`: Compila o projeto TypeScript
- `npm run start`: Inicia o servidor em modo de produção
- `npm run test`: Executa os testes
- `npm run lint`: Executa o linter
- `npm run format`: Formata o código usando Prettier


## Docker

O projeto inclui duas configurações Docker:

- `Dockerfile` e `docker-compose.yml` para produção
- `Dockerfile.dev` e `docker-compose.dev.yml` para desenvolvimento

## Variáveis de Ambiente

Certifique-se de configurar as seguintes variáveis de ambiente no arquivo `.env`:

- `DATABASE_URL`: URL de conexão com o banco de dados
- Outras variáveis conforme necessário para o projeto

## Testes

Os testes são configurados usando Jest. Para executar:

```bash
npm run test
```