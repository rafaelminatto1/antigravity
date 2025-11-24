import { createClient } from "@/lib/supabase/client";

export interface Session {
  id: string;
  appointment_id: string;
  org_id: string;
  patient_id: string;
  physiotherapist_id: string;
  session_date: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: any; // JSONB
  pain_level_before?: number;
  pain_level_after?: number;
  auto_save_data?: any;
  ai_suggestions?: any;
  created_at: string;
  updated_at: string;
  appointments?: {
    patients?: {
      full_name: string;
    };
  };
}

export interface CreateSessionData {
  appointment_id: string;
  patient_id: string;
  physiotherapist_id: string;
  session_date: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: any;
  pain_level_before?: number;
  pain_level_after?: number;
}

export interface BodyPainMap {
  id: string;
  session_id: string;
  patient_id: string;
  points: Array<{
    x: number;
    y: number;
    view: 'front' | 'back';
    intensity: number;
    notes?: string;
  }>;
  created_at: string;
}

export class SessionService {
  private supabase = createClient();

  async getSessionByAppointment(appointmentId: string) {
    const { data, error } = await this.supabase
      .from('sessions')
      .select(`
        *,
        appointments (
          patients (full_name)
        )
      `)
      .eq('appointment_id', appointmentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Session | null;
  }

  async getSession(id: string) {
    const { data, error } = await this.supabase
      .from('sessions')
      .select(`
        *,
        appointments (
          patients (full_name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Session;
  }

  async getPatientSessions(patientId: string, limit = 10) {
    const { data, error } = await this.supabase
      .from('sessions')
      .select(`
        *,
        appointments (
          patients (full_name)
        )
      `)
      .eq('patient_id', patientId)
      .order('session_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Session[];
  }

  async createSession(data: CreateSessionData) {
    const { data: session, error } = await this.supabase
      .from('sessions')
      .insert({
        ...data,
        org_id: (await this.supabase.auth.getUser()).data.user?.id || '',
      })
      .select(`
        *,
        appointments (
          patients (full_name)
        )
      `)
      .single();

    if (error) throw error;
    return session as Session;
  }

  async updateSession(id: string, updates: Partial<Session>) {
    const { data, error } = await this.supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        appointments (
          patients (full_name)
        )
      `)
      .single();

    if (error) throw error;
    return data as Session;
  }

  async autoSaveSession(id: string, data: Partial<Session>) {
    return this.updateSession(id, {
      ...data,
      auto_save_data: data,
    });
  }

  async saveBodyPainMap(sessionId: string, patientId: string, points: BodyPainMap['points']) {
    // Verificar se já existe um mapa para esta sessão
    const { data: existing } = await this.supabase
      .from('body_pain_maps')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (existing) {
      const { data, error } = await this.supabase
        .from('body_pain_maps')
        .update({ points })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data as BodyPainMap;
    } else {
      const { data, error } = await this.supabase
        .from('body_pain_maps')
        .insert({
          session_id: sessionId,
          patient_id: patientId,
          points,
        })
        .select()
        .single();

      if (error) throw error;
      return data as BodyPainMap;
    }
  }

  async getBodyPainMap(sessionId: string) {
    const { data, error } = await this.supabase
      .from('body_pain_maps')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as BodyPainMap | null;
  }

  async getPatientPainMaps(patientId: string) {
    const { data, error } = await this.supabase
      .from('body_pain_maps')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as BodyPainMap[];
  }
}

export const sessionService = new SessionService();

