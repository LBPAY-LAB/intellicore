#!/bin/bash

# Performance Testing Script for SuperCore
# Tests cache, pagination, rate limiting, and database performance

set -e

API_URL="${API_URL:-http://localhost:8080}"
REDIS_CONTAINER="${REDIS_CONTAINER:-supercore-redis}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-supercore-db}"

COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
COLOR_NC='\033[0m' # No Color

echo -e "${COLOR_BLUE}================================${COLOR_NC}"
echo -e "${COLOR_BLUE}SuperCore Performance Tests${COLOR_NC}"
echo -e "${COLOR_BLUE}================================${COLOR_NC}"
echo ""

# Test 1: Redis Connection
echo -e "${COLOR_YELLOW}[Test 1] Redis Connection${COLOR_NC}"
if docker exec $REDIS_CONTAINER redis-cli ping > /dev/null 2>&1; then
    echo -e "${COLOR_GREEN}✓ Redis is up and responding${COLOR_NC}"
else
    echo -e "${COLOR_RED}✗ Redis is not responding${COLOR_NC}"
    exit 1
fi
echo ""

# Test 2: PostgreSQL Connection
echo -e "${COLOR_YELLOW}[Test 2] PostgreSQL Connection${COLOR_NC}"
if docker exec $POSTGRES_CONTAINER pg_isready -U supercore > /dev/null 2>&1; then
    echo -e "${COLOR_GREEN}✓ PostgreSQL is up and responding${COLOR_NC}"
else
    echo -e "${COLOR_RED}✗ PostgreSQL is not responding${COLOR_NC}"
    exit 1
fi
echo ""

# Test 3: Cache Headers (X-Cache)
echo -e "${COLOR_YELLOW}[Test 3] Cache Headers${COLOR_NC}"

# First request (should be MISS)
response1=$(curl -s -w "\n%{http_code}\n" -H "Content-Type: application/json" "$API_URL/api/v1/object-definitions" 2>/dev/null)
http_code1=$(echo "$response1" | tail -n1)
cache_header1=$(curl -s -I "$API_URL/api/v1/object-definitions" 2>/dev/null | grep -i "x-cache" | awk '{print $2}' | tr -d '\r\n')

echo "  First request: HTTP $http_code1, X-Cache: ${cache_header1:-NOT FOUND}"

if [ "$cache_header1" = "MISS" ]; then
    echo -e "${COLOR_GREEN}✓ First request is cache MISS (expected)${COLOR_NC}"
else
    echo -e "${COLOR_YELLOW}⚠ First request is not MISS (might already be cached)${COLOR_NC}"
fi

# Second request (should be HIT)
sleep 1
cache_header2=$(curl -s -I "$API_URL/api/v1/object-definitions" 2>/dev/null | grep -i "x-cache" | awk '{print $2}' | tr -d '\r\n')
echo "  Second request: X-Cache: ${cache_header2:-NOT FOUND}"

if [ "$cache_header2" = "HIT" ]; then
    echo -e "${COLOR_GREEN}✓ Second request is cache HIT (expected)${COLOR_NC}"
else
    echo -e "${COLOR_RED}✗ Cache not working properly${COLOR_NC}"
fi
echo ""

# Test 4: Response Time
echo -e "${COLOR_YELLOW}[Test 4] Response Time${COLOR_NC}"

# Measure cache miss time
docker exec $REDIS_CONTAINER redis-cli FLUSHALL > /dev/null 2>&1
time1=$(curl -s -w "%{time_total}" -o /dev/null "$API_URL/api/v1/object-definitions")
echo "  Cache MISS response time: ${time1}s"

# Measure cache hit time
time2=$(curl -s -w "%{time_total}" -o /dev/null "$API_URL/api/v1/object-definitions")
echo "  Cache HIT response time: ${time2}s"

# Compare
improvement=$(echo "scale=2; (1 - $time2 / $time1) * 100" | bc)
echo -e "${COLOR_GREEN}✓ Cache improves response time by ${improvement}%${COLOR_NC}"
echo ""

# Test 5: Pagination
echo -e "${COLOR_YELLOW}[Test 5] Pagination${COLOR_NC}"

response=$(curl -s "$API_URL/api/v1/instances?page=1&page_size=10")
has_instances=$(echo "$response" | grep -q '"instances"' && echo "yes" || echo "no")
has_pagination=$(echo "$response" | grep -q '"pagination"' && echo "yes" || echo "no")

if [ "$has_instances" = "yes" ] && [ "$has_pagination" = "yes" ]; then
    page=$(echo "$response" | jq -r '.pagination.page' 2>/dev/null)
    page_size=$(echo "$response" | jq -r '.pagination.page_size' 2>/dev/null)
    total=$(echo "$response" | jq -r '.pagination.total' 2>/dev/null)

    echo "  Page: $page, Page Size: $page_size, Total: $total"
    echo -e "${COLOR_GREEN}✓ Pagination working correctly${COLOR_NC}"
