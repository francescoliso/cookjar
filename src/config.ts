import Constants from 'expo-constants';

// Base URL of the CookJar backend. Only this (public) URL ships in the app —
// the Spoonacular key lives on the server. Set `expo.extra.apiBaseUrl` in
// app.json to your deployed Vercel URL; in dev we fall back to localhost, which
// the iOS Simulator can reach on the host machine.
const configured = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;

export const API_BASE_URL = configured || (__DEV__ ? 'http://localhost:3000' : '');
