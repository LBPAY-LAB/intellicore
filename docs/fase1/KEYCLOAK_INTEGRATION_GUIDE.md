# Keycloak Authentication Integration Guide

**Date**: December 10, 2024
**Status**: Planning
**Priority**: CRITICAL (Sprint 3)

---

## 🎯 Overview

This guide provides the complete implementation strategy for integrating **Keycloak** as the authentication and authorization system for SuperCore.

**Why Keycloak?**
- ✅ Open-source and self-hosted (no vendor lock-in)
- ✅ Full OIDC/OAuth2 compliance
- ✅ Advanced features: SSO, MFA, User Federation (LDAP/AD)
- ✅ Fine-grained authorization with Role-Based Access Control (RBAC)
- ✅ Admin UI for user/role management
- ✅ Active community and enterprise support (Red Hat)

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SuperCore Frontend                       │
│                    (Next.js 14+)                            │
│                                                             │
│  ┌──────────────────────────────────────────────────┐     │
│  │  Keycloak JS Adapter                              │     │
│  │  - Auto-refresh tokens                            │     │
│  │  - Silent SSO check                               │     │
│  │  - Token management                               │     │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ OIDC Flow (Authorization Code + PKCE)
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Keycloak Server                                │
│              (Docker Container)                             │
│                                                             │
│  Realms:                                                    │
│  └─ supercore-realm                                         │
│     ├─ Clients:                                             │
│     │  ├─ supercore-frontend (public, PKCE enabled)        │
│     │  └─ supercore-backend (confidential)                 │
│     ├─ Roles:                                               │
│     │  ├─ admin                                             │
│     │  ├─ product_manager                                   │
│     │  ├─ compliance_officer                                │
│     │  └─ viewer                                            │
│     └─ Users: (managed via Admin UI)                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ JWT Token Validation
                      │
┌─────────────────────▼───────────────────────────────────────┐
│               SuperCore Backend                             │
│               (Go + Gin)                                    │
│                                                             │
│  ┌──────────────────────────────────────────────────┐     │
│  │  Keycloak Middleware                              │     │
│  │  - JWT verification (RS256)                       │     │
│  │  - Extract user info (sub, email, roles)         │     │
│  │  - Inject into Gin context                        │     │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🐳 Docker Setup

### docker-compose.yml (Add Keycloak Service)

```yaml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    container_name: supercore-keycloak
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin123  # Change in production!
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: supercore
      KC_DB_PASSWORD: supercore123
      KC_HOSTNAME: localhost
      KC_HOSTNAME_PORT: 8081
      KC_HTTP_ENABLED: true
      KC_HOSTNAME_STRICT_HTTPS: false
    ports:
      - "8081:8080"
    command:
      - start-dev
    depends_on:
      - postgres
    networks:
      - supercore-network
    volumes:
      - keycloak-data:/opt/keycloak/data

  postgres:
    # Existing postgres service
    environment:
      # Add keycloak database
      POSTGRES_MULTIPLE_DATABASES: supercore,keycloak

volumes:
  keycloak-data:
```

### Initialize Keycloak (First Time)

```bash
# Start Keycloak
docker-compose up -d keycloak

# Wait for Keycloak to be ready (check logs)
docker-compose logs -f keycloak

# Access Admin Console
open http://localhost:8081
# Username: admin
# Password: admin123
```

---

## ⚙️ Keycloak Configuration

### 1. Create Realm: `supercore-realm`

**Via Admin UI**:
1. Login to Admin Console: http://localhost:8081
2. Click "Create Realm"
3. Name: `supercore-realm`
4. Display Name: `SuperCore Banking Platform`
5. Enabled: ✅

### 2. Create Client: `supercore-frontend`

**Settings**:
- **Client ID**: `supercore-frontend`
- **Client Type**: OpenID Connect
- **Access Type**: Public (SPA)
- **Standard Flow Enabled**: ✅
- **Direct Access Grants Enabled**: ❌
- **Valid Redirect URIs**:
  - `http://localhost:3000/*`
  - `https://supercore.lbpay.com.br/*` (production)
- **Valid Post Logout Redirect URIs**: Same as above
- **Web Origins**:
  - `http://localhost:3000`
  - `https://supercore.lbpay.com.br`
- **Proof Key for Code Exchange (PKCE)**: ✅ Required

**Advanced Settings**:
- **Access Token Lifespan**: 5 minutes
- **SSO Session Idle**: 30 minutes
- **SSO Session Max**: 10 hours
- **Client Session Idle**: 30 minutes
- **Client Session Max**: 10 hours

### 3. Create Client: `supercore-backend`

**Settings**:
- **Client ID**: `supercore-backend`
- **Client Type**: OpenID Connect
- **Access Type**: Confidential
- **Service Accounts Enabled**: ✅
- **Authorization Enabled**: ✅

