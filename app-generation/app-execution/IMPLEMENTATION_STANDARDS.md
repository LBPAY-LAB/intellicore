# Implementation Standards - ZERO Mocks, ZERO Placeholders

## 🚫 FORBIDDEN PRACTICES

### ❌ ABSOLUTELY FORBIDDEN - ZERO TOLERANCE

#### 1. NO MOCKS OR STUBS
```javascript
// ❌ FORBIDDEN - Mock implementation
async function getUserData() {
  return { id: 1, name: "Mock User" }; // NEVER!
}

// ✅ REQUIRED - Real implementation
async function getUserData(userId: string) {
  const user = await db.users.findUnique({
    where: { id: userId },
    include: { profile: true, permissions: true }
  });

  if (!user) {
    throw new UserNotFoundException(userId);
  }

  return user;
}
```

#### 2. NO PLACEHOLDER COMMENTS
```python
# ❌ FORBIDDEN
def process_payment(amount: Decimal, user_id: str):
    # TODO: Implement payment processing
    # TODO: Add validation
    # TODO: Handle errors
    pass

# ✅ REQUIRED - Complete implementation
def process_payment(
    amount: Decimal,
    user_id: str,
    payment_method: PaymentMethod,
    idempotency_key: str
) -> PaymentResult:
    """
    Process payment with full validation, error handling, and idempotency.

    Raises:
        ValidationError: Invalid amount or user
        PaymentGatewayError: Payment gateway failure
        InsufficientFundsError: Insufficient balance
    """
    # Validate amount
    if amount <= 0:
        raise ValidationError(f"Invalid amount: {amount}")

    if amount > Decimal("100000.00"):
        raise ValidationError(f"Amount exceeds maximum: {amount}")

    # Check idempotency
    existing = await payment_repo.find_by_idempotency_key(idempotency_key)
    if existing:
        return existing.result

    # Verify user
    user = await user_repo.find_by_id(user_id)
    if not user or not user.is_active:
        raise UserNotFoundException(user_id)

    # Process with payment gateway
    try:
        result = await payment_gateway.charge(
            amount=amount,
            payment_method=payment_method,
            metadata={
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            }
        )

        # Store transaction
        transaction = await payment_repo.create_transaction(
            user_id=user_id,
            amount=amount,
            gateway_transaction_id=result.transaction_id,
            status=TransactionStatus.SUCCESS,
            idempotency_key=idempotency_key
        )

        # Emit event
        await event_bus.publish(PaymentProcessedEvent(
            transaction_id=transaction.id,
            user_id=user_id,
            amount=amount
        ))

        return PaymentResult(
            success=True,
            transaction_id=transaction.id,
            gateway_transaction_id=result.transaction_id
        )

    except PaymentGatewayError as e:
        # Log failure
        await logger.error(f"Payment gateway error: {e}")

        # Store failed transaction
        await payment_repo.create_transaction(
            user_id=user_id,
            amount=amount,
            status=TransactionStatus.FAILED,
            error_message=str(e),
            idempotency_key=idempotency_key
        )

        raise
```

