import { createClient } from "@/lib/supabase/client";

export interface Package {
  id: string;
  org_id: string;
  patient_id: string;
  total_sessions: number;
  used_sessions: number;
  total_value: number;
  payment_method?: string;
  payment_status: string;
  installments?: number;
  created_at: string;
  updated_at: string;
  patients?: {
    full_name: string;
  };
}

export interface Transaction {
  id: string;
  org_id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  payment_method?: string;
  description?: string;
  patient_id?: string;
  package_id?: string;
  transaction_date: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  patients?: {
    full_name: string;
  };
}

export interface CreatePackageData {
  patient_id: string;
  total_sessions: number;
  total_value: number;
  payment_method?: string;
  payment_status?: string;
  installments?: number;
}

export interface CreateTransactionData {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  payment_method?: string;
  description?: string;
  patient_id?: string;
  package_id?: string;
  transaction_date?: string;
}

export interface FinancialSummary {
  revenue: number;
  expenses: number;
  profit: number;
  overdue: number;
  period: {
    start: string;
    end: string;
  };
}

export class FinancialService {
  private supabase = createClient();

  // ========== PACOTES ==========

  async getPackages(orgId?: string, filters?: {
    patientId?: string;
    status?: string;
  }): Promise<Package[]> {
    let query = this.supabase
      .from('packages')
      .select(`
        *,
        patients:patient_id (
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (orgId) {
      query = query.eq('org_id', orgId);
    }

    if (filters?.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }

    if (filters?.status) {
      query = query.eq('payment_status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Package[];
  }

  async getPackage(id: string): Promise<Package | null> {
    const { data, error } = await this.supabase
      .from('packages')
      .select(`
        *,
        patients:patient_id (
          full_name
        )
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Package | null;
  }

  async createPackage(data: CreatePackageData): Promise<Package> {
    const { data: { user } } = await this.supabase.auth.getUser();
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user?.id)
      .single();

    const { data: created, error } = await this.supabase
      .from('packages')
      .insert({
        org_id: profile?.org_id || '',
        patient_id: data.patient_id,
        total_sessions: data.total_sessions,
        used_sessions: 0,
        total_value: data.total_value,
        payment_method: data.payment_method,
        payment_status: data.payment_status || 'pending',
        installments: data.installments || 1,
      })
      .select(`
        *,
        patients:patient_id (
          full_name
        )
      `)
      .single();

    if (error) throw error;

    // Criar transação de receita se pago
    if (data.payment_status === 'paid') {
      await this.createTransaction({
        type: 'income',
        category: 'package_sale',
        amount: data.total_value,
        payment_method: data.payment_method,
        description: `Pacote de ${data.total_sessions} sessões`,
        patient_id: data.patient_id,
        package_id: created.id,
        transaction_date: new Date().toISOString().split('T')[0],
      });
    }

    return created as Package;
  }

  async updatePackage(id: string, updates: Partial<Package>): Promise<Package> {
    const { data, error } = await this.supabase
      .from('packages')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        patients:patient_id (
          full_name
        )
      `)
      .single();

    if (error) throw error;
    return data as Package;
  }

  async consumeSession(packageId: string): Promise<Package> {
    const packageData = await this.getPackage(packageId);
    if (!packageData) throw new Error('Pacote não encontrado');

    if (packageData.used_sessions >= packageData.total_sessions) {
      throw new Error('Pacote esgotado');
    }

    return this.updatePackage(packageId, {
      used_sessions: packageData.used_sessions + 1,
    });
  }

  // ========== TRANSAÇÕES ==========

  async getTransactions(orgId?: string, filters?: {
    type?: 'income' | 'expense';
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> {
    let query = this.supabase
      .from('transactions')
      .select(`
        *,
        patients:patient_id (
          full_name
        )
      `)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (orgId) {
      query = query.eq('org_id', orgId);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.startDate) {
      query = query.gte('transaction_date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('transaction_date', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Transaction[];
  }

  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    const { data: { user } } = await this.supabase.auth.getUser();
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user?.id)
      .single();

    const { data: created, error } = await this.supabase
      .from('transactions')
      .insert({
        org_id: profile?.org_id || '',
        type: data.type,
        category: data.category,
        amount: data.amount,
        payment_method: data.payment_method,
        description: data.description,
        patient_id: data.patient_id,
        package_id: data.package_id,
        transaction_date: data.transaction_date || new Date().toISOString().split('T')[0],
        created_by: user?.id,
      })
      .select(`
        *,
        patients:patient_id (
          full_name
        )
      `)
      .single();

    if (error) throw error;
    return created as Transaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await this.supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        patients:patient_id (
          full_name
        )
      `)
      .single();

    if (error) throw error;
    return data as Transaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ========== RESUMOS E RELATÓRIOS ==========

  async getFinancialSummary(orgId?: string, period?: {
    start: string;
    end: string;
  }): Promise<FinancialSummary> {
    const startDate = period?.start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const endDate = period?.end || new Date().toISOString().split('T')[0];

    const transactions = await this.getTransactions(orgId, {
      startDate,
      endDate,
    });

    const revenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const profit = revenue - expenses;

    // Calcular inadimplência (pacotes pendentes)
    const packages = await this.getPackages(orgId, { status: 'pending' });
    const overdue = packages.reduce((sum, p) => sum + Number(p.total_value), 0);

    return {
      revenue,
      expenses,
      profit,
      overdue,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }
}

export const financialService = new FinancialService();

