# ShopMore — Loyalty & Rewards Platform

A fullstack Laravel 11 + React 19 application that tracks user purchases and automatically awards achievements and badge upgrades as spending milestones are reached. Badge upgrades trigger a ₦300 cashback payment via a pluggable payment provider.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Quick Start — Docker (recommended)](#quick-start--docker-recommended)
- [Quick Start — Local](#quick-start--local)
- [Environment Setup](#environment-setup)
- [Running Tests](#running-tests)
- [Seed Accounts](#seed-accounts)
- [Authentication Flow](#authentication-flow)
- [API Reference](#api-reference)
- [Achievement & Badge Logic](#achievement--badge-logic)
- [Cashback System](#cashback-system)
- [Project Structure](#project-structure)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 11, PHP 8.4 |
| Frontend | React 19, TypeScript, Vite 8 |
| Auth | Laravel Sanctum (token-based) |
| Database | SQLite (default) — swappable to MySQL/PostgreSQL |
| Testing | Pest v3 + pest-plugin-laravel |
| Containerisation | Docker + Docker Compose |

---

## Quick Start — Docker (recommended)

### Prerequisites

- Docker Desktop running

### Start

```bash
docker compose up
```

On first run Docker will:
1. Build the PHP image and install Composer dependencies
2. Run all migrations automatically
3. Seed the database with test users
4. Start the Vite dev server with HMR

| Service | URL |
|---------|-----|
| **React frontend / Laravel** | http://localhost:8088 |
| **Vite HMR (asset server)** | http://localhost:5175 |

### Stop

```bash
docker compose down
```

### Reset database

```bash
docker compose down -v   # removes SQLite volume
docker compose up
```

---

## Quick Start — Local

### Prerequisites

| Tool | Minimum Version |
|------|----------------|
| PHP | 8.4+ |
| Composer | 2.x |
| Node.js | 20+ |
| npm | 10+ |

> **macOS:** If your system PHP is older, use Homebrew:
> ```bash
> /opt/homebrew/bin/php --version
> ```

### Backend

```bash
# 1. Install PHP dependencies
composer install

# 2. Copy environment file and generate key
cp .env.example .env
php artisan key:generate

# 3. Run migrations and seed
php artisan migrate
php artisan db:seed

# 4. Start Laravel server
/opt/homebrew/bin/php artisan serve
# → http://127.0.0.1:8000
```

### Frontend

```bash
# In a separate terminal
npm install
npm run dev
# → http://localhost:5173
```

> When running locally, the React frontend is served by Vite and communicates with Laravel at `http://localhost:8000`.

---

## Environment Setup

The default `.env` uses **SQLite** — no database server required.

### Switching to MySQL / PostgreSQL

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=shopmore
DB_USERNAME=root
DB_PASSWORD=secret
```

---

## Running Tests

```bash
# Local
php artisan test

# Inside Docker
docker compose exec app php artisan test
```

Tests use an **in-memory SQLite database** and reset between each test.

---

## Seed Accounts

| Email | Password | Purchases | Badge |
|-------|----------|-----------|-------|
| `test@shopmore.com` | `password` | 0 | Bronze |
| _(factory)_ | _(random)_ | 1 | Bronze |
| _(factory)_ | _(random)_ | 5 | Silver |
| _(factory)_ | _(random)_ | 10 | Silver |
| _(factory)_ | _(random)_ | 20 | Gold |
| _(factory)_ | _(random)_ | 50 | Platinum |

---

## Authentication Flow

All API routes (except `/auth/register` and `/auth/login`) require a Bearer token.

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123",
  "password_confirmation": "secret123"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@shopmore.com",
  "password": "password"
}
```

**Response:**

```json
{
  "token": "1|abc123...",
  "user": { "id": 1, "name": "Test User", "email": "test@shopmore.com" }
}
```

Include the token in all subsequent requests:

```
Authorization: Bearer 1|abc123...
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

## API Reference

All endpoints return a consistent JSON envelope:

```json
{ "status": "success", "message": "...", "data": { ... } }
{ "status": "failed",  "message": "...", "data": [] }
```

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create a new account |
| POST | `/api/auth/login` | No | Obtain an access token |
| POST | `/api/auth/logout` | Yes | Revoke current token |
| GET  | `/api/auth/me` | Yes | Get authenticated user |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | `/api/users/{id}/achievements` | Yes | Get achievements & badge for a user |
| POST | `/api/users/{id}/purchases` | Yes | Record a purchase for a user |

---

### GET `/api/users/{id}/achievements`

**Response `200`:**

```json
{
  "status": "success",
  "message": "Data retrieved successfully",
  "data": {
    "unlocked_achievements": ["First Steps", "Regular Shopper"],
    "next_available_achievements": ["Loyal Customer"],
    "current_badge": "Silver",
    "next_badge": "Gold",
    "remaining_to_unlock_next_badge": 2
  }
}
```

---

### POST `/api/users/{id}/purchases`

**Request body:**

```json
{ "amount": 250.00 }
```

| Field | Type | Rules |
|-------|------|-------|
| `amount` | numeric | required, min: 1, max: 1,000,000 |

**Response `201`:**

```json
{
  "status": "success",
  "message": "Purchase recorded successfully.",
  "data": {
    "id": 12,
    "user_id": 1,
    "amount": "250.00",
    "created_at": "2026-04-16T10:00:00.000000Z"
  }
}
```

---

## Achievement & Badge Logic

### Achievements (purchase count milestones)

| Achievement | Purchases Required |
|-------------|-------------------|
| First Steps | 1 |
| Regular Shopper | 5 |
| Loyal Customer | 10 |
| Super Fan | 20 |
| Legend | 50 |

### Badge Tiers (achievement count thresholds)

| Badge | Achievements Required |
|-------|----------------------|
| Bronze | 0 |
| Silver | 2 |
| Gold | 4 |
| Platinum | 5 |

Achievements and badges are evaluated automatically when a purchase is recorded. The system is idempotent — re-evaluating an already-achieved milestone will not create duplicates or fire duplicate events.

---

## Cashback System

When a user unlocks a new badge tier, a **₦300 cashback** is automatically triggered via the `BadgeUnlocked` event.

### Flow

```
POST /api/users/{id}/purchases
  → PurchaseCompleted event
    → AwardAchievementsAndBadges listener
      → BadgeUnlocked event (if badge upgraded)
        → ProcessBadgeCashback listener
          → CashbackService::issueBadgeCashback()
            → PaymentProviderInterface::disburse()
```

### Payment Provider

The payment provider is bound via `PaymentProviderInterface` in `AppServiceProvider`. The current implementation is `MockPaymentProvider`, which simulates a successful disbursement and logs to `storage/logs/payments.log`.

**To swap in a real provider (e.g. Paystack):**

1. Create `app/Services/PaystackPaymentProvider.php` implementing `PaymentProviderInterface`
2. Update the binding in `AppServiceProvider`:

```php
$this->app->bind(PaymentProviderInterface::class, PaystackPaymentProvider::class);
```

### Cashback Log Sample

```
[2026-04-16 18:00:00] local.INFO: Cashback initiated {
  "user_id": 1, "user_email": "test@shopmore.com",
  "badge": "Silver", "amount_ngn": 300,
  "reference": "cashback-1-silver-20260416180000"
}
[2026-04-16 18:00:00] local.INFO: [MockPaymentProvider] Disbursement processed {
  "status": "success", "message": "Transfer queued successfully. (mock)"
}
```

View live cashback logs in Docker:

```bash
docker compose exec app tail -f storage/logs/payments.log
```

---

## Rate Limiting

| Route Group | Limit |
|-------------|-------|
| `/api/auth/register`, `/api/auth/login` | 10 requests / minute |
| All other authenticated routes | 60 requests / minute |

---

## Project Structure

```
app/
├── Contracts/
│   └── PaymentProviderInterface.php   # Payment provider contract
├── Events/
│   ├── AchievementUnlocked.php
│   ├── BadgeUnlocked.php
│   └── PurchaseCompleted.php
├── Http/Controllers/
│   ├── AuthController.php
│   ├── AchievementController.php
│   └── PurchaseController.php
├── Listeners/
│   ├── AwardAchievementsAndBadges.php
│   └── ProcessBadgeCashback.php       # Triggers cashback on badge unlock
├── Models/
│   ├── User.php, Purchase.php
│   ├── UserAchievement.php, UserBadge.php
├── Providers/
│   ├── AppServiceProvider.php         # Binds PaymentProviderInterface
│   └── EventServiceProvider.php
└── Services/
    ├── AchievementService.php
    ├── BadgeService.php
    ├── CashbackService.php            # Orchestrates cashback payments
    └── MockPaymentProvider.php        # Simulated payment provider
resources/js/
├── api/                               # Axios client + auth/achievements API
├── components/                        # ProtectedRoute, UI components
├── context/AuthContext.tsx            # Auth state management
├── pages/
│   ├── Dashboard.tsx                  # Loyalty dashboard
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
└── types/                             # TypeScript types
docker/
├── entrypoint.sh                      # Runs migrations + seeds on startup
└── nginx/default.conf                 # Production nginx config
```