#### 3. NO SIMPLIFIED LOGIC
```go
// ❌ FORBIDDEN - Simplified/incomplete
func AuthenticateUser(username, password string) bool {
    return username == "admin" && password == "admin"
}

// ✅ REQUIRED - Production-grade implementation
func AuthenticateUser(ctx context.Context, username, password string) (*AuthResult, error) {
    // Rate limiting
    if err := rateLimiter.CheckLogin(ctx, username); err != nil {
        return nil, &RateLimitError{Username: username}
    }

    // Fetch user from database
    user, err := userRepo.FindByUsername(ctx, username)
    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            // Log failed attempt (timing attack prevention)
            time.Sleep(randomDelay())
            return nil, &InvalidCredentialsError{}
        }
        return nil, fmt.Errorf("database error: %w", err)
    }

    // Check if account is locked
    if user.IsLocked() {
        return nil, &AccountLockedError{
            Username: username,
            UnlockAt: user.LockedUntil,
        }
    }

    // Verify password with bcrypt
    if err := bcrypt.CompareHashAndPassword(
        []byte(user.PasswordHash),
        []byte(password),
    ); err != nil {
        // Increment failed attempts
        if err := userRepo.IncrementFailedAttempts(ctx, user.ID); err != nil {
            logger.Error("Failed to increment attempts", "error", err)
        }

        // Check if should lock account
        if user.FailedAttempts+1 >= maxFailedAttempts {
            lockDuration := time.Hour * 24
            if err := userRepo.LockAccount(ctx, user.ID, lockDuration); err != nil {
                logger.Error("Failed to lock account", "error", err)
            }

            // Notify user of account lock
            go notifyAccountLocked(user.Email, lockDuration)
        }

        // Timing attack prevention
        time.Sleep(randomDelay())
        return nil, &InvalidCredentialsError{}
    }

    // Reset failed attempts on success
    if err := userRepo.ResetFailedAttempts(ctx, user.ID); err != nil {
        logger.Warn("Failed to reset attempts", "error", err)
    }

    // Generate JWT token
    token, err := jwt.Generate(user.ID, user.Roles, tokenExpiration)
    if err != nil {
        return nil, fmt.Errorf("token generation error: %w", err)
    }

    // Update last login
    if err := userRepo.UpdateLastLogin(ctx, user.ID, time.Now()); err != nil {
        logger.Warn("Failed to update last login", "error", err)
    }

    // Audit log
    auditLogger.LogSuccessfulLogin(user.ID, username, getClientIP(ctx))

    return &AuthResult{
        Token:        token,
        User:         user.ToDTO(),
        ExpiresAt:    time.Now().Add(tokenExpiration),
        RefreshToken: generateRefreshToken(user.ID),
    }, nil
}
```

#### 4. NO FAKE DATA OR HARDCODED VALUES
```typescript
// ❌ FORBIDDEN
const API_KEY = "test-api-key-123";
const users = [
  { id: 1, name: "John" },
  { id: 2, name: "Jane" }
];

// ✅ REQUIRED - Real configuration and data sources
import { config } from './config';
import { UserRepository } from './repositories/user.repository';

const apiKey = config.get('API_KEY'); // From env vars
const userRepo = new UserRepository(db);

async function getUsers(filters: UserFilters): Promise<User[]> {
  return userRepo.findAll({
    where: buildWhereClause(filters),
    orderBy: filters.orderBy || { createdAt: 'desc' },
    skip: filters.offset || 0,
    take: Math.min(filters.limit || 20, 100), // Max 100
  });
}
```

