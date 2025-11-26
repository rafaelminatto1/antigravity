import { createClient } from "@/lib/supabase/client";

export type CommunicationType = 'reminder' | 'birthday' | 'campaign' | 'nps';
export type CommunicationChannel = 'whatsapp' | 'sms' | 'email';
export type CommunicationStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface CommunicationLog {
  id: string;
  org_id: string;
  patient_id: string;
  type: CommunicationType;
  channel: CommunicationChannel;
  message: string;
  sent_at: string;
  status: CommunicationStatus;
  response?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface SendReminderData {
  appointmentId: string;
  channel?: CommunicationChannel;
}

export interface SendCampaignData {
  patientIds: string[];
  message: string;
  channel?: CommunicationChannel;
}

export class CommunicationService {
  private supabase = createClient();

  async logCommunication(data: {
    patient_id: string;
    type: CommunicationType;
    channel: CommunicationChannel;
    message: string;
    status?: CommunicationStatus;
    response?: string;
    metadata?: Record<string, any>;
  }): Promise<CommunicationLog> {
    const { data: { user } } = await this.supabase.auth.getUser();
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user?.id)
      .single();

    const { data: created, error } = await this.supabase
      .from('communication_logs')
      .insert({
        org_id: profile?.org_id || '',
        patient_id: data.patient_id,
        type: data.type,
        channel: data.channel,
        message: data.message,
        status: data.status || 'sent',
        response: data.response,
        metadata: data.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return created as CommunicationLog;
  }

  async getCommunicationLogs(orgId?: string, filters?: {
    type?: CommunicationType;
    channel?: CommunicationChannel;
    patientId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<CommunicationLog[]> {
    let query = this.supabase
      .from('communication_logs')
      .select('*')
      .order('sent_at', { ascending: false });

    if (orgId) {
      query = query.eq('org_id', orgId);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.channel) {
      query = query.eq('channel', filters.channel);
    }

    if (filters?.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }

    if (filters?.startDate) {
      query = query.gte('sent_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('sent_at', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as CommunicationLog[];
  }

  async sendReminder(appointmentId: string, channel: CommunicationChannel = 'whatsapp'): Promise<CommunicationLog> {
    // Buscar dados do agendamento
    const { data: appointment } = await this.supabase
      .from('appointments')
      .select(`
        *,
        patients:patient_id (
          full_name,
          phone,
          email
        ),
        physiotherapists:physiotherapist_id (
          full_name
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (!appointment) throw new Error('Agendamento não encontrado');

    const patient = (appointment.patients as any);
    const therapist = (appointment.physiotherapists as any);
    const appointmentDate = new Date(appointment.start_time);
    const formattedDate = appointmentDate.toLocaleString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const message = `Olá ${patient.full_name}, lembrete da sua sessão de fisioterapia em ${formattedDate} com ${therapist.full_name}.

Para confirmar, responda SIM.
Para cancelar, responda NÃO.`;

    // Aqui seria feita a chamada real para o serviço de mensagens
    // Por enquanto, apenas logamos
    return this.logCommunication({
      patient_id: appointment.patient_id,
      type: 'reminder',
      channel,
      message,
      status: 'sent',
      metadata: { appointment_id: appointmentId },
    });
  }

  async sendBirthdayMessage(patientId: string, channel: CommunicationChannel = 'whatsapp'): Promise<CommunicationLog> {
    const { data: patient } = await this.supabase
      .from('patients')
      .select('full_name, org_id')
      .eq('id', patientId)
      .single();

    if (!patient) throw new Error('Paciente não encontrado');

    const { data: org } = await this.supabase
      .from('organizations')
      .select('name')
      .eq('id', patient.org_id)
      .single();

    const message = `🎉 Feliz Aniversário, ${patient.full_name}!

A equipe ${org?.name || 'da clínica'} deseja um dia especial!`;

    return this.logCommunication({
      patient_id: patientId,
      type: 'birthday',
      channel,
      message,
      status: 'sent',
    });
  }

  async sendCampaign(data: SendCampaignData): Promise<CommunicationLog[]> {
    const logs: CommunicationLog[] = [];

    for (const patientId of data.patientIds) {
      const log = await this.logCommunication({
        patient_id: patientId,
        type: 'campaign',
        channel: data.channel || 'whatsapp',
        message: data.message,
        status: 'sent',
      });
      logs.push(log);
    }

    return logs;
  }

  async sendNPS(patientId: string, channel: CommunicationChannel = 'whatsapp'): Promise<CommunicationLog> {
    const { data: patient } = await this.supabase
      .from('patients')
      .select('full_name')
      .eq('id', patientId)
      .single();

    if (!patient) throw new Error('Paciente não encontrado');

    const npsUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.fisioflow.com'}/nps/${patientId}`;
    const message = `Olá ${patient.full_name}, gostaríamos de saber sua opinião sobre nosso atendimento.

Avalie nossa clínica: ${npsUrl}

Sua opinião é muito importante para nós!`;

    return this.logCommunication({
      patient_id: patientId,
      type: 'nps',
      channel,
      message,
      status: 'sent',
      metadata: { nps_url: npsUrl },
    });
  }

  async getChannelEffectiveness(orgId?: string, period?: {
    start: string;
    end: string;
  }): Promise<Record<CommunicationChannel, {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    conversionRate: number;
  }>> {
    const logs = await this.getCommunicationLogs(orgId, {
      startDate: period?.start,
      endDate: period?.end,
    });

    const channels: CommunicationChannel[] = ['whatsapp', 'sms', 'email'];
    const result: any = {};

    for (const channel of channels) {
      const channelLogs = logs.filter(l => l.channel === channel);
      const sent = channelLogs.length;
      const delivered = channelLogs.filter(l => l.status === 'delivered' || l.status === 'read').length;
      const read = channelLogs.filter(l => l.status === 'read').length;
      const failed = channelLogs.filter(l => l.status === 'failed').length;
      const conversionRate = sent > 0 ? (read / sent) * 100 : 0;

      result[channel] = {
        sent,
        delivered,
        read,
        failed,
        conversionRate: Math.round(conversionRate * 10) / 10,
      };
    }

    return result;
  }
}

export const communicationService = new CommunicationService();

