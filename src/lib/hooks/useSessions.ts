import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionService, Session, CreateSessionData, BodyPainMap } from "@/lib/services/sessionService";
import { toast } from "sonner";

export function useSessionByAppointment(appointmentId: string) {
  return useQuery({
    queryKey: ['session', 'appointment', appointmentId],
    queryFn: () => sessionService.getSessionByAppointment(appointmentId),
    enabled: !!appointmentId,
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => sessionService.getSession(id),
    enabled: !!id,
  });
}

export function usePatientSessions(patientId: string) {
  return useQuery({
    queryKey: ['sessions', 'patient', patientId],
    queryFn: () => sessionService.getPatientSessions(patientId),
    enabled: !!patientId,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSessionData) => sessionService.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Sessão criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar sessão');
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Session> }) =>
      sessionService.updateSession(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar sessão');
    },
  });
}

export function useAutoSaveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Session> }) =>
      sessionService.autoSaveSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    // Não mostrar toast para auto-save
  });
}

export function useSaveBodyPainMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, patientId, points }: { sessionId: string; patientId: string; points: BodyPainMap['points'] }) =>
      sessionService.saveBodyPainMap(sessionId, patientId, points),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-pain-maps'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao salvar mapa de dor');
    },
  });
}

export function useBodyPainMap(sessionId: string) {
  return useQuery({
    queryKey: ['body-pain-map', sessionId],
    queryFn: () => sessionService.getBodyPainMap(sessionId),
    enabled: !!sessionId,
  });
}

export function usePatientPainMaps(patientId: string) {
  return useQuery({
    queryKey: ['body-pain-maps', 'patient', patientId],
    queryFn: () => sessionService.getPatientPainMaps(patientId),
    enabled: !!patientId,
  });
}

