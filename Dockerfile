FROM node:22-alpine

WORKDIR /app

COPY package*.json tsconfig.json ./
COPY prisma ./prisma/

RUN npm install

COPY src ./src

# Gerar cliente Prisma e executar migrações
RUN npx prisma generate
RUN npm run build

# Adicionar script para inicialização
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV NODE_PATH=./dist

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"] 