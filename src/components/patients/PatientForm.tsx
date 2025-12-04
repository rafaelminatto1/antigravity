"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { maskCPF, unmaskCPF, validateCPF, maskPhone, unmaskPhone } from "@/lib/utils/masks";
import { patientService, CreatePatientData } from "@/lib/services/patientService";
import { toast } from "sonner";
import { getErrorMessage, errorMessages } from "@/lib/utils/error-messages";

const patientSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  cpf: z.string().optional().refine(
    (val) => !val || validateCPF(val),
    "CPF inválido"
  ),
  birth_date: z.string().optional(),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),
  medical_history: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  onSuccess?: () => void;
}

export function PatientForm({ open, onOpenChange, patientId, onSuccess }: PatientFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cpfValue, setCpfValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [emergencyPhoneValue, setEmergencyPhoneValue] = useState("");

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      cpf: "",
      birth_date: "",
      address: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: "",
      medical_history: "",
    },
  });

  // Carregar dados do paciente se estiver editando
  useEffect(() => {
    if (patientId && open) {
      const loadPatient = async () => {
        try {
          setIsLoading(true);
          const patient = await patientService.getPatientById(patientId);
          if (patient) {
            form.reset({
              full_name: patient.full_name || "",
              email: patient.email || "",
              phone: patient.phone ? maskPhone(patient.phone) : "",
              cpf: patient.cpf ? maskCPF(patient.cpf) : "",
              birth_date: patient.birth_date || "",
              address: patient.address || "",
              emergency_contact_name: patient.emergency_contact?.name || "",
              emergency_contact_phone: patient.emergency_contact?.phone ? maskPhone(patient.emergency_contact.phone) : "",
              emergency_contact_relationship: patient.emergency_contact?.relationship || "",
              medical_history: patient.medical_history?.notes || "",
            });
            setCpfValue(patient.cpf ? maskCPF(patient.cpf) : "");
            setPhoneValue(patient.phone ? maskPhone(patient.phone) : "");
            setEmergencyPhoneValue(patient.emergency_contact?.phone ? maskPhone(patient.emergency_contact.phone) : "");
          }
        } catch (error) {
          console.error("Erro ao carregar paciente:", error);
          const message = getErrorMessage(error, { entity: "paciente", action: "carregar" });
          toast.error(message || errorMessages.patient.load);
        } finally {
          setIsLoading(false);
        }
      };
      loadPatient();
    } else if (!patientId && open) {
      // Resetar formulário quando criar novo paciente
      form.reset({
        full_name: "",
        email: "",
        phone: "",
        cpf: "",
        birth_date: "",
        address: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_relationship: "",
        medical_history: "",
      });
      setCpfValue("");
      setPhoneValue("");
      setEmergencyPhoneValue("");
    }
  }, [patientId, open, form]);

  const onSubmit = async (values: PatientFormValues) => {
    setIsLoading(true);

    try {
      const patientData: CreatePatientData = {
        full_name: values.full_name,
        email: values.email || undefined,
        phone: unmaskPhone(values.phone || ""),
        cpf: unmaskCPF(values.cpf || ""),
        birth_date: values.birth_date || undefined,
        address: values.address || undefined,
        emergency_contact: values.emergency_contact_name
          ? {
              name: values.emergency_contact_name,
              phone: unmaskPhone(values.emergency_contact_phone || ""),
              relationship: values.emergency_contact_relationship || "",
            }
          : undefined,
        medical_history: values.medical_history
          ? { notes: values.medical_history }
          : undefined,
      };

      if (patientId) {
        await patientService.updatePatient(patientId, patientData);
        toast.success("Paciente atualizado com sucesso!");
      } else {
        await patientService.createPatient(patientData);
        toast.success("Paciente cadastrado com sucesso!");
      }

      form.reset();
      setCpfValue("");
      setPhoneValue("");
      setEmergencyPhoneValue("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);
      const action = patientId ? "atualizar" : "criar";
      const message = getErrorMessage(error, { entity: "paciente", action });
      toast.error(message || (patientId ? errorMessages.patient.update : errorMessages.patient.create));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto relative w-[95vw] sm:w-full animate-in fade-in zoom-in-95 duration-200">
        <LoadingOverlay isLoading={isLoading && !!patientId} text="Carregando dados do paciente..." />
        <DialogHeader>
          <DialogTitle>{patientId ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
          <DialogDescription>
            Preencha os dados do paciente. Campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Informações Básicas</h3>
              
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000-00"
                          value={cpfValue}
                          onChange={(e) => {
                            const masked = maskCPF(e.target.value);
                            setCpfValue(masked);
                            field.onChange(masked);
                          }}
                          maxLength={14}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="joao@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(00) 00000-0000"
                          value={phoneValue}
                          onChange={(e) => {
                            const masked = maskPhone(e.target.value);
                            setPhoneValue(masked);
                            field.onChange(masked);
                          }}
                          maxLength={15}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, número, bairro, cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contato de Emergência */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Contato de Emergência</h3>
              
              <FormField
                control={form.control}
                name="emergency_contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emergency_contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(00) 00000-0000"
                          value={emergencyPhoneValue}
                          onChange={(e) => {
                            const masked = maskPhone(e.target.value);
                            setEmergencyPhoneValue(masked);
                            field.onChange(masked);
                          }}
                          maxLength={15}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergency_contact_relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parentesco</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Cônjuge, Filho(a), etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Histórico Médico */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Histórico Médico</h3>
              
              <FormField
                control={form.control}
                name="medical_history"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Alergias, medicações, cirurgias anteriores, etc."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Informações relevantes sobre o histórico médico do paciente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <LoadingButton
                type="submit"
                isLoading={isLoading}
                loadingText={patientId ? "Atualizando..." : "Cadastrando..."}
              >
                {patientId ? "Atualizar" : "Cadastrar"}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


