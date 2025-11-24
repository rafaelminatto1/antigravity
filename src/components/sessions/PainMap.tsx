"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBodyPainMap, useSaveBodyPainMap } from "@/lib/hooks/useSessions";
import { Trash2, RotateCcw, XCircle } from "lucide-react";
import { toast } from "sonner";

interface PainPoint {
  x: number;
  y: number;
  view: 'front' | 'back';
  intensity: number;
  notes?: string;
}

interface PainMapProps {
  sessionId: string;
  patientId: string;
}

export function PainMap({ sessionId, patientId }: PainMapProps) {
  const { data: painMap } = useBodyPainMap(sessionId);
  const saveMutation = useSaveBodyPainMap();
  
  const [points, setPoints] = useState<PainPoint[]>([]);
  const [selectedView, setSelectedView] = useState<'front' | 'back'>('front');
  const [selectedIntensity, setSelectedIntensity] = useState(5);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (painMap?.points) {
      setPoints(painMap.points as PainPoint[]);
    }
  }, [painMap]);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPoint: PainPoint = {
      x,
      y,
      view: selectedView,
      intensity: selectedIntensity,
    };

    setPoints([...points, newPoint]);
    savePoints([...points, newPoint]);
  };

  const savePoints = async (pointsToSave: PainPoint[]) => {
    try {
      await saveMutation.mutateAsync({
        sessionId,
        patientId,
        points: pointsToSave,
      });
    } catch (error) {
      console.error('Error saving pain map:', error);
    }
  };

  const removePoint = (index: number) => {
    const newPoints = points.filter((_, i) => i !== index);
    setPoints(newPoints);
    savePoints(newPoints);
  };

  const clearPoints = () => {
    setPoints([]);
    savePoints([]);
    toast.success('Mapa de dor limpo');
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 2) return '#22c55e'; // verde
    if (intensity <= 4) return '#eab308'; // amarelo
    if (intensity <= 6) return '#f97316'; // laranja
    if (intensity <= 8) return '#ef4444'; // vermelho
    return '#991b1b'; // vermelho escuro
  };

  const frontPoints = points.filter(p => p.view === 'front');
  const backPoints = points.filter(p => p.view === 'back');

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mapa de Dor</CardTitle>
          <Button variant="ghost" size="sm" onClick={clearPoints}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Intensidade da Dor</label>
          <div className="flex items-center gap-4">
            <Slider
              value={[selectedIntensity]}
              onValueChange={([value]) => setSelectedIntensity(value)}
              min={0}
              max={10}
              step={1}
              className="flex-1"
            />
            <Badge
              style={{ backgroundColor: getIntensityColor(selectedIntensity) }}
              className="text-white w-12 text-center"
            >
              {selectedIntensity}
            </Badge>
          </div>
        </div>

        {/* Visualização */}
        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as 'front' | 'back')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="front">Frente</TabsTrigger>
            <TabsTrigger value="back">Costas</TabsTrigger>
          </TabsList>

          <TabsContent value="front" className="mt-4">
            <div className="relative border rounded-lg overflow-hidden bg-muted/20">
              <svg
                ref={svgRef}
                viewBox="0 0 200 400"
                className="w-full h-auto cursor-crosshair"
                onClick={handleSvgClick}
              >
                {/* Silhueta frontal simplificada */}
                <ellipse cx="100" cy="50" rx="30" ry="40" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="70" y="90" width="60" height="120" rx="30" fill="none" stroke="currentColor" strokeWidth="2" />
                <ellipse cx="100" cy="210" rx="40" ry="60" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="60" y="270" width="80" height="120" rx="20" fill="none" stroke="currentColor" strokeWidth="2" />
                
                {/* Pontos de dor */}
                {frontPoints.map((point, index) => (
                  <g key={index}>
                    <circle
                      cx={`${point.x}%`}
                      cy={`${point.y}%`}
                      r="8"
                      fill={getIntensityColor(point.intensity)}
                      opacity="0.7"
                      stroke="white"
                      strokeWidth="2"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                    <text
                      x={`${point.x}%`}
                      y={`${point.y}%`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs font-bold fill-white pointer-events-none"
                    >
                      {point.intensity}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </TabsContent>

          <TabsContent value="back" className="mt-4">
            <div className="relative border rounded-lg overflow-hidden bg-muted/20">
              <svg
                ref={svgRef}
                viewBox="0 0 200 400"
                className="w-full h-auto cursor-crosshair"
                onClick={handleSvgClick}
              >
                {/* Silhueta de costas simplificada */}
                <ellipse cx="100" cy="50" rx="30" ry="40" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="70" y="90" width="60" height="120" rx="30" fill="none" stroke="currentColor" strokeWidth="2" />
                <ellipse cx="100" cy="210" rx="40" ry="60" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="60" y="270" width="80" height="120" rx="20" fill="none" stroke="currentColor" strokeWidth="2" />
                
                {/* Pontos de dor */}
                {backPoints.map((point, index) => (
                  <g key={index}>
                    <circle
                      cx={`${point.x}%`}
                      cy={`${point.y}%`}
                      r="8"
                      fill={getIntensityColor(point.intensity)}
                      opacity="0.7"
                      stroke="white"
                      strokeWidth="2"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                    <text
                      x={`${point.x}%`}
                      y={`${point.y}%`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs font-bold fill-white pointer-events-none"
                    >
                      {point.intensity}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </TabsContent>
        </Tabs>

        {/* Lista de pontos */}
        {points.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            <label className="text-sm font-medium">Pontos Adicionados</label>
            {points
              .filter(p => p.view === selectedView)
              .map((point, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getIntensityColor(point.intensity) }}
                    />
                    <span>Intensidade: {point.intensity}/10</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePoint(points.indexOf(point))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Clique no corpo para adicionar pontos de dor
        </p>
      </CardContent>
    </Card>
  );
}

