const requiredVars = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
] as const;

const optionalVars = [
  "VITE_SENTRY_DSN",
  "VITE_POSTHOG_KEY",
  "VITE_STRIPE_PUBLISHABLE_KEY",
  "VITE_APP_URL",
] as const;

export function validateEnv() {
  const missing: string[] = [];
  for (const key of requiredVars) {
    if (!import.meta.env[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. Check your .env file.`
    );
  }
}

export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN as string | undefined,
  posthogKey: import.meta.env.VITE_POSTHOG_KEY as string | undefined,
  stripeKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined,
  appUrl: import.meta.env.VITE_APP_URL as string | undefined,
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
};
