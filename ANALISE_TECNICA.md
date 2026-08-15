# ANÁLISE TÉCNICA COMPLETA — Sistema de Gestão Empresarial (TFC)

> Documento elaborado após análise profunda do projeto, correção de todos os erros
> encontrados e revisão da arquitetura, dos algoritmos e do funcionamento do sistema.

---

## 1. VISÃO GERAL DO SISTEMA

O projeto é um **sistema web de gestão empresarial completo** para micro, pequenas e
médias empresas em Angola, cobrindo as áreas de **faturação, gestão de stock (inventário),
clientes, fornecedores, fiscalidade e inteligência de negócio**. Foi construído com
arquitetura de duas camadas (frontend + backend separados):

| Camada | Tecnologia | Pasta |
|---|---|---|
| **Frontend** | React 19 + Vite + Material UI (MUI) + Chart.js | `sistema-front-end/` |
| **Backend** | Java 21 + Spring Boot 3 + Spring Security + JPA/Hibernate + MySQL | `sistema back-end/` |
| **Autenticação** | JWT (JSON Web Token) com segredo configurável por variável de ambiente | `security/` |
| **Base de dados** | MySQL (schema `facturacao`) | via JPA `ddl-auto: update` |

### Funcionalidades principais

1. **Autenticação e multi-empresa** — Registo de empresa + administrador, login com JWT,
   isolamento total dos dados por empresa (cada utilizador só vê os dados da sua empresa).
2. **Faturação** — Emissão de faturas, faturas-recibo, recibos, orçamentos e notas de crédito,
   com cálculo automático de IVA (regime do Decreto n.º 34/09 de Angola), sequência de
   documentos e PDF da fatura.
3. **Inventário / Stock** — Cadastro de artigos (produtos físicos e serviços), movimentos de
   stock (entradas e saídas), controlo de stock mínimo e categorias.
4. **Clientes e Fornecedores** — Cadastro, saldo/dívida por cliente, estados (ativo/inativo),
   filtros B2B/B2C.
5. **Dashboard Fiscal** — Indicadores de faturação, IVA liquidado/dedutível, gráficos.
6. **SAF-T** — Geração do ficheiro SAF-T (ficheiro fiscal padrão angolano) da faturação.
7. **Previsão de Stock** *(inteligência de inventário)* — Consumo médio mensal, dias restantes
   de stock, sugestão de reposição e produtos parados.
8. **Inteligência Fiscal** *(previsão de obrigações tributárias)* — Previsão de IVA do próximo
   período, histórico mensal de impostos, obrigações fiscais próximas.
9. **Papéis e Permissões** — 4 papéis padrão (Admin, Gerente, Contabilista, Operador) com
   permissões granulares por módulo, controlo de acesso no backend e no frontend.
10. **Gestão de Utilizadores** — Criação de utilizadores dentro da empresa, alertas de password.
11. **Auditoria** — Registo de todas as ações (login, criações, edições, eliminações) com IP.
12. **Suporte Técnico** — Pedidos de suporte com estados e respostas.
13. **Configurações** — Perfil da empresa, configurações fiscais, séries de documentos.

---

## 2. O QUE O SISTEMA RESOLVE E COMO RESOLVE

### 2.1 Problemas que resolve

| Problema do negócio | Como o sistema resolve |
|---|---|
| Controlo de stock manual e impreciso | Movimentos de stock automáticos ao emitir faturas, stock mínimo por artigo, alertas visuais |
| Erros de cálculo de impostos (IVA) | Cálculo automático de IVA liquidado/dedutível, recálculo sobre movimentos, previsão de IVA |
| Falta de visibilidade do negócio | Dashboard com indicadores, gráficos e comparação ano a ano |
| Gestão de dívidas de clientes | Saldo/dívida calculado por cliente a partir das faturas e notas de crédito |
| Conformidade fiscal (SAF-T) | Geração do ficheiro SAF-T com a estrutura de faturação da empresa |
| Ruptura de stock (vender o que não há) | Previsão de stock: dias restantes, consumo mensal, sugestões de reposição |
| Acesso descontrolado ao sistema | JWT + papéis e permissões por módulo + auditoria de ações |
| Mistura de dados entre empresas | Modelo multi-empresa: tudo é filtrado pela empresa do utilizador autenticado |
| Falta de histórico/rastreabilidade | Módulo de auditoria registando cada ação com IP e utilizador |

