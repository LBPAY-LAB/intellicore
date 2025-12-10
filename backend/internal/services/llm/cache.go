package llm

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"sync"
	"time"
)

// cacheEntry represents a cached response with expiration
type cacheEntry struct {
	response  *ChatResponse
	expiresAt time.Time
}

// responseCache implements a simple in-memory cache for LLM responses
type responseCache struct {
	entries map[string]*cacheEntry
	mu      sync.RWMutex
	ttl     time.Duration
}

// newResponseCache creates a new response cache
func newResponseCache(ttl time.Duration) *responseCache {
	cache := &responseCache{
		entries: make(map[string]*cacheEntry),
		ttl:     ttl,
	}

	// Start cleanup goroutine
	go cache.cleanupLoop()

	return cache
}

// generateKey creates a cache key from messages and options
func (c *responseCache) generateKey(messages []Message, options ChatOptions) string {
	// Create a deterministic representation
	data := struct {
		Messages    []Message
		Temperature float64
		SystemP     string
	}{
		Messages:    messages,
		Temperature: options.Temperature,
		SystemP:     options.SystemPrompt,
	}

	jsonData, _ := json.Marshal(data)
	hash := sha256.Sum256(jsonData)
	return fmt.Sprintf("%x", hash)
}

// Get retrieves a cached response if it exists and hasn't expired
func (c *responseCache) Get(key string) (*ChatResponse, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	entry, exists := c.entries[key]
	if !exists {
		return nil, false
	}

	// Check if expired
	if time.Now().After(entry.expiresAt) {
		return nil, false
	}

	return entry.response, true
}

// Set stores a response in the cache
func (c *responseCache) Set(key string, response *ChatResponse) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.entries[key] = &cacheEntry{
		response:  response,
		expiresAt: time.Now().Add(c.ttl),
	}
}

// Clear removes all entries from the cache
func (c *responseCache) Clear() {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.entries = make(map[string]*cacheEntry)
}

// cleanupLoop periodically removes expired entries
func (c *responseCache) cleanupLoop() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		c.cleanup()
	}
}

// cleanup removes expired entries
func (c *responseCache) cleanup() {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := time.Now()
	for key, entry := range c.entries {
		if now.After(entry.expiresAt) {
			delete(c.entries, key)
		}
	}
}

// Size returns the number of cached entries
func (c *responseCache) Size() int {
	c.mu.RLock()
	defer c.mu.RUnlock()

	return len(c.entries)
}