**Get Client Secret**:
1. Go to "Credentials" tab
2. Copy "Client Secret" (save in `.env`)

### 4. Create Roles

**Realm Roles**:
- `admin` - Full access to all features
- `product_manager` - Create/edit Object Definitions
- `compliance_officer` - View all, approve workflows
- `developer` - API access, read-only backoffice
- `viewer` - Read-only access

**Role Descriptions** (set in role configuration):
```
admin:
  - Manage users, roles, and permissions
  - Full CRUD on Object Definitions, Instances, Relationships
  - Access to Oracle management
  - View audit logs

product_manager:
  - Create and edit Object Definitions
  - Create and edit Instances
  - Use Natural Language Assistant
  - No user management

compliance_officer:
  - View all data
  - Approve/reject state transitions
  - Access audit logs
  - Run compliance reports

developer:
  - API access with Bearer token
  - Read-only backoffice access
  - View documentation

viewer:
  - Read-only access to all data
  - Cannot create or modify anything
```

### 5. Create Test Users

**User 1: Admin**
- Username: `admin@lbpay.com.br`
- Email: `admin@lbpay.com.br`
- First Name: `Admin`
- Last Name: `SuperCore`
- Email Verified: ✅
- Roles: `admin`
- Password: `Admin123!` (temporary, force change on first login)

**User 2: Product Manager**
- Username: `produto@lbpay.com.br`
- Email: `produto@lbpay.com.br`
- First Name: `Produto`
- Last Name: `Manager`
- Email Verified: ✅
- Roles: `product_manager`
- Password: `Produto123!`

**User 3: Compliance Officer**
- Username: `compliance@lbpay.com.br`
- Email: `compliance@lbpay.com.br`
- First Name: `Compliance`
- Last Name: `Officer`
- Email Verified: ✅
- Roles: `compliance_officer`
- Password: `Compliance123!`

---

## 🎨 Frontend Integration (Next.js 14+)

### 1. Install Dependencies

```bash
cd frontend
npm install keycloak-js
```

### 2. Environment Variables

**`.env.local`**:
```bash
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8081
NEXT_PUBLIC_KEYCLOAK_REALM=supercore-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=supercore-frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

### 3. Keycloak Context Provider

**`lib/keycloak/KeycloakProvider.tsx`**:
```typescript
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Keycloak from 'keycloak-js';

interface KeycloakContextType {
  keycloak: Keycloak | null;
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  } | null;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  token: string | null;
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);

