#!/bin/bash

# ==============================================================================
# NebulaGraph Spaces and Schemas Initialization Script
# ==============================================================================
# Creates required graph spaces and schemas for SuperCore knowledge graph
#
# Usage:
#   ./init-nebula-spaces.sh
#
# Environment Variables:
#   NEBULA_HOST: NebulaGraph host (default: localhost)
#   NEBULA_PORT: NebulaGraph port (default: 9669)
#   NEBULA_USER: Username (default: root)
#   NEBULA_PASSWORD: Password (default: nebula)
# ==============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
NEBULA_HOST="${NEBULA_HOST:-localhost}"
NEBULA_PORT="${NEBULA_PORT:-9669}"
NEBULA_USER="${NEBULA_USER:-root}"
NEBULA_PASSWORD="${NEBULA_PASSWORD:-nebula}"

# Utility functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
}

# Check if nebula-console is available
check_nebula_console() {
    # Try to find nebula-console in Docker or locally
    if command -v nebula-console &> /dev/null; then
        log_info "nebula-console found locally"
        NEBULA_CONSOLE="nebula-console"
    elif docker ps --filter "name=supercore-nebula-console" --quiet &> /dev/null; then
        log_info "nebula-console found in Docker"
        NEBULA_CONSOLE="docker exec supercore-nebula-console nebula-console"
    else
        log_warn "nebula-console not found. Will try Docker compose version..."
        # Will attempt with docker-compose instead
        return 0
    fi
}

# Wait for NebulaGraph to be available
wait_for_nebula() {
    local max_attempts=30
    local attempt=0

    echo -n "Waiting for NebulaGraph at ${NEBULA_HOST}:${NEBULA_PORT}..."

    while [ $attempt -lt $max_attempts ]; do
        if nc -zv "${NEBULA_HOST}" "${NEBULA_PORT}" >/dev/null 2>&1; then
            echo -e " ${GREEN}OK${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo -e " ${RED}FAILED${NC}"
    log_error "NebulaGraph did not become available within $(($max_attempts * 2)) seconds"
    return 1
}

# Execute NebulaGraph commands via docker-compose
execute_nebula_cmd() {
    local cmd="$1"
    local description="${2:-Executing command}"

    log_info "$description..."

    # Find docker-compose file location (assuming script is in infrastructure/scripts/)
    local docker_compose_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/docker"

    if [ ! -f "${docker_compose_dir}/docker-compose.yml" ]; then
        log_error "docker-compose.yml not found in ${docker_compose_dir}"
        return 1
    fi

    # Execute via docker-compose
    if docker-compose -f "${docker_compose_dir}/docker-compose.yml" exec -T nebula-console \
        nebula-console -addr "${NEBULA_HOST}" -port "${NEBULA_PORT}" \
        -u "${NEBULA_USER}" -p "${NEBULA_PASSWORD}" -e "$cmd" 2>/dev/null; then
        return 0
    else
        log_warn "Command execution via docker-compose failed, attempting direct connection..."
        return 1
    fi
}

# Alternative: Execute via direct connection (if nebula-console is installed)
execute_nebula_direct() {
    local cmd="$1"

    if ! command -v nc &> /dev/null; then
        log_warn "nc (netcat) not found, cannot test connection"
        return 1
    fi

    # Try direct execution if console is available
    if command -v nebula-console &> /dev/null; then
        nebula-console -addr "${NEBULA_HOST}" -port "${NEBULA_PORT}" \
            -u "${NEBULA_USER}" -p "${NEBULA_PASSWORD}" -e "$cmd"
        return $?
    fi

    return 1
}

