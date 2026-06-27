# Sistema API — Inventário e Faturação

API REST em **Spring Boot** para gestão de inventário, faturação e dashboard de indicadores fiscais (contexto Angola — IVA 14%).

## Requisitos

- Java 21
- Maven 3.9+

## Executar

```bash
cd sistema-api
mvn spring-boot:run
```

A API fica disponível em `http://localhost:8080`.
Esta rodando em mysql assim como postgres

## Endpoints principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/artigos` | Listar inventário |
| POST | `/api/artigos` | Criar artigo |
| GET | `/api/clientes` | Listar clientes |
| GET | `/api/fornecedores` | Listar fornecedores |
| GET | `/api/faturas` | Listar faturas |
| POST | `/api/faturas` | Emitir fatura (atualiza stock) |
| PATCH | `/api/faturas/{id}/pagar` | Marcar fatura como paga |
| GET | `/api/dashboard/indicadores` | KPIs fiscais do ano |
| GET | `/api/dashboard/comparativo-mensal` | Lucro vs impostos por mês |
| GET/PUT | `/api/configuracao-fiscal` | Regime de IVA e impostos |

## Integração com o frontend React

O frontend em `../sistema` (Vite) pode consumir a API em `http://localhost:8080/api`. O CORS está configurado para `localhost:5173`.
