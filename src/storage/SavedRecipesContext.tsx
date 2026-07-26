import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Recipe, SavedRecipe } from '../types/recipe';

// Bumped to v2 when recipe images moved from bundled assets to remote URLs;
// old entries stored stale image references, so they are dropped on upgrade.
const STORAGE_KEY = 'cookjar.savedRecipes.v2';

type SavedRecipesContextValue = {
  savedRecipes: SavedRecipe[];
  isLoaded: boolean;
  isSaved: (id: string) => boolean;
  saveRecipe: (recipe: Recipe) => void;
  removeRecipe: (id: string) => void;
};

const SavedRecipesContext = createContext<SavedRecipesContextValue | null>(null);

export function SavedRecipesProvider({ children }: { children: ReactNode }) {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setSavedRecipes(JSON.parse(raw));
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isLoaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecipes));
  }, [savedRecipes, isLoaded]);

  const value = useMemo<SavedRecipesContextValue>(
    () => ({
      savedRecipes,
      isLoaded,
      isSaved: (id) => savedRecipes.some((r) => r.id === id),
      saveRecipe: (recipe) =>
        setSavedRecipes((prev) =>
          prev.some((r) => r.id === recipe.id)
            ? prev
            : [{ ...recipe, savedAt: new Date().toISOString() }, ...prev]
        ),
      removeRecipe: (id) => setSavedRecipes((prev) => prev.filter((r) => r.id !== id)),
    }),
    [savedRecipes, isLoaded]
  );

  return <SavedRecipesContext.Provider value={value}>{children}</SavedRecipesContext.Provider>;
}

export function useSavedRecipes() {
  const ctx = useContext(SavedRecipesContext);
  if (!ctx) throw new Error('useSavedRecipes must be used within SavedRecipesProvider');
  return ctx;
}
