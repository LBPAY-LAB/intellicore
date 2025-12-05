# LBPay v2 - Universal Meta-Modeling Platform
## TODO List Detalhado

---

## 🎯 Visão Geral do Projeto

### **Objetivo Principal**
Criar uma plataforma universal de meta-modelagem onde:
1. **BACKOFFICE (Meta-Layer)**: Consultores definem tipos de objetos em linguagem natural sem programar
2. **FRONT-OFFICE (Operational)**: Operadores criam instâncias desses objetos validadas automaticamente por LLM

### **Princípios Fundamentais**
- ✅ **Zero código** para definir novos tipos de objetos
- ✅ **Linguagem natural** em português (pt-BR) como interface principal
- ✅ **LLM como motor** de validação e extração de dados
- ✅ **Grafo de relacionamentos** para visualizar hierarquias
- ✅ **RAG** sobre documentos normativos (BACEN, políticas internas)
- ✅ **Auditoria completa** de todas as operações
- ✅ **Triple Gold** (SQL + Graph + Vector) para diferentes casos de uso

---

## ✅ Fase 1: Setup Inicial (CONCLUÍDO - 100%)

### 1.1 - Projeto Next.js 15
- [x] Criar projeto com App Router
- [x] Configurar TypeScript strict mode
- [x] Configurar Tailwind CSS 4
- [x] Instalar shadcn/ui base

**Resultado:** Projeto em `/frontend` funcionando

### 1.2 - Internacionalização (i18n)
- [x] Instalar next-intl
- [x] Configurar routing (pt-BR, en-US, es-ES)
- [x] Criar arquivos de tradução
- [x] Configurar middleware

**Resultado:** Sistema multi-idioma funcionando

### 1.3 - Projeto NestJS
- [x] Criar projeto base
- [x] Configurar TypeScript
- [x] Estrutura de módulos

**Resultado:** Projeto em `/backend` funcionando

### 1.4 - Infrastructure as Code
- [x] docker-compose.yml completo
  - PostgreSQL 16
  - Valkey (Redis fork)
  - Meilisearch
  - Keycloak
- [x] init-db.sql com extensões
- [x] Healthchecks configurados

**Resultado:** `docker compose up -d` funciona

### 1.5 - Database Schema
- [x] Schema SQL completo em `database-schema.sql`
- [x] Tabelas de meta-layer
- [x] Tabelas de operational layer
- [x] Índices otimizados
- [x] Triggers e functions

**Resultado:** Schema pronto para migrations

### 1.6 - Documentação
- [x] README.md principal
- [x] SETUP_GUIDE.md detalhado
- [x] .env.example files
- [x] start.sh script

**Resultado:** Documentação completa

---

## 📋 Fase 2: BACKOFFICE - Tipos de Objetos (EM ANDAMENTO - 0%)

**Objetivo:** Permitir que consultores criem tipos de objetos (Cliente PF, PJ, Conta, etc.) definindo campos, regras e políticas em linguagem natural.

**Estimativa:** 2-3 semanas

---

### 2.1 - Backend: Configuração Base (Estimativa: 2 dias)

#### 2.1.1 - Instalar Dependências GraphQL
```bash
cd backend
npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql
npm install @nestjs/config
npm install class-validator class-transformer
```

**Critérios de aceitação:**
- [ ] GraphQL Playground acessível em http://localhost:4000/graphql
- [ ] Schema básico funcionando
- [ ] Validação de inputs configurada

**Arquivos a criar:**
- `src/app.module.ts` (atualizar com GraphQLModule)
- `src/schema.gql` (schema GraphQL)

**Exemplo de configuração:**
```typescript
// app.module.ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  sortSchema: true,
  playground: true,
  context: ({ req }) => ({ req }),
})
```

---

#### 2.1.2 - Configurar TypeORM
```bash
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/config dotenv
```

**Critérios de aceitação:**
- [ ] Conexão com PostgreSQL funcionando
- [ ] Migrations configuradas
- [ ] Entities sincronizadas

**Arquivos a criar:**
- `src/config/database.config.ts`
- `src/config/typeorm.config.ts`
- `ormconfig.json`

