# =============================================================================
# Stage 1 – PHP base (shared by dev and prod)
# =============================================================================
FROM php:8.4-cli AS base

RUN apt-get update && apt-get install -y --no-install-recommends \
        libsqlite3-dev libxml2-dev libzip-dev libonig-dev unzip git curl \
    && docker-php-ext-install pdo pdo_sqlite mbstring xml bcmath zip pcntl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# =============================================================================
# Stage 2 – Development (php artisan serve)
# =============================================================================
FROM base AS development

WORKDIR /var/www/html

# Install PHP dependencies first (layer-cached)
COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-interaction --prefer-dist

# Application source is volume-mounted at runtime; copy here for standalone use
COPY . .

RUN touch database/database.sqlite || true

EXPOSE 8000

ENTRYPOINT ["/var/www/html/docker/entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

# =============================================================================
# Stage 3 – Frontend asset builder
# =============================================================================
FROM node:22-alpine AS frontend-builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# =============================================================================
# Stage 4 – Production (php-fpm + pre-built assets)
# =============================================================================
FROM php:8.4-fpm AS production

RUN apt-get update && apt-get install -y --no-install-recommends \
        libsqlite3-dev libxml2-dev libzip-dev libonig-dev unzip \
    && docker-php-ext-install pdo pdo_sqlite mbstring xml bcmath zip pcntl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# PHP deps (production only)
COPY --chown=www-data:www-data composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction \
        --prefer-dist --optimize-autoloader

# Application source
COPY --chown=www-data:www-data . .

# Inject pre-built frontend assets
COPY --from=frontend-builder --chown=www-data:www-data /app/public/build ./public/build

# Prepare storage, database, and symlinks
RUN touch database/database.sqlite \
    && php artisan storage:link --no-interaction \
    && chown -R www-data:www-data storage bootstrap/cache database \
    && chmod -R 775 storage bootstrap/cache database

EXPOSE 9000
CMD ["php-fpm"]
