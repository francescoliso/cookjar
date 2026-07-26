import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useLayoutEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getRecipe } from '../api/client';
import { RecipeDetailParams, SearchStackParamList } from '../navigation/types';
import { useSavedRecipes } from '../storage/SavedRecipesContext';
import { colors, radius, spacing } from '../theme/theme';

export function RecipeDetailScreen() {
  const route = useRoute<RouteProp<Record<string, RecipeDetailParams>, string>>();
  const navigation = useNavigation<NativeStackNavigationProp<SearchStackParamList>>();
  const { isSaved, saveRecipe, removeRecipe, savedRecipes } = useSavedRecipes();
  const saveScale = useRef(new Animated.Value(1)).current;

  const recipeId = route.params.recipeId;
  // A saved recipe is the offline source of truth; otherwise fetch by id.
  const savedCopy = savedRecipes.find((r) => r.id === recipeId);
  const {
    data: fetched,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: ({ signal }) => getRecipe(recipeId, signal),
    enabled: !savedCopy,
  });

  const recipe = savedCopy ?? fetched;
  const saved = isSaved(recipeId);

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

  if (!recipe && isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!recipe && isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>
          {error instanceof Error ? error.message : 'Could not load this recipe.'}
        </Text>
        <Pressable style={styles.retry} onPress={() => refetch()}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Recipe not found.</Text>
      </View>
    );
  }

  const openSource = () => {
    if (recipe.sourceUrl) Linking.openURL(recipe.sourceUrl);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.imageWrap}>
        {recipe.image ? (
          <>
            <Image source={{ uri: recipe.image }} style={styles.image} />
            <View style={styles.scrim} />
          </>
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderEmoji}>🍽️</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Pressable onPress={openSource} disabled={!recipe.sourceUrl}>
          <Text style={[styles.source, recipe.sourceUrl && styles.sourceLink]}>
            {recipe.sourceName}
          </Text>
        </Pressable>

        {(recipe.readyInMinutes > 0 || recipe.servings > 0) && (
          <View style={styles.metaRow}>
            {recipe.readyInMinutes > 0 && (
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>{recipe.readyInMinutes} min</Text>
              </View>
            )}
            {recipe.servings > 0 && (
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>{recipe.servings} servings</Text>
              </View>
            )}
          </View>
        )}

        {recipe.ingredients.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.listRow}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>{ingredient}</Text>
              </View>
            ))}
          </>
        )}

        {recipe.instructions.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.instructions.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.listText}>{step}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.noSteps}>Full step-by-step instructions are on the source site.</Text>
        )}

        {recipe.sourceUrl ? (
          <Pressable style={styles.sourceButton} onPress={openSource}>
            <Text style={styles.sourceButtonText}>View full recipe</Text>
            <View style={styles.sourceButtonDot}>
              <Text style={styles.sourceButtonArrow}>→</Text>
            </View>
          </Pressable>
        ) : null}
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
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  retry: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
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
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 56,
    opacity: 0.5,
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
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 34,
    color: colors.text,
  },
  source: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  sourceLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
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
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
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
    color: colors.text,
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
  noSteps: {
    marginTop: spacing.lg,
    fontSize: 15,
    lineHeight: 21,
    color: colors.textMuted,
  },
  sourceButton: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 15,
  },
  sourceButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  sourceButtonDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceButtonArrow: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
