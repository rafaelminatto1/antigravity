"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2 } from "lucide-react";
import { Prescription, PrescriptionExercise } from "@/lib/services/libraryService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PrescriptionViewProps {
  prescription: Prescription;
  onExport?: () => void;
}

export function PrescriptionView({ prescription, onExport }: PrescriptionViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Prescrição de Treino</CardTitle>
          <div className="flex gap-2">
            {prescription.start_date && (
              <Badge variant="outline">
                Início: {format(new Date(prescription.start_date), "dd/MM/yyyy", { locale: ptBR })}
              </Badge>
            )}
            {prescription.end_date && (
              <Badge variant="outline">
                Fim: {format(new Date(prescription.end_date), "dd/MM/yyyy", { locale: ptBR })}
              </Badge>
            )}
            {prescription.frequency_per_week && (
              <Badge variant="secondary">
                {prescription.frequency_per_week}x/semana
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {prescription.exercises && prescription.exercises.length > 0 ? (
          <div className="space-y-4">
            {prescription.exercises.map((exercise: PrescriptionExercise, index: number) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{exercise.name}</h4>
                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                      {exercise.series && (
                        <span>Séries: {exercise.series}</span>
                      )}
                      {exercise.repetitions && (
                        <span>Repetições: {exercise.repetitions}</span>
                      )}
                      {exercise.load && (
                        <span>Carga: {exercise.load}</span>
                      )}
                    </div>
                    {exercise.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{exercise.notes}</p>
                    )}
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum exercício prescrito
          </div>
        )}

        {prescription.notes && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Observações</h4>
            <p className="text-sm text-muted-foreground">{prescription.notes}</p>
          </div>
        )}

        {onExport && (
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

