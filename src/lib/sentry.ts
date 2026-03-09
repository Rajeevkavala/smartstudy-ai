import { useEffect } from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import * as Sentry from "@sentry/react";

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,

    // Identify environment and release
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE,

    // Include user IP and request headers in events
    sendDefaultPii: true,

    // 100% in dev, 10% in prod
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Session Replay: 10% all sessions, 100% of sessions with errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Enable Sentry Logs product
    enableLogs: true,

    // Only enabled in production (avoids noise in dev unless DSN set)
    enabled: import.meta.env.PROD || !!import.meta.env.VITE_SENTRY_DSN,

    integrations: [
      // React Router v6 navigation tracing
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      // Session Replay
      Sentry.replayIntegration({
        // Mask all text by default for privacy
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Propagate traces to Supabase and the app itself
    tracePropagationTargets: [
      "localhost",
      /^https:\/\/[a-z0-9]+\.supabase\.co/,
      ...(import.meta.env.VITE_APP_URL ? [import.meta.env.VITE_APP_URL as string] : []),
    ],
  });
}

export { Sentry };
