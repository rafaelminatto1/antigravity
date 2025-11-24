"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichEditor } from "@/components/editor/rich-editor";
import { Session } from "@/lib/services/sessionService";
import { Mic, Sparkles } from "lucide-react";
import { PlanEditor } from "./PlanEditor";

interface SessionEvolutionFormProps {
  session: Session;
  onDataChange: (data: any) => void;
}

export function SessionEvolutionForm({ session, onDataChange }: SessionEvolutionFormProps) {
  const [subjective, setSubjective] = useState(session.subjective || "");
  const [objective, setObjective] = useState(session.objective || "");
  const [assessment, setAssessment] = useState(session.assessment || "");
  const [plan, setPlan] = useState(session.plan || { categories: [] });
  const [painBefore, setPainBefore] = useState(session.pain_level_before ?? 5);
  const [painAfter, setPainAfter] = useState(session.pain_level_after ?? 5);

  useEffect(() => {
    const data = {
      subjective,
      objective,
      assessment,
      plan,
      pain_level_before: painBefore,
      pain_level_after: painAfter,
    };
    onDataChange(data);
  }, [subjective, objective, assessment, plan, painBefore, painAfter, onDataChange]);

  const handleAISuggestion = async (field: 'subjective' | 'objective' | 'assessment' | 'plan') => {
    // TODO: Implementar chamada para Edge Function de IA
    console.log('AI suggestion for', field);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Evolução SOAP</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* EVA - Escala Visual Analógica */}
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <Label className="text-base font-semibold">EVA - Escala Visual Analógica</Label>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="text-sm">Antes da Sessão</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[painBefore]}
                    onValueChange={([value]) => setPainBefore(value)}
                    min={0}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-lg font-bold w-8 text-center">{painBefore}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Após a Sessão</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[painAfter]}
                    onValueChange={([value]) => setPainAfter(value)}
                    min={0}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-lg font-bold w-8 text-center">{painAfter}</span>
                </div>
              </div>
            </div>
            {painBefore > painAfter && (
              <p className="text-sm text-green-600 mt-2">
                ✓ Melhora de {painBefore - painAfter} pontos na escala
              </p>
            )}
          </div>
        </div>

        <Tabs defaultValue="subjective" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="subjective">S</TabsTrigger>
            <TabsTrigger value="objective">O</TabsTrigger>
            <TabsTrigger value="assessment">A</TabsTrigger>
            <TabsTrigger value="plan">P</TabsTrigger>
          </TabsList>

          {/* S - Subjetivo */}
          <TabsContent value="subjective" className="space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Subjetivo</Label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAISuggestion('subjective')}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  IA
                </Button>
                <Button variant="ghost" size="sm">
                  <Mic className="h-4 w-4 mr-1" />
                  Áudio
                </Button>
              </div>
            </div>
            <RichEditor
              content={subjective || '<p>Relato do paciente sobre a queixa, sintomas, limitações funcionais...</p>'}
              onChange={setSubjective}
            />
            <p className="text-xs text-muted-foreground">
              Relato do paciente sobre sintomas, queixas e limitações funcionais
            </p>
          </TabsContent>

          {/* O - Objetivo */}
          <TabsContent value="objective" className="space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Objetivo</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAISuggestion('objective')}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                IA
              </Button>
            </div>
            <RichEditor
              content={objective || '<p>Avaliação objetiva: testes realizados, ADM, força muscular, palpação...</p>'}
              onChange={setObjective}
            />
            <p className="text-xs text-muted-foreground">
              Avaliação objetiva: testes, medidas, observações clínicas
            </p>
          </TabsContent>

          {/* A - Avaliação */}
          <TabsContent value="assessment" className="space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Avaliação</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAISuggestion('assessment')}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                IA
              </Button>
            </div>
            <RichEditor
              content={assessment || '<p>Análise e interpretação dos dados subjetivos e objetivos...</p>'}
              onChange={setAssessment}
            />
            <p className="text-xs text-muted-foreground">
              Análise e interpretação dos dados coletados
            </p>
          </TabsContent>

          {/* P - Plano */}
          <TabsContent value="plan" className="space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Plano</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAISuggestion('plan')}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                IA
              </Button>
            </div>
            <PlanEditor
              plan={plan}
              onChange={setPlan}
            />
            <p className="text-xs text-muted-foreground">
              Plano de tratamento estruturado por categorias
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

