import { createClient } from "@/lib/supabase/client";

export interface Appointment {
  id: string;
  patient_id: string;
  therapist_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'canceled' | 'no_show';
  duration_minutes?: number;
  confirmed_at?: string;
  reminder_sent?: boolean;
  recurrence_pattern?: any;
  notes?: string;
  metadata?: any;
  org_id?: string;
  patients?: {
    full_name: string;
    phone?: string;
    email?: string;
  };
  profiles?: {
    full_name: string;
  };
}

export interface CreateAppointmentData {
  patient_id: string;
  therapist_id: string;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  notes?: string;
  org_id?: string;
}

export class AppointmentService {
  private supabase = createClient();

  async getAppointments(filters: {
    startDate?: Date;
    endDate?: Date;
    therapistId?: string;
    status?: string;
  } = {}) {
    let query = this.supabase
      .from('appointments')
      .select(`
        *,
        patients (full_name, phone, email),
        profiles (full_name)
      `)
      .order('start_time', { ascending: true });

    if (filters.startDate) {
      query = query.gte('start_time', filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query = query.lte('start_time', filters.endDate.toISOString());
    }

    if (filters.therapistId) {
      query = query.eq('therapist_id', filters.therapistId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Appointment[];
  }

  async getAppointmentById(id: string) {
    const { data, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        patients (*),
        profiles (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Appointment;
  }

  async createAppointment(data: CreateAppointmentData) {
    // Verificar conflito de horário
    const conflict = await this.checkConflict(
      data.therapist_id,
      data.start_time,
      data.end_time
    );

    if (conflict) {
      throw new Error('Conflito de horário: já existe um agendamento neste período');
    }

    const { data: appointment, error } = await this.supabase
      .from('appointments')
      .insert({
        ...data,
        status: 'scheduled',
        duration_minutes: data.duration_minutes || 60,
      })
      .select(`
        *,
        patients (full_name, phone, email),
        profiles (full_name)
      `)
      .single();

    if (error) throw error;
    return appointment as Appointment;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>) {
    // Se estiver atualizando horário, verificar conflito
    if (updates.start_time && updates.end_time && updates.therapist_id) {
      const conflict = await this.checkConflict(
        updates.therapist_id,
        updates.start_time,
        updates.end_time,
        id
      );

      if (conflict) {
        throw new Error('Conflito de horário: já existe um agendamento neste período');
      }
    }

    const { data, error } = await this.supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        patients (full_name, phone, email),
        profiles (full_name)
      `)
      .single();

    if (error) throw error;
    return data as Appointment;
  }

  async deleteAppointment(id: string) {
    const { error } = await this.supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async checkConflict(
    therapistId: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<boolean> {
    let query = this.supabase
      .from('appointments')
      .select('id')
      .eq('therapist_id', therapistId)
      .in('status', ['scheduled', 'confirmed'])
      .or(`start_time.lt.${endTime},end_time.gt.${startTime}`);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data?.length || 0) > 0;
  }

  async confirmAppointment(id: string) {
    return this.updateAppointment(id, {
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    });
  }

  async cancelAppointment(id: string, reason?: string) {
    return this.updateAppointment(id, {
      status: 'canceled',
      notes: reason ? `${reason}\n\n${new Date().toLocaleString('pt-BR')}` : undefined,
    });
  }

  async markAsNoShow(id: string) {
    return this.updateAppointment(id, {
      status: 'no_show',
    });
  }

  async completeAppointment(id: string) {
    return this.updateAppointment(id, {
      status: 'completed',
    });
  }
}

export const appointmentService = new AppointmentService();

