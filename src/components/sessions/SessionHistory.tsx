"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePatientSessions } from "@/lib/hooks/useSessions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Calendar } from "lucide-react";

interface SessionHistoryProps {
  patientId: string;
  currentSessionId: string;
}

export function SessionHistory({ patientId, currentSessionId }: SessionHistoryProps) {
  const { data: sessions = [], isLoading } = usePatientSessions(patientId);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Histórico de Sessões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  const filteredSessions = sessions.filter(s => s.id !== currentSessionId);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Histórico de Sessões</CardTitle>
      </CardHeader>
      <CardContent>
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma sessão anterior</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(session.session_date), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    {session.pain_level_before !== undefined && session.pain_level_after !== undefined && (
                      <Badge variant="outline">
                        EVA: {session.pain_level_before} → {session.pain_level_after}
                      </Badge>
                    )}
                  </div>
                  
                  {session.subjective && (
                    <div className="text-sm text-muted-foreground mb-2">
                      <strong>S:</strong> {session.subjective.substring(0, 100)}
                      {session.subjective.length > 100 && '...'}
                    </div>
                  )}
                  
                  {session.assessment && (
                    <div className="text-sm text-muted-foreground">
                      <strong>A:</strong> {session.assessment.substring(0, 100)}
                      {session.assessment.length > 100 && '...'}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => {
                      // TODO: Abrir modal com detalhes completos
                      console.log('View session:', session.id);
                    }}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

