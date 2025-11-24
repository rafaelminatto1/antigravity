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

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Arquivar agendamentos antigos
    const { data: oldAppointments, error: aptError } = await supabase
      .from("appointments")
      .update({ metadata: { archived: true } })
      .lt("start_time", oneYearAgo.toISOString())
      .is("metadata->archived", null)
      .select("id");

    if (aptError) throw aptError;

    // Limpar notificações antigas (mais de 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error: notifError } = await supabase
      .from("notifications")
      .delete()
      .lt("created_at", thirtyDaysAgo.toISOString())
      .eq("read", true);

    if (notifError) throw notifError;

    return NextResponse.json({
      success: true,
      archived_appointments: oldAppointments?.length || 0,
      cleaned_notifications: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

