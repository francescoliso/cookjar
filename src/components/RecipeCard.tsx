import { useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import { Recipe } from '../types/recipe';

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
        <Image source={recipe.image} style={styles.image} />
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {recipe.title}
          </Text>
          <Text style={styles.meta}>
            {recipe.readyInMinutes} min · {recipe.servings} servings
          </Text>
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
  image: {
    width: '100%',
    height: 140,
    backgroundColor: colors.primarySoft,
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
