# Relationships Module - Developer Guide

## Overview

The Relationships module provides comprehensive relationship management and graph traversal capabilities for the LBPay intelliCore platform. It enables defining typed relationships between ObjectTypes with cardinality constraints and advanced graph algorithms.

## Quick Start

### 1. Create a Relationship

```graphql
mutation {
  createRelationship(input: {
    source_id: "customer-uuid"
    target_id: "order-uuid"
    relationship_type: HAS_MANY
    cardinality: ONE_TO_MANY
    description: "Customer has many orders"
  }) {
    id
    source { id name }
    target { id name }
  }
}
```

### 2. Query Relationships

```graphql
query {
  relationshipsByObjectType(objectTypeId: "customer-uuid") {
    id
    target { id name }
    relationship_type
    cardinality
  }
}
```

### 3. Graph Traversal

```graphql
query {
  graphDescendants(objectTypeId: "customer-uuid", maxDepth: 5) {
    objectTypeId
    objectType { id name }
    depth
    path
  }
}
```

## Architecture

```
relationships/
├── entities/
│   └── object-relationship.entity.ts    # TypeORM entity with enums
├── dto/
│   ├── create-relationship.input.ts     # Create input with validation
│   ├── update-relationship.input.ts     # Update input
│   ├── pagination.args.ts               # Pagination arguments
│   └── paginated-relationships.response.ts
├── relationships.service.ts             # CRUD operations + validation
├── graph-traversal.service.ts           # BFS, DFS, path finding, cycle detection
├── relationships.resolver.ts            # GraphQL mutations/queries
├── graph-traversal.resolver.ts          # Graph algorithm queries
├── object-type-relationships.resolver.ts # Field resolver
├── relationships.module.ts              # Module configuration
└── *.spec.ts                            # Unit tests
```

## Relationship Types

| Type | Description | Valid Cardinalities |
|------|-------------|---------------------|
| `PARENT_OF` | Parent-child hierarchy | ONE_TO_MANY, MANY_TO_MANY |
| `CHILD_OF` | Inverse of PARENT_OF | ONE_TO_ONE, ONE_TO_MANY |
| `HAS_ONE` | One-to-one ownership | ONE_TO_ONE |
| `HAS_MANY` | One-to-many ownership | ONE_TO_MANY, MANY_TO_MANY |
| `BELONGS_TO` | Ownership reference | ONE_TO_ONE, ONE_TO_MANY |

## Cardinality Types

- `ONE_TO_ONE`: Each source has at most one target
- `ONE_TO_MANY`: Each source can have multiple targets
- `MANY_TO_MANY`: Both sides can have multiple relationships

## Validation Rules

### 1. Self-Referencing Prevention
```typescript
// ❌ INVALID
source_id: "uuid-1"
target_id: "uuid-1"  // Same as source

// ✅ VALID
source_id: "uuid-1"
target_id: "uuid-2"
```

### 2. Duplicate Prevention
```typescript
// ❌ INVALID: Same relationship already exists
{
  source_id: "A",
  target_id: "B",
  relationship_type: "HAS_MANY"
}

// ✅ VALID: Different type allowed
{
  source_id: "A",
  target_id: "B",
  relationship_type: "BELONGS_TO"
}
```

### 3. Type-Cardinality Combinations
```typescript
// ❌ INVALID
HAS_ONE + MANY_TO_MANY  // HAS_ONE only supports ONE_TO_ONE

// ✅ VALID
HAS_ONE + ONE_TO_ONE
HAS_MANY + ONE_TO_MANY
HAS_MANY + MANY_TO_MANY
```

### 4. Cardinality Constraints
```typescript
// For ONE_TO_ONE relationships:
// ❌ Source can only have ONE relationship of this type
// ❌ Target can only be referenced ONCE

// For HAS_ONE relationships:
// ❌ Source can only have ONE target total
```

## Graph Algorithms

### Breadth-First Search (BFS)
**Use case:** Level-order traversal, shortest path
```graphql
query {
  graphBFS(startId: "uuid", maxDepth: 10) {
    objectTypeId
    depth
    path
  }
}
```

### Depth-First Search (DFS)
**Use case:** Deep exploration, cycle detection
```graphql
query {
  graphDFS(startId: "uuid", maxDepth: 10) {
    objectTypeId
    depth
    path
  }
}
```

### Find Ancestors
**Use case:** Find all parents/predecessors
```graphql
query {
  graphAncestors(objectTypeId: "uuid") {
    objectTypeId
    objectType { name }
    depth
  }
}
```

### Find Descendants
**Use case:** Find all children/successors
```graphql
query {
  graphDescendants(objectTypeId: "uuid") {
    objectTypeId
    objectType { name }
    depth
  }
}
```

### Shortest Path
**Use case:** Find minimum hops between two nodes
```graphql
query {
  graphShortestPath(sourceId: "uuid1", targetId: "uuid2") {
    depth
    path
  }
}
```

### Detect Circular References
**Use case:** Validate graph integrity
```graphql
query {
  graphDetectCircularReferences(startId: "uuid") {
    hasCircularReference
    cycle
    cycleLength
  }
}
```

## Service Layer Usage

### Import Services
```typescript
import { RelationshipsService } from './relationships/relationships.service';
import { GraphTraversalService } from './relationships/graph-traversal.service';

@Injectable()
export class MyService {
  constructor(
    private relationshipsService: RelationshipsService,
    private graphTraversalService: GraphTraversalService,
  ) {}
}
```

