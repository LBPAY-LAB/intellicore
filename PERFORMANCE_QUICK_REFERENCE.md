# Performance Quick Reference

Guia rápido para desenvolvedores sobre uso de cache, paginação e otimizações.

---

## Redis Cache - Backend

### Usar Cache em Handler

```go
import "github.com/lbpay/supercore/internal/cache"

// 1. Injetar cache no handler
type MyHandler struct {
    db    *database.DB
    cache *cache.RedisCache
}

func NewMyHandler(db *database.DB, cache *cache.RedisCache) *MyHandler {
    return &MyHandler{db: db, cache: cache}
}

// 2. Tentar buscar do cache
func (h *MyHandler) Get(c *gin.Context) {
    id := c.Param("id")
    cacheKey := fmt.Sprintf("my_object:%s", id)

    var data MyType
    err := h.cache.Get(c.Request.Context(), cacheKey, &data)
    if err == nil {
        // Cache HIT
        c.Header("X-Cache", "HIT")
        c.JSON(http.StatusOK, data)
        return
    }

    // Cache MISS - buscar do banco
    c.Header("X-Cache", "MISS")
    // ... query database ...

    // Armazenar no cache
    h.cache.Set(c.Request.Context(), cacheKey, data, 10*time.Minute)

    c.JSON(http.StatusOK, data)
}

// 3. Invalidar cache em UPDATE/DELETE
func (h *MyHandler) Update(c *gin.Context) {
    id := c.Param("id")

    // ... update database ...

    // Invalida cache específico
    cacheKey := fmt.Sprintf("my_object:%s", id)
    h.cache.Delete(c.Request.Context(), cacheKey)

    // Invalida listas
    h.cache.DeletePattern(c.Request.Context(), "my_objects:list:*")

    c.JSON(http.StatusOK, updatedData)
}
```

### TTL Recomendados

| Tipo de Dado | TTL | Razão |
|--------------|-----|-------|
| Object Definitions | 1 hora | Mudam raramente |
| Instances | 5-10 min | Mudam frequentemente |
| Schemas | 30 min | Mudam com object definition |
| Listas | 2-5 min | Podem ter novos items |
| Usuários | 15 min | Balance entre freshness e cache |

---

## Paginação - Backend

### Implementar Paginação

```go
func (h *Handler) List(c *gin.Context) {
    // 1. Parse parâmetros
    page := 1
    pageSize := 50
    if c.Query("page") != "" {
        fmt.Sscanf(c.Query("page"), "%d", &page)
    }
    if c.Query("page_size") != "" {
        fmt.Sscanf(c.Query("page_size"), "%d", &pageSize)
    }

    // Limite máximo
    if pageSize > 100 {
        pageSize = 100
    }

    offset := (page - 1) * pageSize

    // 2. Count total
    var total int
    err := h.db.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM my_table WHERE ...").Scan(&total)

    // 3. Query paginada
    query := `
        SELECT * FROM my_table
        WHERE ...
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
    `
    rows, err := h.db.Pool.Query(ctx, query, pageSize, offset)

    // 4. Response com metadata
    c.JSON(http.StatusOK, gin.H{
        "items": items,
        "pagination": gin.H{
            "page":        page,
            "page_size":   pageSize,
            "total":       total,
            "total_pages": (total + pageSize - 1) / pageSize,
        },
    })
}
```

---

## React Query - Frontend

### Buscar Dados com Cache

```typescript
import { useObjectDefinition } from '@/lib/api/object-definitions';

function MyComponent({ id }: { id: string }) {
  // Busca com cache automático
  const { data, isLoading, error } = useObjectDefinition(id);

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return <div>{data.display_name}</div>;
}
```

### Criar/Atualizar com Invalidação

```typescript
import { useCreateObjectDefinition } from '@/lib/api/object-definitions';

function CreateForm() {
  const createMutation = useCreateObjectDefinition();

  const handleSubmit = async (data) => {
    try {
      const result = await createMutation.mutateAsync(data);
      // Cache é invalidado automaticamente
      toast.success('Created!');
      router.push(`/object-definitions/${result.id}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
      <button disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### Prefetch para UX Rápida

```typescript
import { usePrefetchObjectDefinition } from '@/lib/api/object-definitions';

function ObjectList({ objects }) {
  const prefetch = usePrefetchObjectDefinition();

  return (
    <ul>
      {objects.map((obj) => (
        <li
          key={obj.id}
          onMouseEnter={() => prefetch(obj.id)} // Prefetch ao hover
        >
          <Link href={`/object-definitions/${obj.id}`}>
            {obj.display_name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

### Lidar com Paginação

```typescript
import { useObjectDefinitions } from '@/lib/api/object-definitions';

function ObjectList() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useObjectDefinitions({ page, page_size: 50 });

  if (isLoading) return <Spinner />;

  return (
    <>
      <ul>
        {data.items.map((obj) => (
          <li key={obj.id}>{obj.display_name}</li>
        ))}
      </ul>

      <Pagination
        current={data.pagination.page}
        total={data.pagination.total_pages}
        onChange={setPage}
      />
    </>
  );
}
```

---

## Database Queries

### Usar Índices Corretamente

```sql
-- ✅ BOM: Usa índice idx_instances_objdef_state
SELECT * FROM instances
WHERE object_definition_id = $1
  AND current_state = $2
  AND is_deleted = false
