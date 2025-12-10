# SuperCore Frontend

Frontend da plataforma SuperCore - Core Banking 100% AI-Based

## Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: Keycloak (OIDC/OAuth2)
- **Language**: TypeScript
- **Icons**: Lucide React

## Estrutura de Diretórios

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout com KeycloakProvider
│   ├── page.tsx                 # Dashboard principal
│   └── unauthorized/            # Página de acesso negado
├── components/                   # Componentes reutilizáveis
│   ├── ui/                      # shadcn/ui components
│   ├── ProtectedRoute.tsx       # HOC para rotas protegidas
│   └── UserMenu.tsx             # Menu do usuário
├── lib/                         # Bibliotecas e utilitários
│   ├── keycloak/
│   │   └── KeycloakProvider.tsx # Provider de autenticação
│   └── api/
│       └── client.ts            # Cliente HTTP com Bearer token
└── public/
    └── silent-check-sso.html    # SSO silencioso do Keycloak
```

## Setup do Ambiente

### 1. Instalar Dependências

```bash
cd frontend
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env.local` e configure:

```bash
# Keycloak Configuration
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8081
NEXT_PUBLIC_KEYCLOAK_REALM=supercore-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=supercore-frontend

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

### 3. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

O frontend estará disponível em: http://localhost:3000

## Autenticação com Keycloak

### Fluxo de Autenticação

1. **Check SSO**: Ao acessar a aplicação, o Keycloak verifica se há uma sessão ativa
2. **Login**: Se não autenticado, redireciona para a página de login do Keycloak
3. **Token**: Após login bem-sucedido, recebe um JWT token
4. **Auto-refresh**: Token é automaticamente renovado a cada 60 segundos
5. **Protected Routes**: Componentes protegidos verificam autenticação

### Uso do KeycloakProvider

O `KeycloakProvider` gerencia toda a lógica de autenticação:

```typescript
import { useKeycloak } from '@/lib/keycloak/KeycloakProvider';

function MyComponent() {
  const { user, authenticated, login, logout, hasRole, token } = useKeycloak();

  if (!authenticated) {
    return <button onClick={login}>Login</button>;
  }

  return (
    <div>
      <p>Bem-vindo, {user?.name}</p>
      {hasRole('admin') && <AdminPanel />}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes

Para proteger uma página:

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Conteúdo protegido apenas para admins</div>
    </ProtectedRoute>
  );
}
```

## Chamadas à API

### Usando o useApiClient Hook

```typescript
import { useApiClient } from '@/lib/api/client';

function MyComponent() {
  const apiClient = useApiClient();

  const fetchData = async () => {
    try {
      const data = await apiClient.get('/oracle/whoami');
      console.log(data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return <button onClick={fetchData}>Buscar Dados</button>;
}
```

O token de autenticação é automaticamente injetado em todas as requisições.

## Roles e Permissões

### Roles Disponíveis

- **admin**: Acesso completo ao sistema
- **product_manager**: Criar/editar Object Definitions e Instances
- **compliance_officer**: Visualizar tudo, aprovar workflows
- **developer**: Acesso à API, read-only no backoffice
- **viewer**: Apenas leitura

### Verificação de Roles

```typescript
const { hasRole } = useKeycloak();

// Verificar role única
if (hasRole('admin')) {
  // Mostrar funcionalidade admin
}

// Verificar múltiplas roles
const canEdit = hasRole('admin') || hasRole('product_manager');
```

## Componentes Principais

### Dashboard (app/page.tsx)

- Exibe identidade do Oracle (`GET /oracle/whoami`)
- Mostra estatísticas rápidas
- Interface responsiva e moderna

### UserMenu

- Dropdown com informações do usuário
- Lista de roles do usuário
- Logout

### ProtectedRoute

- HOC para proteger páginas
- Redireciona para login se não autenticado
- Verifica roles específicas
- Mostra loading durante verificação

## Desenvolvimento

### Adicionar Novas Páginas Protegidas

1. Criar arquivo em `app/nova-pagina/page.tsx`
2. Envolver com `ProtectedRoute`:

```typescript
'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function NovaPagina() {
  return (
    <ProtectedRoute requiredRole="product_manager">
      <div>Conteúdo da nova página</div>
    </ProtectedRoute>
  );
}
```

### Fazer Chamadas à API

```typescript
const apiClient = useApiClient();

// GET
const data = await apiClient.get('/endpoint');

// POST
const result = await apiClient.post('/endpoint', { data: 'value' });

// PUT
await apiClient.put('/endpoint/:id', { data: 'updated' });

// DELETE
await apiClient.delete('/endpoint/:id');
```

## Build para Produção

```bash
npm run build
npm start
```

## Troubleshooting

### Token Expirado

Se o token expirar, o Keycloak automaticamente tenta renovar. Se falhar, o usuário é redirecionado para login.

### CORS Issues

Certifique-se de que o backend está configurado para aceitar requisições do frontend:

```go
// No backend Go
r.Use(cors.New(cors.Config{
    AllowOrigins: []string{"http://localhost:3000"},
    AllowMethods: []string{"GET", "POST", "PUT", "DELETE"},
    AllowHeaders: []string{"Authorization", "Content-Type"},
}))
```

### Keycloak Não Conecta

1. Verifique se o Keycloak está rodando: `docker-compose ps`
2. Verifique as variáveis de ambiente em `.env.local`
3. Certifique-se de que o realm e client estão configurados corretamente

## Próximos Passos

- [ ] Adicionar páginas para Object Definitions
- [ ] Implementar CRUD de Instances
- [ ] Criar visualização de Relationships (grafo)
- [ ] Implementar Natural Language Assistant
- [ ] Adicionar testes E2E com Playwright

## Referências

- [Next.js Documentation](https://nextjs.org/docs)
- [Keycloak JS Adapter](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
