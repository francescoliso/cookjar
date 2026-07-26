import { describe, it, expect, beforeEach } from 'vitest';
import searchHandler from '../search';
import recipeHandler from '../recipe';

// Minimal VercelRequest/VercelResponse doubles for exercising the fixture path.
function mockReq(query: Record<string, string>) {
  return {
    method: 'GET',
    query,
    headers: {},
    socket: { remoteAddress: `127.0.0.${Math.floor(Math.random() * 250) + 1}` },
  } as any;
}

function mockRes() {
  const res: any = {
    statusCode: 200,
    body: undefined,
    headers: {} as Record<string, string>,
    setHeader(k: string, v: string) {
      this.headers[k] = v;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    end() {
      return this;
    },
  };
  return res;
}

describe('endpoints (fixture path, no API key)', () => {
  beforeEach(() => {
    delete process.env.SPOONACULAR_API_KEY;
  });

  it('GET /api/search?q=pasta returns matching fixtures', async () => {
    const res = mockRes();
    await searchHandler(mockReq({ q: 'pasta' }), res);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.recipes)).toBe(true);
    expect(res.body.recipes.length).toBeGreaterThan(0);
    expect(res.body.recipes[0]).toHaveProperty('ingredients');
  });

  it('GET /api/search with empty q returns an empty list', async () => {
    const res = mockRes();
    await searchHandler(mockReq({ q: '' }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body.recipes).toEqual([]);
  });

  it('GET /api/recipe?id=fx-... returns a full recipe', async () => {
    const res = mockRes();
    await recipeHandler(mockReq({ id: 'fx-spaghetti-carbonara' }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body.recipe.title).toBe('Spaghetti Carbonara');
    expect(res.body.recipe.instructions.length).toBeGreaterThan(0);
  });

  it('GET /api/recipe with unknown id returns 404', async () => {
    const res = mockRes();
    await recipeHandler(mockReq({ id: 'fx-nope' }), res);
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/recipe with no id returns 400', async () => {
    const res = mockRes();
    await recipeHandler(mockReq({}), res);
    expect(res.statusCode).toBe(400);
  });
});
