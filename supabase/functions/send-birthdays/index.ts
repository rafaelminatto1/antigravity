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

      // Enviar via WhatsApp Business API
      const whatsappToken = Deno.env.get("WHATSAPP_API_TOKEN");
      const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
      const patientPhone = patient.phone?.replace(/\D/g, "") || ""; // Remove caracteres não numéricos
      
      if (whatsappToken && phoneNumberId && patientPhone) {
        try {
          const whatsappResponse = await fetch(
            `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${whatsappToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                to: `55${patientPhone}`,
                type: "text",
                text: {
                  body: message,
                },
              }),
            }
          );

          const whatsappData = await whatsappResponse.json();
          
          if (whatsappResponse.ok) {
            console.log(`WhatsApp de aniversário enviado para ${patient.full_name}:`, whatsappData);
          } else {
            console.error(`Erro ao enviar WhatsApp:`, whatsappData);
          }
        } catch (error) {
          console.error("Erro ao enviar WhatsApp:", error);
        }
      }

      // Enviar via Email (Resend)
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      const patientEmail = patient.email;
      
      if (resendApiKey && patientEmail) {
        try {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "FisioFlow <noreply@moocafisio.com.br>",
              to: patientEmail,
              subject: "🎉 Feliz Aniversário! - FisioFlow",
              html: `<p>${message.replace(/\n/g, "<br>")}</p>`,
            }),
          });

          const emailData = await emailResponse.json();
          
          if (emailResponse.ok) {
            console.log(`Email de aniversário enviado para ${patient.full_name}:`, emailData);
          } else {
            console.error(`Erro ao enviar email:`, emailData);
          }
        } catch (error) {
          console.error("Erro ao enviar email:", error);
        }
      }

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

