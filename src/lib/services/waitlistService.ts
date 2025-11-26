import { createClient } from "@/lib/supabase/client";

export type WaitlistPriority = 'normal' | 'high' | 'urgent';
export type WaitlistStatus = 'waiting' | 'notified' | 'confirmed' | 'expired' | 'cancelled';

export interface WaitlistItem {
  id: string;
  org_id: string;
  patient_id: string;
  physiotherapist_id?: string;
  desired_date?: string;
  desired_time?: string;
  priority: WaitlistPriority;
  status: WaitlistStatus;
  notes?: string;
  notified_at?: string;
  expires_at?: string;
  created_at: string;
  patients?: {
    full_name: string;
    phone?: string;
    email?: string;
  };
  physiotherapists?: {
    full_name: string;
  };
}

export interface CreateWaitlistData {
  patient_id: string;
  physiotherapist_id?: string;
  desired_date?: string;
  desired_time?: string;
  priority?: WaitlistPriority;
  notes?: string;
}

export class WaitlistService {
  private supabase = createClient();

  async getWaitlist(orgId?: string, filters?: {
    status?: WaitlistStatus;
    priority?: WaitlistPriority;
    physiotherapistId?: string;
  }): Promise<WaitlistItem[]> {
    let query = this.supabase
      .from('waitlist')
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
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (orgId) {
      query = query.eq('org_id', orgId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters?.physiotherapistId) {
      query = query.eq('physiotherapist_id', filters.physiotherapistId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as WaitlistItem[];
  }

  async getWaitlistItem(id: string): Promise<WaitlistItem | null> {
    const { data, error } = await this.supabase
      .from('waitlist')
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
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as WaitlistItem | null;
  }

  async addToWaitlist(data: CreateWaitlistData): Promise<WaitlistItem> {
    const { data: { user } } = await this.supabase.auth.getUser();
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user?.id)
      .single();

    const { data: created, error } = await this.supabase
      .from('waitlist')
      .insert({
        org_id: profile?.org_id || '',
        patient_id: data.patient_id,
        physiotherapist_id: data.physiotherapist_id,
        desired_date: data.desired_date,
        desired_time: data.desired_time,
        priority: data.priority || 'normal',
        notes: data.notes,
        status: 'waiting',
      })
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
      .single();

    if (error) throw error;
    return created as WaitlistItem;
  }

  async updateWaitlistItem(id: string, updates: Partial<WaitlistItem>): Promise<WaitlistItem> {
    const { data, error } = await this.supabase
      .from('waitlist')
      .update(updates)
      .eq('id', id)
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
      .single();

    if (error) throw error;
    return data as WaitlistItem;
  }

  async notifyNext(canceledAppointmentId: string): Promise<WaitlistItem | null> {
    // Buscar o agendamento cancelado para pegar informações
    const { data: appointment } = await this.supabase
      .from('appointments')
      .select('physiotherapist_id, start_time')
      .eq('id', canceledAppointmentId)
      .single();

    if (!appointment) return null;

    // Buscar próximo da fila compatível
    const { data: nextInLine } = await this.supabase
      .from('waitlist')
      .select('*')
      .eq('status', 'waiting')
      .or(`physiotherapist_id.is.null,physiotherapist_id.eq.${appointment.physiotherapist_id}`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (!nextInLine) return null;

    // Atualizar status para notificado
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2); // 2 horas para confirmar

    const updated = await this.updateWaitlistItem(nextInLine.id, {
      status: 'notified',
      notified_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    });

    return updated;
  }

  async confirmWaitlist(waitlistId: string, appointmentData: {
    start_time: string;
    end_time: string;
  }): Promise<void> {
    // Atualizar status da lista de espera
    await this.updateWaitlistItem(waitlistId, {
      status: 'confirmed',
    });
  }

  async expireWaitlist(waitlistId: string): Promise<void> {
    await this.updateWaitlistItem(waitlistId, {
      status: 'expired',
    });
  }

  async cancelWaitlist(waitlistId: string): Promise<void> {
    await this.updateWaitlistItem(waitlistId, {
      status: 'cancelled',
    });
  }

  async getMetrics(orgId?: string): Promise<{
    total: number;
    waiting: number;
    notified: number;
    confirmed: number;
    expired: number;
    averageWaitTime: number;
    conversionRate: number;
  }> {
    const waitlist = await this.getWaitlist(orgId);

    const total = waitlist.length;
    const waiting = waitlist.filter(w => w.status === 'waiting').length;
    const notified = waitlist.filter(w => w.status === 'notified').length;
    const confirmed = waitlist.filter(w => w.status === 'confirmed').length;
    const expired = waitlist.filter(w => w.status === 'expired').length;

    // Calcular tempo médio de espera (em horas)
    const confirmedItems = waitlist.filter(w => w.status === 'confirmed' && w.notified_at);
    const averageWaitTime = confirmedItems.length > 0
      ? confirmedItems.reduce((acc, item) => {
          const waitTime = new Date(item.notified_at!).getTime() - new Date(item.created_at).getTime();
          return acc + waitTime;
        }, 0) / confirmedItems.length / (1000 * 60 * 60) // Converter para horas
      : 0;

    // Taxa de conversão (confirmados / notificados)
    const conversionRate = notified > 0 ? (confirmed / notified) * 100 : 0;

    return {
      total,
      waiting,
      notified,
      confirmed,
      expired,
      averageWaitTime: Math.round(averageWaitTime * 10) / 10,
      conversionRate: Math.round(conversionRate * 10) / 10,
    };
  }
}

export const waitlistService = new WaitlistService();

