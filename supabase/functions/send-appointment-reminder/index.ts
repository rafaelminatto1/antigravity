import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Buscar agendamentos para amanhã que ainda não receberam lembrete
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const { data: appointments, error } = await supabaseClient
      .from("appointments")
      .select(`
        *,
        patients (full_name, phone, email),
        profiles (full_name)
      `)
      .eq("status", "scheduled")
      .eq("reminder_sent", false)
      .gte("start_time", tomorrow.toISOString())
      .lte("start_time", tomorrowEnd.toISOString());

    if (error) throw error;

    const results = [];

    for (const appointment of appointments || []) {
      // Enviar notificação (email, SMS, WhatsApp)
      // TODO: Implementar integração com Resend, Twilio, etc.

      // Marcar como lembrete enviado
      await supabaseClient
        .from("appointments")
        .update({ reminder_sent: true })
        .eq("id", appointment.id);

      // Criar notificação in-app
      await supabaseClient.from("notifications").insert({
        user_id: appointment.therapist_id,
        type: "appointment_reminder",
        title: "Lembrete de Agendamento",
        message: `Agendamento com ${appointment.patients?.full_name} amanhã às ${new Date(appointment.start_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
        data: { appointment_id: appointment.id },
      });

      results.push({
        appointment_id: appointment.id,
        patient: appointment.patients?.full_name,
        status: "reminder_sent",
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        reminders_sent: results.length,
        results,
      }),
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

