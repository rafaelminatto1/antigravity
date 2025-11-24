import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Buscar agendamentos cancelados recentemente
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const { data: canceledAppointments, error: aptError } = await supabase
      .from("appointments")
      .select("*")
      .eq("status", "canceled")
      .gte("updated_at", oneHourAgo.toISOString());

    if (aptError) throw aptError;

    const results = [];

    for (const appointment of canceledAppointments || []) {
      // Chamar Edge Function para notificar lista de espera
      const { data, error: functionError } = await supabase.functions.invoke(
        "notify-waitlist",
        {
          body: { appointment_id: appointment.id },
        }
      );

      if (!functionError && data) {
        results.push({
          appointment_id: appointment.id,
          waitlist_notified: true,
        });
      }
    }

    // Limpar entradas expiradas da lista de espera
    const now = new Date();
    await supabase
      .from("waitlist")
      .update({ status: "expired" })
      .eq("status", "notified")
      .lt("expires_at", now.toISOString());

    return NextResponse.json({
      success: true,
      waitlist_checked: results.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

