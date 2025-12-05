# Sprint 4: Architecture Diagrams

## Entity Relationship Diagram

```mermaid
erDiagram
    OBJECT_TYPES ||--o{ OBJECT_RELATIONSHIPS : "source"
    OBJECT_TYPES ||--o{ OBJECT_RELATIONSHIPS : "target"
    OBJECT_TYPES ||--o{ FIELDS : "has"

    OBJECT_TYPES {
        uuid id PK
        string name UK
        text description
        boolean is_active
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    OBJECT_RELATIONSHIPS {
        uuid id PK
        uuid source_id FK
        uuid target_id FK
        enum relationship_type
        enum cardinality
        boolean is_bidirectional
        text description
        jsonb relationship_rules
        boolean is_active
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    FIELDS {
        uuid id PK
        uuid object_type_id FK
        string name
        enum field_type
        boolean is_required
        jsonb validation_rules
        timestamp created_at
        timestamp updated_at
    }
```

## Module Architecture

```mermaid
graph TB
    subgraph "Relationships Module"
        Entity[ObjectRelationshipEntity]
        RelService[RelationshipsService]
        GraphService[GraphTraversalService]
        RelResolver[RelationshipsResolver]
        GraphResolver[GraphTraversalResolver]
        FieldResolver[ObjectTypeRelationshipsResolver]

        Entity --> RelService
        Entity --> GraphService
        RelService --> RelResolver
        GraphService --> GraphResolver
        RelService --> FieldResolver
    end

    subgraph "ObjectTypes Module"
        ObjEntity[ObjectTypeEntity]
        ObjService[ObjectTypesService]
        ObjResolver[ObjectTypesResolver]
    end

    subgraph "Auth Module"
        JwtGuard[JwtAuthGuard]
        RolesGuard[RolesGuard]
    end

    RelResolver --> JwtGuard
    RelResolver --> RolesGuard
    GraphResolver --> JwtGuard
    GraphResolver --> RolesGuard

    FieldResolver --> ObjEntity
    RelService --> ObjEntity
    Entity -.references.-> ObjEntity
```

## Data Flow: Create Relationship

```mermaid
sequenceDiagram
    participant Client
    participant Resolver as RelationshipsResolver
    participant Service as RelationshipsService
    participant Validator as ValidationLayer
    participant DB as PostgreSQL

    Client->>Resolver: createRelationship(input)
    Resolver->>Resolver: Check JWT + Roles
    Resolver->>Service: create(input)

    Service->>Validator: validateRelationshipInput()
    Validator->>DB: Check source ObjectType exists
    Validator->>DB: Check target ObjectType exists
    Validator-->>Service: Validation passed

    Service->>DB: Check for duplicate
    Service->>Validator: validateCardinalityConstraints()
    Validator->>DB: Query existing relationships
    Validator-->>Service: Constraints satisfied

    Service->>DB: INSERT relationship
    DB-->>Service: Saved relationship

    Service->>DB: findOne with relations
    DB-->>Service: Relationship + source + target

    Service-->>Resolver: ObjectRelationshipEntity
    Resolver-->>Client: Created relationship
```

## Graph Traversal: BFS Algorithm

```mermaid
graph TD
    Start[Start Node A] --> Queue[Add to Queue]
    Queue --> Pop[Pop from Queue]
    Pop --> Visit[Mark as Visited]
    Visit --> Check{Max Depth?}
    Check -->|No| GetEdges[Get Outgoing Edges]
    Check -->|Yes| Skip[Skip Node]
    GetEdges --> Loop[For each edge]
    Loop --> Visited{Already Visited?}
    Visited -->|No| AddQueue[Add to Queue]
    Visited -->|Yes| Skip2[Skip]
    AddQueue --> QueueEmpty{Queue Empty?}
    Skip2 --> QueueEmpty
    Skip --> QueueEmpty
    QueueEmpty -->|No| Pop
    QueueEmpty -->|Yes| Done[Return Results]
```

## Validation Flow

