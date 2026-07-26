import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useLayoutEffect, useRef } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { mockRecipes } from '../data/mockRecipes';
import { RecipeDetailParams, SearchStackParamList } from '../navigation/types';
import { useSavedRecipes } from '../storage/SavedRecipesContext';
import { colors, radius, spacing } from '../theme/theme';

export function RecipeDetailScreen() {
  const route = useRoute<RouteProp<Record<string, RecipeDetailParams>, string>>();
  const navigation = useNavigation<NativeStackNavigationProp<SearchStackParamList>>();
  const { isSaved, saveRecipe, removeRecipe, savedRecipes } = useSavedRecipes();
  const saveScale = useRef(new Animated.Value(1)).current;

  // Prefer the canonical recipe (freshest image/data), fall back to the saved copy.
  const recipe =
    mockRecipes.find((r) => r.id === route.params.recipeId) ??
    savedRecipes.find((r) => r.id === route.params.recipeId);

  const saved = recipe ? isSaved(recipe.id) : false;

  const handleToggleSave = () => {
    if (!recipe) return;
    saved ? removeRecipe(recipe.id) : saveRecipe(recipe);
    saveScale.setValue(0.85);
    Animated.spring(saveScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 14,
      bounciness: 14,
    }).start();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        recipe ? (
          <Pressable onPress={handleToggleSave} hitSlop={8}>
            <Animated.View
              style={[
                styles.savePill,
                saved && styles.savePillActive,
                { transform: [{ scale: saveScale }] },
              ]}
            >
              <Text style={[styles.savePillText, saved && styles.savePillTextActive]}>
                {saved ? 'Saved ✓' : 'Save'}
              </Text>
            </Animated.View>
          </Pressable>
        ) : null,
    });
  }, [navigation, recipe, saved]);

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Recipe not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.imageWrap}>
        <Image source={recipe.image} style={styles.image} />
        <View style={styles.scrim} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.source}>{recipe.sourceName}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Text style={styles.metaPillText}>{recipe.readyInMinutes} min</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaPillText}>{recipe.servings} servings</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ingredients</Text>
        {recipe.ingredients.map((ingredient, index) => (
          <View key={index} style={styles.listRow}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>{ingredient}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Instructions</Text>
        {recipe.instructions.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.listText}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  notFound: {
    color: colors.textMuted,
    fontSize: 16,
  },
  imageWrap: {
    width: '100%',
    height: 240,
  },
  image: {
    width: '100%',
    height: 240,
    backgroundColor: colors.primarySoft,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.scrim,
  },
  body: {
    padding: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  source: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metaPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  metaPillText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  savePill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  savePillActive: {
    backgroundColor: colors.accent,
  },
  savePillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  savePillTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
  },
});
