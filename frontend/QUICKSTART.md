# Quick Start Guide - SuperCore Frontend

Get the frontend running in 5 minutes!

## Prerequisites

- Node.js 20+ installed
- Docker running (for Keycloak)
- Backend running on port 8080 (optional for initial test)

## Step 1: Install Dependencies

```bash
cd frontend
npm install
```

This installs all dependencies including keycloak-js.

## Step 2: Environment Variables

The `.env.local` file is already created with default values:

```bash
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8081
NEXT_PUBLIC_KEYCLOAK_REALM=supercore-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=supercore-frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

No changes needed if using default setup!

## Step 3: Start Keycloak (if not running)

```bash
cd ..  # Go back to project root
docker-compose up -d keycloak
```

Wait ~30 seconds for Keycloak to start.

## Step 4: Configure Keycloak (First Time Only)

1. **Access Admin Console**: http://localhost:8081
   - Username: `admin`
   - Password: `admin123`

2. **Create Realm**:
   - Click "Create Realm"
   - Name: `supercore-realm`
   - Click "Create"

3. **Create Client**:
   - Clients → Create Client
   - Client ID: `supercore-frontend`
   - Client Type: OpenID Connect
   - Click "Next"
   - Enable "Standard flow"
   - Click "Next"
   - Valid redirect URIs: `http://localhost:3000/*`
   - Web origins: `http://localhost:3000`
   - Click "Save"
   - Go to "Advanced" tab
   - Set "Proof Key for Code Exchange Code Challenge Method" to "S256"
   - Click "Save"

4. **Create Roles**:
   - Realm roles → Create role
   - Create these roles:
     - `admin`
     - `product_manager`
     - `compliance_officer`
     - `viewer`

5. **Create Test User**:
   - Users → Create user
   - Username: `admin@lbpay.com.br`
   - Email: `admin@lbpay.com.br`
   - First name: `Admin`
   - Last name: `SuperCore`
   - Email verified: ON
   - Click "Create"
   - Go to "Credentials" tab
   - Click "Set password"
   - Password: `Admin123!`
   - Temporary: OFF
   - Click "Save"
   - Go to "Role mapping" tab
   - Click "Assign role"
   - Select `admin`
   - Click "Assign"

## Step 5: Start Frontend

```bash
cd frontend
npm run dev
```

Frontend running at: http://localhost:3000

## Step 6: Test Authentication

1. Open http://localhost:3000
2. You'll be redirected to Keycloak login
3. Enter credentials:
   - Username: `admin@lbpay.com.br`
   - Password: `Admin123!`
4. Click "Sign In"
5. You'll be redirected to the dashboard
6. You should see:
   - Welcome message with your name
   - User menu in top-right (click to see profile)
   - Oracle Identity section (will show error if backend not running)
   - Quick stats cards

## Troubleshooting

### "Failed to fetch Oracle identity"

This is normal if the backend isn't running. The frontend works independently for authentication testing. To fix:

```bash
cd ../backend
go run cmd/api/main.go
```

### "Keycloak initialization failed"

1. Check if Keycloak is running: `docker ps | grep keycloak`
2. Check if it's accessible: `curl http://localhost:8081`
3. Restart Keycloak: `docker-compose restart keycloak`

### "Invalid redirect_uri"

Make sure the client has the correct redirect URIs configured in Keycloak:
- Valid redirect URIs: `http://localhost:3000/*`
- Web origins: `http://localhost:3000`

### Page keeps redirecting

Clear browser cookies and local storage:
1. Open DevTools (F12)
2. Application → Storage → Clear site data
3. Refresh page

## What You Should See

### On First Load
- Immediate redirect to Keycloak login page
- Clean login form with SuperCore branding (via Keycloak)

### After Login
- Dashboard with gradient background
- Header with SuperCore logo and user menu
- Welcome message with your name
- Oracle Identity card (shows error if backend offline)
- Three stat cards (will show 0 initially)

### User Menu
- Click avatar in top-right
- Should show:
  - Your name
  - Your email
  - Role badge(s) - should see "admin" badge
  - Profile option
  - Settings option (only for admin role)
  - Logout button

### After Logout
- Redirected back to home page
- Automatically redirected to Keycloak login again (check-sso)

## Next Steps

Now that authentication is working:

1. **Start the Backend**: Get the Go backend running to see Oracle identity
2. **Create More Users**: Add users with different roles to test permissions
3. **Explore the Code**: Check out the components in `/components` and `/lib`
4. **Build Features**: Start adding Object Definition management UI

## Quick Command Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Check dependencies
npm list keycloak-js

# Clear cache and reinstall
rm -rf node_modules package-lock.json && npm install
```

## Default Test Users (Create These)

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| admin@lbpay.com.br | Admin123! | admin | Full access |
| produto@lbpay.com.br | Produto123! | product_manager | Create objects |
| compliance@lbpay.com.br | Compliance123! | compliance_officer | View & approve |
| viewer@lbpay.com.br | Viewer123! | viewer | Read-only |

Create these users following the same process as Step 4 above.

## Testing Different Roles

1. **Logout**: Click user menu → Logout
2. **Login as different user**: Use different email/password
3. **Observe differences**:
   - Viewers won't see Settings in menu
   - Product managers can create but not delete
   - Compliance officers can approve workflows
   - Admins see everything

## Architecture Overview

```
Browser
  ↓
KeycloakProvider (auto-initializes)
  ↓
ProtectedRoute (checks auth + roles)
  ↓
Dashboard (loads user data)
  ↓
API Client (adds Bearer token)
  ↓
Backend API
```

## Success Criteria

✅ Keycloak login page appears
✅ Can login with test user
✅ Redirected to dashboard after login
✅ User menu shows name, email, roles
✅ Can logout successfully
✅ Protected routes redirect to login

---

**You're all set! Time to build Core Banking features! 🚀**

For detailed documentation, see `README.md`
For complete implementation details, see `SETUP_COMPLETE.md`
