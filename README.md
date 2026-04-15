# Bumpa Assessment — Backend API

A Laravel 11 REST API that tracks user purchases and automatically awards achievements and badge upgrades as spending milestones are reached. Authentication is handled with Laravel Sanctum.

---

## Table of Contents

- [Requirements](#requirements)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running the Server](#running-the-server)
- [Running Tests](#running-tests)
- [Authentication Flow](#authentication-flow)
- [API Reference](#api-reference)
- [Achievement & Badge Logic](#achievement--badge-logic)
- [Project Structure](#project-structure)

---

## Requirements

| Tool | Minimum Version |
|------|----------------|
| PHP  | 8.2+           |
| Composer | 2.x       |
| SQLite | 3.x (bundled with PHP) |

> **macOS (Homebrew):** If your system PHP is older, use the Homebrew version:
> ```bash
> /opt/homebrew/bin/php --version
> ```

---

## Tech Stack

- **Framework:** Laravel 11
- **Authentication:** Laravel Sanctum (token-based)
- **Database:** SQLite (default) — swappable to MySQL/PostgreSQL via `.env`
- **Testing:** Pest v3 + pest-plugin-laravel

---

## Installation

```bash
# 1. Clone the repository
git clone <repo-url> bumpa-backend
cd bumpa-backend

# 2. Install PHP dependencies
composer install
```

---

## Environment Setup

```bash
# Copy the example env file
cp .env.example .env

# Generate the application key
php artisan key:generate
```

The default `.env` uses **SQLite** — no database server required. The database file is created automatically at `database/database.sqlite`.

### Switching to MySQL / PostgreSQL

Update the following values in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bumpa
DB_USERNAME=root
DB_PASSWORD=secret
```

---

## Database Setup

```bash
# Run all migrations
php artisan migrate

# Seed the database with test users and data
php artisan db:seed
```

The seeder creates the following records:

| Email | Password | Purchases | Achievements | Badge |
|-------|----------|-----------|--------------|-------|
| `test@bumpa.com` | `password` | 0 | none | Bronze |
| _(factory)_ | _(random)_ | 1 | First Steps | Bronze |
| _(factory)_ | _(random)_ | 5 | First Steps, Regular Shopper | Silver |
| _(factory)_ | _(random)_ | 10 | + Loyal Customer | Silver |
| _(factory)_ | _(random)_ | 20 | + Super Fan | Gold |
| _(factory)_ | _(random)_ | 50 | + Legend | Platinum |

Use `test@bumpa.com` / `password` to log in immediately without registering.

---

## Running the Server

```bash
php artisan serve
```

The API will be available at **`http://127.0.0.1:8000`**.

> **macOS with XAMPP / Herd:** If your default `php` points to an older version, prefix commands with the Homebrew PHP path:
> ```bash
> /opt/homebrew/bin/php artisan serve
> ```

---

## Running Tests

```bash
php artisan test
```

Or using Pest directly:

```bash
./vendor/bin/pest
```

Tests use an **in-memory SQLite database** and reset between each test — no separate test database setup needed.

---

## Authentication Flow

All API routes (except `/auth/register` and `/auth/login`) require a Bearer token.

### 1. Register

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

### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@bumpa.com",
  "password": "password"
}
```

**Response:**

```json
{
  "token": "1|abc123...",
  "user": { "id": 1, "name": "Test User", "email": "test@bumpa.com" }
}
```

### 3. Use the token

Include the token in the `Authorization` header for all subsequent requests:

```
Authorization: Bearer 1|abc123...
```

### 4. Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

## API Reference

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

Returns the user's achievement and badge progress.

**Response `200`:**

```json
{
  "unlocked_achievements": ["First Steps", "Regular Shopper"],
  "next_available_achievements": ["Loyal Customer"],
  "current_badge": "Silver",
  "next_badge": "Gold",
  "remaining_to_unlock_next_badge": 2
}
```

**Response `404`** — user not found:

```json
{ "message": "User not found." }
```

---

### POST `/api/users/{id}/purchases`

Records a purchase and triggers achievement/badge evaluation.

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
  "id": 12,
  "user_id": 1,
  "amount": "250.00",
  "created_at": "2026-04-16T10:00:00.000000Z",
  "updated_at": "2026-04-16T10:00:00.000000Z"
}
```

**Response `404`** — user not found:

```json
{ "message": "User not found." }
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

Achievements and badges are evaluated automatically when a purchase is recorded. The system is idempotent — re-evaluating an already-achieved milestone will not create duplicate records or fire duplicate events.

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
├── Events/               # AchievementUnlocked, BadgeUnlocked, PurchaseCompleted
├── Http/Controllers/     # AuthController, AchievementController, PurchaseController
├── Listeners/            # AwardAchievementsAndBadges, ProcessBadgeCashback
├── Models/               # User, Purchase, UserAchievement, UserBadge
├── Providers/            # EventServiceProvider
└── Services/             # AchievementService, BadgeService
database/
├── migrations/           # Schema migrations (incl. soft deletes)
└── seeders/              # DatabaseSeeder with test users
routes/
└── api.php               # All API routes
tests/
└── Feature/
    └── AchievementTest.php  # 8 Pest feature tests
```


## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com/)**
- **[Tighten Co.](https://tighten.co)**
- **[WebReinvent](https://webreinvent.com/)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel/)**
- **[Cyber-Duck](https://cyber-duck.co.uk)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Jump24](https://jump24.co.uk)**
- **[Redberry](https://redberry.international/laravel/)**
- **[Active Logic](https://activelogic.com)**
- **[byte5](https://byte5.de)**
- **[OP.GG](https://op.gg)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
