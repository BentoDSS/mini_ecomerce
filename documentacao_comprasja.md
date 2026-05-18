# ComprasJá — Documentação Técnica Completa

> Documento de especificação de engenharia para o sistema ComprasJá: mini e-commerce com painel administrativo integrado.

---

## Sumário

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitetura Geral](#3-arquitetura-geral)
4. [Modelagem do Banco de Dados](#4-modelagem-do-banco-de-dados)
5. [Requisitos Funcionais](#5-requisitos-funcionais)
6. [Arquitetura da API — Backend (FastAPI)](#6-arquitetura-da-api--backend-fastapi)
7. [Arquitetura do Frontend (React)](#7-arquitetura-do-frontend-react)
8. [Fluxo de Autenticação e Segurança](#8-fluxo-de-autenticação-e-segurança)
9. [Fluxo de Negócio Principal](#9-fluxo-de-negócio-principal)
10. [Guia de Instalação e Execução](#10-guia-de-instalação-e-execução)
11. [Deploy em Produção](#11-deploy-em-produção)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Visão Geral do Sistema

O **ComprasJá** é uma aplicação web de e-commerce de pequeno porte, composta por dois subsistemas integrados:

- **Catálogo Público (E-commerce):** Página principal acessível a qualquer visitante, exibindo os produtos ativos cadastrados no sistema.
- **Painel Administrativo:** Área restrita a usuários com perfil `admin`, acessível via botão no cabeçalho da aplicação. Permite o gerenciamento completo de produtos e usuários (CRUD).

### Premissas do sistema

- Qualquer pessoa pode visualizar o catálogo de produtos sem precisar de login.
- Para realizar compras (fluxo futuro) ou acessar o painel admin, o login é obrigatório.
- Produtos criados ou editados no painel administrativo refletem imediatamente no catálogo público.
- A remoção de produtos pode ser **lógica** (campo `ativo = false`) ou física — a remoção lógica é a abordagem recomendada para preservar histórico.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão Recomendada |
|---|---|---|
| Frontend | React (JavaScript) | 18+ |
| Roteamento | React Router DOM | v6 |
| Requisições HTTP | Axios | latest |
| Gerenciamento de Estado | Context API (nativo React) | — |
| Backend | Python + FastAPI | Python 3.10+ / FastAPI 0.100+ |
| ORM | SQLAlchemy | 2.x |
| Banco de Dados | PostgreSQL | 14+ |
| Autenticação | JWT (python-jose) | — |
| Hash de Senhas | Passlib (bcrypt) | — |
| Servidor ASGI | Uvicorn | latest |

---

## 3. Arquitetura Geral

```
┌────────────────────────────────────────────────────┐
│                   NAVEGADOR (Client)               │
│                                                    │
│  ┌──────────────┐        ┌──────────────────────┐  │
│  │ Catálogo     │        │  Painel Admin        │  │
│  │ (público)    │        │  (restrito: admin)   │  │
│  └──────┬───────┘        └──────────┬───────────┘  │
│         │         React             │              │
│         └──────────────────────────┘              │
│                      │                             │
│              React Router + AuthContext            │
└──────────────────────┬─────────────────────────────┘
                       │ HTTPS / JSON + JWT
┌──────────────────────▼─────────────────────────────┐
│                 BACKEND (FastAPI)                   │
│                                                    │
│   /auth         /api/produtos        /api/usuarios  │
│   (público)     (público: GET)       (admin only)   │
│                 (admin: POST/PUT/DEL)               │
│                                                    │
│            Depends → Validação JWT                  │
└──────────────────────┬─────────────────────────────┘
                       │ SQLAlchemy ORM
┌──────────────────────▼─────────────────────────────┐
│               BANCO DE DADOS (PostgreSQL)           │
│                                                    │
│         Tabela: usuarios   Tabela: produtos         │
└────────────────────────────────────────────────────┘
```

---

## 4. Modelagem do Banco de Dados

### 4.1 Tabela: `usuarios`

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Identificador único |
| `nome` | `VARCHAR(150)` | `NOT NULL` | Nome completo |
| `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | E-mail de acesso |
| `senha_hash` | `TEXT` | `NOT NULL` | Senha criptografada com bcrypt |
| `perfil` | `VARCHAR(10)` | `NOT NULL, DEFAULT 'user'` | Valores: `admin` ou `user` |
| `ativo` | `BOOLEAN` | `NOT NULL, DEFAULT TRUE` | Remoção lógica |
| `criado_em` | `TIMESTAMP` | `DEFAULT NOW()` | Data de criação |

### 4.2 Tabela: `produtos`

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Identificador único |
| `nome` | `VARCHAR(200)` | `NOT NULL` | Nome do produto |
| `descricao` | `TEXT` | — | Descrição detalhada |
| `preco` | `NUMERIC(10,2)` | `NOT NULL` | Preço unitário |
| `quantidade_estoque` | `INTEGER` | `NOT NULL, DEFAULT 0` | Unidades disponíveis |
| `categoria` | `VARCHAR(100)` | — | Categoria do produto |
| `ativo` | `BOOLEAN` | `NOT NULL, DEFAULT TRUE` | Remoção lógica |
| `criado_em` | `TIMESTAMP` | `DEFAULT NOW()` | Data de criação |
| `atualizado_em` | `TIMESTAMP` | `DEFAULT NOW()` | Última atualização |

### 4.3 Exemplo de Schema SQL

```sql
CREATE TABLE usuarios (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(150)  NOT NULL,
    email       VARCHAR(255)  NOT NULL UNIQUE,
    senha_hash  TEXT          NOT NULL,
    perfil      VARCHAR(10)   NOT NULL DEFAULT 'user',
    ativo       BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMP     DEFAULT NOW()
);

CREATE TABLE produtos (
    id                  SERIAL PRIMARY KEY,
    nome                VARCHAR(200)   NOT NULL,
    descricao           TEXT,
    preco               NUMERIC(10,2)  NOT NULL,
    quantidade_estoque  INTEGER        NOT NULL DEFAULT 0,
    categoria           VARCHAR(100),
    ativo               BOOLEAN        NOT NULL DEFAULT TRUE,
    criado_em           TIMESTAMP      DEFAULT NOW(),
    atualizado_em       TIMESTAMP      DEFAULT NOW()
);
```

---

## 5. Requisitos Funcionais

### 5.1 Módulo Público (E-commerce)

| ID | Requisito |
|---|---|
| RF-01 | O sistema deve exibir todos os produtos com `ativo = true` no catálogo. |
| RF-02 | O usuário pode visualizar nome, descrição, preço, categoria e disponibilidade de cada produto. |
| RF-03 | O sistema deve disponibilizar uma tela de Login e Cadastro. |
| RF-04 | Após o login, o header deve exibir o nome do usuário autenticado. |
| RF-05 | Se o perfil do usuário logado for `admin`, o header exibirá um botão "Painel Admin". |

### 5.2 Módulo Administrativo — Produtos

| ID | Requisito |
|---|---|
| RF-06 | O admin pode cadastrar um novo produto preenchendo todos os campos obrigatórios. |
| RF-07 | O admin pode listar todos os produtos (ativos e inativos). |
| RF-08 | O admin pode visualizar os detalhes completos de um produto. |
| RF-09 | O admin pode editar qualquer campo de um produto existente. |
| RF-10 | O admin pode excluir um produto (remoção lógica: `ativo = false`, ou física). |
| RF-11 | Produtos criados/ativados no painel devem aparecer automaticamente no catálogo público. |

### 5.3 Módulo Administrativo — Usuários

| ID | Requisito |
|---|---|
| RF-12 | O admin pode cadastrar um novo usuário definindo nome, e-mail, senha e perfil. |
| RF-13 | O admin pode listar todos os usuários do sistema. |
| RF-14 | O admin pode visualizar detalhes de um usuário. |
| RF-15 | O admin pode editar dados de um usuário (exceto ver a senha em texto plano). |
| RF-16 | O admin pode desativar ou excluir um usuário. |

---

## 6. Arquitetura da API — Backend (FastAPI)

### 6.1 Rotas de Autenticação (Públicas)

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| `POST` | `/auth/cadastro` | Registra novo usuário | Não |
| `POST` | `/auth/login` | Autentica e retorna JWT | Não |

**Exemplo de payload — Login:**
```json
// Request
{
  "email": "usuario@email.com",
  "senha": "minhasenha123"
}

// Response 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "perfil": "admin"
}
```

### 6.2 Rotas de Produtos

| Método | Endpoint | Descrição | Auth | Perfil |
|---|---|---|---|---|
| `GET` | `/api/produtos` | Lista produtos ativos | Não | Público |
| `GET` | `/api/produtos/{id}` | Detalha um produto | Não | Público |
| `POST` | `/api/produtos` | Cria novo produto | Sim | admin |
| `PUT` | `/api/produtos/{id}` | Edita produto | Sim | admin |
| `DELETE` | `/api/produtos/{id}` | Remove produto | Sim | admin |

**Exemplo de payload — Criar produto:**
```json
// Request POST /api/produtos
{
  "nome": "Tênis Esportivo X",
  "descricao": "Tênis leve para corrida",
  "preco": 249.90,
  "quantidade_estoque": 50,
  "categoria": "Calçados",
  "ativo": true
}

// Response 201 Created
{
  "id": 12,
  "nome": "Tênis Esportivo X",
  "preco": 249.90,
  "ativo": true
}
```

### 6.3 Rotas de Usuários (Admin only)

| Método | Endpoint | Descrição | Auth | Perfil |
|---|---|---|---|---|
| `GET` | `/api/usuarios` | Lista todos os usuários | Sim | admin |
| `GET` | `/api/usuarios/{id}` | Detalha um usuário | Sim | admin |
| `POST` | `/api/usuarios` | Cria novo usuário | Sim | admin |
| `PUT` | `/api/usuarios/{id}` | Edita usuário | Sim | admin |
| `DELETE` | `/api/usuarios/{id}` | Remove usuário | Sim | admin |

### 6.4 Proteção de Rotas no Backend

O FastAPI utiliza o sistema de dependências (`Depends`) para validar o token JWT e verificar o perfil do usuário em cada requisição protegida:

```python
# Exemplo de dependência de verificação
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_usuario_atual(token: str = Depends(oauth2_scheme)):
    # Decodifica e valida o JWT
    payload = decode_jwt(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    return payload

def requer_admin(usuario = Depends(get_usuario_atual)):
    if usuario["perfil"] != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    return usuario

# Uso em uma rota protegida:
@router.post("/api/produtos")
def criar_produto(produto: ProdutoSchema, admin = Depends(requer_admin)):
    ...
```

---

## 7. Arquitetura do Frontend (React)

### 7.1 Estrutura de Pastas

```
src/
├── assets/                  # Imagens, ícones e estilos globais
├── components/
│   ├── Header.jsx           # Cabeçalho com botão condicional de Admin
│   ├── CardProduto.jsx      # Card de produto no catálogo
│   └── RotaProtegida.jsx    # HOC de proteção de rotas privadas
├── context/
│   └── AuthContext.jsx      # Contexto global de autenticação (JWT + perfil)
├── pages/
│   ├── Home.jsx             # Página inicial com hero section e destaques (NOVO)
│   ├── Catalogo.jsx         # Página de catálogo completo
│   ├── Login.jsx            # Tela de Login e Cadastro
│   └── Admin/
│       ├── Dashboard.jsx              # Visão geral do painel
│       ├── GerenciamentoProdutos.jsx  # CRUD de produtos
│       └── GerenciamentoUsuarios.jsx  # CRUD de usuários
├── services/
│   ├── api.js               # Instância configurada do Axios (baseURL + interceptor JWT)
│   ├── authService.js       # Funções de login e cadastro
│   ├── produtosService.js   # Funções de CRUD de produtos
│   └── usuariosService.js   # Funções de CRUD de usuários
├── styles/
│   └── Home.css             # Estilos da página inicial (NOVO)
└── routes.jsx               # Configuração de rotas com React Router v6
```

### 7.2 Página Inicial (Home) — NOVO

A página inicial foi adicionada em maio de 2026 para melhorar a experiência do usuário. Está acessível em `/` e contém:

**Seções:**
- **Hero Section**: Boas-vindas com CTA "Explorar Catálogo"
- **Categorias Populares**: Grade com 4 categorias (Eletrônicos, Moda, Casa, Livros)
- **Produtos em Destaque**: Exibe os 6 primeiros produtos do catálogo
- **Vantagens**: 4 cards destacando benefícios (Rápido, Seguro, Preço Justo, Suporte)
- **Call-to-Action Final**: Convite para acessar o catálogo completo

**Componentes:**
- `Home.jsx` - Componente principal da página
- `Home.css` - Estilos com glassmorphism, animações e efeitos visuais

**Design:**
- Responsivo (mobile, tablet, desktop)
- Gradientes e blur effects (glassmorphism)
- Animações fluidas (0.3s)
- Paleta de cores consistente (Indigo/Purple gradient)

### 7.3 AuthContext — Gerenciamento de Autenticação

```jsx
// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem("usuario");
    return salvo ? JSON.parse(salvo) : null;
  });

  const login = (dadosUsuario, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(dadosUsuario));
    setUsuario(dadosUsuario);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### 7.4 Header — Botão Condicional para Admin

```jsx
// src/components/Header.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header>
      <h1>ComprasJá</h1>
      <nav>
        <button onClick={() => navigate("/")}>Catálogo</button>

        {usuario?.perfil === "admin" && (
          <button onClick={() => navigate("/admin")}>Painel Admin</button>
        )}

        {usuario ? (
          <>
            <span>Olá, {usuario.nome}</span>
            <button onClick={logout}>Sair</button>
          </>
        ) : (
          <button onClick={() => navigate("/login")}>Entrar</button>
        )}
      </nav>
    </header>
  );
}
```

### 7.5 Rota Protegida

```jsx
// src/components/RotaProtegida.jsx
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function RotaProtegida({ children, apenasAdmin = false }) {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/login" />;
  if (apenasAdmin && usuario.perfil !== "admin") return <Navigate to="/" />;

  return children;
}
```

### 7.6 Configuração de Rotas

```jsx
// src/routes.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Catalogo from "./pages/Catalogo";
import Login from "./pages/Login";
import Dashboard from "./pages/Admin/Dashboard";
import GerenciamentoProdutos from "./pages/Admin/GerenciamentoProdutos";
import GerenciamentoUsuarios from "./pages/Admin/GerenciamentoUsuarios";
import RotaProtegida from "./components/RotaProtegida";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Catalogo />} />
        <Route path="/login" element={<Login />} />

        {/* Rotas protegidas — somente admin */}
        <Route path="/admin" element={
          <RotaProtegida apenasAdmin>
            <Dashboard />
          </RotaProtegida>
        } />
        <Route path="/admin/produtos" element={
          <RotaProtegida apenasAdmin>
            <GerenciamentoProdutos />
          </RotaProtegida>
        } />
        <Route path="/admin/usuarios" element={
          <RotaProtegida apenasAdmin>
            <GerenciamentoUsuarios />
          </RotaProtegida>
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

### 7.7 Configuração do Axios com Interceptor JWT

```js
// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Injeta o token JWT automaticamente em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 8. Fluxo de Autenticação e Segurança

### 8.1 Segurança Implementada

✅ **JWT com expiração** - Tokens expiram em tempo determinado  
✅ **Hash de senhas** - Armazenadas com bcrypt, nunca em texto plano  
✅ **HTTPS** - Obrigatório em produção  
✅ **CORS configurado** - Apenas domínios permitidos  
✅ **Validação de entrada** - Todos os dados validados com Pydantic  
✅ **Autorização por perfil** - Admin-only endpoints protegidos  

### 8.2 Fluxo de Login

```
Usuário preenche e-mail e senha
        │
        ▼
POST /auth/login  ──►  FastAPI valida credenciais
                               │
                    Senha correta + usuário ativo?
                               │
                 Sim ──────────┴────────── Não
                  │                         │
          Gera token JWT              HTTP 401 Unauthorized
                  │
          Retorna { token, perfil }
                  │
          React armazena em localStorage
                  │
          AuthContext atualiza estado global
                  │
     perfil = admin? ──► Exibe botão "Painel Admin" no Header
```

### 8.3 Proteção de Rota — Dupla Camada

**Frontend (React Router):**
O componente `RotaProtegida` verifica se o usuário está logado e se possui perfil `admin` antes de renderizar a página. Caso contrário, redireciona para `/login` ou `/`.

**Backend (FastAPI Depends):**
Toda rota sensível exige o token JWT no header `Authorization: Bearer <TOKEN>`. O sistema de dependências do FastAPI valida o token e verifica o perfil a cada requisição. Sem token válido ou perfil adequado, a API retorna `HTTP 401` ou `HTTP 403 Forbidden`.

---

## 9. Fluxo de Negócio Principal

### 9.1 Criação de Produto e Reflexo no Catálogo

```
Admin acessa /admin/produtos
        │
        ▼
Preenche formulário de novo produto
        │
        ▼
POST /api/produtos  (com JWT no header)
        │
        ▼
FastAPI valida token + perfil admin
        │
        ▼
Produto salvo no PostgreSQL (ativo = true)
        │
        ▼
Catálogo público (GET /api/produtos) passa a retorná-lo
        │
        ▼
Página principal exibe o produto automaticamente
```

### 9.2 Remoção Lógica de Produto

Ao "excluir" um produto no painel admin, o sistema altera `ativo = false` no banco. O endpoint `GET /api/produtos` filtra apenas produtos com `ativo = true`, removendo-o do catálogo sem apagar o registro.

---

## 10. Guia de Instalação e Execução

### 10.1 Pré-requisitos

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ rodando localmente ou em nuvem

### 10.2 Backend (FastAPI)

```bash
# 1. Clone o repositório e acesse a pasta do backend
cd backend

# 2. Crie e ative o ambiente virtual
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

# 3. Instale as dependências
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic python-jose passlib[bcrypt]

# 4. Configure as variáveis de ambiente (crie um arquivo .env)
DATABASE_URL=postgresql://usuario:senha@localhost:5432/comprasja
SECRET_KEY=sua_chave_secreta_jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# 5. Execute as migrations / criação das tabelas
python -c "from database import Base, engine; Base.metadata.create_all(engine)"

# 6. Suba o servidor
uvicorn main:app --reload
# API disponível em: http://localhost:8000
# Documentação automática em: http://localhost:8000/docs
```

### 10.3 Frontend (React)

```bash
# 1. Acesse a pasta do frontend
cd frontend

# 2. Instale as dependências
npm install

# 3. Configure a URL da API (opcional: crie .env)
REACT_APP_API_URL=http://localhost:8000

# 4. Inicie o servidor de desenvolvimento
npm start
# Aplicação disponível em: http://localhost:3000
```

### 10.4 Variáveis de Ambiente

| Variável | Local | Descrição |
|---|---|---|
| `DATABASE_URL` | Backend `.env` | String de conexão com o PostgreSQL |
| `SECRET_KEY` | Backend `.env` | Chave secreta para assinar o JWT |
| `ALGORITHM` | Backend `.env` | Algoritmo JWT (padrão: `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Backend `.env` | Tempo de expiração do token |
| `REACT_APP_API_URL` | Frontend `.env` | URL base da API FastAPI |

---

## 11. Deploy em Produção

### 11.1 Frontend — Netlify

**URL em Produção:** `https://comprasja.netlify.app`

#### Pré-requisitos
- Repositório Git no GitHub/GitLab
- Conta Netlify conectada ao repositório

#### Processo de Deploy

1. **Build local para testar:**
```bash
cd frontend
npm run build
# Gera pasta `build/` otimizada
```

2. **Configurar Netlify:**
   - Conectar repositório à Netlify
   - Build command: `npm run build`
   - Publish directory: `build`
   - Environment variable: `REACT_APP_API_URL=https://comprasja-api.onrender.com`

3. **Deploy automático:**
   - Cada push para `main` dispara novo build
   - Netlify compila e publica automaticamente

#### Configuração de Redirects (SPA)

Crie arquivo `netlify.toml` na raiz do projeto:

```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 11.2 Backend — Render

**URL em Produção:** `https://comprasja-api.onrender.com`

#### Pré-requisitos
- Repositório Git
- Conta Render

#### Processo de Deploy

1. **Preparar arquivo `render.yaml`:**

```yaml
services:
  - type: web
    name: comprasja-api
    env: python
    region: ohio
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port 8000
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: SECRET_KEY
        sync: false
```

2. **Variáveis de Ambiente no Render:**
   - `DATABASE_URL`: String de conexão PostgreSQL
   - `SECRET_KEY`: Chave JWT (gerar aleatória)
   - `ALGORITHM`: HS256

3. **Conectar repositório:**
   - Acessar Render Dashboard
   - Criar novo Web Service
   - Conectar repositório Git
   - Selecionar branch `main`
   - Render detecta `render.yaml` e faz deploy automático

#### Exemplo de DATABASE_URL (Render PostgreSQL)

```
postgresql://usuario:senha@pg-comprasja.render-instances.com:5432/comprasja_db
```

### 11.3 Banco de Dados — PostgreSQL no Render

#### Setup

1. **Criar PostgreSQL no Render:**
   - Dashboard → New → PostgreSQL
   - Name: `comprasja-db`
   - Plan: Free tier
   - Region: Same as API

2. **Cópia da conexão:**
   - Copiar External Database URL
   - Usar como `DATABASE_URL` na API

#### Backup e Restore

- **Automático:** Render faz backup diário (7 dias retenção)
- **Manual:** Dashboard → Backups → Create Backup
- **Restore:** Dashboard → Backups → Restore

### 11.4 CORS Configurado para Produção

No backend (`main.py`), o CORS está configurado para aceitar:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",           # Desenvolvimento
        "https://comprasja.netlify.app"   # Produção
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 11.5 Checklist de Deploy

- [ ] Build frontend local funciona (`npm run build`)
- [ ] Variáveis de ambiente configuradas
- [ ] CORS incluindo domínio Netlify
- [ ] SECRET_KEY alterada de valor padrão
- [ ] Banco de dados PostgreSQL criado e acessível
- [ ] Migrations/tabelas criadas no banco
- [ ] Teste login/autenticação em produção
- [ ] HTTPS habilitado (automático em Netlify/Render)
- [ ] Monitorar logs de erro

---

## 12. Troubleshooting

### Erro: "Connection refused" no Backend

**Causa:** PostgreSQL não está rodando ou credenciais incorretas

**Solução:**
```bash
# Windows
Get-Service postgresql-x64-14 | Start-Service

# Mac/Linux
sudo systemctl start postgresql

# Testar conexão
psql -U postgres -h localhost -d comprasja
```

### Erro: "CORS error" no Frontend

**Causa:** Domínio do frontend não está em `allow_origins`

**Solução:** Adicionar domínio ao backend:
```python
allow_origins=[
    "http://localhost:3000",
    "https://comprasja.netlify.app"
]
```

### Erro: "JWT Token expirado"

**Causa:** Token JWT passou do tempo de expiração

**Solução:** 
- Fazer logout e login novamente
- Aumentar `ACCESS_TOKEN_EXPIRE_MINUTES` se necessário

### Erro: "Produto não aparece no catálogo"

**Causa:** Produto pode estar com `ativo = false`

**Solução:** Verificar no banco de dados:
```sql
SELECT * FROM produtos WHERE nome = 'Seu Produto';
-- Verificar se ativo = true
UPDATE produtos SET ativo = true WHERE id = 1;
```

### Erro: "Permission denied" ao criar produto

**Causa:** Usuário não é admin ou token inválido

**Solução:**
- Verificar se usuário tem perfil `admin` no banco
- Renovar token fazendo login novamente
- Verificar header `Authorization: Bearer <TOKEN>`

### Deploy no Netlify: "Build failed"

**Causa:** Dependências não instaladas ou variáveis faltando

**Solução:**
```bash
# Testar build localmente
npm run build

# Verificar .env.production
REACT_APP_API_URL=https://comprasja-api.onrender.com

# Verificar logs no Netlify Dashboard
```

### Deploy no Render: "Application failed to start"

**Causa:** Dependências Python faltando ou DATABASE_URL incorreta

**Solução:**
```bash
# Verificar requirements.txt
pip install -r requirements.txt

# Testar localmente
uvicorn main:app --reload

# Verificar logs no Render Dashboard
```

### Banco de dados vazio após deploy

**Causa:** Migrations não foram executadas

**Solução:** Executar schema no Render:
```bash
# Via console Render
python -c "from database import Base, engine; Base.metadata.create_all(engine)"

# Ou executar schema.sql manualmente via pgAdmin
```

### Frontend não consegue conectar à API em produção

**Causa:** URL da API incorreta ou CORS bloqueado

**Solução:**
1. Verificar `REACT_APP_API_URL` no Netlify
2. Verificar console do navegador (F12) para erro exato
3. Confirmar CORS no backend inclui domínio Netlify

---

*Documentação técnica do projeto ComprasJá — versão 2.0*
*Última atualização: Maio 2026*
*Inclui: Especificação, Deploy e Troubleshooting completos*
