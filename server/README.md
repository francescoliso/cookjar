# CookJar Server

Serverless backend (Vercel Functions) that proxies and normalizes the
[Spoonacular](https://spoonacular.com/food-api) recipe API for the CookJar app.
It exists so the API key stays server-side and every recipe is returned in the
app's `Recipe` shape.

## Endpoints

- `GET /api/search?q=<query>&number=<1-30>` → `{ recipes: Recipe[] }`
- `GET /api/recipe?id=<id>` → `{ recipe: Recipe }`
- `POST /api/transcribe` (raw audio body, `Content-Type: audio/m4a`) →
  `{ text }` — voice search transcription via ElevenLabs.

If `SPOONACULAR_API_KEY` is **not** set, recipe endpoints serve built-in fixtures
(see `lib/fixtures.ts`). If `ELEVENLABS_API_KEY` is **not** set, `/api/transcribe`
returns a canned transcript — so the app works end-to-end in local dev with no
keys.

## Local development

```bash
cd server
npm install
cp .env.example .env      # optionally add your SPOONACULAR_API_KEY
npm run dev               # vercel dev  → http://localhost:3000
# no key set? you still get fixtures:
curl "http://localhost:3000/api/search?q=pasta"
curl "http://localhost:3000/api/recipe?id=fx-spaghetti-carbonara"
```

## Deploy

```bash
cd server
vercel                    # first run links/creates the project
vercel env add SPOONACULAR_API_KEY   # paste your key (Production + Preview)
vercel deploy --prod
```

Then point the app at the deployment URL via `expo.extra.apiBaseUrl` in
`app.json`.

## Environment

| Variable               | Required | Notes                                                   |
| ---------------------- | -------- | ------------------------------------------------------- |
| `SPOONACULAR_API_KEY`  | no\*     | Free key from spoonacular.com. Unset → recipe fixtures. |
| `ELEVENLABS_API_KEY`   | no\*     | Key from elevenlabs.io. Unset → canned transcript.      |
| `ALLOWED_ORIGINS`      | no       | Comma-separated CORS allowlist. Defaults to `*`.        |

\* Required for real data; optional for fixture-backed local dev.

## Tests

```bash
npm test        # vitest — normalizeRecipe mapping
```
