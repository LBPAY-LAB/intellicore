package llm

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"
)

// Client is the main interface for LLM operations
type Client interface {
	Chat(ctx context.Context, messages []Message, options ChatOptions) (*ChatResponse, error)
	GenerateObjectDefinition(ctx context.Context, req SchemaGenerationRequest) (*ObjectDefinitionGeneration, error)
	RefineSchema(ctx context.Context, req SchemaRefinementRequest) (*ObjectDefinitionGeneration, error)
	GetUsageMetrics(since time.Time) []UsageMetrics
	Close() error
}

// Config holds the configuration for the LLM client
type Config struct {
	Provider       Provider
	APIKey         string
	Model          string
	DefaultTemp    float64
	DefaultMaxToks int
	OracleIdentity string
	EnableMetrics  bool
	EnableCache    bool
	CacheTTL       time.Duration
	RateLimitRPS   int // Requests per second
}

// client is the concrete implementation of the Client interface
type client struct {
	config         Config
	provider       LLMProvider
	prompts        *SystemPrompts
	metrics        []UsageMetrics
	metricsMu      sync.RWMutex
	cache          *responseCache
	rateLimiter    *rateLimiter
}

// NewClient creates a new LLM client
func NewClient(config Config) (Client, error) {
	if config.APIKey == "" {
		return nil, fmt.Errorf("API key is required")
	}

	if config.Model == "" {
		// Set sensible defaults based on provider
		if config.Provider == ProviderClaude {
			config.Model = ModelClaudeSonnet35
		} else if config.Provider == ProviderOpenAI {
			config.Model = ModelGPT4oMini
		}
	}

	if config.DefaultTemp == 0 {
		config.DefaultTemp = 0.7
	}

	if config.DefaultMaxToks == 0 {
		config.DefaultMaxToks = 4096
	}

	if config.CacheTTL == 0 {
		config.CacheTTL = 15 * time.Minute
	}

	if config.RateLimitRPS == 0 {
		config.RateLimitRPS = 5 // Default: 5 requests per second
	}

	// Create provider
	var provider LLMProvider
	var err error

	switch config.Provider {
	case ProviderClaude:
		provider, err = NewClaudeProvider(config.APIKey, config.Model)
	case ProviderOpenAI:
		provider, err = NewOpenAIProvider(config.APIKey, config.Model)
	default:
		return nil, fmt.Errorf("unsupported provider: %s", config.Provider)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to create provider: %w", err)
	}

	c := &client{
		config:      config,
		provider:    provider,
		prompts:     NewSystemPrompts(config.OracleIdentity),
		metrics:     make([]UsageMetrics, 0),
		rateLimiter: newRateLimiter(config.RateLimitRPS),
	}

	if config.EnableCache {
		c.cache = newResponseCache(config.CacheTTL)
	}

	return c, nil
}

// Chat sends messages to the LLM and returns a response
func (c *client) Chat(ctx context.Context, messages []Message, options ChatOptions) (*ChatResponse, error) {
	startTime := time.Now()
	requestID := uuid.New()

	// Apply rate limiting
	if err := c.rateLimiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("rate limit exceeded: %w", err)
	}

	// Check cache if enabled
	if c.config.EnableCache && c.cache != nil {
		cacheKey := c.cache.generateKey(messages, options)
		if cached, found := c.cache.Get(cacheKey); found {
			return cached, nil
		}
	}

	// Set defaults if not provided
	if options.Temperature == 0 {
		options.Temperature = c.config.DefaultTemp
	}
	if options.MaxTokens == 0 {
		options.MaxTokens = c.config.DefaultMaxToks
	}

	// Call provider
	response, err := c.provider.Chat(ctx, messages, options)

	latency := time.Since(startTime).Milliseconds()

	// Record metrics
	if c.config.EnableMetrics {
		metric := UsageMetrics{
			RequestID:    requestID,
			Model:        c.config.Model,
			PromptTokens: response.TokensUsed, // This should be split by provider
			OutputTokens: 0,                    // This should be split by provider
			TotalTokens:  response.TokensUsed,
			CostUSD:      CalculateCost(c.config.Model, response.TokensUsed, 0),
			Latency:      latency,
			Timestamp:    startTime,
			Endpoint:     "chat",
			Success:      err == nil,
		}
		if err != nil {
			metric.ErrorMessage = err.Error()
		}
		c.recordMetric(metric)
	}

	if err != nil {
		return nil, fmt.Errorf("provider chat failed: %w", err)
	}

	// Cache successful response
	if c.config.EnableCache && c.cache != nil && err == nil {
		cacheKey := c.cache.generateKey(messages, options)
		c.cache.Set(cacheKey, response)
	}

	return response, nil
}

