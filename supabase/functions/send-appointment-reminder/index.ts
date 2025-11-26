import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Buscar agendamentos nas próximas 24h que ainda não foram lembrados
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setHours(23, 59, 59, 999);

    // Buscar agendamentos
    const { data: appointments, error } = await supabaseClient
      .from("appointments")
      .select("*")
      .eq("status", "confirmed")
      .gte("start_time", tomorrow.toISOString())
      .lte("start_time", dayAfter.toISOString())
      .is("reminder_sent", null);

    if (error) throw error;

    // Buscar dados dos pacientes e terapeutas
    const patientIds = [...new Set((appointments || []).map(a => a.patient_id))];
    const therapistIds = [...new Set((appointments || []).map(a => a.therapist_id).filter(Boolean))];

    const { data: patientsData } = await supabaseClient
      .from("patients")
      .select("id, full_name, phone, email")
      .in("id", patientIds);

    const { data: therapistsData } = await supabaseClient
      .from("therapists")
      .select("id, user_id")
      .in("user_id", therapistIds);

    const therapistUserIds = therapistsData?.map(t => t.user_id) || [];
    const { data: usersData } = await supabaseClient
      .from("users")
      .select("id, full_name")
      .in("id", therapistUserIds);

    // Criar mapas para lookup rápido
    const patientsMap = new Map((patientsData || []).map(p => [p.id, p]));
    const therapistsMap = new Map((therapistsData || []).map(t => [t.user_id, t.id]));
    const usersMap = new Map((usersData || []).map(u => [u.id, u]));

    if (error) throw error;

    const results = [];

    for (const appointment of appointments || []) {
      const patient = patientsMap.get(appointment.patient_id);
      const therapistId = therapistsMap.get(appointment.therapist_id);
      const therapist = therapistId ? usersMap.get(appointment.therapist_id) : null;
      
      const appointmentDate = new Date(appointment.start_time);
      const therapistName = therapist?.full_name || "seu fisioterapeuta";
      const patientName = patient?.full_name || "Paciente";

      const message = `Olá ${patientName}, lembrete da sua sessão de fisioterapia amanhã às ${appointmentDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} com ${therapistName}.

Para confirmar, responda SIM.
Para cancelar, responda NÃO.`;

      // Aqui você integraria com WhatsApp Business API, SMS ou Email
      // Por enquanto, apenas logamos
      const orgId = (appointment as any).org_id || null;
      await supabaseClient.from("communication_logs").insert({
        org_id: orgId,
        patient_id: appointment.patient_id,
        type: "reminder",
        channel: "whatsapp",
        message,
        status: "sent",
        metadata: { appointment_id: appointment.id },
      });

      // Marcar como lembrado
      await supabaseClient
        .from("appointments")
        .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
        .eq("id", appointment.id);

      results.push({ appointment_id: appointment.id, sent: true });
    }

    return new Response(
      JSON.stringify({ success: true, sent: results.length, results }),
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
