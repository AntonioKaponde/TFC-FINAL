# 🔧 Variáveis de Ambiente — Railway (Tudo Num Só Sítio)

Este ficheiro contém **TODAS** as variáveis que precisas de configurar no Railway.
Copia e cola cada secção no respectivo serviço.

---

## 📦 SERVIÇO: BACKEND (Sistema API)

Serviço: `sistema back-end`
Root Directory: `sistema back-end`

### Variáveis de Ambiente

| # | Variável | Valor | Descrição |
|---|----------|-------|-----------|
| 1 | `SPRING_PROFILES_ACTIVE` | `prod` | Activa o perfil de produção (usa PostgreSQL) |
| 2 | `PORT` | `${{PORT}}` | Railway define automaticamente (não mudar) |
| 3 | `JWT_SECRET` | `openssl rand -hex 32` (ver abaixo) | Segredo para tokens JWT |
| 4 | `FRONTEND_URL` | `https://<NOME-FRONTEND>.up.railway.app` | URL do frontend para CORS |

> **⚠️ Ligação à Base de Dados (importante)**: o Railway injeta automaticamente as variáveis
> `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` quando o serviço PostgreSQL
> está **ligado (Service Connection)** ao backend. O `application-prod.yml` usa essas
> variáveis para montar a URL `jdbc:postgresql://...`.
>
> **NÃO uses `DATABASE_URL` directamente** — o Railway fornece-a como
> `postgresql://user:pass@host/db` (sem o prefixo `jdbc:`) e o Hikari/Hibernate
> recusam essa ligação. Por isso o backend usa `PGHOST`/`PGPORT`/etc. em vez dela.
> Basta ligar o PostgreSQL ao serviço Backend em **Settings → Service Connections**.

### ⚠️ IMPORTANTE: Gerar JWT_SECRET

Antes de configurar, gera um segredo seguro. Corre isto no terminal:
```bash
openssl rand -hex 32
```

Exemplo de resultado:
```
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

**Usa esse valor como `JWT_SECRET`.**

### Cópia Rápida para Railway Dashboard

Copia e cola isto na secção **Variables** do backend:

```
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=<O-TEU-SEGREDO-AQUI>
FRONTEND_URL=https://<NOME-FRONTEND>.up.railway.app
```

> As variáveis `PORT`, `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` são
> injetadas automaticamente pelo Railway — **NÃO** precisas de as definir manualmente
> se tiveres o PostgreSQL ligado ao serviço Backend.

---

## 🌐 SERVIÇO: FRONTEND (Sistema React)

Serviço: `sistema-front-end`
Root Directory: `sistema-front-end`

### Variáveis de Ambiente

| # | Variável | Valor | Descrição |
|---|----------|-------|-----------|
| 1 | `API_URL` | `https://<NOME-BACKEND>.up.railway.app` | URL do backend — usada pelo nginx (proxy `/api/`)

### Cópia Rápida para Railway Dashboard

Copia e cola isto na secção **Variables** do frontend:

```
API_URL=https://<NOME-BACKEND>.up.railway.app
```

> **NOTA**: Substitui `<NOME-BACKEND>` pelo domínio gerado no serviço backend.
> Substitui `<NOME-FRONTEND>` pelo domínio gerado no serviço frontend.
>
> ⚠️ **NÃO uses `VITE_API_URL`**: é embutida em build-time e não é necessária.
> O nginx faz proxy de todos os pedidos `/api/...` para o backend através de
> `API_URL` (runtime). Deixa `VITE_API_URL` vazia para os pedidos irem para o
> mesmo domínio do frontend (evita CORS).
>
> ⚠️ **Sem barra final**: `API_URL` deve terminar SEM `/` (ex.:
> `https://api.exemplo.com`, não `https://api.exemplo.com/`).

---

## 🗄️ SERVIÇO: POSTGRESQL

Serviço: `PostgreSQL` (criado via Railway)

**NÃO precisas de configurar variáveis** — o Railway cria automaticamente:
- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`

Apenas liga o PostgreSQL ao serviço **Backend**:
1. No dashboard, clica no serviço Backend
2. Vai em **Settings** → **Service Connections**
3. Clica em **"Link Database"** → seleciona o PostgreSQL

---

## 📋 Resumo: O Que Configurar em Cada Serviço

### Backend (copiar para Railway → Variables):
```env
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
FRONTEND_URL=https://sistema-front-end.up.railway.app
app.cors.allowed-origins=https://sistema-front-end.up.railway.app
app.uploads.dir=/app/uploads
```

### Frontend (copiar para Railway → Variables):
```env
API_URL=https://sistema-api.up.railway.app
```

### PostgreSQL (criar no Railway → Database → PostgreSQL):
```env
# Automático — não precisa de configuração manual
DATABASE_URL=postgresql://postgres:xxx@xxx.railway.internal:5432/railway
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=xxx
```

---

## 🔗 Ordem dos Passos no Railway Dashboard

```
1. Criar Projecto
   └──→ New Project → Deploy from GitHub Repo

2. Criar PostgreSQL
   └──→ + New → Database → PostgreSQL

3. Criar Serviço Backend
   └──→ + New → GitHub Repo → selecionar repo
   └──→ Settings → Root Directory → "sistema back-end"
   └──→ Variables → colar variáveis do backend
   └──→ Settings → Service Connections → Link PostgreSQL
   └──→ Settings → Networking → Generate Domain

4. Criar Serviço Frontend
   └──→ + New → GitHub Repo → selecionar o MESMO repo
   └──→ Settings → Root Directory → "sistema-front-end"
   └──→ Variables → colar variáveis do frontend (`API_URL`)
   └──→ Settings → Networking → Generate Domain

5. Actualizar URL do Backend no Frontend
   └──→ Copiar o domínio gerado do backend
   └──→ Colar em API_URL do frontend

6. Actualizar URL do Frontend no Backend
   └──→ Copiar o domínio gerado do frontend
   └──→ Colar em FRONTEND_URL e app.cors.allowed-origins do backend

7. Verificar Deploy
   └──→ Aceder ao domínio do frontend
   └──→ Testar login e funcionalidades
```

---

## 🐛 Variáveis Comuns de Erro

| Erro | Causa | Solução |
|------|-------|---------|
| `CORS error` | `FRONTEND_URL` não configurado | Adicionar URL do frontend em `FRONTEND_URL` |
| `JWT signature invalid` | `JWT_SECRET` diferente entre deploys | Usar SEMPRE o mesmo `JWT_SECRET` |
| `Connection refused` | PostgreSQL não ligado ao serviço | **Settings → Service Connections → Link Database** |
| `PSQLException: ... near "MONTH"` | Queries antigas com `FUNCTION('MONTH'...)` (MySQL) | Já corrigido — agora usam `EXTRACT(...)` compatível com PostgreSQL |
| `Cannot find module VITE_API_URL` | Frontend não tem a variável | (Opção antiga) — agora usa-se `API_URL` no nginx; não é preciso |
| `405 Not Allowed` ao fazer login/API | nginx sem proxy `/api/` (config antiga) | Redeploy com o novo `nginx.conf` e `API_URL` definida |
| `Port already in use` | Railway já define PORT | Remover PORT hard-coded, usar `${{PORT}}` |

---

**Ficheiro gerado automaticamente para o projecto Sistema de Gestão**
**Última actualização: 2026-08-14**
