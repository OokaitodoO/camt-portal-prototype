#!/bin/sh

# Laravel Spin Development Cache Clearing Script
# This script runs in development environment only

# Only run in development environment
if [ "$APP_ENV" = "local" ] || [ "$APP_ENV" = "development" ] || [ "$APP_ENV" = "" ]; then
    echo "🚀 Development environment detected - Running comprehensive cache clearing..."

    # Wait a moment to ensure all services are ready
    sleep 2

    # Clear application cache with more verbose output
    echo "Clearing application cache..."
    php artisan cache:clear --verbose || echo "⚠️  Warning: Failed to clear application cache"

    # Clear optimization cache
    echo "Clearing optimization cache..."
    php artisan optimize:clear --verbose || echo "⚠️  Warning: Failed to clear optimization cache"

    # Clear compiled views cache
    echo "Clearing compiled views..."
    php artisan view:clear --verbose || echo "⚠️  Warning: Failed to clear view cache"

    # Clear compiled config cache
    echo "Clearing config cache..."
    php artisan config:clear --verbose || echo "⚠️  Warning: Failed to clear config cache"

    # Clear route cache 
    echo "Clearing route cache..."
    php artisan route:clear --verbose || echo "⚠️  Warning: Failed to clear route cache"

    # Clear event cache (if exists)
    echo "Clearing event cache..."
    php artisan event:clear --verbose || echo "⚠️  Warning: Failed to clear event cache (may not exist)"

    # Additional development-friendly operations
    echo "Running composer dump-autoload..."
    composer dump-autoload --optimize || echo "⚠️  Warning: Failed to dump autoload"

    echo "✅ Development cache clearing completed successfully!"
else
    echo "ℹ️  Production environment detected - skipping development cache clearing"
fi 