### 2.2 Como resolve — arquitetura

```
[React + MUI] ──HTTP/JSON──▶ [Spring Security (JWT)] ──▶ [Controllers]
                                                              │
                                                              ▼
                                                        [Services]
                                                              │
                                                              ▼
                                                   [Repositories (JPA)]
                                                              │
                                                              ▼
                                                        [MySQL]
```

- **Frontend** chama a API através de um cliente centralizado (`src/api/client.js`), que
  injeta o token JWT em cada pedido e trata erros de forma uniforme.
- **Backend** valida o token em cada pedido (`JwtAuthenticationFilter`), resolve o utilizador
  autenticado e obtém a empresa dele, garantindo isolamento dos dados (`getCurrentEmpresa()`).
- **Segurança por permissões**: além da autenticação, os endpoints usam `@PreAuthorize`
  (ex.: `hasAnyRole('ADMIN', 'GERENTE')`), e o frontend esconde/desabilita telas e botões
  conforme o papel (`utils/roles.js`, `SideBar`).

---

## 3. ALGORITMOS USADOS NOS PONTOS MAIS IMPORTANTES

### 3.1 Autenticação JWT (`security/JwtTokenProvider`, `AuthService`)

**Algoritmo:** HMAC-SHA (HS256/HS512) com segredo configurável.

1. O utilizador envia email + password.
2. `AuthenticationManager` (Spring Security) valida as credenciais contra o `UserDetailsService`.
3. Em caso de sucesso, o `JwtTokenProvider` gera o token com:
   - `subject` = email
   - claims = roles/permissões do utilizador
   - `expiration` = 7 dias (604800000 ms)
   - assinatura HMAC com o segredo (`JWT_SECRET`, agora via `@Value` para poder ser definido
     no Railway/ambiente de produção, com fallback seguro para desenvolvimento)
4. O token é devolvido e o frontend guarda a sessão em `sessionStorage` (por aba).
5. Cada pedido seguinte envia `Authorization: Bearer <token>`; o filtro valida a assinatura,
   a expiração e carrega o utilizador, colocando-o no contexto de segurança.

> **Correção aplicada:** o segredo JWT estava fixo no código. Foi alterado para ser lido de
> `JWT_SECRET` (variável de ambiente) com valor padrão, permitindo deploy seguro no Railway
> sem expor a chave de produção no repositório.

### 3.2 Previsão de Stock (`PrevisaoStockService`)

**Algoritmo:** análise de consumo real com janela de 90 dias (média móvel).

1. **Consumo médio mensal** = unidades vendidas nos últimos 90 dias ÷ 3.
2. **Consumo diário** = consumo mensal ÷ 30.
3. **Dias restantes de stock** = stock atual ÷ consumo diário (arredondado para baixo).
4. **Classificação de estado** (hierarquia):
   - `SEM_STOCK` → stock ≤ 0
   - `PARADO` → sem vendas nos últimos 60 dias
   - `A_ACABAR` → dias restantes ≤ 15
   - `STOCK_BAIXO` → dias restantes ≤ 30 ou stock ≤ stock mínimo
   - `NORMAL` → caso contrário
5. **Velocidade de venda**:
   - `ALTA` → consumo ≥ 30 un/mês
   - `MEDIA` → consumo ≥ 10 un/mês
   - `BAIXA` → consumo > 0 e < 10
   - `SEM_VENDAS` → sem consumo
6. **Sugestão de reposição** = (consumo mensal × 1,5) − stock atual, com arredondamento para
   cima. O fator 1,5 garante cobertura de ~45 dias. Produtos parados ou sem vendas não recebem
   sugestão.
7. Os artigos são ordenados por criticidade: `A_ACABAR` → `STOCK_BAIXO` → `PARADO` → `NORMAL`.

**Fonte dos dados:** consulta agregada no repositório (`resumoVendasPorArtigo`) que soma as
quantidades vendidas por artigo a partir das faturas dos últimos 90 dias — algoritmo O(n)
sobre o resultado agregado, sem carregar todas as faturas para memória.

### 3.3 Inteligência Fiscal (`InteligenciaFiscalService`)

**Algoritmo:** média móvel simples de 3 meses com ajuste por tendência.

1. **Histórico mensal** do ano corrente: faturação, IVA liquidado (das faturas) e IVA
   dedutível (dos movimentos de stock de compras), por mês.
