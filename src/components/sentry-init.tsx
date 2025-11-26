"use client";

// Componente para inicializar o Sentry no cliente
// No Next.js 15 com App Router, o Sentry é inicializado automaticamente
// através do instrumentation-client.ts, mas este componente garante
// que a inicialização aconteça no contexto correto do React
export function SentryInit() {
  // O Sentry é inicializado automaticamente pelo SDK do Next.js
  // Este componente existe apenas como placeholder caso seja necessário
  // adicionar lógica adicional no futuro
  return null;
}

