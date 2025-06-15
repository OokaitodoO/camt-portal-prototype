# Laravel Spin Automatic Cache Clearing

This directory contains entrypoint scripts that automatically run when the Laravel Spin containers start up.

## Scripts

### `98-dev-cache-clear.sh`
- **Purpose**: Comprehensive cache clearing for development environments
- **When it runs**: Only when `APP_ENV` is `local`, `development`, or empty
- **What it does**:
  - Clears application cache with verbose output
  - Clears optimization cache (config, route, view)
  - Clears individual cache types (view, config, route, event)
  - Runs `composer dump-autoload --optimize`
  - Provides detailed logging for debugging

### `99-cache-clear.sh`
- **Purpose**: Basic cache clearing for all environments
- **When it runs**: Every time the container starts
- **What it does**:
  - Clears application cache (`php artisan cache:clear`)
  - Clears optimization cache (`php artisan optimize:clear`)
  - Clears individual cache types for thoroughness
  - Uses error handling to prevent container startup failures

## How It Works

These scripts leverage Laravel Spin's entrypoint system:

1. Scripts in `/etc/entrypoint.d/` are automatically executed during container startup
2. Scripts are executed in alphabetical order (98 runs before 99)
3. The container will continue starting even if cache clearing fails (graceful degradation)

## File Permissions

The scripts are automatically given executable permissions via the Dockerfile:
```dockerfile
COPY --chmod=755 ./entrypoint.d/ /etc/entrypoint.d/
```

## Environment Variables

The development script checks for these environment variables:
- `APP_ENV=local` - Laravel local development
- `APP_ENV=development` - Development environment
- `APP_ENV` (empty) - Defaults to development behavior

## Benefits

- **Prevents cache conflicts**: Ensures fresh cache on every container restart
- **Development-friendly**: More verbose output in development environments
- **Production-safe**: Basic cache clearing in production without excessive logging
- **Error-resistant**: Container will start even if cache clearing fails
- **Automatic**: No manual intervention required

## Troubleshooting

If you see cache-related issues after container restarts, check the container logs:

```bash
# View container startup logs
spin logs php

# Run cache clearing manually
spin run php php artisan cache:clear
spin run php php artisan optimize:clear
``` 