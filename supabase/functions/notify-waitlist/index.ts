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

    const { appointment_id } = await req.json();

    if (!appointment_id) {
      throw new Error("appointment_id is required");
    }

    // Buscar agendamento cancelado
    const { data: appointment, error: aptError } = await supabaseClient
      .from("appointments")
      .select("*")
      .eq("id", appointment_id)
      .eq("status", "canceled")
      .single();

    if (aptError || !appointment) {
      throw new Error("Appointment not found or not canceled");
    }

    // Buscar próximo da lista de espera
    const { data: waitlistEntry, error: waitlistError } = await supabaseClient
      .from("waitlist")
      .select(`
        *,
        patients (full_name, phone, email)
      `)
      .eq("status", "waiting")
      .eq("org_id", appointment.org_id)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (waitlistError || !waitlistEntry) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No waitlist entries found",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Atualizar status da lista de espera
    await supabaseClient
      .from("waitlist")
      .update({
        status: "notified",
        notified_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 horas
      })
      .eq("id", waitlistEntry.id);

    // Criar notificação
    await supabaseClient.from("notifications").insert({
      user_id: waitlistEntry.patient_id,
      type: "waitlist_notification",
      title: "Vaga Disponível!",
      message: `Uma vaga está disponível para ${new Date(appointment.start_time).toLocaleDateString("pt-BR")} às ${new Date(appointment.start_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
      data: {
        waitlist_id: waitlistEntry.id,
        appointment_id: appointment.id,
      },
    });

    // TODO: Enviar email/SMS/WhatsApp

    return new Response(
      JSON.stringify({
        success: true,
        waitlist_entry: waitlistEntry.id,
        patient: waitlistEntry.patients?.full_name,
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

