# SuperCore Deployment Guide

This guide covers deployment strategies for SuperCore in different environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Docker Compose Deployment](#docker-compose-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Database Setup](#database-setup)
- [Security Configuration](#security-configuration)
- [Monitoring Setup](#monitoring-setup)
- [Backup Strategy](#backup-strategy)
- [Scaling Considerations](#scaling-considerations)
- [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Minimum Requirements

**Development Environment:**
- 2 CPU cores
- 4 GB RAM
- 20 GB disk space
- Docker 20.10+
- Docker Compose 2.0+

**Production Environment:**
- 4 CPU cores (8 recommended)
- 16 GB RAM (32 recommended)
- 100 GB SSD (for database and logs)
- PostgreSQL 15+ (managed service recommended)
- Load balancer (AWS ALB, Nginx, etc.)
- SSL/TLS certificates

### Software Requirements

- Docker 20.10+ and Docker Compose 2.0+
- PostgreSQL 15+
- Go 1.23+ (for building from source)
- OpenAI or Claude API key
- (Optional) Kubernetes 1.24+
- (Optional) Redis for caching
- (Optional) Keycloak for authentication

---

## Environment Configuration

### Environment Variables

Create a `.env.production` file:

```bash
# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL=postgres://supercore_user:STRONG_PASSWORD@prod-db.example.com:5432/supercore_prod?sslmode=require

# Connection pool settings
DATABASE_MAX_CONNECTIONS=25
DATABASE_MAX_IDLE_CONNECTIONS=5
DATABASE_CONNECTION_LIFETIME=5m

# ============================================
# APPLICATION CONFIGURATION
# ============================================
PORT=8080
GIN_MODE=release

# Service name and version
SERVICE_NAME=supercore-api
SERVICE_VERSION=1.0.0

# ============================================
# AI/LLM CONFIGURATION
# ============================================
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini

# Alternative: Use Claude
# LLM_PROVIDER=claude
# CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# CLAUDE_MODEL=claude-3-5-sonnet-20241022

# LLM Feature Flags
LLM_ENABLE_CACHE=true
LLM_ENABLE_METRICS=true
LLM_RATE_LIMIT_RPS=5
LLM_CACHE_TTL=3600

# ============================================
# EMBEDDING / RAG CONFIGURATION
# ============================================
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-ada-002

# Alternative: Cohere
# EMBEDDING_PROVIDER=cohere
# COHERE_API_KEY=xxxxxxxxxx
# EMBEDDING_MODEL=embed-multilingual-v3.0

# ============================================
# ORACLE CONFIGURATION
# ============================================
ORACLE_IDENTITY=LBPAY - Instituição de Pagamento licenciada pelo BACEN
ORACLE_CNPJ=12.345.678/0001-90

# ============================================
# SECURITY CONFIGURATION
# ============================================
JWT_SECRET=CHANGE_THIS_TO_A_VERY_STRONG_RANDOM_SECRET_AT_LEAST_32_CHARS
JWT_EXPIRATION=24h

# CORS settings
CORS_ALLOWED_ORIGINS=https://app.lbpay.com.br,https://backoffice.lbpay.com.br
CORS_ALLOW_CREDENTIALS=true

# ============================================
# CACHE CONFIGURATION (Optional)
# ============================================
REDIS_URL=redis://redis.example.com:6379/0
REDIS_PASSWORD=redis_password
CACHE_TTL=3600

# ============================================
# KEYCLOAK CONFIGURATION (Optional)
# ============================================
KEYCLOAK_URL=https://auth.lbpay.com.br
KEYCLOAK_REALM=supercore-realm
KEYCLOAK_CLIENT_ID=supercore-backend
KEYCLOAK_CLIENT_SECRET=xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# ============================================
# MONITORING & LOGGING
# ============================================
LOG_LEVEL=info
LOG_FORMAT=json

# Prometheus metrics
METRICS_ENABLED=true
METRICS_PORT=9090

# Sentry (Error tracking)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ENVIRONMENT=production

# ============================================
# EXTERNAL INTEGRATIONS
# ============================================
# TigerBeetle Ledger
TIGERBEETLE_URL=tcp://tigerbeetle.example.com:3000
TIGERBEETLE_CLUSTER_ID=1

# BACEN SPI (PIX)
BACEN_SPI_URL=https://api.spi.bcb.gov.br/v1
BACEN_ISPB=12345678
BACEN_CERT_PATH=/secrets/bacen-pix.crt
BACEN_KEY_PATH=/secrets/bacen-pix.key

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST=10
```

### Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use environment-specific secrets** (dev, staging, prod)
3. **Rotate secrets regularly** (every 90 days minimum)
4. **Use a secrets manager** (AWS Secrets Manager, HashiCorp Vault)
5. **Enable SSL/TLS** for all database connections
6. **Use strong, randomly-generated passwords** (min 32 characters)

---

## Docker Compose Deployment

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # Backend API
  backend:
    image: supercore/backend:${VERSION:-latest}
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        - GO_VERSION=1.23
    restart: always
    ports:
      - "8080:8080"
      - "9090:9090"  # Metrics
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - PORT=8080
      - GIN_MODE=release
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - LLM_PROVIDER=${LLM_PROVIDER}
      - EMBEDDING_PROVIDER=${EMBEDDING_PROVIDER}
      - JWT_SECRET=${JWT_SECRET}
      - LOG_LEVEL=info
      - LOG_FORMAT=json
      - METRICS_ENABLED=true
      - SENTRY_DSN=${SENTRY_DSN}
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"
    volumes:
      - ./secrets:/secrets:ro
      - backend-tmp:/tmp

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      - POSTGRES_DB=supercore_prod
      - POSTGRES_USER=supercore_user
      - POSTGRES_PASSWORD=${DATABASE_PASSWORD}
      - POSTGRES_INITDB_ARGS=--encoding=UTF-8 --lc-collate=C --lc-ctype=C
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./database/migrations:/docker-entrypoint-initdb.d/migrations:ro
      - ./database/seeds:/docker-entrypoint-initdb.d/seeds:ro
      - ./backups:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U supercore_user -d supercore_prod"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
    command:
      - "postgres"
      - "-c"
      - "max_connections=100"
      - "-c"
      - "shared_buffers=256MB"
      - "-c"
      - "effective_cache_size=1GB"
      - "-c"
      - "maintenance_work_mem=64MB"
      - "-c"
      - "checkpoint_completion_target=0.9"
      - "-c"
      - "wal_buffers=16MB"
      - "-c"
      - "default_statistics_target=100"
      - "-c"
      - "random_page_cost=1.1"
      - "-c"
      - "effective_io_concurrency=200"

  # Redis Cache (Optional)
  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 512mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  # Prometheus (Monitoring)
  prometheus:
    image: prom/prometheus:latest
    restart: always
    ports:
      - "9091:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'

  # Grafana (Dashboards)
  grafana:
    image: grafana/grafana:latest
    restart: always
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_SERVER_ROOT_URL=https://monitoring.lbpay.com.br
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources:ro
    depends_on:
      - prometheus

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
  prometheus-data:
    driver: local
  grafana-data:
    driver: local
  backend-tmp:
    driver: local

networks:
  default:
    name: supercore-prod
    driver: bridge
```

### Deployment Steps

```bash
# 1. Clone repository on production server
git clone <repository-url> /opt/supercore
cd /opt/supercore

# 2. Checkout specific version (tag)
git checkout v1.0.0

# 3. Copy and configure environment
cp .env.example .env.production
nano .env.production  # Edit with production values

# 4. Build images
docker-compose -f docker-compose.prod.yml build --no-cache

# 5. Start services
docker-compose -f docker-compose.prod.yml up -d

# 6. Wait for services to be healthy
docker-compose -f docker-compose.prod.yml ps

# 7. Verify backend health
curl http://localhost:8080/health

# 8. Check logs
docker-compose -f docker-compose.prod.yml logs -f backend

# 9. Test Oracle endpoint
curl http://localhost:8080/api/v1/oracle/whoami
```

### Update Deployment

```bash
# 1. Pull new version
cd /opt/supercore
git fetch --tags
git checkout v1.1.0

# 2. Backup database (see Backup section)
./scripts/backup-database.sh

# 3. Build new images
docker-compose -f docker-compose.prod.yml build --no-cache backend

# 4. Stop old containers (zero-downtime: use scale first)
docker-compose -f docker-compose.prod.yml up -d --scale backend=4 --no-recreate

# 5. Stop old version containers
docker-compose -f docker-compose.prod.yml up -d --scale backend=2

# 6. Verify new version
curl http://localhost:8080/health

# 7. If successful, continue. If not, rollback (see Rollback section)
```

---

## Kubernetes Deployment

### Namespace

```yaml
# k8s/namespace.yml
apiVersion: v1
kind: Namespace
metadata:
  name: supercore-prod
  labels:
    name: supercore-prod
    environment: production
```

### ConfigMap

```yaml
# k8s/configmap.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: supercore-config
  namespace: supercore-prod
data:
  PORT: "8080"
  GIN_MODE: "release"
  LLM_PROVIDER: "openai"
  EMBEDDING_PROVIDER: "openai"
  LOG_LEVEL: "info"
  LOG_FORMAT: "json"
  METRICS_ENABLED: "true"
  METRICS_PORT: "9090"
```

### Secrets

```yaml
# k8s/secrets.yml
apiVersion: v1
kind: Secret
metadata:
  name: supercore-secrets
  namespace: supercore-prod
type: Opaque
stringData:
  database-url: "postgres://user:password@postgres-service:5432/supercore_prod"
  openai-api-key: "sk-proj-xxxxx"
  jwt-secret: "your-super-secret-jwt-key"
  sentry-dsn: "https://xxxxx@sentry.io/xxxxx"
```

Apply secrets securely:
```bash
# Use kubectl create secret from file
kubectl create secret generic supercore-secrets \
  --from-literal=database-url="postgres://..." \
  --from-literal=openai-api-key="sk-..." \
  -n supercore-prod

# Or use sealed-secrets / external-secrets operator
```

### Deployment

```yaml
# k8s/backend-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: supercore-backend
  namespace: supercore-prod
  labels:
    app: supercore-backend
    version: v1.0.0
spec:
  replicas: 3
  selector:
    matchLabels:
      app: supercore-backend
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: supercore-backend
        version: v1.0.0
    spec:
      containers:
      - name: backend
        image: supercore/backend:1.0.0
        imagePullPolicy: Always
        ports:
        - name: http
          containerPort: 8080
          protocol: TCP
        - name: metrics
          containerPort: 9090
          protocol: TCP
        env:
        - name: PORT
          valueFrom:
            configMapKeyRef:
              name: supercore-config
              key: PORT
        - name: GIN_MODE
          valueFrom:
            configMapKeyRef:
              name: supercore-config
              key: GIN_MODE
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: supercore-secrets
              key: database-url
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: supercore-secrets
              key: openai-api-key
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: supercore-secrets
              key: jwt-secret
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "2000m"
            memory: "2Gi"
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 3
      restartPolicy: Always
      terminationGracePeriodSeconds: 30
```

### Service

```yaml
# k8s/backend-service.yml
apiVersion: v1
kind: Service
metadata:
  name: supercore-backend-service
  namespace: supercore-prod
  labels:
    app: supercore-backend
spec:
  type: ClusterIP
  ports:
  - name: http
    port: 80
    targetPort: 8080
    protocol: TCP
  - name: metrics
    port: 9090
    targetPort: 9090
    protocol: TCP
  selector:
    app: supercore-backend
```

### Ingress

```yaml
# k8s/ingress.yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: supercore-ingress
  namespace: supercore-prod
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.lbpay.com.br
    secretName: supercore-tls
  rules:
  - host: api.lbpay.com.br
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: supercore-backend-service
            port:
              number: 80
```

### HorizontalPodAutoscaler

```yaml
# k8s/hpa.yml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: supercore-backend-hpa
  namespace: supercore-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: supercore-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 2
        periodSeconds: 30
      selectPolicy: Max
```

### Apply to Kubernetes

```bash
# 1. Create namespace
kubectl apply -f k8s/namespace.yml

# 2. Create secrets (use secure method)
kubectl apply -f k8s/secrets.yml

# 3. Create configmap
kubectl apply -f k8s/configmap.yml

# 4. Deploy backend
kubectl apply -f k8s/backend-deployment.yml
kubectl apply -f k8s/backend-service.yml

# 5. Create ingress
kubectl apply -f k8s/ingress.yml

# 6. Setup autoscaling
kubectl apply -f k8s/hpa.yml

# 7. Verify deployment
kubectl get pods -n supercore-prod
kubectl get svc -n supercore-prod
kubectl get ingress -n supercore-prod

# 8. Check logs
kubectl logs -f deployment/supercore-backend -n supercore-prod

# 9. Test endpoint
curl https://api.lbpay.com.br/health
curl https://api.lbpay.com.br/api/v1/oracle/whoami
```

---

## Database Setup

### Initial Migration

```bash
# 1. Connect to PostgreSQL
psql -h your-db-host.com -U supercore_user -d supercore_prod

# 2. Run migrations in order
\i database/migrations/001_initial_schema.sql
\i database/seeds/002_validation_rules_seed.sql
\i database/seeds/003_oraculo_seed.sql

# 3. Verify tables
\dt

# 4. Check data
SELECT COUNT(*) FROM object_definitions;
SELECT COUNT(*) FROM validation_rules;
```

### PostgreSQL Production Tuning

```sql
-- Connection settings
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET effective_cache_size = '12GB';
ALTER SYSTEM SET maintenance_work_mem = '1GB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;  -- For SSD
ALTER SYSTEM SET effective_io_concurrency = 200;  -- For SSD
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

-- Reload configuration
SELECT pg_reload_conf();
```

---

## Security Configuration

### SSL/TLS Setup

```bash
# Generate SSL certificates (or use Let's Encrypt)
certbot certonly --standalone -d api.lbpay.com.br

# Copy certificates
cp /etc/letsencrypt/live/api.lbpay.com.br/fullchain.pem ./nginx/ssl/
cp /etc/letsencrypt/live/api.lbpay.com.br/privkey.pem ./nginx/ssl/
```

### Nginx SSL Configuration

```nginx
# nginx/nginx.conf
server {
    listen 80;
    server_name api.lbpay.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.lbpay.com.br;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Monitoring Setup

See [monitoring.md](monitoring.md) for complete setup.

Quick verification:
```bash
# Check Prometheus targets
curl http://localhost:9091/api/v1/targets

# Access Grafana
open http://localhost:3001
```

---

## Backup Strategy

### Automated Database Backups

```bash
#!/bin/bash
# scripts/backup-database.sh

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/supercore_backup_$TIMESTAMP.sql.gz"

# Create backup
pg_dump -h postgres -U supercore_user supercore_prod | gzip > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://lbpay-backups/supercore/

# Keep only last 30 days locally
find $BACKUP_DIR -name "supercore_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

Schedule with cron:
```cron
0 2 * * * /opt/supercore/scripts/backup-database.sh
```

---

## Scaling Considerations

### Horizontal Scaling

- Backend is stateless, scale horizontally
- Use load balancer (AWS ALB, Nginx)
- Database connection pooling
- Redis for session/cache sharing

### Vertical Scaling

- Increase PostgreSQL resources first
- Monitor query performance
- Add indexes as needed

---

## Rollback Procedures

### Docker Compose Rollback

```bash
# 1. Stop current version
docker-compose -f docker-compose.prod.yml down

# 2. Checkout previous version
git checkout v1.0.0

# 3. Restore database (if needed)
gunzip -c /backups/supercore_backup_20241209.sql.gz | psql -h localhost -U supercore_user supercore_prod

# 4. Start previous version
docker-compose -f docker-compose.prod.yml up -d

# 5. Verify
curl http://localhost:8080/health
```

### Kubernetes Rollback

```bash
# Rollback to previous revision
kubectl rollout undo deployment/supercore-backend -n supercore-prod

# Rollback to specific revision
kubectl rollout undo deployment/supercore-backend --to-revision=2 -n supercore-prod

# Check status
kubectl rollout status deployment/supercore-backend -n supercore-prod
```

---

## Health Checks

```bash
# Backend health
curl http://localhost:8080/health

# Oracle consciousness
curl http://localhost:8080/api/v1/oracle/whoami

# Database connectivity
docker-compose exec postgres pg_isready -U supercore_user

# Check all services
docker-compose ps
```

---

## Troubleshooting

See [troubleshooting.md](troubleshooting.md) for detailed troubleshooting guide.

---

**Last Updated**: 2024-12-10
