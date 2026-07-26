import { API_BASE_URL } from '../config';
import { Recipe } from '../types/recipe';

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError('No API base URL configured. Set expo.extra.apiBaseUrl in app.json.');
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { signal });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection.");
  }
  if (!res.ok) {
    let message = 'Something went wrong. Please try again.';
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // non-JSON error body; keep the default message
    }
    throw new ApiError(message, res.status);
  }
  return (await res.json()) as T;
}

export async function searchRecipes(query: string, signal?: AbortSignal): Promise<Recipe[]> {
  if (!query.trim()) return [];
  const data = await getJson<{ recipes: Recipe[] }>(
    `/api/search?q=${encodeURIComponent(query)}`,
    signal
  );
  return data.recipes ?? [];
}

export async function getRecipe(id: string, signal?: AbortSignal): Promise<Recipe> {
  const data = await getJson<{ recipe: Recipe }>(`/api/recipe?id=${encodeURIComponent(id)}`, signal);
  return data.recipe;
}
