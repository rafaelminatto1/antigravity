/**
 * Utilitários para mensagens de erro contextualizadas
 */

export type ErrorType =
  | "network"
  | "validation"
  | "not_found"
  | "unauthorized"
  | "server"
  | "unknown";

export interface ErrorContext {
  entity?: string; // "paciente", "agendamento", "sessão", etc.
  action?: string; // "criar", "atualizar", "deletar", etc.
  field?: string; // campo específico em validação
}

/**
 * Extrai o tipo de erro de uma mensagem ou objeto de erro
 */
export function getErrorType(error: unknown): ErrorType {
  if (typeof error === "string") {
    if (error.includes("network") || error.includes("fetch") || error.includes("conexão")) {
      return "network";
    }
    if (error.includes("validation") || error.includes("validação") || error.includes("inválido")) {
      return "validation";
    }
    if (error.includes("not found") || error.includes("não encontrado")) {
      return "not_found";
    }
    if (error.includes("unauthorized") || error.includes("não autorizado")) {
      return "unauthorized";
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("network") || message.includes("fetch") || message.includes("failed to fetch")) {
      return "network";
    }
    if (message.includes("404") || message.includes("not found")) {
      return "not_found";
    }
    if (message.includes("401") || message.includes("403") || message.includes("unauthorized")) {
      return "unauthorized";
    }
    if (message.includes("500") || message.includes("server")) {
      return "server";
    }
  }

  return "unknown";
}

/**
 * Gera uma mensagem de erro amigável baseada no tipo e contexto
 */
export function getErrorMessage(
  error: unknown,
  context?: ErrorContext
): string {
  const errorType = getErrorType(error);
  const entity = context?.entity || "item";
  const action = context?.action || "processar";

  const messages: Record<ErrorType, string> = {
    network: `Erro de conexão. Verifique sua internet e tente novamente.`,
    validation: context?.field
      ? `O campo "${context.field}" está inválido. Verifique os dados e tente novamente.`
      : `Dados inválidos. Verifique as informações e tente novamente.`,
    not_found: `O ${entity} não foi encontrado.`,
    unauthorized: `Você não tem permissão para ${action} este ${entity}.`,
    server: `Erro no servidor. Tente novamente em alguns instantes.`,
    unknown: `Erro ao ${action} ${entity}. Tente novamente.`,
  };

  // Se temos uma mensagem específica do erro, tentamos usá-la primeiro
  if (error instanceof Error && error.message) {
    // Mas só se não for uma mensagem técnica genérica
    if (
      !error.message.includes("Failed to fetch") &&
      !error.message.includes("NetworkError") &&
      !error.message.includes("404") &&
      !error.message.includes("500")
    ) {
      return error.message;
    }
  }

  if (typeof error === "string" && error.length > 0) {
    return error;
  }

  return messages[errorType];
}

/**
 * Mensagens de erro específicas por ação
 */
export const errorMessages = {
  patient: {
    create: "Não foi possível criar o paciente. Verifique os dados e tente novamente.",
    update: "Não foi possível atualizar o paciente. Verifique os dados e tente novamente.",
    delete: "Não foi possível arquivar o paciente. Tente novamente.",
    notFound: "Paciente não encontrado.",
    load: "Erro ao carregar pacientes. Tente recarregar a página.",
  },
  appointment: {
    create: "Não foi possível criar o agendamento. Verifique os dados e tente novamente.",
    update: "Não foi possível atualizar o agendamento. Verifique os dados e tente novamente.",
    delete: "Não foi possível excluir o agendamento. Tente novamente.",
    cancel: "Não foi possível cancelar o agendamento. Tente novamente.",
    confirm: "Não foi possível confirmar o agendamento. Tente novamente.",
    notFound: "Agendamento não encontrado.",
    load: "Erro ao carregar agendamentos. Tente recarregar a página.",
  },
  session: {
    create: "Não foi possível criar a sessão. Verifique os dados e tente novamente.",
    update: "Não foi possível atualizar a sessão. Verifique os dados e tente novamente.",
    delete: "Não foi possível excluir a sessão. Tente novamente.",
    notFound: "Sessão não encontrada.",
    load: "Erro ao carregar sessões. Tente recarregar a página.",
  },
  attachment: {
    upload: "Erro ao fazer upload do arquivo. Verifique o tamanho e formato e tente novamente.",
    delete: "Erro ao excluir o anexo. Tente novamente.",
    load: "Erro ao carregar anexos. Tente recarregar a página.",
  },
  general: {
    network: "Erro de conexão. Verifique sua internet e tente novamente.",
    server: "Erro no servidor. Tente novamente em alguns instantes.",
    unauthorized: "Você não tem permissão para realizar esta ação.",
    unknown: "Ocorreu um erro inesperado. Tente novamente.",
  },
};

