import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RecipeCard } from '../components/RecipeCard';
import { mockRecipes } from '../data/mockRecipes';
import { SearchStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<SearchStackParamList, 'SearchList'>;

export function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockRecipes;
    return mockRecipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(q) ||
        recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Find a recipe</Text>
      <TextInput
        style={styles.input}
        placeholder="Search by dish or ingredient"
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        returnKeyType="search"
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No recipes match "{query}"</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
    fontSize: 15,
  },
});
