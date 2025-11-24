"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface WaitlistEntry {
  id: string;
  patient_id: string;
  desired_date: string;
  desired_time: string;
  priority: 'urgent' | 'high' | 'normal';
  status: 'waiting' | 'notified' | 'accepted' | 'expired' | 'cancelled';
  expires_at: string;
  patients?: {
    full_name: string;
    phone?: string;
  };
}

const priorityConfig = {
  urgent: { label: 'Urgente', color: 'bg-red-500/10 text-red-500' },
  high: { label: 'Alta', color: 'bg-orange-500/10 text-orange-500' },
  normal: { label: 'Normal', color: 'bg-blue-500/10 text-blue-500' },
};

const statusConfig = {
  waiting: { label: 'Aguardando', color: 'bg-gray-500/10 text-gray-500', icon: Clock },
  notified: { label: 'Notificado', color: 'bg-yellow-500/10 text-yellow-500', icon: AlertCircle },
  accepted: { label: 'Aceito', color: 'bg-green-500/10 text-green-500', icon: CheckCircle2 },
  expired: { label: 'Expirado', color: 'bg-red-500/10 text-red-500', icon: AlertCircle },
  cancelled: { label: 'Cancelado', color: 'bg-gray-500/10 text-gray-500', icon: XCircle },
};

export function WaitlistManager() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<'urgent' | 'high' | 'normal'>('normal');
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: waitlist = [], isLoading } = useQuery({
    queryKey: ['waitlist'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('waitlist')
        .select(`
          *,
          patients (full_name, phone)
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as WaitlistEntry[];
    },
  });

  const addToWaitlistMutation = useMutation({
    mutationFn: async (data: {
      patient_id: string;
      desired_date: string;
      desired_time: string;
      priority: string;
    }) => {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2); // 2 horas de timeout

      const { data: entry, error } = await supabase
        .from('waitlist')
        .insert({
          ...data,
          status: 'waiting',
          expires_at: expiresAt.toISOString(),
        })
        .select(`
          *,
          patients (full_name, phone)
        `)
        .single();

      if (error) throw error;
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      toast.success('Paciente adicionado à lista de espera');
      setSelectedDate(undefined);
      setSelectedTime("");
      setSelectedPatientId("");
      setPatientSearch("");
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao adicionar à lista de espera');
    },
  });

  const handleAddToWaitlist = () => {
    if (!selectedPatientId || !selectedDate || !selectedTime) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    addToWaitlistMutation.mutate({
      patient_id: selectedPatientId,
      desired_date: format(selectedDate, 'yyyy-MM-dd'),
      desired_time: selectedTime,
      priority: selectedPriority,
    });
  };

  // Buscar pacientes
  const { data: patients = [] } = useQuery({
    queryKey: ['patients', patientSearch],
    queryFn: async () => {
      if (!patientSearch || patientSearch.length < 2) return [];

      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, phone')
        .ilike('full_name', `%${patientSearch}%`)
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: patientSearch.length >= 2,
  });

  const waitingEntries = waitlist.filter(e => e.status === 'waiting' || e.status === 'notified');
  const otherEntries = waitlist.filter(e => e.status !== 'waiting' && e.status !== 'notified');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar à Lista de Espera</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca de Paciente */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Paciente *</label>
            <Input
              placeholder="Buscar paciente..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
            />
            {patients.length > 0 && (
              <div className="border rounded-md max-h-48 overflow-y-auto">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => {
                      setSelectedPatientId(patient.id);
                      setPatientSearch(patient.full_name || "");
                    }}
                    className="p-2 hover:bg-muted cursor-pointer"
                  >
                    <div className="font-medium">{patient.full_name}</div>
                    {patient.phone && (
                      <div className="text-sm text-muted-foreground">{patient.phone}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Data Desejada */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Desejada *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={ptBR}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Horário Desejado */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Horário Desejado *</label>
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
          </div>

          {/* Prioridade */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Prioridade</label>
            <Select value={selectedPriority} onValueChange={(v: any) => setSelectedPriority(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAddToWaitlist}
            disabled={!selectedPatientId || !selectedDate || !selectedTime || addToWaitlistMutation.isPending}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar à Lista de Espera
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Espera */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Espera</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : waitingEntries.length === 0 && otherEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum paciente na lista de espera
            </div>
          ) : (
            <div className="space-y-4">
              {waitingEntries.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Aguardando</h3>
                  <div className="space-y-2">
                    {waitingEntries.map((entry) => {
                      const priority = priorityConfig[entry.priority];
                      const status = statusConfig[entry.status];
                      const StatusIcon = status.icon;
                      
                      return (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {entry.patients?.full_name || 'Paciente'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(entry.desired_date), "dd/MM/yyyy", { locale: ptBR })} às {entry.desired_time}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={priority.color}>
                              {priority.label}
                            </Badge>
                            <Badge className={status.color}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {status.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {otherEntries.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Outros</h3>
                  <div className="space-y-2">
                    {otherEntries.map((entry) => {
                      const status = statusConfig[entry.status];
                      const StatusIcon = status.icon;
                      
                      return (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 border rounded-lg opacity-60"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {entry.patients?.full_name || 'Paciente'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(entry.desired_date), "dd/MM/yyyy", { locale: ptBR })} às {entry.desired_time}
                            </div>
                          </div>
                          <Badge className={status.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