2. **IVA a entregar** = IVA liquidado − IVA dedutível (nunca negativo).
3. **Previsão do próximo período** = média dos últimos 3 meses com dados não nulos da série
   (janela reduzida se houver menos dados). Aplica-se a IVA e a faturação.
4. **Variação % vs mês anterior** e **comparação anual (YTD)** — percentual de crescimento
   entre o acumulado do ano atual e o do ano anterior.
5. **Obrigações fiscais** — geração dinâmica da agenda:
   - Projeção da data limite (dia 12 do mês, `DIA_LIMITE_IVA`):
     - antes do dia 12 → obrigação referente ao mês anterior;
     - depois do dia 12 → obrigação do mês corrente.
   - Classificação do prazo: `VENCIDA`, `PRÓXIMA` (≤5 dias), `EM_DIA` (≤15), `PROGRAMADA`.
6. **IRT** — indicação informativa de que o sistema não regista retenções na fonte.

### 3.4 Faturação e cálculo de impostos (`FaturaService`, `MovimentoEstoqueService`)

1. **Totais da fatura**: cada linha = quantidade × preço unitário (com/sem IVA conforme o
   artigo); somam-se totais por artigo, desconto (se aplicável) e IVA.
2. **Movimento de stock automático**: ao emitir uma fatura de produtos físicos, o stock é
   debitado (`saída`) e o movimento é registado com custo e IVA dedutível apurado
   (para compras).
3. **Nota de crédito**: estorna a fatura, devolve stock e atualiza o saldo do cliente.
4. **Saldo do cliente** = total faturado − pagamentos − notas de crédito.
5. **Sequência de documentos** por série configurada (ex.: FT, FR, NC) — numeração
   consecutiva por empresa e ano fiscal.

### 3.5 SAF-T (`SaftService`)

**Algoritmo:** serialização do histórico de faturação num ficheiro XML com a estrutura do
SAF-T (Ficheiro de Auditoria Fiscal) angolano — cabeçalho com dados da empresa, tabela de
clientes, produtos e os documentos de faturação do período selecionado. Usado para
comunicação de faturação à Administração Geral Tributária (AGT).

### 3.6 Papéis e Permissões (`PerfilRoleService`, `Permissao` enum)

- 4 papéis padrão criados no registo da empresa (`AuthService.registrarEmpresaEUsuario`):
  - **Admin**: todas as permissões
  - **Gerente**: visualização e edição de faturação, inventário, fornecedores, etc.
  - **Contabilista**: dashboard, faturação, SAF-T, configurações, auditoria
  - **Operador**: faturação e clientes (sem relatórios financeiros)
- As permissões são expressas como `MODULO_VIEW`, `MODULO_EDIT`, `MODULO_DELETE`.
- O backend aplica `@PreAuthorize` nos endpoints; o frontend reflete as permissões no menu
  e esconde botões. A página "Papéis e Permissões" apresenta a matriz de forma **somente
  leitura** (as permissões dos papéis padrão são fixas).

> **Correção aplicada:** foram removidos handlers, estados e diálogos órfãos (criar/eliminar
> papel) que nunca eram acionados pela interface, alinhando o código com o design
> só-leitura da página.

### 3.7 Auditoria (`AuditoriaService`)

Registo em base de dados de cada ação relevante: `REGISTO`, `LOGIN`, `LOGIN_FALHA`,
`CRIOU`, `ATUALIZOU`, `REMOVEU`, com entidade, descrição, utilizador, IP e data/hora —
permitindo trilha de auditoria completa.

---

## 4. ESTRUTURA DO PROJETO

### 4.1 Backend (`sistema back-end/src/main/java/co/ao/tfc/sistema`)

```
├── controller/    → Endpoints REST (Auth, Fatura, Cliente, Fornecedor, MovimentoEstoque,
│                     PrevisaoStock, InteligenciaFiscal, Saft, Dashboard, Usuario, PerfilRole,
│                     Auditoria, PedidoSuporte, NotaCredito, Empresa)
├── service/       → Lógica de negócio (FaturaService, PrevisaoStockService,
│                     InteligenciaFiscalService, SaftService, AuthService, AuditoriaService, ...)
├── repository/    → Interfaces JPA (FaturaRepository, ArtigoRepository, UsuarioRepository, ...)
├── model/         → Entidades (Empresa, Usuario, Fatura, Artigo, Cliente, Fornecedor,
│                     MovimentoEstoque, PerfilRole, NotaCredito, PedidoSuporte, Categoria)
│   └── enums/     → TipoEmpresa, Permissao, ...
├── dto/           → Objetos de transferência (LoginRequest, JwtAuthResponse, FaturaRequest,
│                     PrevisaoStockResponse, PrevisaoFiscalResponse, ...)
├── security/      → JwtTokenProvider, JwtAuthenticationFilter, SecurityConfig,
│                     CustomUserDetailsService
├── config/        → CorsConfig, DataInitializer, MigracaoPapelGerente
└── exception/     → GlobalExceptionHandler (tratamento uniforme de erros)
```

