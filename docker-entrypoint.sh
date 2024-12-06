#!/bin/sh

# Esperar pelo banco de dados
echo "Aguardando o banco de dados..."
sleep 5

# Executar migrações do Prisma
echo "Executando migrações do Prisma..."
npx prisma migrate deploy

# Executar o comando original
exec "$@"