#### 5. NO MISSING ERROR HANDLING
```python
# ❌ FORBIDDEN - No error handling
def delete_user(user_id: str):
    db.users.delete(user_id)
    return {"success": True}

# ✅ REQUIRED - Comprehensive error handling
def delete_user(user_id: str, deleted_by: str) -> DeleteResult:
    """
    Soft delete user with audit trail and cascading effects.

    Args:
        user_id: UUID of user to delete
        deleted_by: UUID of admin performing deletion

    Returns:
        DeleteResult with success status and details

    Raises:
        UserNotFoundException: User doesn't exist
        PermissionDeniedError: Cannot delete system users
        DatabaseError: Database operation failed
    """
    try:
        # Verify user exists
        user = db.users.find_one({"_id": user_id})
        if not user:
            raise UserNotFoundException(f"User {user_id} not found")

        # Check if system user (cannot delete)
        if user.get("is_system_user"):
            raise PermissionDeniedError(
                f"Cannot delete system user {user_id}"
            )

        # Start transaction
        with db.transaction() as tx:
            # Soft delete user
            result = tx.users.update_one(
                {"_id": user_id},
                {
                    "$set": {
                        "deleted_at": datetime.utcnow(),
                        "deleted_by": deleted_by,
                        "status": UserStatus.DELETED
                    }
                }
            )

            if result.modified_count == 0:
                raise DatabaseError("Failed to delete user")

            # Cascade soft delete to related entities
            tx.sessions.update_many(
                {"user_id": user_id},
                {"$set": {"invalidated_at": datetime.utcnow()}}
            )

            tx.api_keys.update_many(
                {"user_id": user_id},
                {"$set": {"revoked_at": datetime.utcnow()}}
            )

            # Create audit log
            tx.audit_logs.insert_one({
                "action": "USER_DELETED",
                "user_id": user_id,
                "performed_by": deleted_by,
                "timestamp": datetime.utcnow(),
                "metadata": {
                    "user_email": user.get("email"),
                    "user_name": user.get("name")
                }
            })

            # Commit transaction
            tx.commit()

        # Publish event (after commit)
        event_bus.publish(UserDeletedEvent(
            user_id=user_id,
            deleted_by=deleted_by,
            timestamp=datetime.utcnow()
        ))

        # Invalidate cache
        cache.delete(f"user:{user_id}")
        cache.delete_pattern(f"user:{user_id}:*")

        logger.info(
            "User deleted successfully",
            extra={
                "user_id": user_id,
                "deleted_by": deleted_by
            }
        )

        return DeleteResult(
            success=True,
            user_id=user_id,
            deleted_at=datetime.utcnow()
        )

    except UserNotFoundException:
        logger.warning(f"Attempted to delete non-existent user {user_id}")
        raise

    except PermissionDeniedError as e:
        logger.warning(str(e))
        raise

    except Exception as e:
        logger.error(
            f"Unexpected error deleting user {user_id}: {e}",
            exc_info=True
        )
        raise DatabaseError(f"Failed to delete user: {str(e)}") from e
```

## ✅ REQUIRED IMPLEMENTATION STANDARDS

### 1. Complete Database Integration

Every function that needs data MUST:
- ✅ Use real database connections
- ✅ Handle connection errors
- ✅ Use transactions where appropriate
- ✅ Include proper indexes
- ✅ Implement connection pooling
- ✅ Handle timeouts

### 2. Comprehensive Error Handling

Every function MUST:
- ✅ Define all possible error cases
- ✅ Use typed exceptions/errors
- ✅ Include error messages with context
- ✅ Log errors appropriately
- ✅ Return proper HTTP status codes
- ✅ Never swallow exceptions silently

### 3. Production-Grade Security

Every endpoint/function MUST:
- ✅ Validate ALL inputs
- ✅ Sanitize ALL outputs
- ✅ Implement authentication
- ✅ Implement authorization
- ✅ Protect against SQL injection
- ✅ Protect against XSS
- ✅ Protect against CSRF
- ✅ Rate limiting
- ✅ Audit logging

### 4. Complete Testing

Every feature MUST include:
- ✅ Unit tests (>80% coverage)
- ✅ Integration tests
- ✅ Edge case tests
- ✅ Error path tests
- ✅ Performance tests
- ✅ Security tests

### 5. Full Documentation

Every module MUST have:
- ✅ API documentation (OpenAPI/Swagger)
- ✅ Function/method docstrings
- ✅ Usage examples
- ✅ Error documentation
- ✅ Architecture diagrams (if complex)

### 6. Observability

Every service MUST include:
- ✅ Structured logging
- ✅ Metrics (Prometheus format)
- ✅ Distributed tracing (OpenTelemetry)
- ✅ Health check endpoints
- ✅ Readiness/liveness probes

## 📋 DEFINITION OF DONE (DoD)

A card is ONLY considered DONE when ALL of these are true:

### ✅ Functional Requirements
- [ ] ALL acceptance criteria met
- [ ] ALL edge cases handled
- [ ] NO mocks or stubs
- [ ] NO placeholder comments
- [ ] NO hardcoded values
- [ ] Real database integration
- [ ] Real API integrations
- [ ] Real authentication/authorization

### ✅ Quality Requirements
- [ ] Code review approved
- [ ] Unit tests >80% coverage
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Security scan clean (no HIGH/CRITICAL)
- [ ] Performance benchmarks met
- [ ] No linter warnings
- [ ] No type errors

### ✅ Documentation Requirements
- [ ] API documentation complete
- [ ] Code comments for complex logic
- [ ] README updated (if needed)
- [ ] Changelog updated
- [ ] ADR created (for architectural decisions)

### ✅ Deployment Requirements
- [ ] Migrations created (if DB changes)
- [ ] Environment variables documented
- [ ] Deployment tested in dev
- [ ] Deployment tested in QA
- [ ] Rollback plan documented

### ✅ Observability Requirements
- [ ] Logging implemented
- [ ] Metrics exported
- [ ] Tracing configured
- [ ] Health checks working
- [ ] Alerts configured (if needed)

## 🚨 QA VALIDATION CHECKLIST

QA Lead MUST verify ZERO tolerance items:

### Critical Checks
```yaml
- name: "No Mock Implementations"
  command: "grep -r 'mock' --include='*.py' --include='*.ts' --include='*.go'"
  expected: "No matches or only test files"
  severity: CRITICAL

- name: "No TODO Comments in Production Code"
  command: "grep -r 'TODO\\|FIXME\\|HACK' src/ --exclude-dir=tests"
  expected: "No matches"
  severity: CRITICAL

- name: "No Hardcoded Credentials"
  command: "trufflehog filesystem src/"
  expected: "No secrets found"
  severity: CRITICAL

- name: "No console.log/print in Production"
  command: "grep -r 'console\\.log\\|print(' src/ --exclude-dir=tests"
  expected: "No matches"
  severity: HIGH

- name: "All Functions Have Error Handling"
  script: "./scripts/verify-error-handling.sh"
  expected: "100% coverage"
  severity: HIGH
```

## 🎯 EXAMPLES BY STACK

### Backend (Go)
```go
// ✅ PRODUCTION-READY EXAMPLE
package handlers

type CreateUserRequest struct {
    Email    string `json:"email" validate:"required,email"`
    Password string `json:"password" validate:"required,min=12"`
    Name     string `json:"name" validate:"required,min=2,max=100"`
}

type CreateUserResponse struct {
    UserID    string    `json:"user_id"`
    Email     string    `json:"email"`
    CreatedAt time.Time `json:"created_at"`
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()

    // Parse and validate request
    var req CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        respondError(w, http.StatusBadRequest, "invalid request body")
        return
    }

    if err := h.validator.Struct(req); err != nil {
        respondError(w, http.StatusBadRequest, fmt.Sprintf("validation error: %v", err))
        return
    }

    // Check if email already exists
    exists, err := h.userRepo.EmailExists(ctx, req.Email)
    if err != nil {
        h.logger.Error("failed to check email existence", "error", err)
        respondError(w, http.StatusInternalServerError, "internal server error")
        return
    }
    if exists {
        respondError(w, http.StatusConflict, "email already registered")
        return
    }

    // Hash password
    hashedPassword, err := bcrypt.GenerateFromPassword(
        []byte(req.Password),
        bcrypt.DefaultCost,
    )
    if err != nil {
        h.logger.Error("failed to hash password", "error", err)
        respondError(w, http.StatusInternalServerError, "internal server error")
        return
    }

    // Create user
    user := &models.User{
        ID:           uuid.New().String(),
        Email:        req.Email,
        PasswordHash: string(hashedPassword),
        Name:         req.Name,
        CreatedAt:    time.Now(),
        Status:       models.UserStatusActive,
    }

    if err := h.userRepo.Create(ctx, user); err != nil {
        h.logger.Error("failed to create user", "error", err)
        respondError(w, http.StatusInternalServerError, "internal server error")
        return
    }

    // Send welcome email (async)
    go func() {
        if err := h.emailService.SendWelcome(user.Email, user.Name); err != nil {
            h.logger.Warn("failed to send welcome email", "error", err)
        }
    }()

    // Publish event
    h.eventBus.Publish(events.UserCreated{
        UserID:    user.ID,
        Email:     user.Email,
        Timestamp: time.Now(),
    })

    // Respond
    respondJSON(w, http.StatusCreated, CreateUserResponse{
        UserID:    user.ID,
        Email:     user.Email,
        CreatedAt: user.CreatedAt,
    })
}
```