```mermaid
flowchart TD
    Input[Create Relationship Input] --> V1{source_id == target_id?}
    V1 -->|Yes| E1[Error: Self-referencing]
    V1 -->|No| V2{Source exists?}
    V2 -->|No| E2[Error: Source not found]
    V2 -->|Yes| V3{Target exists?}
    V3 -->|No| E3[Error: Target not found]
    V3 -->|Yes| V4{Valid type + cardinality?}
    V4 -->|No| E4[Error: Invalid combination]
    V4 -->|Yes| V5{Duplicate exists?}
    V5 -->|Yes| E5[Error: Duplicate]
    V5 -->|No| V6{ONE_TO_ONE constraint?}
    V6 -->|Violated| E6[Error: Cardinality constraint]
    V6 -->|OK| Success[Create Relationship]

    E1 --> Fail[Throw BadRequestException]
    E2 --> Fail
    E3 --> Fail
    E4 --> Fail
    E5 --> FailConflict[Throw ConflictException]
    E6 --> FailConflict
    Success --> Return[Return Created Entity]
```

## GraphQL Schema Structure

```mermaid
graph LR
    subgraph "Input Types"
        CRI[CreateRelationshipInput]
        URI[UpdateRelationshipInput]
        PA[PaginationArgs]
    end

    subgraph "Object Types"
        ORE[ObjectRelationshipEntity]
        OTE[ObjectTypeEntity]
        PRI[PaginatedRelationshipsResponse]
        PI[PageInfo]
        GPI[GraphPathInfo]
        GCRI[GraphCircularReferenceInfo]
        GS[GraphStructure]
    end

    subgraph "Enums"
        RT[RelationshipType]
        C[Cardinality]
    end

    CRI --> ORE
    URI --> ORE
    PA --> PRI
    ORE --> OTE
    ORE --> RT
    ORE --> C
    PRI --> PI
    GPI --> OTE
```

## Circular Reference Detection Algorithm

```mermaid
graph TD
    Start[Start DFS from Node] --> Push[Add to Recursion Stack]
    Push --> Visit[Mark as Visited]
    Visit --> GetEdges[Get Outgoing Edges]
    GetEdges --> Loop[For each edge]
    Loop --> Check{Target in Stack?}
    Check -->|Yes| Cycle[Cycle Detected!]
    Check -->|No| Visited{Already Visited?}
    Visited -->|Yes| NextEdge[Next Edge]
    Visited -->|No| Recurse[DFS on Target]
    Recurse --> CycleFound{Cycle?}
    CycleFound -->|Yes| Return[Return Cycle]
    CycleFound -->|No| NextEdge
    NextEdge --> MoreEdges{More Edges?}
    MoreEdges -->|Yes| Loop
    MoreEdges -->|No| PopStack[Remove from Stack]
    PopStack --> NoCycle[No Cycle Found]
```

## Service Layer Dependencies

```mermaid
graph TD
    subgraph "RelationshipsService"
        RS[Relationships Service]
        RS --> RR[Repository: ObjectRelationshipEntity]
        RS --> OTR[Repository: ObjectTypeEntity]
        RS --> DS[DataSource for Transactions]
    end

    subgraph "GraphTraversalService"
        GTS[Graph Traversal Service]
        GTS --> RR2[Repository: ObjectRelationshipEntity]
        GTS --> OTR2[Repository: ObjectTypeEntity]
    end

    subgraph "Algorithms"
        BFS[Breadth-First Search]
        DFS[Depth-First Search]
        SP[Shortest Path]
        CD[Cycle Detection]
        ANC[Find Ancestors]
        DESC[Find Descendants]
    end

    GTS --> BFS
    GTS --> DFS
    GTS --> SP
    GTS --> CD
    GTS --> ANC
    GTS --> DESC
```

## Request/Response Flow with Authentication

```mermaid
sequenceDiagram
    participant C as Client
    participant G as GraphQL Layer
    participant JG as JwtAuthGuard
    participant RG as RolesGuard
    participant R as Resolver
    participant S as Service
    participant DB as Database

    C->>G: Request with JWT Token
    G->>JG: Validate JWT
    JG->>JG: Decode token
    JG->>JG: Extract user info
    JG->>RG: User authenticated
    RG->>RG: Check user roles
    RG->>R: User authorized
    R->>S: Call service method
    S->>DB: Execute query
    DB-->>S: Return data
    S->>S: Transform data
    S-->>R: Return result
    R-->>G: GraphQL response
    G-->>C: JSON response
```

