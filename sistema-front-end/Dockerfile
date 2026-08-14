# ============================================
# Stage 1 — Build do frontend React/Vite
# ============================================
FROM node:20-alpine AS build

WORKDIR /app

# Copiar ficheiros de dependências primeiro (melhor cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código-fonte e compilar
COPY . .
RUN npm run build

# ============================================
# Stage 2 — Servir com nginx
# ============================================
FROM nginx:alpine

# Remover config default e usar a nossa
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar o build do frontend
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
