import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://800ab5684b016f6055c6968a6bf77c05@o420250.ingest.us.sentry.io/4511236704829440",
  tracesSampleRate: 1,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [Sentry.replayIntegration()],
  enableLogs: true,
  sendDefaultPii: true,
});
