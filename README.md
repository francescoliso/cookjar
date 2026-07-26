# CookJar

A simple, modern recipe app: search real recipes from the web, view them in a
clean format (ingredients, instructions, time, servings), and save the ones
you've cooked so you can find them again.

## How it works

The app talks to a small serverless backend (`server/`) that proxies and
normalizes the [Spoonacular](https://spoonacular.com/food-api) recipe API. The
API key lives only on the server — the app just knows the backend URL. If no key
is configured, the backend serves built-in fixture recipes so everything works
in local dev without a key.

```
App (Expo) ──► Backend (Vercel Functions) ──► Spoonacular
```

## Features

- **Search** — live recipe search by dish name or ingredient, with loading,
  empty, and error states.
- **Recipe detail** — image, ingredients, step-by-step instructions, prep time,
  servings, and a link to the original source.
- **Saved recipes** — save any recipe; it persists locally (AsyncStorage) and is
  available offline.
- **Considered design** — warm "moody dark" palette, an illustrated app icon,
  photo scrims, and micro-animations (cards spring on press, save button pops).

## Tech stack

- [Expo](https://docs.expo.dev/) / React Native + TypeScript
- React Navigation (bottom tabs + native stack)
- [TanStack Query](https://tanstack.com/query) for data fetching/caching
- AsyncStorage for local persistence
- Backend: Vercel Functions (see [`server/README.md`](server/README.md))

## Getting started

**1. Backend** (serves fixtures without a key):

```bash
cd server
npm install
npm run dev:local        # http://localhost:3000
```

**2. App:**

```bash
npm install
npx expo start --dev-client
```

Press `i` for the iOS Simulator. The Simulator reaches the local backend at
`http://localhost:3000` by default (see `src/config.ts`). For real recipes, add a
Spoonacular key to `server/.env` and deploy the backend, then set
`expo.extra.apiBaseUrl` in `app.json` to the deployment URL.

## Roadmap

- Accounts + cloud sync of saved recipes.
- Cooking features (servings scaler, ingredient check-off, cook mode).
- Recipe notes/ratings and a "cooked" history.
