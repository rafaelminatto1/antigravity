import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentService, Appointment, CreateAppointmentData } from "@/lib/services/appointmentService";
import { toast } from "sonner";
import { getErrorMessage, errorMessages } from "@/lib/utils/error-messages";

export function useAppointments(filters: {
  startDate?: Date;
  endDate?: Date;
  therapistId?: string;
  status?: string;
} = {}) {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => appointmentService.getAppointments(filters),
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentService.getAppointmentById(id),
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentData) => appointmentService.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento criado com sucesso!');
    },
    onError: (error: Error) => {
      const message = getErrorMessage(error, { entity: "agendamento", action: "criar" });
      toast.error(message || errorMessages.appointment.create);
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Appointment> }) =>
      appointmentService.updateAppointment(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento atualizado com sucesso!');
    },
    onError: (error: Error) => {
      const message = getErrorMessage(error, { entity: "agendamento", action: "atualizar" });
      toast.error(message || errorMessages.appointment.update);
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentService.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento excluído com sucesso!');
    },
    onError: (error: Error) => {
      const message = getErrorMessage(error, { entity: "agendamento", action: "excluir" });
      toast.error(message || errorMessages.appointment.delete);
    },
  });
}

export function useConfirmAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentService.confirmAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento confirmado!');
    },
    onError: (error: Error) => {
      const message = getErrorMessage(error, { entity: "agendamento", action: "confirmar" });
      toast.error(message || errorMessages.appointment.confirm);
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      appointmentService.cancelAppointment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento cancelado');
    },
    onError: (error: Error) => {
      const message = getErrorMessage(error, { entity: "agendamento", action: "cancelar" });
      toast.error(message || errorMessages.appointment.cancel);
    },
  });
}

