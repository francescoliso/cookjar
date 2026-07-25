import { ImageSourcePropType } from 'react-native';

export type Recipe = {
  id: string;
  title: string;
  image: ImageSourcePropType;
  sourceUrl: string;
  sourceName: string;
  readyInMinutes: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
};

export type SavedRecipe = Recipe & {
  savedAt: string;
};
