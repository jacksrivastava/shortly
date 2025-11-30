# Docker Build Instructions
#
# Purpose: Defines the steps to build a container image for the application, including
# installing dependencies, building the TypeScript code, and setting up the runtime environment.
#
# Why: Enables consistent deployment across different environments (dev, staging, prod)
# by packaging the application and its dependencies into a single portable unit.

FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production
RUN apk add --no-cache openssl
RUN npm install -g prisma
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate

COPY --from=builder /app/dist ./dist
COPY public ./public

EXPOSE 3000

CMD ["npm", "start"]
