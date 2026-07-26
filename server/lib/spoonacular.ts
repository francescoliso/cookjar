import { Recipe } from './types';

const BASE = 'https://api.spoonacular.com';

// The subset of Spoonacular's recipe shape we read. Both `complexSearch`
// (with addRecipeInformation & fillIngredients) and `/{id}/information`
// return these fields, so one normalizer handles both.
export type SpoonacularRecipe = {
  id: number;
  title: string;
  image?: string;
  sourceUrl?: string;
  spoonacularSourceUrl?: string;
  sourceName?: string;
  creditsText?: string;
  readyInMinutes?: number;
  servings?: number;
  instructions?: string | null;
  extendedIngredients?: { original?: string; originalString?: string; name?: string }[];
  analyzedInstructions?: { steps: { step: string }[] }[];
};

function stripHtml(html: string): string {
  return html
    .replace(/<li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function hostOf(url: string | undefined): string {
  if (!url) return 'Recipe source';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Recipe source';
  }
}

export function normalizeRecipe(r: SpoonacularRecipe): Recipe {
  const ingredients = (r.extendedIngredients ?? [])
    .map((i) => (i.original ?? i.originalString ?? i.name ?? '').trim())
    .filter(Boolean);

  let instructions: string[] = [];
  const steps = r.analyzedInstructions?.[0]?.steps ?? [];
  if (steps.length) {
    instructions = steps.map((s) => s.step.trim()).filter(Boolean);
  } else if (r.instructions) {
    instructions = stripHtml(r.instructions)
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const sourceUrl = r.sourceUrl || r.spoonacularSourceUrl || '';

  return {
    id: String(r.id),
    title: r.title,
    image: r.image ?? '',
    sourceUrl,
    sourceName: r.sourceName || r.creditsText || hostOf(sourceUrl),
    readyInMinutes: r.readyInMinutes ?? 0,
    servings: r.servings ?? 0,
    ingredients,
    instructions,
  };
}

async function spoonFetch(path: string, params: Record<string, string>, apiKey: string, signal: AbortSignal) {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set('apiKey', apiKey);

  const res = await fetch(url, { signal });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`Spoonacular ${res.status}: ${body.slice(0, 200)}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function searchRecipes(
  query: string,
  number: number,
  apiKey: string,
  signal: AbortSignal
): Promise<Recipe[]> {
  const data = (await spoonFetch(
    '/recipes/complexSearch',
    {
      query,
      number: String(number),
      addRecipeInformation: 'true',
      fillIngredients: 'true',
      instructionsRequired: 'true',
    },
    apiKey,
    signal
  )) as { results?: SpoonacularRecipe[] };
  return (data.results ?? []).map(normalizeRecipe);
}

export async function getRecipe(id: string, apiKey: string, signal: AbortSignal): Promise<Recipe> {
  const data = (await spoonFetch(
    `/recipes/${encodeURIComponent(id)}/information`,
    { includeNutrition: 'false' },
    apiKey,
    signal
  )) as SpoonacularRecipe;
  return normalizeRecipe(data);
}
