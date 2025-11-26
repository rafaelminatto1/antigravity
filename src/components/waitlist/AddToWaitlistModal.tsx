"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { waitlistService, CreateWaitlistData, WaitlistPriority } from "@/lib/services/waitlistService";
import { patientService, Patient } from "@/lib/services/patientService";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

interface AddToWaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  onSuccess?: () => void;
}

export function AddToWaitlistModal({ open, onOpenChange, patientId, onSuccess }: AddToWaitlistModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [physiotherapists, setPhysiotherapists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateWaitlistData & { selectedDate?: Date }>({
    patient_id: patientId || '',
    priority: 'normal',
  });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const supabase = createClient();
      
      // Carregar pacientes
      const patientsData = await patientService.getPatients();
      setPatients(patientsData);

      // Carregar fisioterapeutas
      const { data: therapists } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'physiotherapist');

      setPhysiotherapists(therapists || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patient_id) {
      toast.error("Selecione um paciente");
      return;
    }

    try {
      setIsLoading(true);
      const data: CreateWaitlistData = {
        patient_id: formData.patient_id,
        physiotherapist_id: formData.physiotherapist_id,
        desired_date: formData.selectedDate ? format(formData.selectedDate, 'yyyy-MM-dd') : undefined,
        desired_time: formData.desired_time,
        priority: formData.priority || 'normal',
        notes: formData.notes,
      };

      await waitlistService.addToWaitlist(data);
      toast.success("Paciente adicionado à lista de espera!");
      onSuccess?.();
      onOpenChange(false);
      setFormData({
        patient_id: patientId || '',
        priority: 'normal',
      });
    } catch (error) {
      console.error("Erro ao adicionar à lista de espera:", error);
      toast.error("Erro ao adicionar à lista de espera");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar à Lista de Espera</DialogTitle>
          <DialogDescription>
            Adicione um paciente à lista de espera para ser notificado quando houver disponibilidade
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient">Paciente *</Label>
            <Select
              value={formData.patient_id}
              onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
              disabled={!!patientId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="physiotherapist">Fisioterapeuta Desejado (Opcional)</Label>
            <Select
              value={formData.physiotherapist_id || ''}
              onValueChange={(value) => setFormData({ ...formData, physiotherapist_id: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Qualquer fisioterapeuta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Qualquer fisioterapeuta</SelectItem>
                {physiotherapists.map((therapist) => (
                  <SelectItem key={therapist.id} value={therapist.id}>
                    {therapist.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="desired_date">Data Desejada (Opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.selectedDate ? (
                      format(formData.selectedDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.selectedDate}
                    onSelect={(date) => setFormData({ ...formData, selectedDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desired_time">Horário Desejado (Opcional)</Label>
              <Input
                id="desired_time"
                type="time"
                value={formData.desired_time || ''}
                onChange={(e) => setFormData({ ...formData, desired_time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select
              value={formData.priority || 'normal'}
              onValueChange={(value) => setFormData({ ...formData, priority: value as WaitlistPriority })}
            >
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

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações sobre a preferência do paciente..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adicionando..." : "Adicionar à Lista"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

