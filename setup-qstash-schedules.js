// Script Node.js para configurar Cron Jobs no QStash
// Execute: node setup-qstash-schedules.js

import { Client } from "@upstash/qstash";

const QSTASH_TOKEN = "eyJVc2VySUQiOiI5YzI2ZjViNi1mMDlmLTRkODctYjczMi1hNzAzNzY2Nzc3MDIiLCJQYXNzd29yZCI6ImUxZTQ4M2M1MGEyZDQ0Zjk5NGI0NDBlNWUzNDZmNTI4In0=";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA";
const SUPABASE_URL = "https://urfxniitfbbvsaskicfo.supabase.co";

const client = new Client({
  token: QSTASH_TOKEN,
});

async function setupSchedules() {
  console.log("🚀 Configurando Cron Jobs no QStash...\n");

  try {
    // 1. Lembretes de Agendamento (Diário às 8h)
    console.log("📅 Criando schedule para lembretes de agendamento...");
    const reminderSchedule = await client.schedules.create({
      destination: `${SUPABASE_URL}/functions/v1/send-appointment-reminder`,
      cron: "0 8 * * *",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    });
    console.log("✅ Schedule criado:", reminderSchedule.scheduleId);
    console.log("   Próxima execução:", reminderSchedule.nextRunTime);
    console.log();

    // 2. Mensagens de Aniversário (Diário às 9h)
    console.log("🎉 Criando schedule para mensagens de aniversário...");
    const birthdaySchedule = await client.schedules.create({
      destination: `${SUPABASE_URL}/functions/v1/send-birthdays`,
      cron: "0 9 * * *",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    });
    console.log("✅ Schedule criado:", birthdaySchedule.scheduleId);
    console.log("   Próxima execução:", birthdaySchedule.nextRunTime);
    console.log();

    console.log("✨ Configuração concluída!");
    console.log("\nPara verificar os cron jobs, acesse: https://console.upstash.com/qstash");
  } catch (error) {
    console.error("❌ Erro ao configurar schedules:", error.message);
    if (error.response) {
      console.error("Detalhes:", error.response.data);
    }
    process.exit(1);
  }
}

setupSchedules();

