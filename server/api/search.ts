import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors, getQueryParam, rateLimit, sendError, timeoutSignal, withRetry } from '../lib/http';
import { cached } from '../lib/cache';
import { searchRecipes } from '../lib/spoonacular';
import { searchFixtures } from '../lib/fixtures';
import { Recipe } from '../lib/types';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return sendError(res, 405, 'Method not allowed');
  if (!rateLimit(req)) return sendError(res, 429, 'Too many requests, slow down.');

  const query = (getQueryParam(req, 'q') ?? '').trim();
  const number = Math.min(Math.max(parseInt(getQueryParam(req, 'number') ?? '20', 10) || 20, 1), 30);
  if (!query) return res.status(200).json({ recipes: [] });

  const apiKey = process.env.SPOONACULAR_API_KEY;

  try {
    let recipes: Recipe[];
    if (!apiKey) {
      // Dev fallback: no key configured → serve built-in fixtures.
      recipes = searchFixtures(query).slice(0, number);
    } else {
      recipes = await cached(`search:${number}:${query.toLowerCase()}`, CACHE_TTL_MS, async () => {
        const { signal, clear } = timeoutSignal();
        try {
          return await withRetry(() => searchRecipes(query, number, apiKey, signal));
        } finally {
          clear();
        }
      });
    }
    return res.status(200).json({ recipes });
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 402) return sendError(res, 502, 'Recipe provider quota exceeded. Try again later.');
    console.error('search failed:', err);
    return sendError(res, 502, 'Recipe search is temporarily unavailable.');
  }
}
