import { createClient } from "@/lib/supabase/client";

export interface Anamnesis {
  id: string;
  patient_id: string;
  org_id: string;
  chief_complaint?: string;
  history_of_present_illness?: string;
  past_medical_history?: string;
  medications?: string;
  allergies?: string;
  family_history?: string;
  social_history?: string;
  functional_assessment?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PhysicalExam {
  id: string;
  patient_id: string;
  org_id: string;
  session_id?: string;
  general_appearance?: string;
  vital_signs?: Record<string, any>;
  inspection?: string;
  palpation?: string;
  range_of_motion?: Record<string, any>;
  muscle_strength?: Record<string, any>;
  special_tests?: Record<string, any>;
  neurological_exam?: string;
  functional_tests?: string;
  observations?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalAttachment {
  id: string;
  patient_id: string;
  org_id: string;
  session_id?: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  description?: string;
  category?: 'exam' | 'image' | 'document' | 'other';
  uploaded_by?: string;
  created_at: string;
}

export class ProntuarioService {
  private supabase = createClient();

  // ========== ANAMNESE ==========
  
  async getAnamnesis(patientId: string): Promise<Anamnesis | null> {
    const { data, error } = await this.supabase
      .from('anamnesis')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Anamnesis | null;
  }

  async createOrUpdateAnamnesis(patientId: string, data: Partial<Anamnesis>): Promise<Anamnesis> {
    // Verificar se já existe
    const existing = await this.getAnamnesis(patientId);

    if (existing) {
      // Atualizar
      const { data: updated, error } = await this.supabase
        .from('anamnesis')
        .update(data)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return updated as Anamnesis;
    } else {
      // Criar novo
      const { data: { user } } = await this.supabase.auth.getUser();
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user?.id)
        .single();

      const { data: created, error } = await this.supabase
        .from('anamnesis')
        .insert({
          patient_id: patientId,
          org_id: profile?.org_id || '',
          created_by: user?.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return created as Anamnesis;
    }
  }

  // ========== EXAME FÍSICO ==========

  async getPhysicalExam(patientId: string, sessionId?: string): Promise<PhysicalExam | null> {
    let query = this.supabase
      .from('physical_exams')
      .select('*')
      .eq('patient_id', patientId);

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as PhysicalExam | null;
  }

  async getPhysicalExamsByPatient(patientId: string): Promise<PhysicalExam[]> {
    const { data, error } = await this.supabase
      .from('physical_exams')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as PhysicalExam[];
  }

  async createOrUpdatePhysicalExam(
    patientId: string,
    data: Partial<PhysicalExam>,
    sessionId?: string
  ): Promise<PhysicalExam> {
    const existing = sessionId 
      ? await this.getPhysicalExam(patientId, sessionId)
      : await this.getPhysicalExam(patientId);

    if (existing) {
      const { data: updated, error } = await this.supabase
        .from('physical_exams')
        .update(data)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return updated as PhysicalExam;
    } else {
      const { data: { user } } = await this.supabase.auth.getUser();
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user?.id)
        .single();

      const { data: created, error } = await this.supabase
        .from('physical_exams')
        .insert({
          patient_id: patientId,
          org_id: profile?.org_id || '',
          session_id: sessionId,
          created_by: user?.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return created as PhysicalExam;
    }
  }

  // ========== ANEXOS ==========

  async getAttachments(patientId: string, sessionId?: string): Promise<MedicalAttachment[]> {
    let query = this.supabase
      .from('medical_attachments')
      .select('*')
      .eq('patient_id', patientId);

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as MedicalAttachment[];
  }

  async uploadAttachment(
    patientId: string,
    file: File,
    metadata: {
      sessionId?: string;
      description?: string;
      category?: MedicalAttachment['category'];
    }
  ): Promise<MedicalAttachment> {
    const { data: { user } } = await this.supabase.auth.getUser();
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user?.id)
      .single();

    // Upload para Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${patientId}/${Date.now()}.${fileExt}`;
    const filePath = `medical-attachments/${fileName}`;

    const { error: uploadError } = await this.supabase.storage
      .from('medical-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Obter URL pública
    const { data: { publicUrl } } = this.supabase.storage
      .from('medical-attachments')
      .getPublicUrl(filePath);

    // Salvar metadata no banco
    const { data: attachment, error } = await this.supabase
      .from('medical_attachments')
      .insert({
        patient_id: patientId,
        org_id: profile?.org_id || '',
        session_id: metadata.sessionId,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        description: metadata.description,
        category: metadata.category || 'other',
        uploaded_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return attachment as MedicalAttachment;
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    // Buscar attachment para pegar file_url
    const { data: attachment, error: fetchError } = await this.supabase
      .from('medical_attachments')
      .select('file_url')
      .eq('id', attachmentId)
      .single();

    if (fetchError) throw fetchError;

    // Extrair path do storage
    const url = new URL(attachment.file_url);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf('medical-attachments')).join('/');

    // Deletar do storage
    await this.supabase.storage
      .from('medical-attachments')
      .remove([filePath]);

    // Deletar do banco
    const { error } = await this.supabase
      .from('medical_attachments')
      .delete()
      .eq('id', attachmentId);

    if (error) throw error;
  }
}

export const prontuarioService = new ProntuarioService();

