# CookJar

A simple, modern recipe app: search for recipes, view them in a clean format (ingredients, instructions, time, servings), and save the ones you've cooked so you can find them again.

## Status

This is an early mock version. Recipe search currently runs against a small local dataset with the same shape real scraped data will have (title, image, ingredients, instructions, time, servings) — the goal is to swap in live recipe search without reworking the UI. Dish photos are real, bundled with the app.

## Features

- **Search** — look up recipes by dish name or ingredient.
- **Recipe detail** — ingredients, step-by-step instructions, prep time, and servings in a clean, readable layout.
- **Saved recipes** — save any recipe you've cooked; it persists locally on your device.
- **Considered design** — warm, food-forward palette, an illustrated app icon, and micro-animations (cards spring on press, the save button pops on toggle).

## Roadmap

- Replace the local mock dataset with live recipe search (web search + scraping recipe sites' structured data).
- Recipe notes/ratings on saved recipes.
- Shareable recipe links.

## Tech stack

- [Expo](https://docs.expo.dev/) / React Native
- TypeScript
- React Navigation (bottom tabs + native stack)
- AsyncStorage for local persistence

## Getting started

```bash
npm install
npx expo start
```

Press `i` for the iOS Simulator, `a` for Android, or `w` for web. See [Expo's setup docs](https://docs.expo.dev/get-started/set-up-your-environment/) for running on a physical device.