# Create spaces
create_spaces() {
    log_section "Creating NebulaGraph Spaces"

    # Space 1: Knowledge Graph (for Oracles, Objects, Relations)
    log_info "Creating space: knowledge_graph"
    execute_nebula_cmd "CREATE SPACE IF NOT EXISTS knowledge_graph (
        partition_num = 1,
        replica_factor = 1,
        vid_type = INT64,
        charset = utf8,
        collate = utf8_bin
    );" "Creating knowledge_graph space"

    sleep 2  # Wait for space creation

    # Space 2: Conversation Graph (for message relationships)
    log_info "Creating space: conversation_graph"
    execute_nebula_cmd "CREATE SPACE IF NOT EXISTS conversation_graph (
        partition_num = 1,
        replica_factor = 1,
        vid_type = INT64
    );" "Creating conversation_graph space"

    sleep 2

    # Space 3: Audit Graph (for compliance and tracking)
    log_info "Creating space: audit_graph"
    execute_nebula_cmd "CREATE SPACE IF NOT EXISTS audit_graph (
        partition_num = 1,
        replica_factor = 1,
        vid_type = INT64
    );" "Creating audit_graph space"

    log_info "Spaces created successfully"
}

# Create tags (node types) for knowledge_graph
create_knowledge_graph_tags() {
    log_section "Creating Tags (Node Types) for Knowledge Graph"

    local space="knowledge_graph"

    # Use space
    log_info "Using space: $space"

    # Tag: Oracle
    log_info "Creating tag: Oracle"
    execute_nebula_cmd "USE ${space};
    CREATE TAG IF NOT EXISTS Oracle (
        id STRING,
        name STRING,
        description STRING,
        version STRING,
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        INDEX oracle_idx ON Oracle(id)
    );" "Creating Oracle tag"

    sleep 1

    # Tag: Object Definition
    log_info "Creating tag: ObjectDefinition"
    execute_nebula_cmd "USE ${space};
    CREATE TAG IF NOT EXISTS ObjectDefinition (
        id STRING,
        name STRING,
        description STRING,
        schema_version STRING,
        created_at TIMESTAMP,
        INDEX objdef_idx ON ObjectDefinition(id)
    );" "Creating ObjectDefinition tag"

    sleep 1

    # Tag: Agent
    log_info "Creating tag: Agent"
    execute_nebula_cmd "USE ${space};
    CREATE TAG IF NOT EXISTS Agent (
        id STRING,
        name STRING,
        role STRING,
        capabilities ARRAY,
        created_at TIMESTAMP,
        INDEX agent_idx ON Agent(id)
    );" "Creating Agent tag"

    sleep 1

    # Tag: Workflow
    log_info "Creating tag: Workflow"
    execute_nebula_cmd "USE ${space};
    CREATE TAG IF NOT EXISTS Workflow (
        id STRING,
        name STRING,
        definition STRING,
        status STRING,
        created_at TIMESTAMP,
        INDEX workflow_idx ON Workflow(id)
    );" "Creating Workflow tag"

    log_info "Tags created successfully"
}

# Create edges (relationships) for knowledge_graph
create_knowledge_graph_edges() {
    log_section "Creating Edges (Relationships) for Knowledge Graph"

    local space="knowledge_graph"

    # Edge: oracle_has_objects (Oracle defines Objects)
    log_info "Creating edge: oracle_has_objects"
    execute_nebula_cmd "USE ${space};
    CREATE EDGE IF NOT EXISTS oracle_has_objects (
        created_at TIMESTAMP,
        INDEX oracle_obj_idx ON oracle_has_objects()
    );" "Creating oracle_has_objects edge"

    sleep 1

    # Edge: oracle_has_agents (Oracle requires Agents)
    log_info "Creating edge: oracle_has_agents"
    execute_nebula_cmd "USE ${space};
    CREATE EDGE IF NOT EXISTS oracle_has_agents (
        role STRING,
        INDEX oracle_agent_idx ON oracle_has_agents()
    );" "Creating oracle_has_agents edge"

    sleep 1

    # Edge: agent_executes_workflow (Agent executes Workflow)
    log_info "Creating edge: agent_executes_workflow"
    execute_nebula_cmd "USE ${space};
    CREATE EDGE IF NOT EXISTS agent_executes_workflow (
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        status STRING,
        INDEX agent_flow_idx ON agent_executes_workflow()
    );" "Creating agent_executes_workflow edge"

    sleep 1

    # Edge: object_depends_on (Object dependency relationships)
    log_info "Creating edge: object_depends_on"
    execute_nebula_cmd "USE ${space};
    CREATE EDGE IF NOT EXISTS object_depends_on (
        dependency_type STRING,
        INDEX obj_dep_idx ON object_depends_on()
    );" "Creating object_depends_on edge"

    log_info "Edges created successfully"
}

