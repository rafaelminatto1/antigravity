"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, User, Copy } from "lucide-react";
import { sessionService, Session } from "@/lib/services/sessionService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface SessionTimelineProps {
  patientId: string;
  onSelectSession?: (session: Session) => void;
  onReplicateSession?: (session: Session) => void;
}

export function SessionTimeline({ patientId, onSelectSession, onReplicateSession }: SessionTimelineProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, [patientId]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const data = await sessionService.getPatientSessions(patientId, 50);
      setSessions(data);
    } catch (error) {
      console.error("Erro ao carregar sessões:", error);
      toast.error("Erro ao carregar histórico de sessões");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplicate = (session: Session) => {
    if (onReplicateSession) {
      onReplicateSession(session);
    } else {
      toast.info("Funcionalidade de replicação em desenvolvimento");
    }
  };

  const getPainLevelColor = (level?: number) => {
    if (!level) return "bg-muted";
    if (level <= 2) return "bg-green-500";
    if (level <= 5) return "bg-yellow-500";
    if (level <= 8) return "bg-orange-500";
    return "bg-red-500";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Evoluções</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Histórico de Evoluções</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma evolução registrada
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSessionId === session.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => {
                    setSelectedSessionId(session.id);
                    onSelectSession?.(session);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(session.session_date), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReplicate(session);
                      }}
                      title="Replicar conduta"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>

                  {session.pain_level_before !== undefined && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">EVA:</span>
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-3 h-3 rounded-full ${getPainLevelColor(session.pain_level_before)}`}
                          title={`Antes: ${session.pain_level_before}/10`}
                        />
                        <span className="text-xs">→</span>
                        <div
                          className={`w-3 h-3 rounded-full ${getPainLevelColor(session.pain_level_after)}`}
                          title={`Depois: ${session.pain_level_after || session.pain_level_before}/10`}
                        />
                        <span className="text-xs text-muted-foreground ml-1">
                          {session.pain_level_before} → {session.pain_level_after || session.pain_level_before}
                        </span>
                      </div>
                    </div>
                  )}

                  {session.subjective && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">S - Subjetivo</p>
                      <p className="text-sm line-clamp-2">{session.subjective}</p>
                    </div>
                  )}

                  {session.objective && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">O - Objetivo</p>
                      <p className="text-sm line-clamp-2">{session.objective}</p>
                    </div>
                  )}

                  {session.assessment && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">A - Avaliação</p>
                      <p className="text-sm line-clamp-2">{session.assessment}</p>
                    </div>
                  )}

                  {session.plan && typeof session.plan === 'object' && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">P - Plano</p>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray((session.plan as any).categories) &&
                          (session.plan as any).categories.slice(0, 3).map((cat: any, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {cat.name || cat}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                    {format(new Date(session.created_at), "HH:mm", { locale: ptBR })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