### 4.2 Frontend (`sistema-front-end/src`)

```
├── Cadastro_Login/  → Login.jsx, Cadastro.jsx
├── api/             → client.js (axios com token), index.js (fachadas por módulo)
├── components/      → NavBar, SideBar, tabelas (TabelaClientes, TabelaFatura,
│                       TabelaFornecedor, TabelaInventario), gráficos, modais, PDFs
├── context/         → MenuContext, NotificacoesContext
├── pages/           → Dashboard, Faturacao, Vendas, Inventario, Clientes, Fornecedores,
│                       PrevisaoStock, InteligenciaFiscal, PapeisPermissoes,
│                       GestaoDeUsuarios, Configuracoes, ResumoEmpresa, Relatorio,
│                       Ficheiro (SAF-T), Auditoria, Suporte...
└── utils/           → authStorage (sessão), roles (permissões de UI), formatters,
                        pdfExport, calculosFiscais
```

---

## 5. FUNCIONAMENTO DO PROJETO (como correr e como funciona)

### 5.1 Requisitos

- **Java 21** e **Maven** (backend)
- **Node.js 18+** e **npm** (frontend)
- **MySQL** com a base `facturacao` (o JPA cria/atualiza as tabelas automaticamente com
  `ddl-auto: update`)

### 5.2 Configuração

**Backend** (`sistema back-end/src/main/resources/application.yml`):
```yaml
spring.datasource.url: jdbc:mysql://${MYSQL_HOST:localhost}:3306/facturacao
spring.datasource.username: ${MYSQL_USER:rooter}
spring.datasource.password: ${MYSQL_PASSWORD:<definir via env>}
```
Todas as credenciais são sobrescrevíveis por variáveis de ambiente (usadas no Railway) —
**não commitar passwords em texto claro**; usar sempre `MYSQL_PASSWORD`, `PGPASSWORD` e `JWT_SECRET` via variáveis de ambiente.
A variável `JWT_SECRET` também é lida de ambiente (ver `JwtTokenProvider`).

**Frontend** (`sistema-front-end/src/api/client.js`): a URL base da API pode ser definida
por `VITE_API_URL` (fallback para `http://localhost:8080`).

### 5.3 Execução

```bash
# Backend
cd "sistema back-end"
mvn spring-boot:run

# Frontend
cd sistema-front-end
npm install
npm run dev        # desenvolvimento (Vite, porta 5173)
npm run build      # produção (gera a pasta dist/)
```

### 5.4 Deploy (Railway)

- O repositório contém `railway.json`, `Dockerfile` e `nginx.conf` para o frontend e o
  backend, permitindo deploy contínuo no Railway.
- `RAILWAY_VARIABLES.md` documenta as variáveis a definir (`MYSQL_HOST`, `MYSQL_USER`,
  `MYSQL_PASSWORD`, `JWT_SECRET`, `VITE_API_URL`, etc.).

### 5.5 Fluxo de utilização típico

1. **Registo**: criar empresa + administrador (escolhendo setor e regime de IVA).
2. **Login**: autenticação JWT; a sessão fica por aba (sessionStorage).
3. **Configuração inicial**: perfil da empresa, configurações fiscais, séries de documentos.
4. **Operação diária**: cadastrar clientes/fornecedores/artigos, emitir faturas (stock é
   debitado automaticamente), controlar inventário.
5. **Inteligência**: consultar Previsão de Stock e Inteligência Fiscal para decisões de
   reposição e planeamento de obrigações fiscais.
6. **Conformidade**: gerar o SAF-T para comunicação à AGT; consultar auditoria.

---

## 6. CORREÇÕES APLICADAS NESTA REVISÃO

Todas as correções foram validadas com `mvn compile` (backend) e `npm run lint` + `vite build`
(frontend) — **sem erros nem warnings**.

