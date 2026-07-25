export type RecipeDetailParams = { recipeId: string };

export type SearchStackParamList = {
  SearchList: undefined;
  RecipeDetail: RecipeDetailParams;
};

export type SavedStackParamList = {
  SavedList: undefined;
  RecipeDetail: RecipeDetailParams;
};