**Exemplo:**
```typescript
// database.config.ts
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    url: config.get('DATABASE_URL'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false, // Use migrations in production
    logging: config.get('NODE_ENV') === 'development',
  }),
})
```

---

#### 2.1.3 - Configurar Keycloak
```bash
npm install keycloak-connect nest-keycloak-connect
```

**Critérios de aceitação:**
- [ ] Autenticação via Keycloak funcionando
- [ ] Guards protegendo rotas
- [ ] Roles extraídos do token

**Arquivos a criar:**
- `src/auth/keycloak.module.ts`
- `src/auth/guards/auth.guard.ts`
- `src/auth/guards/roles.guard.ts`
- `src/auth/decorators/current-user.decorator.ts`
- `src/auth/decorators/roles.decorator.ts`

**Exemplo:**
```typescript
// keycloak.module.ts
KeycloakConnectModule.register({
  authServerUrl: process.env.KEYCLOAK_URL,
  realm: process.env.KEYCLOAK_REALM,
  clientId: process.env.KEYCLOAK_CLIENT_ID,
  secret: process.env.KEYCLOAK_CLIENT_SECRET,
})
```

---

### 2.2 - Backend: Módulo ObjectTypes (Estimativa: 3-4 dias)

**Objetivo:** CRUD completo de tipos de objetos via GraphQL

#### 2.2.1 - Entity: ObjectType

**Arquivo:** `src/modules/object-types/entities/object-type.entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType as GQLObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

@Entity('object_types')
@GQLObjectType()
export class ObjectType {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true, length: 100 })
  name: string;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  description?: string;

  @Field()
  @Column('text')
  fieldsDefinition: string;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  validationRules?: string;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  internalPolicies?: string;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  workflowDefinition?: string;

  @Field()
  @Column('text')
  agentSystemPrompt: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column('jsonb', { nullable: true })
  generatedSchema?: Record<string, any>;

  @Field({ nullable: true })
  @Column('uuid', { nullable: true })
  createdBy?: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({ default: true })
  isActive: boolean;
}
```

**Critérios de aceitação:**
- [ ] Entity sincronizada com database
- [ ] Todos os campos mapeados
- [ ] GraphQL types gerados

---

#### 2.2.2 - DTOs: Input Types

**Arquivo:** `src/modules/object-types/dto/create-object-type.input.ts`

```typescript
import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

@InputType()
export class CreateObjectTypeInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  fieldsDefinition: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  validationRules?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  internalPolicies?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  workflowDefinition?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  agentSystemPrompt: string;
}
```

**Arquivo:** `src/modules/object-types/dto/update-object-type.input.ts`

```typescript
import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateObjectTypeInput } from './create-object-type.input';

@InputType()
export class UpdateObjectTypeInput extends PartialType(CreateObjectTypeInput) {
  @Field(() => ID)
  id: string;
}
```

**Critérios de aceitação:**
- [ ] Validação funcionando
- [ ] Tipos GraphQL gerados
- [ ] Mensagens de erro claras

---

#### 2.2.3 - Service: ObjectTypesService

**Arquivo:** `src/modules/object-types/object-types.service.ts`

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectType } from './entities/object-type.entity';
import { CreateObjectTypeInput } from './dto/create-object-type.input';
import { UpdateObjectTypeInput } from './dto/update-object-type.input';

@Injectable()
export class ObjectTypesService {
  constructor(
    @InjectRepository(ObjectType)
    private objectTypesRepository: Repository<ObjectType>,
  ) {}

