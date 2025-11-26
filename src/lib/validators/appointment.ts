import { z } from 'zod'

/**
 * Schema de validação para agendamentos
 * Usado em formulários de criação e edição de agendamentos
 */
export const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Selecione um paciente'),
  therapist_id: z.string().min(1, 'Selecione um fisioterapeuta'),
  start_time: z.string().min(1, 'Data e hora são obrigatórias'),
  end_time: z.string().min(1, 'Data e hora de término são obrigatórias'),
  duration_minutes: z.number().min(15).max(240),
  notes: z.string().optional(),
})

export type AppointmentFormValues = z.infer<typeof appointmentSchema>

