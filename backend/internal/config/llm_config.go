package config

import (
	"os"
	"strconv"
	"time"

	"github.com/lbpay/supercore/internal/services/llm"
)

// GetLLMConfig creates LLM configuration from environment variables
func GetLLMConfig() llm.Config {
	provider := llm.Provider(os.Getenv("LLM_PROVIDER"))
	if provider == "" {
		provider = llm.ProviderOpenAI // Default
	}

	apiKey := ""
	model := ""

	switch provider {
	case llm.ProviderOpenAI:
		apiKey = os.Getenv("OPENAI_API_KEY")
		model = os.Getenv("OPENAI_MODEL")
		if model == "" {
			model = llm.ModelGPT4oMini
		}
	case llm.ProviderClaude:
		apiKey = os.Getenv("CLAUDE_API_KEY")
		model = os.Getenv("CLAUDE_MODEL")
		if model == "" {
			model = llm.ModelClaudeSonnet35
		}
	}

	enableCache, _ := strconv.ParseBool(os.Getenv("LLM_ENABLE_CACHE"))
	enableMetrics, _ := strconv.ParseBool(os.Getenv("LLM_ENABLE_METRICS"))
	rateLimitRPS, _ := strconv.Atoi(os.Getenv("LLM_RATE_LIMIT_RPS"))
	if rateLimitRPS == 0 {
		rateLimitRPS = 5
	}

	return llm.Config{
		Provider:       provider,
		APIKey:         apiKey,
		Model:          model,
		DefaultTemp:    0.7,
		DefaultMaxToks: 4096,
		OracleIdentity: os.Getenv("ORACLE_IDENTITY"),
		EnableMetrics:  enableMetrics,
		EnableCache:    enableCache,
		CacheTTL:       15 * time.Minute,
		RateLimitRPS:   rateLimitRPS,
	}
}