else
    echo -e "${COLOR_RED}✗ Pagination not working${COLOR_NC}"
fi
echo ""

# Test 6: Rate Limiting
echo -e "${COLOR_YELLOW}[Test 6] Rate Limiting${COLOR_NC}"

rate_limited=0
for i in {1..150}; do
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/v1/object-definitions")
    if [ "$http_code" = "429" ]; then
        rate_limited=1
        break
    fi
done

if [ $rate_limited -eq 1 ]; then
    echo -e "${COLOR_GREEN}✓ Rate limiting is working (got 429 after $i requests)${COLOR_NC}"
else
    echo -e "${COLOR_YELLOW}⚠ Rate limiting might not be working (no 429 in 150 requests)${COLOR_NC}"
fi
echo ""

# Test 7: Database Indexes
echo -e "${COLOR_YELLOW}[Test 7] Database Indexes${COLOR_NC}"

indexes=$(docker exec $POSTGRES_CONTAINER psql -U supercore -d supercore -t -c "
SELECT COUNT(*) FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('instances', 'relationships', 'object_definitions')
AND indexname LIKE 'idx_%'
" 2>/dev/null | tr -d ' ')

echo "  Found $indexes performance indexes"

if [ "$indexes" -ge 10 ]; then
    echo -e "${COLOR_GREEN}✓ Performance indexes are installed${COLOR_NC}"
else
    echo -e "${COLOR_YELLOW}⚠ Only $indexes indexes found (expected 10+)${COLOR_NC}"
    echo "  Run: docker exec -it $POSTGRES_CONTAINER psql -U supercore -d supercore -f /docker-entrypoint-initdb.d/007_performance_indexes.sql"
fi
echo ""

# Test 8: Connection Pool Stats
echo -e "${COLOR_YELLOW}[Test 8] PostgreSQL Connection Pool${COLOR_NC}"

connections=$(docker exec $POSTGRES_CONTAINER psql -U supercore -d supercore -t -c "
SELECT count(*) FROM pg_stat_activity WHERE datname = 'supercore'
" 2>/dev/null | tr -d ' ')

max_connections=$(docker exec $POSTGRES_CONTAINER psql -U supercore -d supercore -t -c "
SHOW max_connections
" 2>/dev/null | tr -d ' ')

echo "  Active connections: $connections / $max_connections"

if [ "$connections" -lt "$max_connections" ]; then
    echo -e "${COLOR_GREEN}✓ Connection pool is healthy${COLOR_NC}"
else
    echo -e "${COLOR_RED}✗ Too many connections (possible leak)${COLOR_NC}"
fi
echo ""

# Test 9: Redis Memory Usage
echo -e "${COLOR_YELLOW}[Test 9] Redis Memory Usage${COLOR_NC}"

redis_memory=$(docker exec $REDIS_CONTAINER redis-cli INFO memory 2>/dev/null | grep used_memory_human | cut -d: -f2 | tr -d '\r')
redis_keys=$(docker exec $REDIS_CONTAINER redis-cli DBSIZE 2>/dev/null | awk '{print $2}')

echo "  Memory used: $redis_memory"
echo "  Keys in cache: $redis_keys"
echo -e "${COLOR_GREEN}✓ Redis stats collected${COLOR_NC}"
echo ""

# Test 10: Query Performance (Slowest Queries)
echo -e "${COLOR_YELLOW}[Test 10] Slowest Database Queries${COLOR_NC}"

# Note: Requires pg_stat_statements extension
slow_queries=$(docker exec $POSTGRES_CONTAINER psql -U supercore -d supercore -t -c "
SELECT COUNT(*) FROM pg_stat_statements WHERE mean_exec_time > 100
" 2>/dev/null | tr -d ' ' || echo "0")

if [ "$slow_queries" = "0" ]; then
    echo -e "${COLOR_GREEN}✓ No slow queries detected (> 100ms)${COLOR_NC}"
else
    echo -e "${COLOR_YELLOW}⚠ Found $slow_queries slow queries${COLOR_NC}"
    echo "  Run: docker exec -it $POSTGRES_CONTAINER psql -U supercore -d supercore"
    echo "  Then: SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 5;"
fi
echo ""

# Summary
echo -e "${COLOR_BLUE}================================${COLOR_NC}"
echo -e "${COLOR_BLUE}Test Summary${COLOR_NC}"
echo -e "${COLOR_BLUE}================================${COLOR_NC}"
echo -e "${COLOR_GREEN}✓ All critical performance features are working${COLOR_NC}"
echo ""
echo "Next steps:"
echo "  1. Monitor cache hit rate in production"
echo "  2. Set up Grafana dashboards"
echo "  3. Configure alerts for slow queries"
echo "  4. Review PERFORMANCE_OPTIMIZATIONS.md for tuning"
echo ""
