# NC Messenger - Deploy Railway
# better-sqlite3 precisa ser compilado no Linux (python3, make, g++)

FROM node:20-bookworm-slim

# Ferramentas para compilar módulos nativos (better-sqlite3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar package e scripts antes do npm ci (postinstall roda scripts/patch-capacitor-java.js)
COPY package.json package-lock.json ./
COPY scripts/ scripts/
RUN npm ci

COPY . .
RUN npm run build && npm prune --production

EXPOSE 3000

CMD ["node", "dist/server/index.js"]
