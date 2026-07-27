# CookJar

A simple, modern recipe app: search real recipes from the web, view them in a
clean format (ingredients, instructions, time, servings), and save the ones
you've cooked so you can find them again.

## How it works

The app talks to a small serverless backend (`server/`) that proxies and
normalizes the [Spoonacular](https://spoonacular.com/food-api) recipe API and the
[ElevenLabs](https://elevenlabs.io) Speech-to-Text API. The API keys live only on
the server — the app just knows the backend URL. If no keys are configured, the
backend serves built-in fixtures (recipes and a canned transcript) so everything
works in local dev without keys.

```
App (Expo) ──► Backend (Vercel Functions) ──► Spoonacular  (recipes)
                                          └─► ElevenLabs  (voice → text)
```

## Features

- **Search** — live recipe search by dish name or ingredient, with loading,
  empty, and error states.
- **Voice search** — tap the mic and speak; audio is transcribed via
  [ElevenLabs](https://elevenlabs.io) Speech-to-Text (on the backend) and drops
  straight into the search box.
- **Recipe detail** — image, ingredients, step-by-step instructions, prep time,
  servings, and a link to the original source. Tap an ingredient to check it
  off while you cook or shop.
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
- Cooking features (servings scaler, cook mode).
- Recipe notes/ratings and a "cooked" history.
