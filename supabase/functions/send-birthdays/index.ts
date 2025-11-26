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

    // Buscar pacientes aniversariantes do dia
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const { data: patients, error } = await supabaseClient
      .from("patients")
      .select("*")
      .eq("status", "active");

    if (error) throw error;

    const birthdayPatients = (patients || []).filter((patient) => {
      if (!patient.birth_date) return false;
      const birthDate = new Date(patient.birth_date);
      return (
        String(birthDate.getMonth() + 1).padStart(2, "0") === month &&
        String(birthDate.getDate()).padStart(2, "0") === day
      );
    });

    const results = [];

    // Buscar organização padrão
    const { data: orgs } = await supabaseClient
      .from("organizations")
      .select("id, name")
      .limit(1)
      .single();
    
    const orgName = orgs?.name || "da clínica";
    const orgId = orgs?.id || null;

    for (const patient of birthdayPatients) {
      const message = `🎉 Feliz Aniversário, ${patient.full_name}!

A equipe ${orgName} deseja um dia especial!`;

      // Aqui você integraria com WhatsApp Business API, SMS ou Email
      await supabaseClient.from("communication_logs").insert({
        org_id: orgId,
        patient_id: patient.id,
        type: "birthday",
        channel: "whatsapp",
        message,
        status: "sent",
      });

      results.push({ patient_id: patient.id, sent: true });
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