### Create Relationship Programmatically
```typescript
const relationship = await this.relationshipsService.create({
  source_id: 'uuid-1',
  target_id: 'uuid-2',
  relationship_type: RelationshipType.HAS_MANY,
  cardinality: Cardinality.ONE_TO_MANY,
  description: 'Customer has orders',
});
```

### Graph Traversal Programmatically
```typescript
const descendants = await this.graphTraversalService.findDescendants(
  'customer-uuid',
  10, // maxDepth
);

descendants.forEach(pathInfo => {
  console.log(`${pathInfo.objectType.name} at depth ${pathInfo.depth}`);
  console.log(`Path: ${pathInfo.path.join(' -> ')}`);
});
```

## Testing

### Run Tests
```bash
# All relationship tests
npm test -- relationships

# Specific service
npm test -- relationships.service.spec.ts
npm test -- graph-traversal.service.spec.ts

# With coverage
npm test -- --coverage relationships
```

### Test Structure
```typescript
describe('RelationshipsService', () => {
  let service: RelationshipsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RelationshipsService,
        // ... mock providers
      ],
    }).compile();

    service = module.get<RelationshipsService>(RelationshipsService);
  });

  it('should create relationship', async () => {
    // Test implementation
  });
});
```

## Database Schema

### Table: object_relationships
```sql
CREATE TABLE object_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES object_types(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES object_types(id) ON DELETE CASCADE,
  relationship_type relationship_type_enum NOT NULL,
  cardinality cardinality_enum NOT NULL,
  is_bidirectional BOOLEAN DEFAULT false,
  description TEXT,
  relationship_rules JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);
```

### Indexes
```sql
-- Unique constraint (with soft delete support)
CREATE UNIQUE INDEX idx_unique_relationship
ON object_relationships(source_id, target_id, relationship_type)
WHERE deleted_at IS NULL;

-- Performance indexes
CREATE INDEX idx_relationship_source ON object_relationships(source_id);
CREATE INDEX idx_relationship_target ON object_relationships(target_id);
```

## Authorization

### Required Roles

**Read Operations (Queries):**
- Requires: `admin` OR `viewer` role
- All relationship queries
- All graph traversal queries

**Write Operations (Mutations):**
- Requires: `admin` role ONLY
- createRelationship
- updateRelationship
- deleteRelationship

### Example with Authorization
```typescript
@Roles('admin', 'viewer')  // Can be admin OR viewer
@Query(() => [ObjectRelationshipEntity])
async getRelationships() { }

@Roles('admin')  // Must be admin
@Mutation(() => ObjectRelationshipEntity)
async createRelationship() { }
```

## Performance Considerations

### Query Optimization
- Always use indexed fields in WHERE clauses
- Limit maxDepth in graph queries to prevent excessive recursion
- Use pagination for large result sets

### Best Practices
```typescript
// ✅ GOOD: Limited depth
await graphTraversalService.findDescendants(id, 5);

// ❌ BAD: Excessive depth
await graphTraversalService.findDescendants(id, 1000);

// ✅ GOOD: Paginated results
await relationshipsService.findAll({ first: 20 });

// ❌ BAD: Too many results
await relationshipsService.findAll({ first: 100 });
```

### Caching Opportunities
Consider caching:
- Frequently accessed graph structures
- Circular reference detection results
- Ancestor/descendant lists for stable hierarchies

## Error Handling

### Common Exceptions

```typescript
// NotFoundException
throw new NotFoundException('Relationship with ID "..." not found');

// ConflictException
throw new ConflictException('This relationship already exists');

// BadRequestException
throw new BadRequestException('Self-referencing not allowed');
throw new BadRequestException('Invalid combination: HAS_ONE cannot have MANY_TO_MANY');
```

### Handling in Resolvers
```typescript
try {
  return await this.relationshipsService.create(input);
} catch (error) {
  if (error instanceof ConflictException) {
    // Handle duplicate
  }
  throw error;
}
```

## Migration Guide

### Running Migration
```bash
npm run migration:run
```

### Rollback Migration
```bash
npm run migration:revert
```

### Verify Migration
```sql
-- Check table
SELECT * FROM object_relationships LIMIT 1;

-- Check indexes
\di object_relationships*
```

## Troubleshooting

### Issue: "Self-referencing not allowed"
**Solution:** Ensure source_id ≠ target_id

### Issue: "Invalid combination"
**Solution:** Check valid type-cardinality combinations table

### Issue: "Relationship already exists"
**Solution:** Query existing relationships before creating

### Issue: "Circular reference detected"
**Solution:** Use graphDetectCircularReferences to find cycle

### Issue: Query timeout on graph traversal
**Solution:** Reduce maxDepth parameter

## Future Enhancements

Planned features:
- [ ] Relationship instance management (operational data)
- [ ] Custom validation rules engine
- [ ] Bulk operations with transactions
- [ ] GraphQL subscriptions for real-time updates
- [ ] Neo4j integration for advanced analytics
- [ ] Graph visualization API endpoints

## Related Documentation

- [SPRINT_4_IMPLEMENTATION_REPORT.md](../../../SPRINT_4_IMPLEMENTATION_REPORT.md) - Complete implementation details
- [SPRINT_MASTER_PLAN.md](../../../SPRINT_MASTER_PLAN.md) - Sprint planning
- [TypeORM Documentation](https://typeorm.io/) - ORM reference
- [NestJS GraphQL](https://docs.nestjs.com/graphql/quick-start) - GraphQL integration

## Support

For issues or questions:
1. Check this README
2. Review implementation report
3. Check unit tests for examples
4. Consult Sprint Master Plan

## License

Part of LBPay intelliCore platform - Internal use only
