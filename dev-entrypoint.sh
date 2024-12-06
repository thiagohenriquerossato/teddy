#!/bin/sh

# Aguardar o banco de dados
echo "Aguardando o banco de dados..."
until pg_isready -h db_dev -U user -d mydb_dev
do
  echo "Aguardando banco de dados..."
  sleep 2
done

# Gerar cliente Prisma
echo "Gerando cliente Prisma..."
npx prisma generate

# Executar migrações
echo "Executando migrações..."
npx prisma migrate deploy

# Iniciar aplicação em modo desenvolvimento
echo "Iniciando aplicação..."
npm run dev 