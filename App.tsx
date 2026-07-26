import { NavigationContainer, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RecipeDetailScreen } from './src/screens/RecipeDetailScreen';
import { SavedScreen } from './src/screens/SavedScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { SavedRecipesProvider } from './src/storage/SavedRecipesContext';
import { colors } from './src/theme/theme';
import { SavedStackParamList, SearchStackParamList } from './src/navigation/types';

const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const SavedStack = createNativeStackNavigator<SavedStackParamList>();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  headerTitle: '',
  headerBackButtonDisplayMode: 'minimal' as const,
};

function SearchStackNavigator() {
  return (
    <SearchStack.Navigator screenOptions={screenOptions}>
      <SearchStack.Screen name="SearchList" component={SearchScreen} options={{ headerShown: false }} />
      <SearchStack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </SearchStack.Navigator>
  );
}

function SavedStackNavigator() {
  return (
    <SavedStack.Navigator screenOptions={screenOptions}>
      <SavedStack.Screen name="SavedList" component={SavedScreen} options={{ headerShown: false }} />
      <SavedStack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </SavedStack.Navigator>
  );
}

const navigationTheme: Theme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 },
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SavedRecipesProvider>
          <NavigationContainer theme={navigationTheme}>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.textMuted,
              tabBarLabelStyle: { fontWeight: '600' },
              tabBarStyle: {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
                borderTopWidth: 1,
              },
            }}
          >
            <Tab.Screen
              name="Search"
              component={SearchStackNavigator}
              options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔍</Text> }}
            />
            <Tab.Screen
              name="Saved"
              component={SavedStackNavigator}
              options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📖</Text> }}
            />
            </Tab.Navigator>
          </NavigationContainer>
          <StatusBar style="dark" />
        </SavedRecipesProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
