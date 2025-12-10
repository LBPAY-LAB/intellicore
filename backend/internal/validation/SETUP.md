# Setup Instructions for Validation Package

## Required Dependencies

This package requires the `goja` JavaScript VM for the FunctionRuleExecutor.

### Installation

Run the following command from the `backend` directory:

```bash
cd backend
go get github.com/dop251/goja@latest
go mod tidy
```

This will add the following to your `go.mod`:

```
require (
    github.com/dop251/goja v0.0.0-20231027120936-b396bb4c349d
)
```

### Verification

After running `go get`, verify the package is available:

```bash
go list -m github.com/dop251/goja
```

You should see output like:
```
github.com/dop251/goja v0.0.0-20231027120936-b396bb4c349d
```

### Alternative: Manual go.mod Edit

If `go get` doesn't work, manually add to `backend/go.mod`:

```
require (
    // ... existing dependencies ...
    github.com/dop251/goja v0.0.0-20231027120936-b396bb4c349d
)
```

Then run:
```bash
go mod tidy
go mod download
```

## Complete Dependency List

The validation package requires:

```
github.com/dop251/goja          # JavaScript VM (NEW)
github.com/google/uuid          # UUID handling (already present)
github.com/jackc/pgx/v5         # PostgreSQL driver (already present)
encoding/json                   # Standard library
context                         # Standard library
regexp                          # Standard library
net/http                        # Standard library
```

## Build and Test

After installing dependencies:

```bash
# Build
cd backend
go build ./...

# Test validation package
cd internal/validation
go test -v

# Test with coverage
go test -v -cover
```

## Troubleshooting

### Error: "could not import github.com/dop251/goja"

**Solution:**
```bash
cd backend
rm go.sum
go mod tidy
go get github.com/dop251/goja@latest
```

### Error: "module not found"

**Solution:**
```bash
# Clear cache and re-download
go clean -modcache
go mod download
```

### Error: "build constraints exclude all Go files"

**Solution:** Ensure you're in the `backend` directory and Go version is 1.21+:
```bash
go version  # Should be 1.21+
cd backend
go build ./...
```

## IDE Setup

### VSCode

If using VSCode, reload the Go extension after installing dependencies:

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Go: Install/Update Tools"
3. Select all tools and install

### GoLand

GoLand should automatically detect the new dependency. If not:

1. Right-click on `go.mod`
2. Select "Sync Dependencies"

## Verification Script

Create a simple test to verify everything works:

```go
package main

import (
    "fmt"
    "github.com/dop251/goja"
)

func main() {
    vm := goja.New()
    v, err := vm.RunString("2 + 2")
    if err != nil {
        panic(err)
    }
    fmt.Println(v.Export()) // Should print: 4
}
```

Save as `backend/test_goja.go` and run:
```bash
cd backend
go run test_goja.go
```

## Next Steps

After successful setup:

1. Review `README.md` for API documentation
2. Review `EXAMPLES.md` for usage examples
3. Run tests: `go test ./internal/validation/... -v`
4. Integrate with InstanceHandler (see README.md)

## Support

If you encounter issues:

1. Check Go version: `go version` (must be 1.21+)
2. Check module proxy: `echo $GOPROXY`
3. Try with direct download: `GOPROXY=direct go get github.com/dop251/goja`
4. Contact the development team

## Alternative: Vendor Dependencies

If network issues persist, vendor the dependencies:

```bash
cd backend
go mod vendor
```

This creates a `vendor/` directory with all dependencies.

Then build with:
```bash
go build -mod=vendor ./...
```
