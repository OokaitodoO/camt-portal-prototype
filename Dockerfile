############################################
# Base Image
############################################

# Learn more about the Server Side Up PHP Docker Images at:
# https://serversideup.net/open-source/docker-php/
FROM serversideup/php:8.4-fpm-nginx-alpine AS base

## Uncomment if you need to install additional PHP extensions
# USER root
# RUN install-php-extensions bcmath gd

############################################
# Development Image
############################################
FROM base AS development

# We can pass USER_ID and GROUP_ID as build arguments
# to ensure the www-data user has the same UID and GID
# as the user running Docker.
ARG USER_ID
ARG GROUP_ID

# Switch to root so we can set the user ID and group ID
USER root

# Set the user ID and group ID for www-data
RUN docker-php-serversideup-set-id www-data $USER_ID:$GROUP_ID  && \
    docker-php-serversideup-set-file-permissions --owner $USER_ID:$GROUP_ID --service nginx

# Drop privileges back to www-data    
USER www-data

############################################
# CI image
############################################
FROM base AS ci

# Sometimes CI images need to run as root
# so we set the ROOT user and configure
# the PHP-FPM pool to run as www-data
USER root
RUN echo "user = www-data" >> /usr/local/etc/php-fpm.d/docker-php-serversideup-pool.conf && \
    echo "group = www-data" >> /usr/local/etc/php-fpm.d/docker-php-serversideup-pool.conf

############################################
# Production Image
############################################
FROM base AS deploy

# Switch to root to install Node.js
USER root

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Copy package files first for better Docker layer caching
COPY package*.json /var/www/html/

# Set working directory and install npm dependencies
WORKDIR /var/www/html
RUN npm install

# Copy the rest of the application
COPY --chown=www-data:www-data . /var/www/html

# Run npm build
RUN npm run build

# Remove the hot file that makes Laravel use dev server instead of built assets
RUN rm -f /var/www/html/public/hot

# Set production environment
ENV APP_ENV=production
ENV NODE_ENV=production

# Clear existing caches
RUN php artisan cache:clear || true
RUN php artisan optimize:clear || true

# Optimize Laravel for production
RUN php artisan config:cache || true
RUN php artisan route:cache || true
RUN php artisan view:cache || true

# Create the SQLite directory and set the owner to www-data (remove this if you're not using SQLite)
RUN mkdir -p /var/www/html/.infrastructure/volume_data/sqlite/ && \
    chown -R www-data:www-data /var/www/html/.infrastructure/volume_data/sqlite/

# Set proper ownership for all files
RUN chown -R www-data:www-data /var/www/html

USER www-data