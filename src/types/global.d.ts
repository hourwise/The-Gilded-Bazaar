declare namespace NodeJS {
  interface ProcessEnv {
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
    REVENUECAT_ANDROID_API_KEY?: string;
    REVENUECAT_IOS_API_KEY?: string;
    GEMINI_API_KEY?: string;
  }
}