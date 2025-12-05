# LBPay v2 - Guia Completo de Setup

Este guia contém todas as instruções para executar o projeto completo no seu ambiente local.

## 📋 Pré-requisitos

- Node.js 22+ e npm
- Docker e Docker Compose
- Git

## 🚀 Setup Rápido (5 minutos)

### **1. Iniciar Databases**

```bash
cd /path/to/lbpay-v2
docker compose up -d
```

Aguarde todos os serviços ficarem healthy (~2 minutos):
```bash
docker compose ps
```

### **2. Configurar Keycloak**

Acesse: http://localhost:8080
- User: `admin`
- Password: `admin`

**Criar Realm:**
1. Click em "Create Realm"
2. Nome: `lbpay`
3. Enabled: `ON`
4. Save

**Criar Client (Frontend):**
1. Clients → Create Client
2. Client ID: `nextjs-frontend`
3. Client type: `OpenID Connect`
4. Client authentication: `OFF` (public client)
5. Valid redirect URIs: `http://localhost:3000/*`
6. Web origins: `http://localhost:3000`
7. Save

**Criar Client (Backend):**
1. Clients → Create Client
2. Client ID: `nestjs-backend`
3. Client type: `OpenID Connect`
4. Client authentication: `ON` (confidential)
5. Service accounts roles: `ON`
6. Valid redirect URIs: `http://localhost:4000/*`
7. Save
8. Credentials tab → copiar `Client Secret`

**Criar Roles:**
1. Realm roles → Create role
2. Criar roles:
   - `admin`
   - `backoffice_operator`
   - `compliance_officer`
   - `auditor`

**Criar Usuário Admin:**
1. Users → Add user
2. Username: `admin@lbpay.com`
3. Email: `admin@lbpay.com`
4. Email verified: `ON`
5. Save
6. Credentials tab → Set password: `admin123` (Temporary: OFF)
7. Role mapping → Assign role `admin`

### **3. Configurar Backend (NestJS)**

```bash
cd backend
npm install
```

Criar `.env`:
```bash
# Database
DATABASE_URL="postgresql://lbpay:lbpay_dev_password@localhost:5432/lbpay"

# Keycloak
KEYCLOAK_URL="http://localhost:8080"
KEYCLOAK_REALM="lbpay"
KEYCLOAK_CLIENT_ID="nestjs-backend"
KEYCLOAK_CLIENT_SECRET="<COPIAR_DO_KEYCLOAK>"

# Redis/Valkey
REDIS_URL="redis://localhost:6379"

# Meilisearch
MEILI_HOST="http://localhost:7700"
MEILI_MASTER_KEY="lbpay_dev_master_key"

# Server
PORT=4000
NODE_ENV=development
```

Instalar dependências adicionais:
```bash
npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql
npm install @nestjs/config @nestjs/typeorm typeorm pg
npm install keycloak-connect nest-keycloak-connect
npm install @nestjs/bull bull
npm install ioredis
npm install meilisearch
```

Executar migrations:
```bash
npm run migration:run
```

Iniciar servidor:
```bash
npm run start:dev
```

Backend rodando em: http://localhost:4000
GraphQL Playground: http://localhost:4000/graphql

### **4. Configurar Frontend (Next.js)**

```bash
cd frontend
npm install
```

Criar `.env.local`:
```bash
# Backend GraphQL
NEXT_PUBLIC_GRAPHQL_URL="http://localhost:4000/graphql"

# Keycloak
NEXT_PUBLIC_KEYCLOAK_URL="http://localhost:8080"
NEXT_PUBLIC_KEYCLOAK_REALM="lbpay"
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID="nextjs-frontend"
```

Iniciar servidor:
```bash
npm run dev
```

Frontend rodando em: http://localhost:3000

## ✅ Verificação

1. **Databases**: `docker compose ps` - todos devem estar `healthy`
2. **Backend**: http://localhost:4000/graphql - deve abrir GraphQL Playground
3. **Frontend**: http://localhost:3000 - deve mostrar página inicial
4. **Keycloak**: http://localhost:8080 - deve fazer login

## 🔧 Comandos Úteis

### **Docker**
```bash
# Ver logs
docker compose logs -f

# Parar tudo
docker compose down

# Resetar tudo (CUIDADO: apaga dados)
docker compose down -v
```

### **Backend**
```bash
# Gerar migration
npm run migration:generate -- src/migrations/MigrationName

# Executar migrations
npm run migration:run

# Reverter migration
npm run migration:revert

# Seed database
npm run seed
```

### **Frontend**
```bash
# Build para produção
npm run build

# Executar produção
npm run start
```

## 📚 Próximos Passos

Após o setup completo, você pode:

1. **Acessar o BACKOFFICE**: http://localhost:3000/backoffice
   - Criar tipos de objetos
   - Definir hierarquias
   - Upload de documentos

2. **Acessar o FRONT-OFFICE**: http://localhost:3000/frontoffice
   - Criar instâncias
   - Listar e pesquisar

## 🐛 Troubleshooting

### Erro de conexão com PostgreSQL
```bash
# Verificar se está rodando
docker compose ps postgres

# Ver logs
docker compose logs postgres
```

### Erro de conexão com Keycloak
```bash
# Aguardar Keycloak ficar pronto (pode levar 1-2 minutos)
docker compose logs keycloak

# Verificar health
curl http://localhost:8080/health/ready
```

### Backend não inicia
```bash
# Verificar .env
cat backend/.env

# Reinstalar dependências
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 📞 Suporte

Para problemas ou dúvidas, consulte a documentação técnica:
- `ARCHITECTURE.md` - Arquitetura detalhada
- `FINAL_TECH_STACK.md` - Stack completa
- `LLM_ORCHESTRATION.md` - LLM e orquestração
