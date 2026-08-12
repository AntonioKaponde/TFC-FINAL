# Sistema de Gestão Empresarial (ERP) - Faturação, Inventário e SAF-T

Este é um sistema completo de gestão empresarial (ERP), com módulos de faturação, controlo de inventário, gestão de clientes/fornecedores, relatórios financeiros e exportação do ficheiro SAF-T (AO). O projeto foi desenhado para facilitar as operações do dia-a-dia de empresas, garantindo total conformidade fiscal e usabilidade intuitiva.

## 🚀 Tecnologias Utilizadas

### Backend
- **Java 17 / Spring Boot 3**: Framework principal para construção da robusta API REST.
- **Spring Security & JWT**: Para autenticação e controlo de acesso minucioso baseado em perfis e permissões (RBAC).
- **Hibernate / Spring Data JPA**: Mapeamento objeto-relacional (ORM) eficiente.
- **MySQL**: Base de dados relacional fiável para armazenamento.
- **iTextPDF**: Geração dinâmica de faturas e documentos fiscais em formato PDF.
- **XMLStreamWriter**: Geração assíncrona e otimizada (memory-efficient) do ficheiro SAF-T (AO).

### Frontend
- **React.js (Vite)**: Biblioteca para construção da interface de utilizador como Single Page Application (SPA), garantindo transições imediatas.
- **Material-UI (MUI)**: Design System de topo para a criação de componentes elegantes, modernos e dinâmicos (estética premium).
- **Axios**: Cliente HTTP para a comunicação assíncrona com a API.
- **Recharts**: Implementação de painéis visuais interativos e relatórios em gráficos no Dashboard.

---

## 📁 Estrutura do Projeto

O repositório está dividido em dois blocos principais:
- `sistema back-end/`: Contém a API e regras de negócio construídas em Java Spring Boot.
- `sistema-front-end/`: Contém a aplicação web e todos os componentes interativos construídos em React.

---

## 📡 Endpoints da API

O sistema expõe uma arquitetura RESTful. Abaixo estão documentados os principais endpoints e as suas funções:

### 🔐 Autenticação, Configuração & Empresa
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/auth/login` | Autentica um utilizador e retorna o Token JWT de sessão. |
| `POST` | `/auth/register` | Regista um novo utilizador no sistema. |
| `POST` | `/auth/empresa` | Regista uma nova entidade/empresa no sistema. |
| `PUT` | `/auth/{id}` | Atualiza os detalhes da empresa. |
| `GET` | `/api/empresa/atual` | Retorna o detalhe da empresa da sessão logada. |
| `GET` | `/api/configuracao-fiscal` | Consulta os parâmetros e impostos standard da empresa. |
| `PUT` | `/api/configuracao-fiscal` | Atualiza a parametrização fiscal (Regime IVA, Impostos, etc). |

### 📄 Faturação & Exportação SAF-T
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/faturas` | Lista de todas as faturas e documentos equivalentes. |
| `POST` | `/api/faturas` | Emissão de um novo documento comercial (Fatura, Proforma, Recibo). |
| `GET` | `/api/faturas/{id}/pdf` | Descarrega a fatura em formato PDF pronta a imprimir. |
| `PATCH` | `/api/faturas/{id}/pagar` | Atualiza o estado da fatura para "Paga". |
| `GET` | `/api/notas-credito` | Lista as notas de crédito (estornos/devoluções). |
| `POST` | `/api/notas-credito` | Emite uma nova nota de crédito com referência à fatura base. |
| `GET` | `/api/saft/exportar` | Gera o documento XML do **SAF-T (AO)** por Mês e Ano. |

### 📦 Inventário e Artigos
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/artigos` | Consulta de catálogo e lista de artigos em armazém. |
| `POST` | `/api/artigos` | Registo de um novo artigo/serviço. |
| `PUT` | `/api/artigos/{id}` | Atualização de preçário e detalhes do artigo. |
| `DELETE` | `/api/artigos/{id}` | Desativação ou remoção de um artigo. |
| `GET` | `/api/movimentos-estoque` | Registo histórico do fluxo de produtos (entradas/saídas). |
| `POST` | `/api/movimentos-estoque` | Transação que afeta positivamente ou negativamente o stock. |

### 👥 Gestão de Entidades (Clientes e Fornecedores)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/clientes` | Obtém o diretório de clientes registados. |
| `POST` | `/api/clientes` | Cria a ficha de um novo cliente. |
| `PUT` | `/api/clientes/{id}` | Atualiza dados (morada, nif, contactos) de um cliente. |
| `DELETE` | `/api/clientes/{id}` | Remove um cliente do diretório. |
| *(O mesmo padrão)* | `/api/fornecedores` | CRUD equivalente dedicado à lista de Fornecedores. |

### 📊 Dashboard e Relatórios Visuais
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/indicadores` | Retorna KPIs estáticos essenciais (ex: Lucro Anual, Dívida). |
| `GET` | `/api/dashboard/comparativo-mensal` | Dados em array formatados para alimentar gráficos mensais. |

### 🛡️ Controlo de Acesso (Papéis e Permissões)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/roles` | Lista todos os perfis de acesso (ex: Admin, Contabilista, Operador). |
| `POST` | `/api/roles` | Cria um perfil customizado de acessos ao sistema. |
| `PUT` | `/api/roles/{id}` | Atualiza a árvore de permissões de um perfil. |

---

## 🛠️ Como Iniciar o Projeto Localmente

Siga estes passos para correr o sistema na sua máquina.

### Pré-requisitos
- **Node.js** (v16 ou superior)
- **Java JDK 17**
- **Apache Maven**
- **MySQL Server** (8.0 ou superior)

### 1. Configurar a Base de Dados
Abra o seu terminal MySQL (ou ferramenta como MySQL Workbench) e crie a base de dados:
```sql
CREATE DATABASE facturacao;
```
*(O Spring Boot tratará de gerar e atualizar as tabelas automaticamente no arranque).*

### 2. Iniciar o Servidor Backend (API)
Abra um terminal e navegue para a pasta do backend:
```bash
cd "sistema back-end"
mvn clean install
mvn spring-boot:run
```
A API ficará disponível em `http://localhost:8080`.

### 3. Iniciar o Servidor Frontend (Interface Web)
Abra **outro** terminal e navegue para a pasta do frontend:
```bash
cd sistema-front-end
npm install
npm run dev
```
A interface gráfica de utilizador ficará acessível, tipicamente, no endereço impresso na consola (ex: `http://localhost:5173`).

---

## 🧩 SPA e sessões por aba

- **Single Page Application (SPA):** toda a navegação acontece sem recarregar a
  página (React Router). Ao copiar a URL de qualquer tela (ex.: uma fatura em
  `/faturacao`) e abri-la noutra aba, a nova aba **não tem sessão** e é
  redirecionada automaticamente para o login, onde pode iniciar sessão de novo.
- **Sessão por aba:** o token fica apenas no `sessionStorage` da aba onde foi
  feito o login. O `F5` na mesma aba mantém a sessão; abrir uma nova aba exige
  novo login.
- **Deep links em produção:** para colar/abrir URLs diretas de telas no browser
  (ex.: `/faturacao`), o servidor que hospeda os ficheiros de `dist/` tem de
  devolver o `index.html` para todas as rotas (history fallback). O servidor de
  desenvolvimento do Vite já faz isto automaticamente; num servidor estático
  (nginx, Apache, Netlify, etc.) configure um rewrite para o `index.html`.

---

*Desenvolvido como Trabalho de Fim de Curso (TFC).*
