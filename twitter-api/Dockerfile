FROM node:18-alpine AS builder

WORKDIR /app

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Install NestJS CLI globally in production image too
RUN npm install -g @nestjs/cli

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"] 
