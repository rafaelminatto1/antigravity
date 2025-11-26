import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const QSTASH_TOKEN = Deno.env.get("QSTASH_TOKEN");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || 
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA";
    
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || 
      "https://urfxniitfbbvsaskicfo.supabase.co";

    if (!QSTASH_TOKEN) {
      return new Response(
        JSON.stringify({ error: "QSTASH_TOKEN não configurado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const results = [];

    // 1. Criar schedule para lembretes de agendamento
    const reminderUrl = `${SUPABASE_URL}/functions/v1/send-appointment-reminder`;
    const reminderResponse = await fetch(
      `https://qstash.upstash.io/v2/schedules/${encodeURIComponent(reminderUrl)}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${QSTASH_TOKEN}`,
          "Upstash-Cron": "0 8 * * *",
          "Authorization-Forward": `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reminderData = await reminderResponse.json();
    results.push({
      schedule: "send-appointment-reminder",
      success: reminderResponse.ok,
      data: reminderData,
    });

    // 2. Criar schedule para mensagens de aniversário
    const birthdayUrl = `${SUPABASE_URL}/functions/v1/send-birthdays`;
    const birthdayResponse = await fetch(
      `https://qstash.upstash.io/v2/schedules/${encodeURIComponent(birthdayUrl)}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${QSTASH_TOKEN}`,
          "Upstash-Cron": "0 9 * * *",
          "Authorization-Forward": `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const birthdayData = await birthdayResponse.json();
    results.push({
      schedule: "send-birthdays",
      success: birthdayResponse.ok,
      data: birthdayData,
    });

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

