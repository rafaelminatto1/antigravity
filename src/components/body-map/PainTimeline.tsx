"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { sessionService, BodyPainMap } from "@/lib/services/sessionService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PainTimelineProps {
  patientId: string;
  currentSessionId?: string;
  onSelectMap?: (map: BodyPainMap) => void;
}

export function PainTimeline({ patientId, currentSessionId, onSelectMap }: PainTimelineProps) {
  const [maps, setMaps] = useState<BodyPainMap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMaps, setSelectedMaps] = useState<string[]>([]);

  useEffect(() => {
    loadMaps();
  }, [patientId]);

  const loadMaps = async () => {
    try {
      setIsLoading(true);
      const data = await sessionService.getPatientPainMaps(patientId);
      setMaps(data);
    } catch (error) {
      console.error("Erro ao carregar mapas de dor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAveragePain = (points: any[]) => {
    if (!points || points.length === 0) return 0;
    const sum = points.reduce((acc, p) => acc + (p.intensity || 0), 0);
    return (sum / points.length).toFixed(1);
  };

  const toggleMapSelection = (mapId: string) => {
    setSelectedMaps(prev =>
      prev.includes(mapId)
        ? prev.filter(id => id !== mapId)
        : [...prev, mapId].slice(-2) // Máximo 2 mapas selecionados
    );
  };

  const chartData = maps.map(map => ({
    date: format(new Date(map.created_at), "dd/MM", { locale: ptBR }),
    average: parseFloat(calculateAveragePain(map.points as any[])),
  }));

  const getPainTrend = (index: number) => {
    if (index === 0) return null;
    const current = parseFloat(calculateAveragePain(maps[index].points as any[]));
    const previous = parseFloat(calculateAveragePain(maps[index - 1].points as any[]));
    const diff = current - previous;
    
    if (Math.abs(diff) < 0.5) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (diff < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <TrendingUp className="h-4 w-4 text-red-500" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução da Dor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  if (maps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução da Dor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhum mapa de dor registrado
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Gráfico de evolução */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Dor Média</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#5034FF"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Lista de mapas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Mapas</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {maps.map((map, index) => {
                const average = calculateAveragePain(map.points as any[]);
                const isSelected = selectedMaps.includes(map.id);
                const isCurrent = map.session_id === currentSessionId;

                return (
                  <div
                    key={map.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : isCurrent
                        ? "border-green-500 bg-green-500/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      toggleMapSelection(map.id);
                      onSelectMap?.(map);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(map.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-xs">Atual</Badge>
                        )}
                        {isSelected && (
                          <Badge variant="default" className="text-xs">Selecionado</Badge>
                        )}
                      </div>
                      {index > 0 && getPainTrend(index)}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Pontos: </span>
                        <span className="font-medium">{(map.points as any[]).length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Média: </span>
                        <span className="font-medium">{average}/10</span>
                      </div>
                    </div>

                    {/* Visualização dos pontos */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(map.points as any[]).slice(0, 10).map((point: any, idx: number) => (
                        <div
                          key={idx}
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              point.intensity <= 2
                                ? "#22c55e"
                                : point.intensity <= 5
                                ? "#f59e0b"
                                : point.intensity <= 8
                                ? "#f97316"
                                : "#ef4444",
                          }}
                          title={`Intensidade: ${point.intensity}/10`}
                        />
                      ))}
                      {(map.points as any[]).length > 10 && (
                        <span className="text-xs text-muted-foreground">
                          +{(map.points as any[]).length - 10}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Comparação de mapas selecionados */}
      {selectedMaps.length === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {selectedMaps.map((mapId) => {
                const map = maps.find(m => m.id === mapId);
                if (!map) return null;

                return (
                  <div key={mapId} className="space-y-2">
                    <div className="text-sm font-medium">
                      {format(new Date(map.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Pontos: {(map.points as any[]).length} • Média: {calculateAveragePain(map.points as any[])}/10
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

