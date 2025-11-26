import { createClient } from '@/lib/supabase/client';

export interface Patient {
  id: string;
  user_id?: string;
  org_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  address?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medical_history?: Record<string, any>;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientData {
  full_name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  address?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medical_history?: Record<string, any>;
  status?: string;
}

export interface UpdatePatientData extends Partial<CreatePatientData> { }

export const patientService = {
  /**
   * Buscar todos os pacientes da organização
   */
  async getPatients(orgId?: string, filters?: {
    status?: string;
    search?: string;
  }) {
    const supabase = await createClient();

    let query = supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (orgId) {
      query = query.eq('org_id', orgId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,cpf.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar pacientes: ${error.message}`);
    }

    return data as Patient[];
  },

  /**
   * Buscar paciente por ID
   */
  async getPatientById(id: string): Promise<Patient | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      throw new Error(`Erro ao buscar paciente: ${error.message}`);
    }

    return data as Patient;
  },

  /**
   * Criar novo paciente
   */
  async createPatient(patientData: CreatePatientData): Promise<Patient> {
    const supabase = await createClient();

    // Obter usuário atual para pegar org_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Buscar profile para pegar org_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    const { data, error } = await supabase
      .from('patients')
      .insert({
        ...patientData,
        org_id: profile?.org_id,
        status: patientData.status || 'active',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar paciente: ${error.message}`);
    }

    return data as Patient;
  },

  /**
   * Atualizar paciente
   */
  async updatePatient(id: string, patientData: UpdatePatientData): Promise<Patient> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('patients')
      .update(patientData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar paciente: ${error.message}`);
    }

    return data as Patient;
  },

  /**
   * Deletar paciente (soft delete - atualiza status)
   */
  async deletePatient(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('patients')
      .update({ status: 'inactive' })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar paciente: ${error.message}`);
    }
  },

  /**
   * Buscar pacientes por termo de busca
   */
  async searchPatients(searchTerm: string, orgId?: string): Promise<Patient[]> {
    const supabase = await createClient();

    let query = supabase
      .from('patients')
      .select('*')
      .or(`full_name.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('full_name', { ascending: true })
      .limit(20);

    if (orgId) {
      query = query.eq('org_id', orgId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar pacientes: ${error.message}`);
    }

    return data as Patient[];
  },
};


