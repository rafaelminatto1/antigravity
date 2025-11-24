"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { SessionEvolutionForm } from "@/components/sessions/SessionEvolutionForm";
import { PainMap } from "@/components/sessions/PainMap";
import { SessionHistory } from "@/components/sessions/SessionHistory";
import { PatientSummary } from "@/components/sessions/PatientSummary";
import { SessionTests } from "@/components/sessions/SessionTests";
import { useSessionByAppointment, useAutoSaveSession } from "@/lib/hooks/useSessions";
import { Button } from "@/components/ui/button";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SessionEvolutionPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;
  
  const { data: session, isLoading } = useSessionByAppointment(appointmentId);
  const updateMutation = useAutoSaveSession();
  
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save a cada 30 segundos
  useEffect(() => {
    if (!session?.id || !formData) return;

    const interval = setInterval(() => {
      handleAutoSave();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [session?.id, formData]);

  const handleAutoSave = async () => {
    if (!session?.id || !formData) return;

    try {
      await updateMutation.mutateAsync({
        id: session.id,
        data: formData,
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const handleSave = async () => {
    if (!session?.id || !formData) {
      toast.error('Nenhum dado para salvar');
      return;
    }

    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({
        id: session.id,
        data: formData,
      });
      setLastSaved(new Date());
      toast.success('Sessão salva com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar sessão');
    } finally {
      setIsSaving(false);
    }
  };

  // Atalho de teclado Cmd/Ctrl + S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData, session?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <p className="text-muted-foreground">Sessão não encontrada</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.back()} variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Evolução de Sessão</h1>
            <p className="text-sm text-muted-foreground">
              {session.appointments?.patients?.full_name || 'Paciente'} • {new Date(session.session_date).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-sm text-muted-foreground">
              Salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || updateMutation.isPending}
            size="lg"
          >
            {(isSaving || updateMutation.isPending) ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar
          </Button>
        </div>
      </div>

      {/* Layout Principal - 4 Colunas no Desktop */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
        {/* Coluna 1: Formulário SOAP (30%) */}
        <div className="lg:col-span-4 space-y-4">
          <SessionEvolutionForm
            session={session}
            onDataChange={setFormData}
          />
        </div>

        {/* Coluna 2: Mapa de Dor (25%) */}
        <div className="lg:col-span-3 space-y-4">
          <PainMap
            sessionId={session.id}
            patientId={session.patient_id}
          />
        </div>

        {/* Coluna 3: Histórico (25%) */}
        <div className="lg:col-span-3 space-y-4">
          <SessionHistory
            patientId={session.patient_id}
            currentSessionId={session.id}
          />
        </div>

        {/* Coluna 4: Resumo e Testes (20%) */}
        <div className="lg:col-span-2 space-y-4">
          <PatientSummary
            patientId={session.patient_id}
            appointmentId={appointmentId}
          />
          <SessionTests
            sessionId={session.id}
            patientId={session.patient_id}
          />
        </div>
      </div>
    </div>
  );
}

