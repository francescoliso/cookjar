// The normalized recipe shape returned to the app. Kept in sync with the app's
// `src/types/recipe.ts` (image is a remote URL string on the wire).
export type Recipe = {
  id: string;
  title: string;
  image: string;
  sourceUrl: string;
  sourceName: string;
  readyInMinutes: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
};
