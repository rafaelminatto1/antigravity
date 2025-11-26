"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SessionEvolutionForm } from "@/components/sessions/SessionEvolutionForm";
import { SessionHistory } from "@/components/sessions/SessionHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { patientService, Patient } from "@/lib/services/patientService";
import { sessionService, Session, CreateSessionData } from "@/lib/services/sessionService";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function EvolutionPage() {
    const params = useParams();
    const router = useRouter();
    const patientId = params.id as string;

    const [patient, setPatient] = useState<Patient | null>(null);
    const [isLoadingPatient, setIsLoadingPatient] = useState(true);
    const [currentSession, setCurrentSession] = useState<Partial<Session> | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Carregar dados do paciente
    useEffect(() => {
        async function loadPatient() {
            try {
                const data = await patientService.getPatientById(patientId);
                setPatient(data);
            } catch (error) {
                console.error("Erro ao carregar paciente:", error);
                toast.error("Erro ao carregar dados do paciente");
            } finally {
                setIsLoadingPatient(false);
            }
        }

        if (patientId) {
            loadPatient();
        }
    }, [patientId]);

    const handleNewSession = () => {
        const newSession: Partial<Session> = {
            patient_id: patientId,
            session_date: new Date().toISOString(),
            subjective: "",
            objective: "",
            assessment: "",
            plan: { categories: [] },
            pain_level_before: 5,
            pain_level_after: 5,
        };
        setCurrentSession(newSession);
        setIsCreating(true);
    };

    const handleSaveSession = async () => {
        if (!currentSession) return;

        try {
            setIsSaving(true);

            // Preparar dados para salvar
            const sessionData: CreateSessionData = {
                appointment_id: currentSession.appointment_id || "", // Pode ser vazio se for sessão avulsa
                patient_id: patientId,
                physiotherapist_id: "", // Será preenchido pelo backend/service com o usuário atual
                session_date: currentSession.session_date || new Date().toISOString(),
                subjective: currentSession.subjective,
                objective: currentSession.objective,
                assessment: currentSession.assessment,
                plan: currentSession.plan,
                pain_level_before: currentSession.pain_level_before,
                pain_level_after: currentSession.pain_level_after,
            };

            if (currentSession.id) {
                // Atualizar sessão existente
                await sessionService.updateSession(currentSession.id, sessionData);
                toast.success("Sessão atualizada com sucesso!");
            } else {
                // Criar nova sessão
                const created = await sessionService.createSession(sessionData);
                setCurrentSession(created);
                toast.success("Sessão criada com sucesso!");
            }

            setIsCreating(false);
            // Recarregar histórico (pode ser feito via invalidação de query se usar react-query, 
            // ou forçando update no componente filho se necessário, mas aqui o SessionHistory usa hook próprio)

        } catch (error) {
            console.error("Erro ao salvar sessão:", error);
            toast.error("Erro ao salvar sessão");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSessionDataChange = (data: any) => {
        setCurrentSession(prev => ({
            ...prev,
            ...data
        }));
    };

    if (isLoadingPatient) {
        return <div className="flex items-center justify-center h-full">Carregando...</div>;
    }

    if (!patient) {
        return <div className="flex items-center justify-center h-full">Paciente não encontrado</div>;
    }

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Evolução do Paciente</h1>
                        <p className="text-muted-foreground">
                            {patient.full_name} • {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {!isCreating ? (
                        <Button onClick={handleNewSession}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Sessão
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setIsCreating(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSaveSession} disabled={isSaving}>
                                <Save className="mr-2 h-4 w-4" />
                                {isSaving ? "Salvando..." : "Salvar Sessão"}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Coluna da Esquerda: Histórico */}
                <div className="lg:col-span-1 h-full min-h-0">
                    <SessionHistory
                        patientId={patientId}
                        currentSessionId={currentSession?.id || ""}
                    />
                </div>

                {/* Coluna da Direita: Formulário de Evolução */}
                <div className="lg:col-span-2 h-full min-h-0 overflow-y-auto pb-10">
                    {isCreating && currentSession ? (
                        <SessionEvolutionForm
                            session={currentSession as Session}
                            onDataChange={handleSessionDataChange}
                            patientId={patientId}
                        />
                    ) : (
                        <Card className="h-full flex items-center justify-center bg-muted/10 border-dashed">
                            <CardContent className="text-center py-10">
                                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <Plus className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Nova Evolução</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                                    Inicie uma nova sessão para registrar a evolução do paciente, ou selecione uma sessão anterior para visualizar.
                                </p>
                                <Button onClick={handleNewSession}>
                                    Iniciar Atendimento
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
