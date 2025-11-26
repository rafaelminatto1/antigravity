"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { prontuarioService, Anamnesis } from "@/lib/services/prontuarioService";
import { toast } from "sonner";

interface AnamnesisFormProps {
  patientId: string;
  initialData?: Anamnesis | null;
  onSave?: (data: Anamnesis) => void;
}

export function AnamnesisForm({ patientId, initialData, onSave }: AnamnesisFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<Partial<Anamnesis>>({
    defaultValues: initialData || {},
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmit = async (data: Partial<Anamnesis>) => {
    try {
      setIsSaving(true);
      const saved = await prontuarioService.createOrUpdateAnamnesis(patientId, data);
      toast.success("Anamnese salva com sucesso!");
      onSave?.(saved);
      reset(saved);
    } catch (error) {
      console.error("Erro ao salvar anamnese:", error);
      toast.error("Erro ao salvar anamnese");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anamnese</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="chief_complaint">Queixa Principal</Label>
            <Textarea
              id="chief_complaint"
              {...register("chief_complaint")}
              placeholder="Descreva a queixa principal do paciente..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="history_of_present_illness">História da Doença Atual (HDA)</Label>
            <Textarea
              id="history_of_present_illness"
              {...register("history_of_present_illness")}
              placeholder="Descreva o histórico da doença atual..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="past_medical_history">História Patológica Pregressa (HPP)</Label>
            <Textarea
              id="past_medical_history"
              {...register("past_medical_history")}
              placeholder="Doenças anteriores, cirurgias, traumas..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medications">Medicações em Uso</Label>
            <Textarea
              id="medications"
              {...register("medications")}
              placeholder="Liste as medicações que o paciente utiliza..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Alergias</Label>
            <Textarea
              id="allergies"
              {...register("allergies")}
              placeholder="Alergias conhecidas (medicamentos, alimentos, etc.)..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="family_history">História Familiar</Label>
            <Textarea
              id="family_history"
              {...register("family_history")}
              placeholder="Doenças hereditárias ou comuns na família..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_history">História Social</Label>
            <Textarea
              id="social_history"
              {...register("social_history")}
              placeholder="Profissão, atividades físicas, hábitos de vida..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="functional_assessment">Avaliação Funcional</Label>
            <Textarea
              id="functional_assessment"
              {...register("functional_assessment")}
              placeholder="Limitações funcionais, atividades de vida diária (AVD)..."
              rows={4}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving || !isDirty}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar Anamnese"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