### Frontend (React/TypeScript)
```typescript
// ✅ PRODUCTION-READY EXAMPLE
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/toast';

interface CreateUserFormData {
  email: string;
  password: string;
  name: string;
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserFormData) => {
      // Validate on client
      if (!data.email || !data.password || !data.name) {
        throw new Error('All fields are required');
      }

      if (data.password.length < 12) {
        throw new Error('Password must be at least 12 characters');
      }

      // Call real API
      const response = await api.post<CreateUserResponse>(
        '/api/users',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    },

    onSuccess: (data) => {
      // Invalidate users list cache
      queryClient.invalidateQueries({ queryKey: ['users'] });

      // Show success message
      toast.success('User created successfully', {
        description: `${data.email} has been registered`,
      });

      // Track analytics
      analytics.track('user_created', {
        user_id: data.user_id,
        timestamp: new Date().toISOString(),
      });
    },

    onError: (error: Error) => {
      // Handle different error types
      if (error.message.includes('email already registered')) {
        toast.error('Email already in use', {
          description: 'Please use a different email address',
        });
      } else if (error.message.includes('validation error')) {
        toast.error('Invalid input', {
          description: error.message,
        });
      } else {
        toast.error('Failed to create user', {
          description: 'Please try again later',
        });

        // Log to error tracking
        logger.error('User creation failed', {
          error: error.message,
          stack: error.stack,
        });
      }
    },

    retry: (failureCount, error) => {
      // Don't retry validation errors
      if (error.message.includes('validation error')) {
        return false;
      }
      // Retry network errors up to 3 times
      return failureCount < 3;
    },
  });
}
```

## 🔒 ENFORCEMENT

### Agent Instructions
All agents MUST include this in their system prompt:

```
CRITICAL CONSTRAINTS - ZERO TOLERANCE:

1. NEVER use mock data, fake implementations, or placeholders
2. NEVER leave TODO/FIXME comments in production code
3. NEVER use hardcoded credentials or configuration
4. NEVER skip error handling
5. NEVER skip input validation
6. NEVER skip tests

Every implementation MUST be:
- Production-ready
- Fully functional
- Completely tested
- Properly documented
- Security-hardened
- Observable (logs, metrics, traces)

If you cannot implement something completely:
- ESCALATE to Tech Lead immediately
- DO NOT submit incomplete work
- DO NOT use temporary workarounds
```

### QA Validation
QA MUST reject cards that:
- ❌ Contain any mock implementations
- ❌ Have TODO/FIXME in production code
- ❌ Missing error handling
- ❌ Hardcoded values
- ❌ Test coverage <80%
- ❌ Security vulnerabilities
- ❌ Missing documentation

### Tech Lead Review
Tech Lead MUST verify:
- ✅ Architecture follows specifications
- ✅ No shortcuts or simplifications
- ✅ Production-grade quality
- ✅ Complete implementation
- ✅ Proper error handling
- ✅ Security best practices

---

**Zero Tolerance Policy**: Any violation results in immediate card rejection and re-implementation. No exceptions.

**Last Updated**: 2024-12-21
**Version**: 1.0.0
**Status**: MANDATORY FOR ALL SQUADS
