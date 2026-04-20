FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package.json ./packages/shared/
COPY server/package.json ./server/
COPY client/package.json ./client/

RUN npm ci

COPY packages/shared ./packages/shared
COPY server ./server
COPY tsconfig.base.json ./

RUN npm run build:shared && npm run build:server

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "server/dist/index.js"]
