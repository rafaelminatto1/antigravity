import { createClient } from "@/lib/supabase/client";

export interface Exercise {
  id: string;
  org_id?: string;
  name: string;
  description?: string;
  video_url?: string;
  category?: string;
  difficulty?: number;
  equipment?: string;
  indications?: string;
  contraindications?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionExercise {
  exercise_id: string;
  name: string;
  series?: number;
  repetitions?: number;
  load?: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  org_id: string;
  created_by: string;
  exercises: PrescriptionExercise[];
  start_date?: string;
  end_date?: string;
  frequency_per_week?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ClinicalMaterial {
  id: string;
  name: string;
  category?: string;
  specialty?: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  description?: string;
  download_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export class LibraryService {
  private supabase = createClient();

  // ========== EXERCÍCIOS ==========

  async getExercises(orgId?: string, filters?: {
    category?: string;
    difficulty?: number;
    search?: string;
  }): Promise<Exercise[]> {
    let query = this.supabase
      .from('exercises')
      .select('*')
      .order('name', { ascending: true });

    if (orgId) {
      query = query.eq('org_id', orgId);
    } else {
      // Se não especificar org_id, buscar exercícios globais (org_id IS NULL) ou da organização do usuário
      const { data: { user } } = await this.supabase.auth.getUser();
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user?.id)
        .single();

      query = query.or(`org_id.is.null,org_id.eq.${profile?.org_id || ''}`);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Exercise[];
  }

  async createExercise(data: Partial<Exercise>): Promise<Exercise> {
    const { data: { user } } = await this.supabase.auth.getUser();
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user?.id)
      .single();

    const { data: created, error } = await this.supabase
      .from('exercises')
      .insert({
        org_id: profile?.org_id,
        created_by: user?.id,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return created as Exercise;
  }

  async updateExercise(id: string, updates: Partial<Exercise>): Promise<Exercise> {
    const { data, error } = await this.supabase
      .from('exercises')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Exercise;
  }

  async deleteExercise(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('exercises')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ========== PRESCRIÇÕES ==========

  async getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
    const { data, error } = await this.supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Prescription[];
  }

  async createPrescription(data: {
    patient_id: string;
    exercises: PrescriptionExercise[];
    start_date?: string;
    end_date?: string;
    frequency_per_week?: number;
    notes?: string;
  }): Promise<Prescription> {
    const { data: { user } } = await this.supabase.auth.getUser();
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user?.id)
      .single();

    const { data: created, error } = await this.supabase
      .from('prescriptions')
      .insert({
        org_id: profile?.org_id || '',
        created_by: user?.id || '',
        exercises: data.exercises,
        start_date: data.start_date,
        end_date: data.end_date,
        frequency_per_week: data.frequency_per_week || 3,
        notes: data.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return created as Prescription;
  }

  // ========== MATERIAIS CLÍNICOS ==========

  async getClinicalMaterials(filters?: {
    category?: string;
    specialty?: string;
    search?: string;
  }): Promise<ClinicalMaterial[]> {
    let query = this.supabase
      .from('clinical_materials')
      .select('*')
      .order('name', { ascending: true });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.specialty) {
      query = query.eq('specialty', filters.specialty);
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as ClinicalMaterial[];
  }

  async downloadMaterial(materialId: string): Promise<void> {
    // Incrementar contador de downloads
    const { data: material } = await this.supabase
      .from('clinical_materials')
      .select('download_count')
      .eq('id', materialId)
      .single();

    if (material) {
      await this.supabase
        .from('clinical_materials')
        .update({ download_count: (material.download_count || 0) + 1 })
        .eq('id', materialId);
    }
  }
}

export const libraryService = new LibraryService();

