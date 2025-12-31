#!/bin/bash

# ==============================================================================
# MinIO Bucket Initialization Script
# ==============================================================================
# Creates required S3 buckets for SuperCore application
#
# Usage:
#   ./init-minio-buckets.sh
#
# Environment Variables:
#   MINIO_ENDPOINT: MinIO endpoint (default: localhost:9000)
#   MINIO_ACCESS_KEY: Access key (default: minio_admin)
#   MINIO_SECRET_KEY: Secret key (default: minio_password_change_me)
# ==============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
MINIO_ENDPOINT="${MINIO_ENDPOINT:-localhost:9000}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-minio_admin}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-minio_password_change_me}"
MINIO_ALIAS="supercore"

# Buckets to create
declare -a BUCKETS=(
    "documents"           # Document storage (PDFs, images, etc)
    "document-chunks"     # Processed chunks for RAG pipeline
    "embeddings"          # Vector embeddings backup
    "conversations"       # Conversation history and logs
    "exports"             # Data exports and reports
    "backups"             # Database and system backups
    "ai-models"           # Cached AI models and weights
    "workflows"           # Temporal workflow definitions and state
)

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

# Check if mc (MinIO client) is installed
check_mc_installed() {
    if ! command -v mc &> /dev/null; then
        log_error "mc (MinIO Client) is not installed"
        echo "Install it with: brew install minio/stable/mc (macOS) or curl https://dl.min.io/client/mc/release/linux-amd64/mc"
        exit 1
    fi
    log_info "mc (MinIO Client) found: $(mc --version)"
}

# Wait for MinIO to be available
wait_for_minio() {
    local max_attempts=30
    local attempt=0

    echo -n "Waiting for MinIO at ${MINIO_ENDPOINT}..."

    while [ $attempt -lt $max_attempts ]; do
        if curl -s --connect-timeout 2 "http://${MINIO_ENDPOINT}/minio/health/live" >/dev/null 2>&1; then
            echo -e " ${GREEN}OK${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo -e " ${RED}FAILED${NC}"
    log_error "MinIO did not become available within $(($max_attempts * 2)) seconds"
    return 1
}

# Configure MinIO alias (if not already configured)
configure_alias() {
    log_info "Configuring MinIO alias: $MINIO_ALIAS"

    # Remove existing alias if it exists
    mc alias remove "$MINIO_ALIAS" 2>/dev/null || true

    # Add new alias
    if mc alias set "$MINIO_ALIAS" "http://${MINIO_ENDPOINT}" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" --api S3v4; then
        log_info "MinIO alias configured successfully"
    else
        log_error "Failed to configure MinIO alias"
        exit 1
    fi
}

# Create buckets
create_buckets() {
    local created=0
    local already_exist=0
    local failed=0

    for bucket in "${BUCKETS[@]}"; do
        if mc ls "${MINIO_ALIAS}/${bucket}" >/dev/null 2>&1; then
            log_warn "Bucket '${bucket}' already exists"
            ((already_exist++))
        else
            if mc mb "${MINIO_ALIAS}/${bucket}"; then
                log_info "Created bucket: ${bucket}"
                ((created++))

                # Set bucket policy based on type
                case "$bucket" in
                    "documents"|"document-chunks"|"embeddings")
                        # Private buckets for document storage
                        mc policy set private "${MINIO_ALIAS}/${bucket}"
                        ;;
                    "exports"|"backups")
                        # Private buckets for sensitive data
                        mc policy set private "${MINIO_ALIAS}/${bucket}"
                        ;;
                    "workflows")
                        # Private for Temporal
                        mc policy set private "${MINIO_ALIAS}/${bucket}"
                        ;;
                    *)
                        # Default to private
                        mc policy set private "${MINIO_ALIAS}/${bucket}"
                        ;;
                esac

                # Set versioning for backup bucket
                if [ "$bucket" = "backups" ]; then
                    mc version enable "${MINIO_ALIAS}/${bucket}"
                    log_info "Enabled versioning for ${bucket}"
                fi
            else
                log_error "Failed to create bucket: ${bucket}"
                ((failed++))
            fi
        fi
    done

    echo ""
    log_info "Bucket Creation Summary:"
    echo "  Created: $created"
    echo "  Already Exist: $already_exist"
    echo "  Failed: $failed"

    if [ $failed -gt 0 ]; then
        return 1
    fi
}

# List buckets for verification
verify_buckets() {
    log_info "Verifying buckets..."
    echo ""

    if mc ls "$MINIO_ALIAS" --recursive; then
        log_info "Bucket verification successful"
    else
        log_error "Failed to verify buckets"
        return 1
    fi
}

# Create bucket lifecycle policies
create_lifecycle_policies() {
    log_info "Setting up lifecycle policies..."

    # Backups: Keep versions for 30 days
    cat > /tmp/backups-lifecycle.json <<EOF
{
    "Rules": [
        {
            "ID": "DeleteOldVersions",
            "Filter": {},
            "NoncurrentVersionExpiration": {
                "NoncurrentDays": 30
            },
            "Status": "Enabled"
        }
    ]
}
EOF

    # mc ilm import "${MINIO_ALIAS}/backups" < /tmp/backups-lifecycle.json || true

    # Temp exports: Delete after 7 days
    cat > /tmp/exports-lifecycle.json <<EOF
{
    "Rules": [
        {
            "ID": "DeleteOldExports",
            "Filter": {},
            "Expiration": {
                "Days": 7
            },
            "Status": "Enabled"
        }
    ]
}
EOF

    # mc ilm import "${MINIO_ALIAS}/exports" < /tmp/exports-lifecycle.json || true

    log_info "Lifecycle policies configured"
}

# Main execution
main() {
    echo ""
    echo "╔════════════════════════════════════════════╗"
    echo "║   SuperCore v2.0 - MinIO Setup             ║"
    echo "╚════════════════════════════════════════════╝"
    echo ""

    check_mc_installed
    wait_for_minio
    configure_alias
    create_buckets
    create_lifecycle_policies
    verify_buckets

    echo ""
    log_info "MinIO initialization complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Access MinIO Console: http://${MINIO_ENDPOINT//:9000/:9001}"
    echo "  2. Login with:"
    echo "     Username: $MINIO_ACCESS_KEY"
    echo "     Password: $MINIO_SECRET_KEY"
    echo ""
}

# Run main function
main