export function KeycloakProvider({ children }: { children: React.ReactNode }) {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<KeycloakContextType['user']>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const kc = new Keycloak({
      url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM!,
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
    });

    kc.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    })
      .then((auth) => {
        setKeycloak(kc);
        setAuthenticated(auth);

        if (auth && kc.tokenParsed) {
          setUser({
            id: kc.tokenParsed.sub!,
            email: kc.tokenParsed.email || '',
            name: kc.tokenParsed.name || kc.tokenParsed.preferred_username || '',
            roles: kc.tokenParsed.realm_access?.roles || [],
          });
          setToken(kc.token!);
        }

        // Auto-refresh token
        setInterval(() => {
          kc.updateToken(70)
            .then((refreshed) => {
              if (refreshed && kc.token) {
                setToken(kc.token);
                console.log('Token refreshed');
              }
            })
            .catch(() => {
              console.error('Failed to refresh token');
              kc.logout();
            });
        }, 60000); // Check every 60 seconds
      })
      .catch((err) => {
        console.error('Keycloak initialization failed', err);
      });
  }, []);

  const login = () => {
    keycloak?.login();
  };

  const logout = () => {
    keycloak?.logout({
      redirectUri: window.location.origin,
    });
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) || false;
  };

  return (
    <KeycloakContext.Provider
      value={{
        keycloak,
        authenticated,
        user,
        login,
        logout,
        hasRole,
        token,
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
}

export function useKeycloak() {
  const context = useContext(KeycloakContext);
  if (!context) {
    throw new Error('useKeycloak must be used within KeycloakProvider');
  }
  return context;
}
```

### 4. Silent SSO Check HTML

**`public/silent-check-sso.html`**:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Silent SSO Check</title>
</head>
<body>
    <script>
        parent.postMessage(location.href, location.origin);
    </script>
</body>
</html>
```

### 5. Root Layout Integration

**`app/layout.tsx`**:
```typescript
import { KeycloakProvider } from '@/lib/keycloak/KeycloakProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <KeycloakProvider>
          {children}
        </KeycloakProvider>
      </body>
    </html>
  );
}
```

### 6. Protected Route Component

**`components/ProtectedRoute.tsx`**:
```typescript
'use client';

import { useKeycloak } from '@/lib/keycloak/KeycloakProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { authenticated, user, login, hasRole } = useKeycloak();
  const router = useRouter();

  useEffect(() => {
    if (!authenticated) {
      login();
      return;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      router.push('/unauthorized');
    }
  }, [authenticated, requiredRole, user]);

  if (!authenticated || (requiredRole && !hasRole(requiredRole))) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Autenticando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

### 7. User Info Component

**`components/UserMenu.tsx`**:
```typescript
'use client';

import { useKeycloak } from '@/lib/keycloak/KeycloakProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Settings } from 'lucide-react';

export function UserMenu() {
  const { user, logout, hasRole } = useKeycloak();

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {user.roles.map((role) => (
                <span
                  key={role}
                  className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Perfil
        </DropdownMenuItem>
        {hasRole('admin') && (
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 8. API Client with Token

**`lib/api/client.ts`**:
```typescript
import { useKeycloak } from '@/lib/keycloak/KeycloakProvider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export function useApiClient() {
  const { token } = useKeycloak();

  const request = async <T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, Keycloak will handle re-login
        throw new Error('Unauthorized');
      }
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  };

  return {
    get: <T>(endpoint: string) => request<T>(endpoint),
    post: <T>(endpoint: string, data: unknown) =>
      request<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    put: <T>(endpoint: string, data: unknown) =>
      request<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: <T>(endpoint: string) =>
      request<T>(endpoint, {
        method: 'DELETE',
      }),
  };
}
```

---

## 🔐 Backend Integration (Go)

### 1. Install Dependencies

```bash
cd backend
go get github.com/golang-jwt/jwt/v5
go get github.com/Nerzal/gocloak/v13
```

### 2. Environment Variables

**`.env`**:
```bash
KEYCLOAK_URL=http://localhost:8081
KEYCLOAK_REALM=supercore-realm
KEYCLOAK_CLIENT_ID=supercore-backend
KEYCLOAK_CLIENT_SECRET=<your-client-secret>
```

### 3. Keycloak Middleware

**`internal/middleware/keycloak.go`**:
```go
package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/Nerzal/gocloak/v13"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type KeycloakConfig struct {
	URL          string
	Realm        string
	ClientID     string
	ClientSecret string
}

type KeycloakMiddleware struct {
	client *gocloak.GoCloak
	config KeycloakConfig
}

func NewKeycloakMiddleware(config KeycloakConfig) *KeycloakMiddleware {
	return &KeycloakMiddleware{
		client: gocloak.NewClient(config.URL),
		config: config,
	}
}

// AuthMiddleware validates JWT tokens from Keycloak
func (m *KeycloakMiddleware) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		// Introspect token with Keycloak
		ctx := context.Background()
		rptResult, err := m.client.RetrospectToken(
			ctx,
			tokenString,
			m.config.ClientID,
			m.config.ClientSecret,
			m.config.Realm,
		)

		if err != nil || !*rptResult.Active {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Parse token claims
		token, _, err := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to parse token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		// Extract user info
		userID := claims["sub"].(string)
		email := claims["email"].(string)
		name := claims["name"].(string)

		// Extract roles
		realmAccess, ok := claims["realm_access"].(map[string]interface{})
		var roles []string
		if ok {
			rolesInterface, ok := realmAccess["roles"].([]interface{})
			if ok {
				for _, role := range rolesInterface {
					roles = append(roles, role.(string))
				}
			}
		}

		// Set user context
		c.Set("user_id", userID)
		c.Set("user_email", email)
		c.Set("user_name", name)
		c.Set("user_roles", roles)
		c.Set("token", tokenString)

		c.Next()
	}
}

// RequireRole middleware checks if user has required role
func RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		rolesInterface, exists := c.Get("user_roles")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "No roles found"})
			c.Abort()
			return
		}

		roles, ok := rolesInterface.([]string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid roles format"})
			c.Abort()
			return
		}

		hasRole := false
		for _, r := range roles {
			if r == role {
				hasRole = true
				break
			}
		}

		if !hasRole {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Insufficient permissions",
				"required_role": role,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// GetUserID helper to extract user ID from context
func GetUserID(c *gin.Context) (string, error) {
	userID, exists := c.Get("user_id")
	if !exists {
		return "", errors.New("user_id not found in context")
	}
	return userID.(string), nil
}

// GetUserRoles helper to extract user roles from context
func GetUserRoles(c *gin.Context) ([]string, error) {
	roles, exists := c.Get("user_roles")
	if !exists {
		return nil, errors.New("user_roles not found in context")
	}
	return roles.([]string), nil
}
```

### 4. Apply Middleware in Main

**`cmd/api/main.go`**:
```go
package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"supercore/internal/middleware"
	"supercore/internal/handlers"
)

func main() {
	// ... existing setup

	// Keycloak middleware
	keycloakConfig := middleware.KeycloakConfig{
		URL:          os.Getenv("KEYCLOAK_URL"),
		Realm:        os.Getenv("KEYCLOAK_REALM"),
		ClientID:     os.Getenv("KEYCLOAK_CLIENT_ID"),
		ClientSecret: os.Getenv("KEYCLOAK_CLIENT_SECRET"),
	}
	keycloakMW := middleware.NewKeycloakMiddleware(keycloakConfig)

	r := gin.Default()

	// Public routes (no auth)
	public := r.Group("/api/v1")
	{
		public.GET("/health", handlers.HealthCheck)
		public.GET("/oracle/whoami", oracleHandler.WhoAmI) // Oracle can be public
	}

	// Protected routes (requires authentication)
	protected := r.Group("/api/v1")
	protected.Use(keycloakMW.AuthMiddleware())
	{
		// All users (authenticated)
		protected.GET("/oracle/identity", oracleHandler.GetIdentity)
		protected.GET("/instances", instanceHandler.List)
		protected.GET("/instances/:id", instanceHandler.Get)

		// Product Manager only
		productMgr := protected.Group("")
		productMgr.Use(middleware.RequireRole("product_manager"))
		{
			productMgr.POST("/object-definitions", objectDefHandler.Create)
			productMgr.POST("/instances", instanceHandler.Create)
			productMgr.PUT("/instances/:id", instanceHandler.Update)
		}

		// Admin only
		admin := protected.Group("")
		admin.Use(middleware.RequireRole("admin"))
		{
			admin.DELETE("/object-definitions/:id", objectDefHandler.Delete)
			admin.DELETE("/instances/:id", instanceHandler.Delete)
			admin.GET("/audit-log", auditHandler.List)
		}
	}

	log.Fatal(r.Run(":8080"))
}
```

---

## 🧪 Testing the Integration

### 1. Start Services

```bash
# Start all services
docker-compose up -d

# Check Keycloak is running
curl http://localhost:8081/realms/supercore-realm/.well-known/openid-configuration
```

### 2. Test Frontend Login

```bash
cd frontend
npm run dev

# Open browser
open http://localhost:3000

# Should redirect to Keycloak login page
# Login with: produto@lbpay.com.br / Produto123!
```

### 3. Test Backend API

```bash
# Get access token
TOKEN=$(curl -s -X POST \
  http://localhost:8081/realms/supercore-realm/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=produto@lbpay.com.br" \
  -d "password=Produto123!" \
  -d "grant_type=password" \
  -d "client_id=supercore-backend" \
  -d "client_secret=<your-client-secret>" \
  | jq -r '.access_token')

# Test protected endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/oracle/identity

# Should return identity data
```

### 4. Test Role-Based Access

```bash
# Try to create object definition with viewer role (should fail)
curl -X POST \
  -H "Authorization: Bearer $VIEWER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "test"}' \
  http://localhost:8080/api/v1/object-definitions

# Expected: 403 Forbidden
```

---

## 📊 Sprint 3 Deliverables

### Checklist

- [ ] Keycloak running in Docker
- [ ] Realm `supercore-realm` configured
- [ ] Clients created (frontend + backend)
- [ ] Roles defined (admin, product_manager, compliance_officer, viewer)
- [ ] Test users created
- [ ] Frontend KeycloakProvider implemented
- [ ] Protected routes working
- [ ] Backend middleware validating JWT
- [ ] Role-based access control enforced
- [ ] E2E test: Login → Access Protected Page → Logout
- [ ] Documentation updated

---

## 🔒 Production Considerations

### Security Checklist

- [ ] Change default admin password
- [ ] Use HTTPS for Keycloak (Let's Encrypt)
- [ ] Enable HTTPS-only cookies
- [ ] Set secure Keycloak database password
- [ ] Store client secrets in secure vault (not .env)
- [ ] Enable MFA for admin users
- [ ] Configure session timeouts appropriately
- [ ] Enable audit logging in Keycloak
- [ ] Regular security updates (Keycloak + dependencies)
- [ ] Implement rate limiting for token endpoint

### Performance Optimization

- [ ] Enable Keycloak caching
- [ ] Use Redis for distributed sessions (if multiple instances)
- [ ] Tune token lifespans (balance security vs performance)
- [ ] Monitor token introspection latency
- [ ] Consider using offline tokens for long-running jobs

---

## 📚 Additional Resources

- **Keycloak Documentation**: https://www.keycloak.org/documentation
- **Keycloak JS Adapter**: https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter
- **gocloak Library**: https://github.com/Nerzal/gocloak
- **OIDC Spec**: https://openid.net/specs/openid-connect-core-1_0.html

---

**Status**: Ready for implementation in Sprint 3
**Last Updated**: December 10, 2024
