#!/usr/bin/env sh
set -e

# Ensure the SQLite database file exists
touch database/database.sqlite

# Run pending migrations automatically on startup
php artisan migrate --force --no-interaction

# Seed the database (idempotent — uses firstOrCreate internally)
php artisan db:seed --force --no-interaction

exec "$@"
