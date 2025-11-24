import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Verificar se é uma chamada do Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Buscar agendamentos para amanhã
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const { data: appointments, error } = await supabase
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
      // Chamar Edge Function do Supabase para enviar lembretes
      const { error: functionError } = await supabase.functions.invoke(
        "send-appointment-reminder",
        {
          body: { appointment_id: appointment.id },
        }
      );

      if (!functionError) {
        results.push({
          appointment_id: appointment.id,
          patient: appointment.patients?.full_name,
          status: "reminder_sent",
        });
      }
    }

    return NextResponse.json({
      success: true,
      reminders_sent: results.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

