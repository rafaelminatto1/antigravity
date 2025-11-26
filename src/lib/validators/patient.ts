import { z } from 'zod'
import { validateCPF } from '@/lib/utils/masks'

/**
 * Schema de validação para pacientes
 * Usado em formulários de criação e edição de pacientes
 */
export const patientSchema = z.object({
  full_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  cpf: z.string().optional().refine(
    (val) => !val || validateCPF(val),
    'CPF inválido'
  ),
  birth_date: z.string().optional(),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),
  medical_history: z.string().optional(),
})

export type PatientFormValues = z.infer<typeof patientSchema>

