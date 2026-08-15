# 🚀 Guia de Deploy no Railway — Sistema de Gestão

Guia completo e fácil para fazer deploy do seu projecto no Railway.

---

## 📋 Pré-requisitos

- Conta no [Railway](https://railway.app) (gratuita)
- Conta no [GitHub](https://github.com) com o projecto pushado
- Railway CLI instalada (opcional, mas recomendada)

---

## 🏗️ Arquitectura do Deploy

```
┌─────────────────────────────────────────────────┐
│                  Railway Project                │
│                                                 │
│  ┌──────────────┐    ┌──────────────────────┐   │
│  │  Frontend    │    │     Backend          │   │
│  │  (React/Vite)│    │  (Spring Boot/Java)  │   │
│  │  Port: 80    │    │  Port: 8080          │   │
│  └──────┬───────┘    └──────────┬───────────┘   │
│         │                       │               │
│         │    ┌──────────────┐   │               │
│         └────│  PostgreSQL  │───┘               │
│              │  (Railway)   │                   │
│              └──────────────┘                   │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Passo 1: Criar o Projecto no Railway

1. Acesse [railway.app](https://railway.app) e faça login
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub Repo"**
4. Escolha o repositório do projecto

> **Dica**: Railway detecta automaticamente os Dockerfiles na pasta do backend e frontend!

---

## 🗄️ Passo 2: Adicionar PostgreSQL

1. No projecto criado, clique em **"+ New"**
2. Selecione **"Database"** → **"PostgreSQL"**
3. Railway cria a base de dados automaticamente com as variáveis:
   - `DATABASE_URL`
   - `DATABASE_USERNAME`
   - `DATABASE_PASSWORD`

> **Novidade Railway 2026**: A PostgreSQL agora suporta **branching** — pode criar cópias da BD para testes!

---

## ⚙️ Passo 3: Configurar o Backend

### Criar o Serviço Backend

1. Clique em **"+ New"** → **"GitHub Repo"** → selecione o repositório
2. Railway detecta o Dockerfile em `sistema back-end/`
3. Vá em **Settings** → **Root Directory** e defina: `sistema back-end`

### Variáveis de Ambiente do Backend

Vá em **Variables** do serviço backend e adicione:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `SPRING_PROFILES_ACTIVE` | `prod` | Activa o perfil de produção |
| `DATABASE_URL` | `${{PostgreSQL.DATABASE_URL}}` | Referência automática à BD |
| `DATABASE_USERNAME` | `${{PostgreSQL.DATABASE_USERNAME}}` | Referência automática |
| `DATABASE_PASSWORD` | `${{PostgreSQL.DATABASE_PASSWORD}}` | Referência automática |
| `FRONTEND_URL` | `https://<frontend>.up.railway.app` | URL do frontend (depois de criar) |
| `PORT` | `${{PORT}}` | Railway define automaticamente |

> **Novidade Railway 2026 — Variable References**: Use `${{Serviço.VARIÁVEL}}` para referenciar variáveis entre serviços sem copiar valores!

### Configurar Rede

Vá em **Settings** → **Networking** → clique em **"Generate Domain"**

Anote o URL gerado (ex: `https://sistema-api.up.railway.app`).

---

## 🌐 Passo 4: Configurar o Frontend

### Criar o Serviço Frontend

1. Clique em **"+ New"** → **"GitHub Repo"** → selecione o mesmo repositório
2. Vá em **Settings** → **Root Directory** e defina: `sistema-front-end`

### Variáveis de Ambiente do Frontend

Vá em **Variables** do serviço frontend e adicione:

| Variável | Valor |
|----------|-------|
| `API_URL` | `https://<backend-service>.up.railway.app` |

> **Importante**: Use o URL do **backend** obtido no passo anterior, **sem barra final**.
>
> O nginx do frontend faz proxy de todos os pedidos `/api/...` para o backend
> usando esta variável. **Não** uses `VITE_API_URL` — ela é embutida em build-time;
> com o proxy do nginx os pedidos ficam no mesmo domínio e não há CORS.

### Configurar Rede do Frontend

Vá em **Settings** → **Networking** → clique em **"Generate Domain"**

Este será o URL público da aplicação!

---

## 🔗 Passo 5: Ligar os Serviços (Variable References)

Railway 2026 suporta **Variable References** — ligue o frontend ao backend automaticamente:

No serviço **frontend**, na variável `API_URL`, use:
```
${{Backend Service.API_URL}}
```

Ou simplesmente coloque o URL directo do backend (ex.: `https://sistema-api.up.railway.app`).

---

## 📡 Passo 6: Configurar Watch Paths (Monorepo)

Para evitar que mudanças no frontend re-buildem o backend (e vice-versa):

1. No serviço **Backend**, vá em **Settings** → **Watch Paths**
2. Adicione: `sistema back-end/**`
3. No serviço **Frontend**, vá em **Settings** → **Watch Paths**
4. Adicione: `sistema-front-end/**`

> **Novidade Railway 2026 — Watch Paths**: O Railway agora suporta padrões gitignore-style para triggers de deploy!

---

## 🔄 Passo 7: Fazer Deploy

### Opção A: Deploy Automático (Recomendado)

Faça push para o GitHub:
```bash
git add .
git commit -m "feat: preparar deploy para Railway"
git push origin AntonioKaponde
```

Railway detecta automaticamente e faz deploy!

### Opção B: Deploy Manual via CLI

```bash
# Instalar CLI (se ainda não tiver)
npm install -g @railway/cli

# Login
railway login

# Link ao projecto
railway link

# Deploy
railway up
```

---

## 🔍 Passo 8: Verificar o Deploy

1. Acesse o URL do **frontend** (ex: `https://sistema.up.railway.app`)
2. Faça login com as credenciais existentes
3. Verifique se todas as funcionalidades funcionam:
   - Dashboard
   - Facturação
   - Inventário
   - Clientes
   - Previsão de Stock
   - Inteligência Fiscal

---

## 🛠️ Novidades do Railway 2026 para o seu Projecto

### 1. 🌿 Branch Deploys (Preview por Branch)
Cada branch no GitHub pode ter o seu próprio ambiente de preview!
- Crie uma branch: `git checkout -b feature/nova-funcionalidade`
- Push: `git push origin feature/nova-funcionalidade`
- Railway cria automaticamente um URL de preview

### 2. 🔄 Environment Cloning
Clone o ambiente de produção para staging:
- No dashboard, vá em **Environments** → **Clone**
- Selecione Production → Clone para Staging

### 3. 🔗 Variable References entre Serviços
Use `${{Serviço.Variável}}` para referenciar variáveis:
```
DATABASE_URL = ${{PostgreSQL.DATABASE_URL}}
```

### 4. 📊 Métricas e Logs em Tempo Real
- Logs unificados de todos os serviços
- Métricas de CPU, memória e rede
- Alertas configuráveis

### 5. 🔄 Rollbacks Instantâneos
Precisa reverter? Clique em **"Rollback"** no deploy anterior — instantâneo!

### 6. 🌍 Custom Domains
Adicione o seu próprio domínio:
- Settings → Networking → Custom Domain
- Aponte o DNS para o Railway

---

## 🐛 Solução de Problemas

### Backend não liga
- Verifique os logs: clique no serviço → **Logs**
- Confirme que `SPRING_PROFILES_ACTIVE=prod` está definido
- Verifique se a PostgreSQL está ligada (ícone verde)

### Frontend não comunica com Backend
- Verifique se `API_URL` aponta para o URL correcto do backend (sem barra final)
- Verifique se o nginx.conf em produção tem o bloco `location /api/` (redeploy se necessário)
- Se a página der `405 Not Allowed` no login, o nginx em produção ainda não tem o proxy `/api/` — confirme que o commit com o novo `nginx.conf` foi feito push
- Verifique se o CORS está configurado (variável `FRONTEND_URL`)

### Erro de JWT
- Gere um novo segredo: `openssl rand -hex 32`
- Adicione como variável `JWT_SECRET` no backend

---

## 💰 Custos Railway (2026)

| Plano | Preço | O que inclui |
|-------|-------|--------------|
| **Hobby** | $5/mês | 500 horas de uso, 1GB RAM por serviço |
| **Pro** | $20/mês | Horas ilimitadas, 8GB RAM, custom domains |
| **Enterprise** | Sob consulta | SLA, suporte prioritário |

> **Dica**: Para testes, o plano Hobby é suficiente!

---

## 📁 Ficheiros Criados para o Deploy

```
├── .dockerignore                    # Ignorar ficheiros desnecessários
├── DEPLOY.md                        # Este guia
├── railway.json                     # Config raiz (monorepo)
├── sistema back-end/
│   ├── Dockerfile                   # Build multi-stage (Java 21)
│   └── railway.json                 # Config do backend
└── sistema-front-end/
    ├── Dockerfile                   # Build multi-stage (Node + nginx)
    ├── nginx.conf                   # Config do nginx para SPA
    └── railway.json                 # Config do frontend
```

---

## ✅ Checklist Final

- [ ] Código pushado para o GitHub
- [ ] Railway project criado
- [ ] PostgreSQL adicionada
- [ ] Backend configurado com variáveis
- [ ] Frontend configurado com variáveis
- [ ] Watch paths configurados
- [ ] Domínios gerados
- [ ] Deploy verificado e funcional

---

**Precisa de ajuda?** Consulte a [documentação do Railway](https://docs.railway.com)
