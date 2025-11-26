"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichEditor } from "@/components/editor/rich-editor";
import { Session, sessionService } from "@/lib/services/sessionService";
import { Mic, Sparkles, Copy, Save } from "lucide-react";
import { PlanEditor } from "./PlanEditor";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SessionTimeline } from "./SessionTimeline";

interface SessionEvolutionFormProps {
  session: Session;
  onDataChange: (data: any) => void;
  patientId?: string;
}

export function SessionEvolutionForm({ session, onDataChange, patientId }: SessionEvolutionFormProps) {
  const [subjective, setSubjective] = useState(session.subjective || "");
  const [objective, setObjective] = useState(session.objective || "");
  const [assessment, setAssessment] = useState(session.assessment || "");
  const [plan, setPlan] = useState(session.plan || { categories: [] });
  const [painBefore, setPainBefore] = useState(session.pain_level_before ?? 5);
  const [painAfter, setPainAfter] = useState(session.pain_level_after ?? 5);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showReplicateDialog, setShowReplicateDialog] = useState(false);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<any>(null);

  // Auto-save a cada 30 segundos
  useEffect(() => {
    if (!session.id) return; // Só auto-save se a sessão já foi criada

    const data = {
      subjective,
      objective,
      assessment,
      plan,
      pain_level_before: painBefore,
      pain_level_after: painAfter,
    };

    // Verificar se houve mudanças
    const dataString = JSON.stringify(data);
    if (dataString === lastDataRef.current) return;
    lastDataRef.current = dataString;

    onDataChange(data);

    // Auto-save
    autoSaveIntervalRef.current = setInterval(async () => {
      if (!session.id) return;
      
      try {
        setIsAutoSaving(true);
        await sessionService.autoSaveSession(session.id, data);
        setLastSaved(new Date());
      } catch (error) {
        console.error("Erro no auto-save:", error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 30000); // 30 segundos

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [subjective, objective, assessment, plan, painBefore, painAfter, session.id, onDataChange]);

  const handleReplicateSession = (previousSession: Session) => {
    setSubjective(previousSession.subjective || "");
    setObjective(previousSession.objective || "");
    setAssessment(previousSession.assessment || "");
    setPlan(previousSession.plan || { categories: [] });
    setPainBefore(previousSession.pain_level_before ?? 5);
    setPainAfter(previousSession.pain_level_after ?? 5);
    setShowReplicateDialog(false);
    toast.success("Conduta anterior replicada!");
  };

  const handleAISuggestion = async (field: 'subjective' | 'objective' | 'assessment' | 'plan') => {
    // TODO: Implementar chamada para Edge Function de IA
    console.log('AI suggestion for', field);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Evolução SOAP</CardTitle>
          <div className="flex items-center gap-2">
            {isAutoSaving && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Save className="h-3 w-3 animate-pulse" />
                Salvando...
              </span>
            )}
            {lastSaved && !isAutoSaving && (
              <span className="text-xs text-muted-foreground">
                Salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {patientId && (
              <Dialog open={showReplicateDialog} onOpenChange={setShowReplicateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Copy className="mr-2 h-4 w-4" />
                    Replicar Conduta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Replicar Conduta Anterior</DialogTitle>
                    <DialogDescription>
                      Selecione uma sessão anterior para replicar a conduta
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[60vh] overflow-y-auto">
                    <SessionTimeline
                      patientId={patientId}
                      onSelectSession={handleReplicateSession}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
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

