import type { TriggerConfig } from "@trigger.dev/sdk/v3";

export default {
  // ID do projeto no Trigger.dev (projectRef)
  // Criado automaticamente: proj_rrifzwqeavqexqyedenv
  project: process.env.TRIGGER_PROJECT_ID || "proj_rrifzwqeavqexqyedenv",
  
  // Diretório onde os arquivos de tasks estão localizados
  dirs: ["./src/trigger"],
  
  // Duração máxima para execução de tasks (em segundos)
  // Obrigatório na v4.1.2+, mínimo de 5 segundos
  maxDuration: 300, // 5 minutos (300 segundos)
  
  // Configurações de build
  build: {
    external: [],
  },
} satisfies TriggerConfig;

