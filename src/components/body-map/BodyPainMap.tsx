"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";
import { sessionService, BodyPainMap } from "@/lib/services/sessionService";
import { toast } from "sonner";

interface PainPoint {
  x: number;
  y: number;
  view: 'front' | 'back';
  intensity: number;
  notes?: string;
}

interface BodyPainMapComponentProps {
  sessionId: string;
  patientId: string;
  onSave?: (points: PainPoint[]) => void;
}

export function BodyPainMapComponent({ sessionId, patientId, onSave }: BodyPainMapComponentProps) {
  const [points, setPoints] = useState<PainPoint[]>([]);
  const [selectedView, setSelectedView] = useState<'front' | 'back'>('front');
  const [selectedIntensity, setSelectedIntensity] = useState(5);
  const [selectedPoint, setSelectedPoint] = useState<PainPoint | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPainMap();
  }, [sessionId]);

  const loadPainMap = async () => {
    try {
      const painMap = await sessionService.getBodyPainMap(sessionId);
      if (painMap?.points) {
        setPoints(painMap.points as PainPoint[]);
      }
    } catch (error) {
      console.error("Erro ao carregar mapa de dor:", error);
    }
  };

  const savePoints = async (pointsToSave: PainPoint[]) => {
    try {
      await sessionService.saveBodyPainMap(sessionId, patientId, pointsToSave);
      onSave?.(pointsToSave);
    } catch (error) {
      console.error("Erro ao salvar mapa de dor:", error);
      toast.error("Erro ao salvar mapa de dor");
    }
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || isDragging) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left - pan.x) / zoom / rect.width) * 100;
    const y = ((e.clientY - rect.top - pan.y) / zoom / rect.height) * 100;

    // Verificar se clicou em um ponto existente
    const clickedPoint = points.find(p => {
      const pointX = (p.x / 100) * rect.width * zoom + pan.x;
      const pointY = (p.y / 100) * rect.height * zoom + pan.y;
      const distance = Math.sqrt(
        Math.pow(e.clientX - (rect.left + pointX), 2) +
        Math.pow(e.clientY - (rect.top + pointY), 2)
      );
      return distance < 20;
    });

    if (clickedPoint) {
      setSelectedPoint(clickedPoint);
      return;
    }

    const newPoint: PainPoint = {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
      view: selectedView,
      intensity: selectedIntensity,
    };

    const updatedPoints = [...points, newPoint];
    setPoints(updatedPoints);
    savePoints(updatedPoints);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Botão esquerdo
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(Math.max(0.5, Math.min(3, zoom * delta)));
  };

  const removePoint = (pointToRemove: PainPoint) => {
    const updatedPoints = points.filter(p => p !== pointToRemove);
    setPoints(updatedPoints);
    savePoints(updatedPoints);
    setSelectedPoint(null);
  };

  const updatePoint = (pointToUpdate: PainPoint, updates: Partial<PainPoint>) => {
    const updatedPoints = points.map(p =>
      p === pointToUpdate ? { ...p, ...updates } : p
    );
    setPoints(updatedPoints);
    savePoints(updatedPoints);
    setSelectedPoint(null);
  };

  const clearPoints = () => {
    const filteredPoints = points.filter(p => p.view !== selectedView);
    setPoints(filteredPoints);
    savePoints(filteredPoints);
    toast.success('Pontos removidos');
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 2) return '#22c55e'; // verde
    if (intensity <= 5) return '#f59e0b'; // amarelo
    if (intensity <= 8) return '#f97316'; // laranja
    return '#ef4444'; // vermelho
  };

  const frontPoints = points.filter(p => p.view === 'front');
  const backPoints = points.filter(p => p.view === 'back');
  const currentPoints = selectedView === 'front' ? frontPoints : backPoints;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mapa de Dor Corporal</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={resetView} title="Resetar zoom">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} title="Diminuir zoom">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(3, zoom + 0.1))} title="Aumentar zoom">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={clearPoints}>
              Limpar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
        {/* Controles */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Intensidade da Dor (0-10)</label>
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
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>0-2</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>3-5</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>6-8</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>9-10</span>
            </div>
          </div>
        </div>

        {/* Visualização */}
        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as 'front' | 'back')} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="front">Frente</TabsTrigger>
            <TabsTrigger value="back">Costas</TabsTrigger>
          </TabsList>

          <TabsContent value="front" className="flex-1 min-h-0 mt-4">
            <div
              ref={containerRef}
              className="relative border rounded-lg overflow-hidden bg-muted/20 h-full cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <svg
                ref={svgRef}
                viewBox="0 0 200 400"
                className="w-full h-full"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'top left',
                }}
                onClick={handleSvgClick}
              >
                {/* Silhueta frontal mais detalhada */}
                <g stroke="currentColor" strokeWidth="2" fill="none">
                  {/* Cabeça */}
                  <ellipse cx="100" cy="50" rx="30" ry="40" />
                  {/* Tronco */}
                  <rect x="70" y="90" width="60" height="120" rx="30" />
                  {/* Quadril */}
                  <ellipse cx="100" cy="210" rx="40" ry="60" />
                  {/* Pernas */}
                  <rect x="60" y="270" width="80" height="120" rx="20" />
                  {/* Braços */}
                  <line x1="70" y1="120" x2="40" y2="180" strokeWidth="3" />
                  <line x1="130" y1="120" x2="160" y2="180" strokeWidth="3" />
                  <circle cx="40" cy="180" r="8" />
                  <circle cx="160" cy="180" r="8" />
                </g>
                
                {/* Pontos de dor */}
                {frontPoints.map((point, index) => (
                  <g key={index}>
                    <circle
                      cx={`${point.x}%`}
                      cy={`${point.y}%`}
                      r="10"
                      fill={getIntensityColor(point.intensity)}
                      opacity="0.8"
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPoint(point);
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

          <TabsContent value="back" className="flex-1 min-h-0 mt-4">
            <div
              ref={containerRef}
              className="relative border rounded-lg overflow-hidden bg-muted/20 h-full cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <svg
                ref={svgRef}
                viewBox="0 0 200 400"
                className="w-full h-full"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'top left',
                }}
                onClick={handleSvgClick}
              >
                {/* Silhueta de costas mais detalhada */}
                <g stroke="currentColor" strokeWidth="2" fill="none">
                  {/* Cabeça */}
                  <ellipse cx="100" cy="50" rx="30" ry="40" />
                  {/* Tronco */}
                  <rect x="70" y="90" width="60" height="120" rx="30" />
                  {/* Quadril */}
                  <ellipse cx="100" cy="210" rx="40" ry="60" />
                  {/* Pernas */}
                  <rect x="60" y="270" width="80" height="120" rx="20" />
                  {/* Braços */}
                  <line x1="70" y1="120" x2="40" y2="180" strokeWidth="3" />
                  <line x1="130" y1="120" x2="160" y2="180" strokeWidth="3" />
                  <circle cx="40" cy="180" r="8" />
                  <circle cx="160" cy="180" r="8" />
                </g>
                
                {/* Pontos de dor */}
                {backPoints.map((point, index) => (
                  <g key={index}>
                    <circle
                      cx={`${point.x}%`}
                      cy={`${point.y}%`}
                      r="10"
                      fill={getIntensityColor(point.intensity)}
                      opacity="0.8"
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPoint(point);
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
        {currentPoints.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto border-t pt-4">
            <label className="text-sm font-medium">Pontos Adicionados ({currentPoints.length})</label>
            <div className="space-y-1">
              {currentPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded text-sm hover:bg-muted/80"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getIntensityColor(point.intensity) }}
                    />
                    <span>Intensidade: {point.intensity}/10</span>
                    {point.notes && (
                      <span className="text-muted-foreground text-xs">• {point.notes}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setSelectedPoint(point);
                    }}
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Clique no corpo para adicionar pontos • Arraste para mover • Scroll para zoom
        </p>
      </CardContent>

      {/* Modal para editar ponto */}
      {selectedPoint && (
        <PainPointModal
          point={selectedPoint}
          onClose={() => setSelectedPoint(null)}
          onUpdate={(updates) => updatePoint(selectedPoint, updates)}
          onDelete={() => removePoint(selectedPoint)}
        />
      )}
    </Card>
  );
}

// Componente Modal para editar ponto de dor
function PainPointModal({
  point,
  onClose,
  onUpdate,
  onDelete,
}: {
  point: PainPoint;
  onClose: () => void;
  onUpdate: (updates: Partial<PainPoint>) => void;
  onDelete: () => void;
}) {
  const [intensity, setIntensity] = useState(point.intensity);
  const [notes, setNotes] = useState(point.notes || "");

  const handleSave = () => {
    onUpdate({ intensity, notes: notes.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">Editar Ponto de Dor</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Intensidade (0-10)</label>
            <div className="flex items-center gap-4">
              <Slider
                value={[intensity]}
                onValueChange={([value]) => setIntensity(value)}
                min={0}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-lg font-bold w-8 text-center">{intensity}</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Anotações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Adicione observações sobre este ponto..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onDelete}>
              Excluir
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

