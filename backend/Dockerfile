# Imagem base: Node 20 LTS Alpine (leve e oficial)
FROM node:20-alpine AS base
WORKDIR /app

# --- Dependências ---
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# --- Runtime ---
FROM base AS runtime
ENV NODE_ENV=production

# Usuário não-root
RUN addgroup -S app && adduser -S app -G app

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=app:app . .

USER app

EXPOSE 5000

# Healthcheck simples
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/health > /dev/null || exit 1

CMD ["node", "server.js"]
