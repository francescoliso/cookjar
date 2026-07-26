// Standalone local dev server that mounts the same handlers used on Vercel, so
// you can run the backend without the Vercel CLI (e.g. for the iOS Simulator).
// Usage: npm run dev:local   (serves http://localhost:3000)
import http from 'node:http';
import { URL } from 'node:url';
import searchHandler from './api/search';
import recipeHandler from './api/recipe';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

function adapt(res: http.ServerResponse) {
  const r = res as any;
  r.status = (code: number) => {
    res.statusCode = code;
    return r;
  };
  r.json = (payload: unknown) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
    return r;
  };
  return r;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  (req as any).query = Object.fromEntries(url.searchParams.entries());
  const ares = adapt(res);
  try {
    if (url.pathname === '/api/search') return await searchHandler(req as any, ares);
    if (url.pathname === '/api/recipe') return await recipeHandler(req as any, ares);
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal error' }));
  }
});

server.listen(PORT, () => {
  const mode = process.env.SPOONACULAR_API_KEY ? 'Spoonacular' : 'fixtures (no API key)';
  console.log(`CookJar dev server on http://localhost:${PORT}  [${mode}]`);
});