### Backend
1. **JWT secret exposto no código** → agora lido de `JWT_SECRET` via `@Value` com fallback,
   permitindo segredo de produção configurável no Railway.

### Frontend — erros reais (bugs)
2. **`Login.jsx` — chave duplicada `color`** num objeto `sx` (a segunda chave anulava a
   primeira, alterando a cor do botão de forma imprevisível). Removida a duplicação.
3. **`Login.jsx` — `setState` síncrono dentro de `useEffect`** → hora atual passou a ser
   calculada com inicialização lazy do estado.
4. **`PrevisaoStock.jsx` — pesquisa/filtro declarados mas sem interface**: os estados
   `pesquisa` e `filtroEstado` existiam e filtravam a tabela, mas não havia campo de
   pesquisa nem filtro na tela. **Adicionada** a barra de pesquisa + filtros por estado.
5. **`InteligenciaFiscal.jsx` — mesmo problema**: pesquisa e filtro de meses não tinham UI.
   **Adicionada** a barra de pesquisa + filtros do histórico.
6. **Tabelas (Clientes/Fatura/Fornecedor/Inventário) — paginação com reset em `useEffect`**:
   o reset de página agora é feito por **clamping** no cálculo da paginação (nunca mostra
   página vazia) e o carregamento inicial foi movido para um padrão assíncrono seguro
   (com flag `ativo` para evitar `setState` após desmontagem). Elimina avisos do
   `react-hooks` e melhora a estabilidade.
7. **`DoughnutRelatorio.jsx` — `setState` síncrono em efeito**: estado inicializado a partir
   da prop; a busca só ocorre quando não há prop, com limpeza de `setState` pós-desmonte.

### Frontend — código morto e limpeza
8. **`PapeisPermissoes.jsx`**: removidos diálogos/menus de criar/eliminar papel que nunca
   eram acionados (a página é de consulta), handlers e estados órfãos, e importações não
   usadas.
9. **`TabelaInventario.jsx`**: removidos `isAdmin`, `handleRemoverClick` e o fluxo de
   eliminação desativado (botão comentado) e importações não usadas.
10. **`Configuracoes.jsx`**: removidos handlers de "corrigir artigos/recalcular IVA" que
    estavam desativados (bloco comentado), estado `fixando` e imports órfãos.
11. **`Clientes.jsx`, `Faturacao.jsx`, `Inventario.jsx`**: removida importação não usada de
    `exportarPDF`.
12. **`CriarUsuarios.jsx`**: variável `response` não usada (apenas `await`).
13. **`GestaoDeUsuarios.jsx`**: `catch (error)` sem uso → `catch` simples; `fetchData` e
    `showNotification` envolvidos em `useCallback` (dependências corretas do hook).
14. **`Vendas.jsx`**: leitura de papéis movida para dentro do `useEffect` (dependência
    correta, sem re-render infinito).
15. **`ResumoEmpresa.jsx`**: adicionada dependência `navigate` ao efeito.
16. **`MenuContext.jsx`**: exceção pontual da regra `react-refresh` para contexto
    (exportação de componente + hook, padrão legítimo de contextos).

---

## 7. PONTOS DE ATENÇÃO / MELHORIAS FUTURAS (recomendações de sénior)

1. **Testes automatizados** — o projeto não tem testes unitários nem de integração.
   Recomenda-se começar pelos serviços críticos (cálculo de IVA, previsão de stock,
   movimentos de stock).
2. **Segredos** — `application.yml` ainda contém credenciais MySQL de desenvolvimento com
   valor padrão; em produção devem ser **sempre** sobrescritas por variáveis de ambiente
   (já suportado).
3. **Paginação no backend** — as listagens carregam tudo e paginam no frontend; para
   grandes volumes, passar paginação para o backend (Spring Data `Pageable`).
4. **Código duplicado de tabelas** — as quatro tabelas partilham muito código
   (pesquisa, filtros, paginação); uma refatoração para um componente genérico
   `TabelaGenerica` reduziria manutenção.
5. **Ficheiros grandes no bundle** — o Vite avisa que há chunks > 500 kB; usar
   *code-splitting* com `React.lazy` nas páginas.
6. **Validação no frontend** — reforçar validação de formulários (ex.: biblioteca de
   formulários ou validação manual consistente) alinhada com a do backend.

---

*Documento gerado após análise completa do repositório e verificação de compilação
(backend) e lint/build (frontend) sem erros.*
