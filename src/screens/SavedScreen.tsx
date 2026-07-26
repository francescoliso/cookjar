import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RecipeCard } from '../components/RecipeCard';
import { mockRecipes } from '../data/mockRecipes';
import { SavedStackParamList } from '../navigation/types';
import { useSavedRecipes } from '../storage/SavedRecipesContext';
import { colors, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<SavedStackParamList, 'SavedList'>;

export function SavedScreen({ navigation }: Props) {
  const { savedRecipes } = useSavedRecipes();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Saved recipes</Text>
      <FlatList
        data={savedRecipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          // Prefer the canonical recipe so the freshest image/data is shown.
          const recipe = mockRecipes.find((r) => r.id === item.id) ?? item;
          return (
            <RecipeCard
              recipe={recipe}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
            />
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Recipes you save will show up here. Find one you like in Search and tap "Save".
          </Text>
        }
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
    color: colors.headerText,
    marginTop: spacing.sm,
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
    paddingHorizontal: spacing.lg,
  },
});
