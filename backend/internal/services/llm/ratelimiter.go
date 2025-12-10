package llm

import (
	"context"
	"time"

	"golang.org/x/time/rate"
)

// rateLimiter implements rate limiting for API calls
type rateLimiter struct {
	limiter *rate.Limiter
}

// newRateLimiter creates a new rate limiter
func newRateLimiter(requestsPerSecond int) *rateLimiter {
	// Allow burst of 2x the rate
	limiter := rate.NewLimiter(rate.Limit(requestsPerSecond), requestsPerSecond*2)

	return &rateLimiter{
		limiter: limiter,
	}
}

// Wait blocks until the rate limiter allows the request
func (r *rateLimiter) Wait(ctx context.Context) error {
	return r.limiter.Wait(ctx)
}

// Allow checks if a request can proceed without blocking
func (r *rateLimiter) Allow() bool {
	return r.limiter.Allow()
}
