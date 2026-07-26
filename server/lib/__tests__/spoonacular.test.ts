import { describe, it, expect } from 'vitest';
import { normalizeRecipe, SpoonacularRecipe } from '../spoonacular';

describe('normalizeRecipe', () => {
  it('maps a full Spoonacular recipe to our Recipe shape', () => {
    const input: SpoonacularRecipe = {
      id: 654959,
      title: 'Pasta With Tuna',
      image: 'https://img.spoonacular.com/recipes/654959-556x370.jpg',
      sourceUrl: 'https://www.example.com/pasta-with-tuna',
      sourceName: 'Example Kitchen',
      readyInMinutes: 45,
      servings: 4,
      extendedIngredients: [
        { original: '2 tablespoons olive oil' },
        { original: '1 can tuna, drained' },
      ],
      analyzedInstructions: [
        { steps: [{ step: 'Heat the oil.' }, { step: 'Add the tuna and stir.' }] },
      ],
    };

    const out = normalizeRecipe(input);

    expect(out.id).toBe('654959');
    expect(out.title).toBe('Pasta With Tuna');
    expect(out.image).toContain('654959');
    expect(out.sourceName).toBe('Example Kitchen');
    expect(out.readyInMinutes).toBe(45);
    expect(out.servings).toBe(4);
    expect(out.ingredients).toEqual(['2 tablespoons olive oil', '1 can tuna, drained']);
    expect(out.instructions).toEqual(['Heat the oil.', 'Add the tuna and stir.']);
  });

  it('falls back to HTML instructions when analyzedInstructions is empty', () => {
    const input: SpoonacularRecipe = {
      id: 1,
      title: 'Toast',
      instructions: '<ol><li>Toast the bread.</li><li>Add butter.</li></ol>',
    };
    const out = normalizeRecipe(input);
    expect(out.instructions).toEqual(['Toast the bread.', 'Add butter.']);
  });

  it('derives sourceName from the URL host when none is given', () => {
    const input: SpoonacularRecipe = {
      id: 2,
      title: 'Soup',
      sourceUrl: 'https://www.seriouseats.com/soup-recipe',
    };
    const out = normalizeRecipe(input);
    expect(out.sourceName).toBe('seriouseats.com');
  });

  it('tolerates missing fields without throwing', () => {
    const out = normalizeRecipe({ id: 3, title: 'Empty' });
    expect(out.image).toBe('');
    expect(out.ingredients).toEqual([]);
    expect(out.instructions).toEqual([]);
    expect(out.readyInMinutes).toBe(0);
    expect(out.servings).toBe(0);
  });
});
