/**
 * Typed environment configuration.
 *
 * Uses expo-constants for Expo managed workflow.
 * Falls back to process.env for non-Expo environments.
 *
 * DO NOT commit .env files to version control.
 */

export const ENV = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY:
    process.env.EXPO_PUBLIC_SUPABASE_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '',
  REVENUECAT_ANDROID_API_KEY: process.env.REVENUECAT_ANDROID_API_KEY || '',
  REVENUECAT_IOS_API_KEY: process.env.REVENUECAT_IOS_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
} as const;

export function assertEnv() {
  const missing = Object.entries(ENV)
    .filter(([_, val]) => val === '')
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