  async findAll(): Promise<ObjectType[]> {
    return this.objectTypesRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ObjectType> {
    const objectType = await this.objectTypesRepository.findOne({
      where: { id, isActive: true },
    });
    
    if (!objectType) {
      throw new NotFoundException(`Object type with ID ${id} not found`);
    }
    
    return objectType;
  }

  async create(input: CreateObjectTypeInput, userId: string): Promise<ObjectType> {
    // Check if name already exists
    const existing = await this.objectTypesRepository.findOne({
      where: { name: input.name },
    });
    
    if (existing) {
      throw new ConflictException(`Object type with name "${input.name}" already exists`);
    }

    const objectType = this.objectTypesRepository.create({
      ...input,
      createdBy: userId,
    });

    return this.objectTypesRepository.save(objectType);
  }

  async update(input: UpdateObjectTypeInput, userId: string): Promise<ObjectType> {
    const objectType = await this.findOne(input.id);

    // Check name uniqueness if changed
    if (input.name && input.name !== objectType.name) {
      const existing = await this.objectTypesRepository.findOne({
        where: { name: input.name },
      });
      
      if (existing) {
        throw new ConflictException(`Object type with name "${input.name}" already exists`);
      }
    }

    Object.assign(objectType, input);
    return this.objectTypesRepository.save(objectType);
  }

  async delete(id: string): Promise<boolean> {
    const objectType = await this.findOne(id);
    objectType.isActive = false;
    await this.objectTypesRepository.save(objectType);
    return true;
  }
}
```

**Critérios de aceitação:**
- [ ] CRUD completo funcionando
- [ ] Validações de negócio implementadas
- [ ] Soft delete implementado
- [ ] Tratamento de erros adequado

---

#### 2.2.4 - Resolver: ObjectTypesResolver

**Arquivo:** `src/modules/object-types/object-types.resolver.ts`

```typescript
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectType } from './entities/object-type.entity';
import { ObjectTypesService } from './object-types.service';
import { CreateObjectTypeInput } from './dto/create-object-type.input';
import { UpdateObjectTypeInput } from './dto/update-object-type.input';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

@Resolver(() => ObjectType)
@UseGuards(AuthGuard, RolesGuard)
export class ObjectTypesResolver {
  constructor(private readonly objectTypesService: ObjectTypesService) {}

  @Query(() => [ObjectType], { name: 'objectTypes' })
  @Roles('admin', 'backoffice_operator')
  async findAll(): Promise<ObjectType[]> {
    return this.objectTypesService.findAll();
  }

  @Query(() => ObjectType, { name: 'objectType' })
  @Roles('admin', 'backoffice_operator')
  async findOne(@Args('id') id: string): Promise<ObjectType> {
    return this.objectTypesService.findOne(id);
  }

  @Mutation(() => ObjectType)
  @Roles('admin', 'backoffice_operator')
  async createObjectType(
    @Args('input') input: CreateObjectTypeInput,
    @CurrentUser() user: any,
  ): Promise<ObjectType> {
    return this.objectTypesService.create(input, user.sub);
  }

  @Mutation(() => ObjectType)
  @Roles('admin', 'backoffice_operator')
  async updateObjectType(
    @Args('input') input: UpdateObjectTypeInput,
    @CurrentUser() user: any,
  ): Promise<ObjectType> {
    return this.objectTypesService.update(input, user.sub);
  }

  @Mutation(() => Boolean)
  @Roles('admin')
  async deleteObjectType(@Args('id') id: string): Promise<boolean> {
    return this.objectTypesService.delete(id);
  }
}
```

**Critérios de aceitação:**
- [ ] Queries funcionando no GraphQL Playground
- [ ] Mutations funcionando
- [ ] Autenticação obrigatória
- [ ] RBAC funcionando (admin, backoffice_operator)

---

#### 2.2.5 - Module: ObjectTypesModule

**Arquivo:** `src/modules/object-types/object-types.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectType } from './entities/object-type.entity';
import { ObjectTypesService } from './object-types.service';
import { ObjectTypesResolver } from './object-types.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([ObjectType])],
  providers: [ObjectTypesService, ObjectTypesResolver],
  exports: [ObjectTypesService],
})
export class ObjectTypesModule {}
```

**Critérios de aceitação:**
- [ ] Módulo registrado em AppModule
- [ ] Dependency injection funcionando

---

### 2.3 - Frontend: Apollo Client Setup (Estimativa: 1 dia)

#### 2.3.1 - Instalar Dependências

```bash
cd frontend
npm install @apollo/client graphql
npm install @apollo/experimental-nextjs-app-support
```

---

#### 2.3.2 - Configurar Apollo Client

**Arquivo:** `frontend/lib/apollo-client.ts`

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Get token from Keycloak (will implement later)
  const token = null; // TODO: Get from Keycloak
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
  });
});
```

**Critérios de aceitação:**
- [ ] Cliente Apollo configurado
- [ ] Cache funcionando
- [ ] Headers de autenticação preparados

