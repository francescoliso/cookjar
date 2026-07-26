import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors, getQueryParam, rateLimit, sendError, timeoutSignal, withRetry } from '../lib/http';
import { cached } from '../lib/cache';
import { getRecipe } from '../lib/spoonacular';
import { getFixture } from '../lib/fixtures';
import { Recipe } from '../lib/types';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — recipe detail is stable

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return sendError(res, 405, 'Method not allowed');
  if (!rateLimit(req)) return sendError(res, 429, 'Too many requests, slow down.');

  const id = (getQueryParam(req, 'id') ?? '').trim();
  if (!id) return sendError(res, 400, 'Missing recipe id.');

  const apiKey = process.env.SPOONACULAR_API_KEY;

  try {
    let recipe: Recipe | undefined;
    if (!apiKey || id.startsWith('fx-')) {
      recipe = getFixture(id);
      if (!recipe) return sendError(res, 404, 'Recipe not found.');
    } else {
      recipe = await cached(`recipe:${id}`, CACHE_TTL_MS, async () => {
        const { signal, clear } = timeoutSignal();
        try {
          return await withRetry(() => getRecipe(id, apiKey, signal));
        } finally {
          clear();
        }
      });
    }
    return res.status(200).json({ recipe });
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 404) return sendError(res, 404, 'Recipe not found.');
    if (status === 402) return sendError(res, 502, 'Recipe provider quota exceeded. Try again later.');
    console.error('recipe failed:', err);
    return sendError(res, 502, 'Recipe detail is temporarily unavailable.');
  }
}
