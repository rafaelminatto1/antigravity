"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { User, Phone, Mail, Calendar, Target } from "lucide-react";
import { useRouter } from "next/navigation";

interface PatientSummaryProps {
  patientId: string;
  appointmentId: string;
}

export function PatientSummary({ patientId, appointmentId }: PatientSummaryProps) {
  const router = useRouter();
  const supabase = createClient();

  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });

  const { data: appointment } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!appointmentId,
  });

  if (!patient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do Paciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{patient.full_name}</span>
          </div>
          
          {patient.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              {patient.phone}
            </div>
          )}
          
          {patient.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {patient.email}
            </div>
          )}

          {patient.date_of_birth && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(patient.date_of_birth).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>

        {patient.diagnosis && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-1">Diagnóstico</div>
            <div className="text-sm text-muted-foreground">{patient.diagnosis}</div>
          </div>
        )}

        {patient.status && (
          <Badge
            variant={patient.status === 'active' ? 'default' : 'secondary'}
          >
            {patient.status === 'active' ? 'Ativo' : patient.status}
          </Badge>
        )}

        {appointment && (
          <div className="pt-4 border-t space-y-2">
            <div className="text-sm font-medium">Próximo Agendamento</div>
            <div className="text-sm text-muted-foreground">
              {new Date(appointment.start_time).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(`/patients/${patientId}`)}
        >
          Ver Prontuário Completo
        </Button>
      </CardContent>
    </Card>
  );
}

