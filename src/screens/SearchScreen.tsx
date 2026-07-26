import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { SearchStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<SearchStackParamList, 'SearchList'>;

export function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), 450);
  const voice = useVoiceSearch(setQuery);

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
      <Text style={styles.header} numberOfLines={1} adjustsFontSizeToFit>
        <Text style={styles.headerLead}>Ready to cook? </Text>
        Find a recipe
      </Text>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder={voice.status === 'recording' ? 'Listening…' : 'Search by dish or ingredient'}
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
          editable={voice.status === 'idle'}
        />
        <MicButton status={voice.status} onPress={voice.toggle} />
      </View>
      {voice.error ? <Text style={styles.voiceError}>{voice.error}</Text> : null}
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

function MicButton({ status, onPress }: { status: string; onPress: () => void }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'recording') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.25, duration: 550, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 550, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
    pulse.setValue(1);
  }, [status, pulse]);

  const recording = status === 'recording';
  const transcribing = status === 'transcribing';

  return (
    <Pressable
      onPress={onPress}
      disabled={transcribing}
      style={[styles.mic, recording && styles.micActive]}
      hitSlop={8}
    >
      {transcribing ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Ionicons
            name={recording ? 'stop' : 'mic'}
            size={22}
            color={recording ? colors.text : '#FFFFFF'}
          />
        </Animated.View>
      )}
    </Pressable>
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
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: colors.headerText,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerLead: {
    fontWeight: '400',
    color: colors.headerText,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 15,
    fontSize: 16,
    color: colors.text,
  },
  mic: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micActive: {
    backgroundColor: colors.accent,
  },
  voiceError: {
    color: colors.primary,
    fontSize: 13,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
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
    borderRadius: radius.pill,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
