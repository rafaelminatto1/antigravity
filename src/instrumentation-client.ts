// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://c7be59f371f6cb7af4340817e825c174@o4510069182955520.ingest.us.sentry.io/4510422907551744",

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration({
      // Configuração otimizada para Replay
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  // Reduzido para 0.1 (10%) em produção para otimizar performance
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // Reduzido para 5% em produção para otimizar performance
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  // Mantém 100% quando há erro para capturar contexto completo
  replaysOnErrorSampleRate: 1.0,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  // Ambiente
  environment: process.env.NODE_ENV || "development",

  // Ignora erros conhecidos que não precisam ser reportados
  ignoreErrors: [
    // Erros de navegação do Next.js
    "NEXT_REDIRECT",
    "NEXT_NOT_FOUND",
    // Erros de rede comuns
    "NetworkError",
    "Failed to fetch",
    // Erros de extensões do navegador
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;