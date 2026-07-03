declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_KEY?: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
    REVENUECAT_ANDROID_API_KEY?: string;
    REVENUECAT_IOS_API_KEY?: string;
    GEMINI_API_KEY?: string;
  }
}

declare module 'react-native-vector-icons/MaterialCommunityIcons';
