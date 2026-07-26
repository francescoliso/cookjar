import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchRecipes } from '../api/client';
import { RecipeCard } from '../components/RecipeCard';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { SearchStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<SearchStackParamList, 'SearchList'>;

export function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), 450);

  const {
    data: recipes = [],
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: ({ signal }) => searchRecipes(debouncedQuery, signal),
    enabled: debouncedQuery.length > 0,
  });

  const hasQuery = debouncedQuery.length > 0;
  const showSpinner = hasQuery && isFetching && recipes.length === 0;

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
        clearButtonMode="while-editing"
      />
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
          />
        )}
        ListEmptyComponent={
          <ListState
            idle={!hasQuery}
            loading={showSpinner}
            error={isError}
            errorMessage={error instanceof Error ? error.message : undefined}
            query={debouncedQuery}
            onRetry={refetch}
          />
        }
      />
    </SafeAreaView>
  );
}

function ListState({
  idle,
  loading,
  error,
  errorMessage,
  query,
  onRetry,
}: {
  idle: boolean;
  loading: boolean;
  error: boolean;
  errorMessage?: string;
  query: string;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <View style={styles.state}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.stateText}>Searching…</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.state}>
        <Text style={styles.stateText}>{errorMessage ?? 'Something went wrong.'}</Text>
        <Pressable style={styles.retry} onPress={onRetry}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
  if (idle) {
    return (
      <View style={styles.state}>
        <Text style={styles.stateEmoji}>🍳</Text>
        <Text style={styles.stateText}>Search for a dish or an ingredient to get started.</Text>
      </View>
    );
  }
  return (
    <View style={styles.state}>
      <Text style={styles.stateText}>No recipes found for “{query}”.</Text>
    </View>
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
    flexGrow: 1,
  },
  state: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  stateEmoji: {
    fontSize: 40,
  },
  stateText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
  },
  retry: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
