"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAppointment, useUpdateAppointment } from "@/lib/hooks/useAppointments";
import { Appointment } from "@/lib/services/appointmentService";
import { createClient } from "@/lib/supabase/client";
import { useDebounce } from "use-debounce";
import { Loader2, Search, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const appointmentSchema = z.object({
  patient_id: z.string().min(1, "Selecione um paciente"),
  therapist_id: z.string().min(1, "Selecione um fisioterapeuta"),
  start_time: z.string().min(1, "Data e hora são obrigatórias"),
  end_time: z.string().min(1, "Data e hora de término são obrigatórias"),
  duration_minutes: z.number().min(15).max(240),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
  selectedDate?: Date;
}

export function AppointmentModal({
  open,
  onOpenChange,
  appointment,
  selectedDate,
}: AppointmentModalProps) {
  const [patientSearch, setPatientSearch] = useState("");
  const [debouncedSearch] = useDebounce(patientSearch, 300);
  const [patients, setPatients] = useState<Array<{ id: string; full_name: string; phone?: string }>>([]);
  const [therapists, setTherapists] = useState<Array<{ id: string; full_name: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const supabase = createClient();

  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: "",
      therapist_id: "",
      start_time: selectedDate 
        ? format(selectedDate, "yyyy-MM-dd'T'HH:mm")
        : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      end_time: selectedDate
        ? format(new Date(selectedDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm")
        : format(new Date(Date.now() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
      duration_minutes: 60,
      notes: "",
    },
  });

  // Atualizar form quando appointment mudar
  useEffect(() => {
    if (appointment && open) {
      form.reset({
        patient_id: appointment.patient_id,
        therapist_id: appointment.therapist_id,
        start_time: format(new Date(appointment.start_time), "yyyy-MM-dd'T'HH:mm"),
        end_time: format(new Date(appointment.end_time), "yyyy-MM-dd'T'HH:mm"),
        duration_minutes: appointment.duration_minutes || 60,
        notes: appointment.notes || "",
      });
      setPatientSearch(appointment.patients?.full_name || "");
    } else if (!appointment && open) {
      form.reset({
        patient_id: "",
        therapist_id: "",
        start_time: selectedDate 
          ? format(selectedDate, "yyyy-MM-dd'T'HH:mm")
          : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        end_time: selectedDate
          ? format(new Date(selectedDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm")
          : format(new Date(Date.now() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
        duration_minutes: 60,
        notes: "",
      });
      setPatientSearch("");
    }
  }, [appointment, open, selectedDate, form]);

  // Buscar pacientes
  useEffect(() => {
    const searchPatients = async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setPatients([]);
        return;
      }

      setIsSearching(true);
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, phone')
        .ilike('full_name', `%${debouncedSearch}%`)
        .limit(10);

      if (!error && data) {
        setPatients(data);
      }
      setIsSearching(false);
    };

    searchPatients();
  }, [debouncedSearch, supabase]);

  // Buscar fisioterapeutas
  useEffect(() => {
    const fetchTherapists = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('role', ['physiotherapist', 'admin'])
        .order('full_name');

      if (!error && data) {
        setTherapists(data);
      }
    };

    fetchTherapists();
  }, [supabase]);

  // Atualizar end_time quando duration_minutes ou start_time mudar
  const duration = form.watch('duration_minutes');
  const startTime = form.watch('start_time');

  useEffect(() => {
    if (startTime && duration) {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + duration * 60 * 1000);
      form.setValue('end_time', format(end, "yyyy-MM-dd'T'HH:mm"));
    }
  }, [startTime, duration, form]);

  const onSubmit = async (values: AppointmentFormValues) => {
    try {
      if (appointment) {
        await updateMutation.mutateAsync({
          id: appointment.id,
          updates: values,
        });
      } else {
        await createMutation.mutateAsync(values);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const selectedPatient = patients.find(p => p.id === form.watch('patient_id'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
          <DialogDescription>
            {appointment 
              ? "Atualize as informações do agendamento"
              : "Preencha os dados para criar um novo agendamento"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Busca de Paciente */}
            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente *</FormLabel>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar paciente..."
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    {isSearching && (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                    {patients.length > 0 && (
                      <div className="border rounded-md max-h-48 overflow-y-auto">
                        {patients.map((patient) => (
                          <div
                            key={patient.id}
                            onClick={() => {
                              field.onChange(patient.id);
                              setPatientSearch(patient.full_name);
                              setPatients([]);
                            }}
                            className="p-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                          >
                            <div>
                              <div className="font-medium">{patient.full_name}</div>
                              {patient.phone && (
                                <div className="text-sm text-muted-foreground">{patient.phone}</div>
                              )}
                            </div>
                            {field.value === patient.id && (
                              <div className="text-primary">✓</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedPatient && (
                      <div className="p-2 bg-muted rounded-md">
                        <div className="font-medium">{selectedPatient.full_name}</div>
                        {selectedPatient.phone && (
                          <div className="text-sm text-muted-foreground">{selectedPatient.phone}</div>
                        )}
                      </div>
                    )}
                    {!selectedPatient && field.value && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Abrir modal de cadastro rápido
                          window.open('/patients?new=true', '_blank');
                        }}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Cadastrar novo paciente
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fisioterapeuta */}
            <FormField
              control={form.control}
              name="therapist_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fisioterapeuta *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o fisioterapeuta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {therapists.map((therapist) => (
                        <SelectItem key={therapist.id} value={therapist.id}>
                          {therapist.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data e Hora de Início */}
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data e Hora de Início *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duração */}
            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração (minutos) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={15}
                      max={240}
                      step={15}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Duração padrão: 60 minutos. Mínimo: 15 min, Máximo: 240 min
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data e Hora de Término (calculada automaticamente) */}
            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data e Hora de Término *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} readOnly />
                  </FormControl>
                  <FormDescription>
                    Calculado automaticamente com base na duração
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observações */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre o agendamento..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {appointment ? "Salvar Alterações" : "Criar Agendamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

