package metrics

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	// HTTP Metrics
	httpRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "endpoint", "status"},
	)

	httpRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "HTTP request latencies in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "endpoint"},
	)

	httpRequestsInFlight = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "http_requests_in_flight",
			Help: "Current number of HTTP requests being processed",
		},
	)

	// Database Metrics
	dbQueriesTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "db_queries_total",
			Help: "Total number of database queries",
		},
		[]string{"table", "operation"},
	)

	dbQueryDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "db_query_duration_seconds",
			Help:    "Database query duration in seconds",
			Buckets: []float64{.001, .005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10},
		},
		[]string{"table", "operation"},
	)

	dbConnectionsTotal = promauto.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "db_connections_total",
			Help: "Total number of database connections",
		},
		[]string{"state"}, // idle, in_use, max_open
	)

	// Business Metrics
	objectDefinitionsTotal = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "object_definitions_total",
			Help: "Total number of object definitions",
		},
	)

	instancesTotal = promauto.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "instances_total",
			Help: "Total number of instances by object type",
		},
		[]string{"object_type", "state"},
	)

	relationshipsTotal = promauto.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "relationships_total",
			Help: "Total number of relationships by type",
		},
		[]string{"relationship_type"},
	)

	// Cache Metrics
	cacheHitsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "cache_hits_total",
			Help: "Total number of cache hits",
		},
		[]string{"cache_key_prefix"},
	)

	cacheMissesTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "cache_misses_total",
			Help: "Total number of cache misses",
		},
		[]string{"cache_key_prefix"},
	)

	cacheOperationDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "cache_operation_duration_seconds",
			Help:    "Cache operation duration in seconds",
			Buckets: []float64{.001, .005, .01, .025, .05, .1},
		},
		[]string{"operation"}, // get, set, delete
	)

	// RAG Metrics
	ragQueriesTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "rag_queries_total",
			Help: "Total number of RAG queries",
		},
		[]string{"layer", "status"}, // sql/graph/vector, success/error
	)

	ragQueryDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "rag_query_duration_seconds",
			Help:    "RAG query duration in seconds",
			Buckets: []float64{.1, .25, .5, 1, 2.5, 5, 10, 30, 60},
		},
		[]string{"layer"},
	)

	ragTokensUsed = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "rag_tokens_used_total",
			Help: "Total number of tokens used in RAG queries",
		},
		[]string{"provider"}, // openai, claude
	)

	// LLM Metrics
	llmRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "llm_requests_total",
			Help: "Total number of LLM API requests",
		},
		[]string{"provider", "model", "status"},
	)

	llmRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "llm_request_duration_seconds",
			Help:    "LLM API request duration in seconds",
			Buckets: []float64{.5, 1, 2, 5, 10, 20, 30, 60},
		},
		[]string{"provider", "model"},
	)

	llmTokensUsedTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "llm_tokens_used_total",
			Help: "Total number of tokens used",
		},
		[]string{"provider", "model", "type"}, // prompt, completion
	)

	// Validation Metrics
	validationTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "validation_total",
			Help: "Total number of validations performed",
		},
		[]string{"type", "result"}, // schema/rule/custom, success/failure
	)

	validationDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "validation_duration_seconds",
			Help:    "Validation duration in seconds",
			Buckets: []float64{.001, .005, .01, .025, .05, .1, .25},
		},
		[]string{"type"},
	)

	// State Machine Metrics
	stateTransitionsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "state_transitions_total",
			Help: "Total number of state transitions",
		},
		[]string{"object_type", "from_state", "to_state", "result"},
	)

	// Error Metrics
	errorsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "errors_total",
			Help: "Total number of errors",
		},
		[]string{"type", "component"},
	)
)

// PrometheusMiddleware instruments HTTP requests
func PrometheusMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		httpRequestsInFlight.Inc()

		// Process request
		c.Next()

		// Record metrics
		duration := time.Since(start).Seconds()
		status := fmt.Sprintf("%d", c.Writer.Status())
		method := c.Request.Method
		endpoint := c.FullPath()

		// If endpoint is empty (404), use a generic path
		if endpoint == "" {
			endpoint = "unknown"
		}

		httpRequestsTotal.WithLabelValues(method, endpoint, status).Inc()
		httpRequestDuration.WithLabelValues(method, endpoint).Observe(duration)
		httpRequestsInFlight.Dec()
	}
}

// RecordDBQuery records database query metrics
func RecordDBQuery(table, operation string, duration time.Duration) {
	dbQueriesTotal.WithLabelValues(table, operation).Inc()
	dbQueryDuration.WithLabelValues(table, operation).Observe(duration.Seconds())
}

