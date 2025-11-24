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

    // Buscar todas as organizações
    const { data: organizations, error: orgError } = await supabase
      .from("organizations")
      .select("id, name");

    if (orgError) throw orgError;

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const results = [];

    for (const org of organizations || []) {
      // Estatísticas da semana
      const { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select("id")
        .eq("org_id", org.id)
        .gte("session_date", lastWeek.toISOString().split("T")[0]);

      if (sessionsError) continue;

      const { data: appointments, error: aptError } = await supabase
        .from("appointments")
        .select("id, status")
        .eq("org_id", org.id)
        .gte("start_time", lastWeek.toISOString());

      if (aptError) continue;

      const stats = {
        total_sessions: sessions?.length || 0,
        total_appointments: appointments?.length || 0,
        completed: appointments?.filter((a) => a.status === "completed").length || 0,
        canceled: appointments?.filter((a) => a.status === "canceled").length || 0,
      };

      // TODO: Enviar relatório por email para administradores da organização
      // await sendEmailReport(org, stats);

      results.push({
        organization: org.name,
        stats,
      });
    }

    return NextResponse.json({
      success: true,
      reports_sent: results.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

