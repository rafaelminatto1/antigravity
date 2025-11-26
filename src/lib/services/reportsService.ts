import { createClient } from "@/lib/supabase/client";
import { sessionService } from "./sessionService";
import { patientService } from "./patientService";
import { financialService } from "./financialService";

export interface ExecutiveDashboard {
  activePatients: number;
  occupancyRate: number;
  monthlyRevenue: number;
  noShowRate: number;
  averageNPS: number;
  revenueEvolution: Array<{ month: string; revenue: number }>;
  patientsByStatus: Array<{ status: string; count: number }>;
  sessionsByTherapist: Array<{ therapist: string; count: number }>;
  patientOrigin: Array<{ origin: string; count: number }>;
}

export interface PatientEvolutionReport {
  patient: any;
  treatmentSummary: {
    totalSessions: number;
    startDate: string;
    endDate?: string;
    averagePainBefore: number;
    averagePainAfter: number;
    improvement: number;
  };
  sessions: any[];
  painMaps: any[];
  objectives: any[];
}

export class ReportsService {
  private supabase = createClient();

  async getExecutiveDashboard(orgId?: string, period?: {
    start: string;
    end: string;
  }): Promise<ExecutiveDashboard> {
    const startDate = period?.start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const endDate = period?.end || new Date().toISOString().split('T')[0];

    // Pacientes ativos
    const patients = await patientService.getPatients(orgId);
    const activePatients = patients.filter(p => p.status === 'active').length;

    // Taxa de ocupação (agendamentos confirmados / total de slots disponíveis)
    const { data: appointments } = await this.supabase
      .from('appointments')
      .select('status')
      .gte('start_time', startDate)
      .lte('start_time', endDate);

    const confirmed = appointments?.filter(a => a.status === 'confirmed').length || 0;
    const total = appointments?.length || 0;
    const occupancyRate = total > 0 ? (confirmed / total) * 100 : 0;

    // Receita do mês
    const financialSummary = await financialService.getFinancialSummary(orgId, { start: startDate, end: endDate });
    const monthlyRevenue = financialSummary.revenue;

    // Taxa de no-show
    const noShow = appointments?.filter(a => a.status === 'no_show').length || 0;
    const noShowRate = total > 0 ? (noShow / total) * 100 : 0;

    // Evolução de receita (últimos 6 meses)
    const revenueEvolution = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const monthSummary = await financialService.getFinancialSummary(orgId, {
        start: monthStart,
        end: monthEnd,
      });

      revenueEvolution.push({
        month: date.toLocaleString('pt-BR', { month: 'short' }),
        revenue: monthSummary.revenue,
      });
    }

    // Pacientes por status
    const patientsByStatus = [
      { status: 'Ativo', count: patients.filter(p => p.status === 'active').length },
      { status: 'Inativo', count: patients.filter(p => p.status === 'inactive').length },
    ];

    // Sessões por fisioterapeuta
    const { data: sessions } = await this.supabase
      .from('sessions')
      .select('physiotherapist_id')
      .gte('session_date', startDate)
      .lte('session_date', endDate);

    const sessionsByTherapist: Record<string, number> = {};
    sessions?.forEach(s => {
      sessionsByTherapist[s.physiotherapist_id] = (sessionsByTherapist[s.physiotherapist_id] || 0) + 1;
    });

    // Origem dos pacientes (assumindo que há um campo 'origin' em patients)
    const patientOrigin = [
      { origin: 'Indicação', count: 0 },
      { origin: 'Instagram', count: 0 },
      { origin: 'Google', count: 0 },
      { origin: 'Facebook', count: 0 },
      { origin: 'Outros', count: 0 },
    ];

    return {
      activePatients,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      monthlyRevenue,
      noShowRate: Math.round(noShowRate * 10) / 10,
      averageNPS: 0, // Seria calculado a partir de communication_logs com type='nps'
      revenueEvolution,
      patientsByStatus,
      sessionsByTherapist: Object.entries(sessionsByTherapist).map(([therapist, count]) => ({
        therapist,
        count,
      })),
      patientOrigin,
    };
  }

  async generatePatientEvolutionReport(patientId: string): Promise<PatientEvolutionReport> {
    const patient = await patientService.getPatientById(patientId);
    if (!patient) throw new Error('Paciente não encontrado');

    const sessions = await sessionService.getPatientSessions(patientId, 100);
    const painMaps = await sessionService.getPatientPainMaps(patientId);

    const totalSessions = sessions.length;
    const startDate = sessions.length > 0 ? sessions[sessions.length - 1].session_date : new Date().toISOString();
    const endDate = sessions.length > 0 ? sessions[0].session_date : undefined;

    const painLevelsBefore = sessions.filter(s => s.pain_level_before !== undefined).map(s => s.pain_level_before!);
    const painLevelsAfter = sessions.filter(s => s.pain_level_after !== undefined).map(s => s.pain_level_after!);

    const averagePainBefore = painLevelsBefore.length > 0
      ? painLevelsBefore.reduce((a, b) => a + b, 0) / painLevelsBefore.length
      : 0;

    const averagePainAfter = painLevelsAfter.length > 0
      ? painLevelsAfter.reduce((a, b) => a + b, 0) / painLevelsAfter.length
      : 0;

    const improvement = averagePainBefore - averagePainAfter;

    return {
      patient,
      treatmentSummary: {
        totalSessions,
        startDate,
        endDate,
        averagePainBefore: Math.round(averagePainBefore * 10) / 10,
        averagePainAfter: Math.round(averagePainAfter * 10) / 10,
        improvement: Math.round(improvement * 10) / 10,
      },
      sessions,
      painMaps,
      objectives: [], // Seria buscado de uma tabela de objetivos
    };
  }

  async exportToPDF(reportData: any): Promise<Blob> {
    // Esta função seria implementada usando react-pdf ou Playwright
    // Por enquanto, retornamos um placeholder
    throw new Error('Exportação PDF ainda não implementada');
  }

  async exportToExcel(reportData: any): Promise<Blob> {
    // Esta função seria implementada usando xlsx
    // Por enquanto, retornamos um placeholder
    throw new Error('Exportação Excel ainda não implementada');
  }
}

export const reportsService = new ReportsService();