ORDER BY created_at DESC
LIMIT 50;

-- ❌ RUIM: Full table scan
SELECT * FROM instances
WHERE data->>'nome' LIKE '%Maria%';

-- ✅ BOM: Usa índice idx_instances_data_cpf
SELECT * FROM instances
WHERE data->>'cpf' = $1
  AND is_deleted = false;
```

### Verificar Performance

```sql
-- Explain Analyze
EXPLAIN ANALYZE
SELECT * FROM instances
WHERE object_definition_id = 'uuid'
  AND current_state = 'ACTIVE';

-- Deve mostrar: Index Scan using idx_instances_objdef_state
```

### Índices Disponíveis

| Tabela | Índice | Uso |
|--------|--------|-----|
| instances | `idx_instances_objdef_state` | Filtro por definition + state |
| instances | `idx_instances_data_cpf` | Busca por CPF |
| instances | `idx_instances_data_email` | Busca por email |
| instances | `idx_instances_created_at_desc` | Ordenação por data |
| instances | `idx_instances_data_gin` | Full-text search em data |
| relationships | `idx_relationships_source_type` | Navegação de grafo |
| relationships | `idx_relationships_target_type` | Navegação reversa |

---

## Rate Limiting

### Aplicar em Rotas

```go
import "github.com/lbpay/supercore/internal/middleware"

func SetupRoutes(router *gin.Engine) {
    // Global rate limit: 100 req/s
    router.Use(middleware.RateLimiter(100, 200))

    // IP-based: 1000 req/min por IP
    router.Use(middleware.IPRateLimiter(1000))

    // Rotas sensíveis podem ter limites mais baixos
    authRoutes := router.Group("/api/v1/auth")
    authRoutes.Use(middleware.RateLimiter(10, 20)) // 10 req/s para auth
    {
        authRoutes.POST("/login", loginHandler)
    }
}
```

### Tratar Rate Limit no Frontend

```typescript
async function apiCall(endpoint: string) {
  try {
    const response = await fetch(endpoint);

    if (response.status === 429) {
      const data = await response.json();
      const retryAfter = data.retry_after || '1s';

      toast.error(`Too many requests. Retry after ${retryAfter}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
```

---

## Monitoring

### Verificar Cache Hit Rate

```bash
# Ver estatísticas do Redis
docker exec supercore-redis redis-cli INFO stats | grep keyspace_hits

# Calcular hit rate
hits=$(docker exec supercore-redis redis-cli INFO stats | grep keyspace_hits | cut -d: -f2)
misses=$(docker exec supercore-redis redis-cli INFO stats | grep keyspace_misses | cut -d: -f2)
rate=$(echo "scale=2; $hits / ($hits + $misses) * 100" | bc)
echo "Cache hit rate: ${rate}%"
```

### Ver Queries Lentas

```sql
-- Top 10 queries mais lentas
SELECT
  query,
  mean_exec_time,
  calls,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Monitorar Connection Pool

```sql
-- Conexões ativas
SELECT
  count(*) as active_connections,
  max_conn as max_connections
FROM pg_stat_activity,
     (SELECT setting::int as max_conn FROM pg_settings WHERE name = 'max_connections') mc
WHERE datname = 'supercore'
GROUP BY max_connections;
```

---

## Troubleshooting

### Cache não funciona

```bash
# 1. Verificar Redis
docker exec supercore-redis redis-cli ping
# Esperado: PONG

# 2. Ver logs
docker logs supercore-backend | grep -i redis

# 3. Verificar variáveis
docker exec supercore-backend env | grep REDIS
```

### Queries lentas

```bash
# 1. Habilitar log de queries lentas
docker exec supercore-db psql -U supercore -d supercore -c "
ALTER SYSTEM SET log_min_duration_statement = 100;
SELECT pg_reload_conf();
"

# 2. Ver logs
docker logs supercore-db | grep "duration:"
```

### Memory issues no Redis

```bash
# 1. Ver uso de memória
docker exec supercore-redis redis-cli INFO memory

# 2. Ver keys grandes
docker exec supercore-redis redis-cli --bigkeys

# 3. Limpar cache se necessário
docker exec supercore-redis redis-cli FLUSHALL
```

---

## Checklist de Code Review

Ao revisar código relacionado a performance:

- [ ] Cache é usado para leituras frequentes?
- [ ] Cache é invalidado em writes?
- [ ] Paginação implementada em listagens?
- [ ] Queries usam índices disponíveis?
- [ ] Headers X-Cache adicionados?
- [ ] TTL adequado ao tipo de dado?
- [ ] Rate limiting aplicado se necessário?
- [ ] Frontend usa React Query?
- [ ] Cache keys seguem padrão centralizado?
- [ ] Invalidação de cache é automática?

---

## Links Úteis

- [PERFORMANCE_OPTIMIZATIONS.md](./PERFORMANCE_OPTIMIZATIONS.md) - Documentação completa
- [PERFORMANCE_CHECKLIST.md](./PERFORMANCE_CHECKLIST.md) - Checklist de implementação
- [SPRINT_6_SUMMARY.md](./SPRINT_6_SUMMARY.md) - Resumo da sprint
- [scripts/test_performance.sh](./scripts/test_performance.sh) - Testes automatizados

---

**Dúvidas?** Consulte a documentação completa ou abra uma issue.
