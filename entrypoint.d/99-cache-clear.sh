#!/bin/sh

# Laravel Spin Cache Clearing Script
# This script runs automatically when the container starts up

echo "🧹 Clearing Laravel cache and optimization cache..."

# Clear application cache
echo "Clearing application cache..."
php artisan cache:clear || echo "Warning: Failed to clear application cache"

# Clear optimization cache (config, route, view cache)
echo "Clearing optimization cache..."
php artisan optimize:clear || echo "Warning: Failed to clear optimization cache"

# Optional: Clear compiled views cache specifically
echo "Clearing compiled views..."
php artisan view:clear || echo "Warning: Failed to clear view cache"

# Optional: Clear compiled config cache specifically  
echo "Clearing config cache..."
php artisan config:clear || echo "Warning: Failed to clear config cache"

# Optional: Clear route cache specifically
echo "Clearing route cache..."
php artisan route:clear || echo "Warning: Failed to clear route cache"

echo "✅ Cache clearing completed successfully!" 