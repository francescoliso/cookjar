import { useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import { Recipe } from '../types/recipe';

export function recipeMeta(recipe: Recipe): string {
  const parts: string[] = [];
  if (recipe.readyInMinutes > 0) parts.push(`${recipe.readyInMinutes} min`);
  if (recipe.servings > 0) parts.push(`${recipe.servings} servings`);
  return parts.join(' · ');
}

export function RecipeCard({ recipe, onPress }: { recipe: Recipe; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={styles.card}
        onPress={onPress}
        onPressIn={() => animateTo(0.96)}
        onPressOut={() => animateTo(1)}
      >
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
          <Text style={styles.title} numberOfLines={1}>
            {recipe.title}
          </Text>
          {recipeMeta(recipe) ? <Text style={styles.meta}>{recipeMeta(recipe)}</Text> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  imageWrap: {
    width: '100%',
    height: 140,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: colors.primarySoft,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
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
    gap: spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