// GenerateObjectDefinition generates a complete object definition from a description
func (c *client) GenerateObjectDefinition(ctx context.Context, req SchemaGenerationRequest) (*ObjectDefinitionGeneration, error) {
	// Render the prompt
	promptData := map[string]interface{}{
		"OracleContext":   c.config.OracleIdentity,
		"UserDescription": req.UserDescription,
		"RAGContext":      req.RAGContext,
	}

	systemPrompt, err := RenderPrompt(c.prompts.SchemaGenerationPrompt, promptData)
	if err != nil {
		return nil, fmt.Errorf("failed to render prompt: %w", err)
	}

	// Prepare messages
	messages := []Message{
		{
			Role:    "user",
			Content: req.UserDescription,
		},
	}

	// Chat options for schema generation (higher temperature for creativity)
	options := ChatOptions{
		Temperature:  0.8,
		MaxTokens:    8192, // Allow more tokens for complete schemas
		SystemPrompt: systemPrompt,
	}

	// Get response from LLM
	response, err := c.Chat(ctx, messages, options)
	if err != nil {
		return nil, fmt.Errorf("LLM chat failed: %w", err)
	}

	// Parse the JSON response
	var generation ObjectDefinitionGeneration
	if err := json.Unmarshal([]byte(response.Content), &generation); err != nil {
		return nil, fmt.Errorf("failed to parse LLM response as JSON: %w. Response: %s", err, response.Content)
	}

	// Validate the generated schema
	if err := c.validateGeneratedSchema(&generation); err != nil {
		return nil, fmt.Errorf("generated schema validation failed: %w", err)
	}

	return &generation, nil
}

// RefineSchema refines an existing schema based on user feedback
func (c *client) RefineSchema(ctx context.Context, req SchemaRefinementRequest) (*ObjectDefinitionGeneration, error) {
	// Serialize current schema
	currentSchemaJSON, err := json.Marshal(req.CurrentSchema)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal current schema: %w", err)
	}

	// Render the prompt
	promptData := map[string]interface{}{
		"OracleContext": c.config.OracleIdentity,
		"CurrentSchema": string(currentSchemaJSON),
		"UserFeedback":  req.Feedback,
		"RAGContext":    req.RAGContext,
	}

	systemPrompt, err := RenderPrompt(c.prompts.SchemaRefinementPrompt, promptData)
	if err != nil {
		return nil, fmt.Errorf("failed to render prompt: %w", err)
	}

	// Prepare messages
	messages := []Message{
		{
			Role:    "user",
			Content: fmt.Sprintf("Please refine this schema based on the feedback: %s", req.Feedback),
		},
	}

	// Chat options
	options := ChatOptions{
		Temperature:  0.7,
		MaxTokens:    8192,
		SystemPrompt: systemPrompt,
	}

	// Get response from LLM
	response, err := c.Chat(ctx, messages, options)
	if err != nil {
		return nil, fmt.Errorf("LLM chat failed: %w", err)
	}

	// Parse the JSON response
	var generation ObjectDefinitionGeneration
	if err := json.Unmarshal([]byte(response.Content), &generation); err != nil {
		return nil, fmt.Errorf("failed to parse LLM response as JSON: %w", err)
	}

	// Validate the refined schema
	if err := c.validateGeneratedSchema(&generation); err != nil {
		return nil, fmt.Errorf("refined schema validation failed: %w", err)
	}

	return &generation, nil
}

// GetUsageMetrics returns usage metrics since a given time
func (c *client) GetUsageMetrics(since time.Time) []UsageMetrics {
	c.metricsMu.RLock()
	defer c.metricsMu.RUnlock()

	filtered := make([]UsageMetrics, 0)
	for _, metric := range c.metrics {
		if metric.Timestamp.After(since) {
			filtered = append(filtered, metric)
		}
	}

	return filtered
}

// Close closes the client and releases resources
func (c *client) Close() error {
	if c.cache != nil {
		c.cache.Clear()
	}
	return nil
}

// recordMetric records a usage metric
func (c *client) recordMetric(metric UsageMetrics) {
	c.metricsMu.Lock()
	defer c.metricsMu.Unlock()

	c.metrics = append(c.metrics, metric)

	// Keep only last 1000 metrics to prevent memory bloat
	if len(c.metrics) > 1000 {
		c.metrics = c.metrics[len(c.metrics)-1000:]
	}
}

// validateGeneratedSchema validates a generated schema for completeness
func (c *client) validateGeneratedSchema(gen *ObjectDefinitionGeneration) error {
	if gen.Name == "" {
		return fmt.Errorf("generated schema missing 'name'")
	}
	if gen.DisplayName == "" {
		return fmt.Errorf("generated schema missing 'display_name'")
	}
	if gen.Category == "" {
		return fmt.Errorf("generated schema missing 'category'")
	}

	// Validate category
	validCategories := map[string]bool{
		"BUSINESS_ENTITY": true,
		"RULE":            true,
		"POLICY":          true,
		"INTEGRATION":     true,
		"LOGIC":           true,
	}
	if !validCategories[gen.Category] {
		return fmt.Errorf("invalid category: %s", gen.Category)
	}

	// Validate JSON fields are valid JSON
	if len(gen.Schema) > 0 {
		var schema map[string]interface{}
		if err := json.Unmarshal(gen.Schema, &schema); err != nil {
			return fmt.Errorf("invalid schema JSON: %w", err)
		}
	}

	if len(gen.States) > 0 {
		var states map[string]interface{}
		if err := json.Unmarshal(gen.States, &states); err != nil {
			return fmt.Errorf("invalid states JSON: %w", err)
		}
	}

	return nil
}
