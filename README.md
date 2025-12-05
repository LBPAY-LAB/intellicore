# LBPay Universal Meta-Modeling Platform v2.0

> Plataforma universal de meta-modelagem orientada por IA para gestão de entidades bancárias.

Sistema revolucionário que permite criar qualquer tipo de objeto (Cliente PF, PJ, Conta, Produto, etc.) **sem programar**, usando apenas **linguagem natural** e **validação inteligente por LLM**.

---

## 🎯 Conceito

### **Duas Seções em Um Portal:**

#### **📋 BACKOFFICE (Meta-Layer) - "Ensinar o Sistema"**
Defina tipos de objetos em linguagem natural:
- Criar tipos (Cliente PF, Cliente PJ, Conta, Produto)
- Definir campos, regras, políticas, workflows
- Upload de documentos normativos (BACEN, políticas)
- Visualizar hierarquias em grafo interativo

#### **💼 FRONT-OFFICE (Operational) - "Usar o Sistema"**
Opere com instâncias dos objetos definidos:
- Criar instâncias escrevendo texto livre
- LLM valida automaticamente baseado nas regras do BACKOFFICE
- Listar, pesquisar, editar instâncias
- Visualizar relacionamentos e histórico

---

## 🚀 Quick Start (3 minutos)

### **Opção 1: Script Automático**

```bash
./start.sh
```

### **Opção 2: Manual**

```bash
# 1. Iniciar databases
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env  # Configure Keycloak secret
npm install
npm run migration:run
npm run start:dev

# 3. Frontend (em outro terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

### **Acessar:**
- Frontend: http://localhost:3000
- Backend GraphQL: http://localhost:4000/graphql
- Keycloak: http://localhost:8080 (admin/admin)

📚 **Guia completo:** Ver `SETUP_GUIDE.md`

---

## 📁 Estrutura do Projeto

```
lbpay-v2/
├── frontend/              # Next.js 15 + next-intl + Tailwind 4
│   ├── app/[locale]/      # Pages (i18n)
│   ├── i18n/              # Internacionalização
│   ├── messages/          # Traduções (pt-BR, en-US, es-ES)
│   └── lib/               # Utilities
│
├── backend/               # NestJS + GraphQL + TypeORM
│   ├── src/
│   │   ├── modules/       # Feature modules
│   │   ├── entities/      # TypeORM entities
│   │   └── main.ts        # Entry point
│   └── migrations/        # Database migrations
│
├── docker-compose.yml     # PostgreSQL, Valkey, Meilisearch, Keycloak
├── database-schema.sql    # Complete SQL schema
├── SETUP_GUIDE.md         # Detailed setup instructions
├── todo.md                # Project roadmap
└── start.sh               # Quick start script
```

---

## 🛠️ Stack Tecnológica

### **Frontend**
- **Next.js 15** (App Router, Server Components)
- **next-intl** (i18n: pt-BR, en-US, es-ES)
- **Tailwind CSS 4** (Styling)
- **shadcn/ui** (Components)
- **Apollo Client** (GraphQL)
- **Zustand** (State management)
- **Cytoscape.js** (Graph visualization)
- **React Hook Form + Zod** (Forms)

### **Backend**
- **NestJS** (Framework)
- **GraphQL** (Apollo Server)
- **TypeORM** (ORM)
- **Keycloak** (Authentication & Authorization)
- **Bull** (Job queues)

### **Databases**
- **PostgreSQL 16** (Primary database)
- **Valkey** (Redis fork - Cache & sessions)
- **Meilisearch** (Full-text search)
- **Keycloak** (Identity & Access Management)

### **Futuro**
- **Go** (API Gateway, PIX/DICT services)
- **Python** (LLM services, AI/ML)
- **NebulaGraph** (Graph database)
- **Qdrant** (Vector database)
- **Apache Pulsar** (Event streaming)
- **Temporal** (Workflow orchestration)
- **Dagster** (Data orchestration)

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| `README.md` | Este arquivo (overview) |
| `SETUP_GUIDE.md` | Guia detalhado de instalação e configuração |
| `todo.md` | Roadmap completo do projeto |
| `database-schema.sql` | Schema SQL completo |
| `FINAL_TECH_STACK.md` | Stack tecnológica completa (no projeto antigo) |
| `ARCHITECTURE.md` | Arquitetura detalhada (no projeto antigo) |
| `LLM_ORCHESTRATION.md` | LLM e orquestração (no projeto antigo) |

---

## 🎯 Roadmap

### **✅ Fase 1: Setup Inicial (Concluído)**
- [x] Projeto Next.js 15
- [x] Projeto NestJS
- [x] Docker Compose
- [x] Schema SQL
- [x] Documentação

### **⏳ Fase 2: BACKOFFICE - Tipos de Objetos (Em andamento)**
- [ ] Backend: GraphQL APIs
- [ ] Frontend: CRUD de tipos
- [ ] Formulários em linguagem natural

### **🔮 Fase 3-15: Futuro**
- Grafo de hierarquias
- Upload de documentos
- Agentes LLM
- FRONT-OFFICE completo
- Go services
- Python services
- Advanced databases
- Production infrastructure

Ver `todo.md` para detalhes completos.

---

## 🤝 Contribuindo

Este é um projeto proprietário da LBPay. Para contribuir:

1. Clone o repositório
2. Crie uma branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Proprietary - LBPay © 2024

---

## 🆘 Suporte

- **Documentação:** Ver `SETUP_GUIDE.md`
- **Issues:** Abra uma issue no repositório
- **Email:** suporte@lbpay.com

---

## 🌟 Destaques

- ✅ **Zero código** para criar novos tipos de objetos
- ✅ **Linguagem natural** em português
- ✅ **Validação inteligente** por LLM
- ✅ **Grafo interativo** de hierarquias
- ✅ **Multi-idioma** (pt-BR, en-US, es-ES)
- ✅ **100% open-source** stack
- ✅ **Self-hosted** (controle total)
- ✅ **Enterprise-grade** (Keycloak, PostgreSQL)

---

**Construído com ❤️ pela equipe LBPay**