# Create tags for conversation_graph
create_conversation_graph_tags() {
    log_section "Creating Tags for Conversation Graph"

    local space="conversation_graph"

    log_info "Using space: $space"

    # Tag: Conversation
    execute_nebula_cmd "USE ${space};
    CREATE TAG IF NOT EXISTS Conversation (
        id STRING,
        topic STRING,
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        INDEX conv_idx ON Conversation(id)
    );" "Creating Conversation tag"

    sleep 1

    # Tag: Message
    execute_nebula_cmd "USE ${space};
    CREATE TAG IF NOT EXISTS Message (
        id STRING,
        content STRING,
        sender_type STRING,
        created_at TIMESTAMP,
        INDEX msg_idx ON Message(id)
    );" "Creating Message tag"

    log_info "Conversation tags created successfully"
}

# Create edges for conversation_graph
create_conversation_graph_edges() {
    log_section "Creating Edges for Conversation Graph"

    local space="conversation_graph"

    # Edge: message_in_conversation
    execute_nebula_cmd "USE ${space};
    CREATE EDGE IF NOT EXISTS message_in_conversation (
        sequence INT,
        INDEX msg_conv_idx ON message_in_conversation()
    );" "Creating message_in_conversation edge"

    sleep 1

    # Edge: message_references
    execute_nebula_cmd "USE ${space};
    CREATE EDGE IF NOT EXISTS message_references (
        reference_type STRING,
        INDEX msg_ref_idx ON message_references()
    );" "Creating message_references edge"

    log_info "Conversation edges created successfully"
}

# Create tags for audit_graph
create_audit_graph_tags() {
    log_section "Creating Tags for Audit Graph"

    local space="audit_graph"

    log_info "Using space: $space"

    # Tag: AuditEvent
    execute_nebula_cmd "USE ${space};
    CREATE TAG IF NOT EXISTS AuditEvent (
        id STRING,
        event_type STRING,
        actor_id STRING,
        timestamp TIMESTAMP,
        details STRING,
        INDEX audit_idx ON AuditEvent(id)
    );" "Creating AuditEvent tag"

    log_info "Audit tags created successfully"
}

# Verify spaces were created
verify_spaces() {
    log_section "Verifying Spaces"

    log_info "Listing all spaces..."
    execute_nebula_cmd "SHOW SPACES;" "Listing spaces"

    # Try to show more details if possible
    for space in knowledge_graph conversation_graph audit_graph; do
        log_info "Tags in space: ${space}"
        execute_nebula_cmd "USE ${space}; SHOW TAGS;" "Showing tags in ${space}" || true
    done
}

# Main execution
main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║   SuperCore v2.0 - NebulaGraph Setup                   ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo ""

    log_info "Target: ${NEBULA_HOST}:${NEBULA_PORT}"

    check_nebula_console
    wait_for_nebula

    # Create spaces
    create_spaces

    # Create schemas for each space
    create_knowledge_graph_tags
    create_knowledge_graph_edges

    create_conversation_graph_tags
    create_conversation_graph_edges

    create_audit_graph_tags

    # Verify
    verify_spaces

    echo ""
    log_info "NebulaGraph initialization complete!"
    echo ""
    echo "Next steps:"
    echo "  1. For interactive access, run:"
    echo "     nebula-console -addr ${NEBULA_HOST} -port ${NEBULA_PORT} -u ${NEBULA_USER} -p ${NEBULA_PASSWORD}"
    echo "  2. Check spaces: SHOW SPACES;"
    echo "  3. List tags: USE knowledge_graph; SHOW TAGS;"
    echo ""
}

# Run main function
main "$@"