// RecordDBConnections records database connection pool metrics
func RecordDBConnections(idle, inUse, maxOpen int) {
	dbConnectionsTotal.WithLabelValues("idle").Set(float64(idle))
	dbConnectionsTotal.WithLabelValues("in_use").Set(float64(inUse))
	dbConnectionsTotal.WithLabelValues("max_open").Set(float64(maxOpen))
}

// RecordCacheHit records cache hit
func RecordCacheHit(keyPrefix string) {
	cacheHitsTotal.WithLabelValues(keyPrefix).Inc()
}

// RecordCacheMiss records cache miss
func RecordCacheMiss(keyPrefix string) {
	cacheMissesTotal.WithLabelValues(keyPrefix).Inc()
}

// RecordCacheOperation records cache operation duration
func RecordCacheOperation(operation string, duration time.Duration) {
	cacheOperationDuration.WithLabelValues(operation).Observe(duration.Seconds())
}

// RecordRAGQuery records RAG query metrics
func RecordRAGQuery(layer, status string, duration time.Duration) {
	ragQueriesTotal.WithLabelValues(layer, status).Inc()
	ragQueryDuration.WithLabelValues(layer).Observe(duration.Seconds())
}

// RecordRAGTokens records tokens used in RAG queries
func RecordRAGTokens(provider string, tokens int) {
	ragTokensUsed.WithLabelValues(provider).Add(float64(tokens))
}

// RecordLLMRequest records LLM API request
func RecordLLMRequest(provider, model, status string, duration time.Duration) {
	llmRequestsTotal.WithLabelValues(provider, model, status).Inc()
	llmRequestDuration.WithLabelValues(provider, model).Observe(duration.Seconds())
}

// RecordLLMTokens records LLM tokens used
func RecordLLMTokens(provider, model, tokenType string, tokens int) {
	llmTokensUsedTotal.WithLabelValues(provider, model, tokenType).Add(float64(tokens))
}

// RecordValidation records validation metrics
func RecordValidation(validationType, result string, duration time.Duration) {
	validationTotal.WithLabelValues(validationType, result).Inc()
	validationDuration.WithLabelValues(validationType).Observe(duration.Seconds())
}

// RecordStateTransition records state machine transition
func RecordStateTransition(objectType, fromState, toState, result string) {
	stateTransitionsTotal.WithLabelValues(objectType, fromState, toState, result).Inc()
}

// RecordError records error occurrence
func RecordError(errorType, component string) {
	errorsTotal.WithLabelValues(errorType, component).Inc()
}

// UpdateBusinessMetrics periodically updates business metrics
func UpdateBusinessMetrics(db *sql.DB) {
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			updateMetrics(db)
		}
	}()
}

func updateMetrics(db *sql.DB) {
	// Count object definitions
	var objDefCount int
	err := db.QueryRow("SELECT COUNT(*) FROM object_definitions WHERE is_active = true").Scan(&objDefCount)
	if err == nil {
		objectDefinitionsTotal.Set(float64(objDefCount))
	}

	// Count instances by object type and state
	rows, err := db.Query(`
		SELECT
			od.name,
			i.current_state,
			COUNT(i.id)
		FROM object_definitions od
		LEFT JOIN instances i ON i.object_definition_id = od.id AND i.is_deleted = false
		WHERE od.is_active = true
		GROUP BY od.name, i.current_state
	`)
	if err == nil {
		defer rows.Close()

		// Reset gauges
		instancesTotal.Reset()

		for rows.Next() {
			var objectType, state sql.NullString
			var count int
			if err := rows.Scan(&objectType, &state, &count); err == nil {
				objType := "unknown"
				if objectType.Valid {
					objType = objectType.String
				}
				st := "unknown"
				if state.Valid {
					st = state.String
				}
				instancesTotal.WithLabelValues(objType, st).Set(float64(count))
			}
		}
	}

	// Count relationships by type
	rows, err = db.Query(`
		SELECT relationship_type, COUNT(*)
		FROM relationships
		GROUP BY relationship_type
	`)
	if err == nil {
		defer rows.Close()

		// Reset gauges
		relationshipsTotal.Reset()

		for rows.Next() {
			var relType string
			var count int
			if err := rows.Scan(&relType, &count); err == nil {
				relationshipsTotal.WithLabelValues(relType).Set(float64(count))
			}
		}
	}

	// Record database connection pool stats
	stats := db.Stats()
	RecordDBConnections(stats.Idle, stats.InUse, stats.MaxOpenConnections)
}

// Handler exposes metrics endpoint for Prometheus
func Handler() gin.HandlerFunc {
	h := promhttp.Handler()
	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}
