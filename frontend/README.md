# Loyalty Program Dashboard — Frontend

A React 18 single-page application that visualises a user's e-commerce loyalty progress: badges, achievements, and a purchase simulator.

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18 or newer |
| Backend API | Running on `http://localhost:8000` |

The app makes requests to:
- `GET /api/users/{userId}/achievements`
- `POST /api/users/{userId}/purchases`

Make sure the backend is up before starting the frontend.

---

## Setup

```bash
# Install dependencies
npm install

# Start the development server (default: http://localhost:5173)
npm run dev
```

---

## How to Use the Demo

1. **User switcher** — The dropdown in the top-right corner lets you switch between five pre-seeded demo users (IDs 1–5). Each user has an independent purchase history and badge level.

2. **Simulate a purchase** — Click the **"Simulate a Purchase"** button at the bottom of the dashboard. This fires a `POST /api/users/{id}/purchases` request with `{ "amount": 100 }`, then immediately refreshes the achievements data. Repeat to advance through badge tiers and unlock new achievements.

---

## Component Architecture

```
src/
├── api/
│   └── achievements.js       Axios client — fetchAchievements(), simulatePurchase()
├── hooks/
│   └── useAchievements.js    TanStack Query hook; queryKey ['achievements', userId]
├── components/
│   ├── icons.jsx              Five inline SVG icon components (no external library)
│   ├── AchievementChip.jsx    Single 140×140 achievement card (locked / unlocked state)
│   ├── AchievementChip.styles.js  Shared style objects for AchievementChip
│   ├── AchievementGrid.jsx    Responsive auto-fit grid of all five achievements
│   ├── BadgeDisplay.jsx       120 px circular badge with entry animation + Platinum shimmer
│   ├── BadgeJourney.jsx       Horizontal Bronze→Silver→Gold→Platinum stepper
│   ├── ProgressBar.jsx        Animated fill bar showing progress to the next badge
│   ├── SkeletonLoader.jsx     Pulsing skeleton that mirrors the full dashboard layout
│   └── ErrorState.jsx         Error panel with a "Try again" retry button
└── pages/
    └── Dashboard.jsx          Composes all components; owns userId state and purchase action
```

### Data flow

```
Dashboard (userId state)
  └── useAchievements(userId)   ← TanStack Query, staleTime 30 s
        └── fetchAchievements() ← Axios GET
  └── simulatePurchase()        ← Axios POST → refetch() on success
```

State is kept at the `Dashboard` level and passed down at most two levels; no Redux or Context API is needed.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tool |
| React Router v6 | Client-side routing |
| TanStack Query v5 | Server-state caching and refetch |
| Axios | HTTP client |
| Plain inline styles | All CSS — no UI library |
