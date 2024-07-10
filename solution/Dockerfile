FROM node:20.11.0-alpine3.18 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY ./ ./

ENV POSTGRES_CONN=$POSTGRES_CONN
ENV SERVER_PORT=$SERVER_PORT


CMD ["node", "/app/src/index.js"]
