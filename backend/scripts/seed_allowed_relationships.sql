-- Seed script to add allowed_relationships to existing object_definitions
-- This demonstrates the relationship validation system

-- Example 1: Pessoa Física with allowed relationships
-- A person can have multiple bank accounts (1:N)
UPDATE object_definitions
SET relationships = jsonb_build_object(
    'allowed_relationships', jsonb_build_array(
        jsonb_build_object(
            'type', 'TEM_CONTA',
            'target_object_definition', 'conta_corrente',
            'cardinality', '1:N',
            'allow_cycles', false,
            'cascade_delete', true,
            'description', 'Uma pessoa pode ter múltiplas contas correntes',
            'is_required', false
        ),
        jsonb_build_object(
            'type', 'TEM_CPF',
            'target_object_definition', 'cpf',
            'cardinality', '1:1',
            'allow_cycles', false,
            'cascade_delete', false,
            'description', 'Cada pessoa tem exatamente um CPF',
            'is_required', true
        ),
        jsonb_build_object(
            'type', 'TEM_ENDERECO',
            'target_object_definition', 'endereco',
            'cardinality', 'N:M',
            'allow_cycles', false,
            'cascade_delete', false,
            'description', 'Uma pessoa pode ter múltiplos endereços',
            'is_required', false
        )
    )
)
WHERE name = 'pessoa_fisica';

-- Example 2: Conta Corrente with allowed relationships
-- A bank account belongs to one person but can have multiple transactions
UPDATE object_definitions
SET relationships = jsonb_build_object(
    'allowed_relationships', jsonb_build_array(
        jsonb_build_object(
            'type', 'PERTENCE_A',
            'target_object_definition', 'pessoa_fisica',
            'cardinality', 'N:1',
            'allow_cycles', false,
            'cascade_delete', false,
            'description', 'Conta pertence a uma pessoa',
            'is_required', true
        ),
        jsonb_build_object(
            'type', 'TEM_TRANSACAO',
            'target_object_definition', 'transacao',
            'cardinality', '1:N',
            'allow_cycles', false,
            'cascade_delete', true,
            'description', 'Conta possui múltiplas transações',
            'is_required', false
        ),
        jsonb_build_object(
            'type', 'TEM_LIMITE',
            'target_object_definition', 'limite_credito',
            'cardinality', '1:1',
            'allow_cycles', false,
            'cascade_delete', false,
            'description', 'Conta pode ter um limite de crédito',
            'is_required', false
        )
    )
)
WHERE name = 'conta_corrente';

-- Example 3: Transaction with allowed relationships
UPDATE object_definitions
SET relationships = jsonb_build_object(
    'allowed_relationships', jsonb_build_array(
        jsonb_build_object(
            'type', 'ORIGEM',
            'target_object_definition', 'conta_corrente',
            'cardinality', 'N:1',
            'allow_cycles', false,
            'cascade_delete', false,
            'description', 'Conta de origem da transação',
            'is_required', true
        ),
        jsonb_build_object(
            'type', 'DESTINO',
            'target_object_definition', 'conta_corrente',
            'cardinality', 'N:1',
            'allow_cycles', false,
            'cascade_delete', false,
            'description', 'Conta de destino da transação',
            'is_required', false
        ),
        jsonb_build_object(
            'type', 'VINCULADA_A_REGRA',
            'target_object_definition', 'regra_validacao',
            'cardinality', 'N:M',
            'allow_cycles', false,
            'cascade_delete', false,
            'description', 'Transação vinculada a regras de validação',
            'is_required', false
        )
    )
)
WHERE name = 'transacao';

-- Example 4: Workflow nodes (allow cycles for workflow loops)
UPDATE object_definitions
SET relationships = jsonb_build_object(
    'allowed_relationships', jsonb_build_array(
        jsonb_build_object(
            'type', 'NEXT_STATE',
            'target_object_definition', 'workflow_state',
            'cardinality', 'N:M',
            'allow_cycles', true,
            'cascade_delete', false,
            'description', 'Próximo estado no workflow (permite ciclos)',
            'is_required', false
        )
    )
)
WHERE name = 'workflow_state';

-- Example 5: Hierarchical structure (organization chart)
UPDATE object_definitions
SET relationships = jsonb_build_object(
    'allowed_relationships', jsonb_build_array(
        jsonb_build_object(
            'type', 'REPORTA_PARA',
            'target_object_definition', 'funcionario',
            'cardinality', 'N:1',
            'allow_cycles', false,
            'cascade_delete', false,
            'description', 'Funcionário reporta para um superior',
            'is_required', false
        ),
        jsonb_build_object(
            'type', 'GERENCIA',
            'target_object_definition', 'funcionario',
            'cardinality', '1:N',
            'allow_cycles', false,
            'cascade_delete', false,
            'description', 'Funcionário gerencia subordinados',
            'is_required', false
        )
    )
)
WHERE name = 'funcionario';

-- Verify the updates
SELECT
    name,
    display_name,
    jsonb_pretty(relationships) as relationships_config
FROM object_definitions
WHERE relationships IS NOT NULL AND relationships != 'null'::jsonb
ORDER BY name;
