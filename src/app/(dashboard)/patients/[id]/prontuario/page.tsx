"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import { patientService, Patient } from "@/lib/services/patientService";
import { prontuarioService, Anamnesis, PhysicalExam } from "@/lib/services/prontuarioService";
import { AnamnesisForm } from "@/components/sessions/AnamnesisForm";
import { PhysicalExamForm } from "@/components/sessions/PhysicalExamForm";
import { AttachmentManager } from "@/components/sessions/AttachmentManager";
import { SessionTimeline } from "@/components/sessions/SessionTimeline";
import { toast } from "sonner";

export default function ProntuarioPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [anamnesis, setAnamnesis] = useState<Anamnesis | null>(null);
  const [physicalExam, setPhysicalExam] = useState<PhysicalExam | null>(null);
  const [activeTab, setActiveTab] = useState("anamnese");

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [patientData, anamnesisData, physicalExamData] = await Promise.all([
        patientService.getPatientById(patientId),
        prontuarioService.getAnamnesis(patientId),
        prontuarioService.getPhysicalExam(patientId),
      ]);

      setPatient(patientData);
      setAnamnesis(anamnesisData);
      setPhysicalExam(physicalExamData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar prontuário");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnamnesisSave = (data: Anamnesis) => {
    setAnamnesis(data);
  };

  const handlePhysicalExamSave = (data: PhysicalExam) => {
    setPhysicalExam(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Carregando prontuário...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Paciente não encontrado</div>
      </div>
    );
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
            <h1 className="text-2xl font-bold tracking-tight">Prontuário Eletrônico</h1>
            <p className="text-muted-foreground">
              {patient.full_name} • {patient.status === 'active' ? 'Ativo' : 'Inativo'}
            </p>
          </div>
        </div>
        <Button onClick={() => router.push(`/patients/${patientId}/evolution`)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Evolução
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
          <TabsTrigger value="exame-fisico">Exame Físico</TabsTrigger>
          <TabsTrigger value="evolucoes">Evoluções</TabsTrigger>
          <TabsTrigger value="anexos">Anexos</TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 mt-6">
          <TabsContent value="anamnese" className="h-full m-0">
            <div className="h-full overflow-y-auto">
              <AnamnesisForm
                patientId={patientId}
                initialData={anamnesis}
                onSave={handleAnamnesisSave}
              />
            </div>
          </TabsContent>

          <TabsContent value="exame-fisico" className="h-full m-0">
            <div className="h-full overflow-y-auto">
              <PhysicalExamForm
                patientId={patientId}
                initialData={physicalExam}
                onSave={handlePhysicalExamSave}
              />
            </div>
          </TabsContent>

          <TabsContent value="evolucoes" className="h-full m-0">
            <div className="h-full">
              <SessionTimeline
                patientId={patientId}
                onSelectSession={(session) => {
                  router.push(`/sessions/${session.appointment_id}/evolution`);
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="anexos" className="h-full m-0">
            <div className="h-full overflow-y-auto">
              <AttachmentManager patientId={patientId} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