---

#### 2.3.3 - Provider para Client Components

**Arquivo:** `frontend/lib/apollo-provider.tsx`

```typescript
'use client';

import { ApolloLink, HttpLink } from '@apollo/client';
import {
  ApolloNextAppProvider,
  NextSSRInMemoryCache,
  NextSSRApolloClient,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support/ssr';

function makeClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  });

  return new NextSSRApolloClient({
    cache: new NextSSRInMemoryCache(),
    link:
      typeof window === 'undefined'
        ? ApolloLink.from([
            new SSRMultipartLink({
              stripDefer: true,
            }),
            httpLink,
          ])
        : httpLink,
  });
}

export function ApolloProvider({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
```

**Critérios de aceitação:**
- [ ] Provider funcionando
- [ ] SSR suportado
- [ ] Client-side queries funcionando

---

### 2.4 - Frontend: Layout BACKOFFICE (Estimativa: 2 dias)

#### 2.4.1 - Criar DashboardLayout

**Arquivo:** `frontend/components/layouts/DashboardLayout.tsx`

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems: NavItem[] = [
    {
      href: '/backoffice',
      label: t('nav.backoffice'),
      icon: <HomeIcon />,
    },
    {
      href: '/backoffice/object-types',
      label: t('nav.objectTypes'),
      icon: <CubeIcon />,
    },
    {
      href: '/backoffice/hierarchies',
      label: t('nav.hierarchies'),
      icon: <GraphIcon />,
    },
    {
      href: '/backoffice/documents',
      label: t('nav.documents'),
      icon: <DocumentIcon />,
    },
    {
      href: '/backoffice/agents',
      label: t('nav.agents'),
      icon: <RobotIcon />,
    },
  ];

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className={`bg-slate-800 border-r border-slate-700 transition-all ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4">
          <h1 className="text-white font-bold text-xl">
            {isSidebarOpen ? 'LBPay' : 'LP'}
          </h1>
        </div>
        <nav className="mt-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <span className="mr-3">{item.icon}</span>
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-slate-300 hover:text-white"
            >
              <MenuIcon />
            </button>
            <div className="flex items-center gap-4">
              {/* User Menu */}
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
```

**Critérios de aceitação:**
- [ ] Sidebar responsiva
- [ ] Navegação funcionando
- [ ] User menu implementado
- [ ] Dark theme aplicado

---

### 2.5 - Frontend: Página Listar Tipos (Estimativa: 2 dias)

**Arquivo:** `frontend/app/[locale]/backoffice/object-types/page.tsx`

```typescript
'use client';

import { useQuery, gql } from '@apollo/client';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

const GET_OBJECT_TYPES = gql`
  query GetObjectTypes {
    objectTypes {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;

export default function ObjectTypesPage() {
  const t = useTranslations('backoffice.objectTypes');
  const { data, loading, error } = useQuery(GET_OBJECT_TYPES);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
            <p className="text-slate-400 mt-2">
              Defina tipos de objetos em linguagem natural
            </p>
          </div>
          <Link href="/backoffice/object-types/create">
            <Button>
              <PlusIcon className="mr-2" />
              {t('create')}
            </Button>
          </Link>
        </div>

        {/* Table */}
        {loading && <LoadingSpinner />}
        {error && <ErrorMessage error={error} />}
        {data && (
          <div className="bg-slate-800 rounded-lg border border-slate-700">
            <table className="w-full">
              <thead className="border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-slate-300">{t('name')}</th>
                  <th className="px-6 py-4 text-left text-slate-300">{t('description')}</th>
                  <th className="px-6 py-4 text-left text-slate-300">Criado em</th>
                  <th className="px-6 py-4 text-right text-slate-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.objectTypes.map((type: any) => (
                  <tr key={type.id} className="border-b border-slate-700 hover:bg-slate-750">
                    <td className="px-6 py-4 text-white font-medium">{type.name}</td>
                    <td className="px-6 py-4 text-slate-400">{type.description}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(type.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/backoffice/object-types/${type.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          {t('edit')}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
```

**Critérios de aceitação:**
- [ ] Lista carregando do GraphQL
- [ ] Loading state funcionando
- [ ] Error handling implementado
- [ ] Link para criar novo tipo
- [ ] Link para editar tipo

---

### 2.6 - Frontend: Página Criar Tipo (Estimativa: 3 dias)

**Arquivo:** `frontend/app/[locale]/backoffice/object-types/create/page.tsx`

```typescript
'use client';

import { useMutation, gql } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const CREATE_OBJECT_TYPE = gql`
  mutation CreateObjectType($input: CreateObjectTypeInput!) {
    createObjectType(input: $input) {
      id
      name
    }
  }
`;

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  description: z.string().optional(),
  fieldsDefinition: z.string().min(10, 'Defina os campos em linguagem natural'),
  validationRules: z.string().optional(),
  internalPolicies: z.string().optional(),
  workflowDefinition: z.string().optional(),
  agentSystemPrompt: z.string().min(10, 'System prompt é obrigatório'),
});

type FormData = z.infer<typeof schema>;

export default function CreateObjectTypePage() {
  const t = useTranslations('backoffice.objectTypes');
  const router = useRouter();
  const [createObjectType, { loading }] = useMutation(CREATE_OBJECT_TYPE);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      fieldsDefinition: '',
      validationRules: '',
      internalPolicies: '',
      workflowDefinition: '',
      agentSystemPrompt: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createObjectType({
        variables: { input: data },
        refetchQueries: ['GetObjectTypes'],
      });
      
      toast.success('Tipo de objeto criado com sucesso!');
      router.push('/backoffice/object-types');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar tipo de objeto');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">{t('create')}</h1>
          <p className="text-slate-400 mt-2">
            Defina um novo tipo de objeto em linguagem natural
          </p>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-6">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('name')}
              </label>
              <Input
                {...form.register('name')}
                placeholder="Ex: Cliente PF, Cliente PJ, Conta de Pagamento"
                className="bg-slate-900 border-slate-700 text-white"
              />
              {form.formState.errors.name && (
                <p className="text-red-400 text-sm mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('description')}
              </label>
              <Textarea
                {...form.register('description')}
                placeholder="Descrição breve do tipo de objeto"
                rows={2}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            {/* Definição de Campos */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('fieldsDefinition')}
              </label>
              <Textarea
                {...form.register('fieldsDefinition')}
                placeholder={`Este tipo de objeto deve ter os seguintes campos obrigatórios:

- Nome completo (texto, obrigatório)
- CPF (texto, obrigatório, formato XXX.XXX.XXX-XX)
- Data de nascimento (data, obrigatório)
- Endereço completo (texto, obrigatório)
- CEP (texto, obrigatório, formato XXXXX-XXX)
- Renda mensal (número decimal, obrigatório)

Campos opcionais:
- Email (texto, formato email)
- Telefone (texto)`}
                rows={15}
                className="bg-slate-900 border-slate-700 text-white font-mono text-sm"
              />
              {form.formState.errors.fieldsDefinition && (
                <p className="text-red-400 text-sm mt-1">
                  {form.formState.errors.fieldsDefinition.message}
                </p>
              )}
            </div>

            {/* Regras de Validação */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('validationRules')}
              </label>
              <Textarea
                {...form.register('validationRules')}
                placeholder={`Regras que devem ser validadas:

1. CPF deve ser válido (validar dígitos verificadores)
2. Idade mínima de 18 anos
3. Renda mensal mínima de R$ 1.000,00
4. CEP deve existir e ser válido
5. Email deve ser único no sistema
6. Não pode ter restrições no CPF (consultar Serasa)`}
                rows={10}
                className="bg-slate-900 border-slate-700 text-white font-mono text-sm"
              />
            </div>

            {/* Políticas Internas */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('internalPolicies')}
              </label>
              <Textarea
                {...form.register('internalPolicies')}
                placeholder={`Políticas do banco aplicáveis:

- Não aceitar clientes de países sancionados
- Clientes com renda < R$ 5.000 precisam de aprovação manual
- Profissões de alto risco (PEP) requerem documentação adicional
- Menores de 21 anos precisam de fiador`}
                rows={8}
                className="bg-slate-900 border-slate-700 text-white font-mono text-sm"
              />
            </div>

            {/* Workflow */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('workflowDefinition')}
              </label>
              <Textarea
                {...form.register('workflowDefinition')}
                placeholder={`Estados possíveis:

1. rascunho (inicial)
2. em_validacao (após submit)
3. pendente_aprovacao (validação OK, aguarda aprovação manual)
4. aprovado (final, pode operar)
5. rejeitado (final, não aprovado)

Transições:
- rascunho → em_validacao (automático ao submeter)
- em_validacao → pendente_aprovacao (se todas validações passarem)
- em_validacao → rascunho (se validações falharem)
- pendente_aprovacao → aprovado (aprovação manual)
- pendente_aprovacao → rejeitado (rejeição manual)`}
                rows={12}
                className="bg-slate-900 border-slate-700 text-white font-mono text-sm"
              />
            </div>

            {/* System Prompt do Agente */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('agentPrompt')}
              </label>
              <Textarea
                {...form.register('agentSystemPrompt')}
                placeholder={`Você é um especialista em cadastro de pessoas físicas para instituições financeiras reguladas pelo Banco Central do Brasil.

Sua função é:
1. Extrair dados de texto livre fornecido pelo operador
2. Validar cada campo conforme as regras definidas
3. Consultar as normas BACEN e políticas internas indexadas
4. Retornar JSON estruturado com os dados extraídos
5. Fornecer explicações claras em português sobre validações que falharam

Sempre seja rigoroso com validações de compliance e segurança.
Sempre explique em português claro por que uma validação falhou.
Sempre sugira correções quando possível.`}
                rows={12}
                className="bg-slate-900 border-slate-700 text-white font-mono text-sm"
              />
              {form.formState.errors.agentSystemPrompt && (
                <p className="text-red-400 text-sm mt-1">
                  {form.formState.errors.agentSystemPrompt.message}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar e Treinar Agente'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
```

**Critérios de aceitação:**
- [ ] Form com validação funcionando
- [ ] Mutation criando no backend
- [ ] Feedback de sucesso/erro
- [ ] Redirect após criar
- [ ] Placeholders úteis em português
- [ ] Todos os campos implementados

---

## 🔗 Fase 3: BACKOFFICE - Hierarquias (Grafo)

**Estimativa:** 2 semanas

*[Continua com detalhamento similar...]*

---

## 📊 Progresso Detalhado

### Fase 1: Setup Inicial
**Status:** ✅ 100% Concluído
**Tempo gasto:** ~1 dia
**Próximo:** Fase 2

### Fase 2: BACKOFFICE - Tipos de Objetos
**Status:** ⏳ 0% (Não iniciado)
**Estimativa:** 2-3 semanas
**Tarefas críticas:**
- Backend GraphQL setup
- Entity + Service + Resolver
- Frontend Apollo Client
- Form de criação

### Fases 3-15
**Status:** 🔮 Planejado
**Estimativa total:** 20-24 semanas

---

## 📝 Notas Técnicas Importantes

### Sobre Linguagem Natural
- Todos os campos de definição (fieldsDefinition, validationRules, etc.) são **texto livre em português**
- O LLM irá processar esse texto para extrair estrutura
- Mantenha exemplos claros nos placeholders
- Use listas numeradas ou com bullet points

### Sobre Validação
- Validação acontece em **duas camadas**:
  1. Schema validation (Zod no frontend, class-validator no backend)
  2. LLM validation (regras de negócio em linguagem natural)

### Sobre Performance
- Use **paginação** em todas as listagens
- Implemente **caching** no Apollo Client
- Use **indexes** no PostgreSQL para queries frequentes

### Sobre Segurança
- **Sempre** usar guards do Keycloak
- **Nunca** expor dados sensíveis no GraphQL schema
- Implementar **rate limiting** nas mutations
- Validar **ownership** antes de permitir edição

---

## 🎯 Definição de "Pronto"

Uma tarefa está pronta quando:
- [ ] Código implementado e testado
- [ ] Testes unitários passando (se aplicável)
- [ ] Documentação atualizada
- [ ] Code review aprovado
- [ ] Deploy em dev funcionando
- [ ] Critérios de aceitação atendidos

---

**Última atualização:** 2024-12-02
**Próxima revisão:** Após conclusão da Fase 2
