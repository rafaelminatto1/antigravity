"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { prontuarioService, PhysicalExam } from "@/lib/services/prontuarioService";
import { toast } from "sonner";

interface PhysicalExamFormProps {
  patientId: string;
  sessionId?: string;
  initialData?: PhysicalExam | null;
  onSave?: (data: PhysicalExam) => void;
}

export function PhysicalExamForm({ patientId, sessionId, initialData, onSave }: PhysicalExamFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { register, handleSubmit, reset, watch, setValue, formState: { isDirty } } = useForm<Partial<PhysicalExam>>({
    defaultValues: {
      vital_signs: {},
      range_of_motion: {},
      muscle_strength: {},
      special_tests: {},
      ...initialData,
    },
  });

  const vitalSigns = watch("vital_signs") || {};

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmit = async (data: Partial<PhysicalExam>) => {
    try {
      setIsSaving(true);
      const saved = await prontuarioService.createOrUpdatePhysicalExam(patientId, data, sessionId);
      toast.success("Exame físico salvo com sucesso!");
      onSave?.(saved);
      reset(saved);
    } catch (error) {
      console.error("Erro ao salvar exame físico:", error);
      toast.error("Erro ao salvar exame físico");
    } finally {
      setIsSaving(false);
    }
  };

  const updateVitalSign = (key: string, value: string) => {
    setValue("vital_signs", {
      ...vitalSigns,
      [key]: value,
    }, { shouldDirty: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exame Físico</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Sinais Vitais */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <Label className="text-base font-semibold">Sinais Vitais</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="blood_pressure">PA (mmHg)</Label>
                <Input
                  id="blood_pressure"
                  placeholder="120/80"
                  value={vitalSigns.blood_pressure || ""}
                  onChange={(e) => updateVitalSign("blood_pressure", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heart_rate">FC (bpm)</Label>
                <Input
                  id="heart_rate"
                  placeholder="72"
                  value={vitalSigns.heart_rate || ""}
                  onChange={(e) => updateVitalSign("heart_rate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="respiratory_rate">FR (rpm)</Label>
                <Input
                  id="respiratory_rate"
                  placeholder="16"
                  value={vitalSigns.respiratory_rate || ""}
                  onChange={(e) => updateVitalSign("respiratory_rate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Temp (°C)</Label>
                <Input
                  id="temperature"
                  placeholder="36.5"
                  value={vitalSigns.temperature || ""}
                  onChange={(e) => updateVitalSign("temperature", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="general_appearance">Aspecto Geral</Label>
            <Textarea
              id="general_appearance"
              {...register("general_appearance")}
              placeholder="Estado geral, postura, marcha..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inspection">Inspeção</Label>
            <Textarea
              id="inspection"
              {...register("inspection")}
              placeholder="Observações visuais, assimetrias, deformidades..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="palpation">Palpação</Label>
            <Textarea
              id="palpation"
              {...register("palpation")}
              placeholder="Temperatura, sensibilidade, pontos dolorosos..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="range_of_motion">Amplitude de Movimento (ADM)</Label>
            <Textarea
              id="range_of_motion"
              {...register("range_of_motion")}
              placeholder='Ex: {"ombro_flexao": "0-180°", "ombro_abducao": "0-170°"}'
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Formato JSON: {"{"}"articulacao": "movimento"{"}"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="muscle_strength">Força Muscular</Label>
            <Textarea
              id="muscle_strength"
              {...register("muscle_strength")}
              placeholder='Ex: {"quadriceps": "5/5", "biceps": "4/5"}'
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Escala 0-5 (0 = paralisia, 5 = força normal)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_tests">Testes Especiais</Label>
            <Textarea
              id="special_tests"
              {...register("special_tests")}
              placeholder='Ex: {"Lasegue": "positivo", "Ortolani": "negativo"}'
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neurological_exam">Exame Neurológico</Label>
            <Textarea
              id="neurological_exam"
              {...register("neurological_exam")}
              placeholder="Reflexos, sensibilidade, coordenação..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="functional_tests">Testes Funcionais</Label>
            <Textarea
              id="functional_tests"
              {...register("functional_tests")}
              placeholder="Testes de funcionalidade, equilíbrio, coordenação..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              {...register("observations")}
              placeholder="Outras observações relevantes..."
              rows={4}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving || !isDirty}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar Exame Físico"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

