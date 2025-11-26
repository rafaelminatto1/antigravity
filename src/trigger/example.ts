import { task } from "@trigger.dev/sdk/v3";

/**
 * Task de exemplo do Trigger.dev
 * 
 * Esta é uma task simples que demonstra como criar tasks no Trigger.dev.
 * Você pode disparar esta task através do dashboard ou via código.
 */
export const exampleTask = task({
  id: "example-task",
  run: async (payload: { message?: string } = {}, { ctx }) => {
    const message = payload.message || "Nenhuma mensagem fornecida";
    
    console.log("Task executada com sucesso!");
    console.log("Mensagem recebida:", message);
    console.log("Contexto da execução:", {
      attempt: ctx.attempt,
      run: ctx.run,
      environment: ctx.environment,
    });
    
    return {
      success: true,
      message: message,
      timestamp: new Date().toISOString(),
      attemptNumber: ctx.attempt.number,
    };
  },
});