## Relationship Type State Machine

```mermaid
stateDiagram-v2
    [*] --> Active: createRelationship
    Active --> Active: updateRelationship
    Active --> Inactive: set is_active=false
    Active --> SoftDeleted: deleteRelationship
    Inactive --> Active: set is_active=true
    Inactive --> SoftDeleted: deleteRelationship
    SoftDeleted --> [*]

    note right of Active
        Validates cardinality
        Prevents duplicates
        Enforces constraints
    end note

    note right of SoftDeleted
        deleted_at timestamp set
        Excluded from queries
        Can be restored
    end note
```

## Index Usage for Query Performance

```mermaid
graph LR
    subgraph "Query Types"
        Q1[Find by source_id]
        Q2[Find by target_id]
        Q3[Find duplicate]
        Q4[Find ONE_TO_ONE]
    end

    subgraph "Indexes"
        I1[idx_relationship_source]
        I2[idx_relationship_target]
        I3[idx_unique_relationship]
    end

    Q1 --> I1
    Q2 --> I2
    Q3 --> I3
    Q4 --> I3

    I1 -.O(log n).-> R1[Fast Lookup]
    I2 -.O(log n).-> R2[Fast Lookup]
    I3 -.O(log n).-> R3[Unique Check]
```

## Test Coverage Map

```mermaid
mindmap
  root((Relationship Tests))
    RelationshipsService
      Create
        Success case
        Self-referencing
        Source not found
        Target not found
        Duplicate
        Invalid combination
      Read
        Find all paginated
        Find one by ID
        Find by ObjectType
        Pagination validation
      Update
        Success case
        Not found
      Delete
        Soft delete
        Not found validation
    GraphTraversalService
      BFS
        Linear graph
        Depth limit
        Validation
      DFS
        Branching graph
        Validation
      Ancestors
        Find all
        Empty result
      Descendants
        Find all
        Empty result
      Shortest Path
        Find path
        Same node
        No path
      Cycle Detection
        Detect cycle
        No cycle
      Graph Structure
        Get structure
        Validation
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Application Layer"
        App[NestJS Application]
        GQL[GraphQL Server]
        Auth[Auth Module]
    end

    subgraph "Business Logic"
        Rel[Relationships Module]
        Obj[ObjectTypes Module]
    end

    subgraph "Data Access"
        TypeORM[TypeORM]
        Repo[Repositories]
    end

    subgraph "Database Layer"
        PG[(PostgreSQL 14+)]
        Idx[Indexes]
        Const[Constraints]
    end

    App --> GQL
    GQL --> Auth
    GQL --> Rel
    GQL --> Obj
    Rel --> TypeORM
    Obj --> TypeORM
    TypeORM --> Repo
    Repo --> PG
    PG --> Idx
    PG --> Const
```

## Performance Characteristics

```mermaid
graph LR
    subgraph "Operation Complexity"
        Create[Create: O log n]
        Read[Read by ID: O log n]
        Update[Update: O log n]
        Delete[Delete: O log n]
        BFS[BFS: O V+E]
        DFS[DFS: O V+E]
        Path[Shortest Path: O V+E]
        Cycle[Cycle Detection: O V+E]
    end

    subgraph "Database Operations"
        IdxLookup[Index Lookup]
        TableScan[Table Scan]
        JoinOp[Join Operation]
    end

    Create --> IdxLookup
    Read --> IdxLookup
    Update --> IdxLookup
    Delete --> IdxLookup
    BFS --> JoinOp
    DFS --> JoinOp
    Path --> JoinOp
    Cycle --> JoinOp
```

---

## Key Takeaways

1. **Clean Architecture:** Clear separation between layers (Entity, DTO, Service, Resolver)
2. **Type Safety:** TypeScript + PostgreSQL enums ensure type safety at all levels
3. **Performance:** Strategic indexing enables O(log n) lookups
4. **Security:** Multi-layer authentication and authorization
5. **Testability:** 100% service coverage with comprehensive test suite
6. **Scalability:** Graph algorithms optimized with depth limits
7. **Maintainability:** Well-documented code with clear patterns

---

**Diagrams Generated:** December 3, 2025
**Tools Used:** Mermaid, Markdown
**Coverage:** Complete architecture visualization
