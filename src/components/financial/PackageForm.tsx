"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { financialService, CreatePackageData } from "@/lib/services/financialService";
import { patientService, Patient } from "@/lib/services/patientService";
import { toast } from "sonner";

interface PackageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  onSuccess?: () => void;
}

export function PackageForm({ open, onOpenChange, patientId, onSuccess }: PackageFormProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePackageData & { discount?: number; installments?: number }>({
    patient_id: patientId || '',
    total_sessions: 10,
    total_value: 0,
    payment_method: 'pix',
    payment_status: 'pending',
    installments: 1,
  });

  useEffect(() => {
    if (open) {
      loadPatients();
      calculateValue();
    }
  }, [open, formData.total_sessions]);

  const loadPatients = async () => {
    try {
      const data = await patientService.getPatients();
      setPatients(data);
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
    }
  };

  const calculateValue = () => {
    const sessionValue = 170; // Valor padrão por sessão
    const total = formData.total_sessions * sessionValue;
    const discount = formData.discount || 0;
    setFormData(prev => ({ ...prev, total_value: total - discount }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patient_id) {
      toast.error("Selecione um paciente");
      return;
    }

    try {
      setIsLoading(true);
      await financialService.createPackage(formData);
      toast.success("Pacote criado com sucesso!");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao criar pacote:", error);
      toast.error("Erro ao criar pacote");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Pacote</DialogTitle>
          <DialogDescription>
            Crie um novo pacote de sessões para o paciente
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_sessions">Número de Sessões *</Label>
              <Input
                id="total_sessions"
                type="number"
                min="1"
                value={formData.total_sessions}
                onChange={(e) => {
                  const sessions = parseInt(e.target.value) || 0;
                  setFormData({ ...formData, total_sessions: sessions });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Desconto (R$)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                value={formData.discount || 0}
                onChange={(e) => {
                  const discount = parseFloat(e.target.value) || 0;
                  setFormData({ ...formData, discount });
                  calculateValue();
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Valor Total</Label>
            <div className="text-2xl font-bold text-primary">
              R$ {formData.total_value.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-muted-foreground">
              {formData.total_sessions} sessões × R$ 170,00
              {formData.discount ? ` - R$ ${formData.discount.toFixed(2).replace('.', ',')} de desconto` : ''}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Forma de Pagamento</Label>
              <Select
                value={formData.payment_method || 'pix'}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                  <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="installments">Parcelas</Label>
              <Select
                value={String(formData.installments || 1)}
                onValueChange={(value) => setFormData({ ...formData, installments: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num}x {num === 1 ? '(À vista)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_status">Status do Pagamento</Label>
            <Select
              value={formData.payment_status || 'pending'}
              onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Pacote"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

