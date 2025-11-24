"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface SessionTestsProps {
  sessionId: string;
  patientId: string;
}

// Mock data - será substituído por dados reais
const mockTests = [
  { name: "ADM Flexão", value: 120, normal: 150, unit: "°" },
  { name: "ADM Extensão", value: 10, normal: 0, unit: "°" },
  { name: "Força Muscular", value: 4, normal: 5, unit: "/5" },
  { name: "Teste de Palpação", result: "Positivo" },
];

export function SessionTests({ sessionId, patientId }: SessionTestsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Testes e Medidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockTests.map((test, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{test.name}</span>
              {test.result ? (
                <Badge
                  variant={test.result === "Positivo" ? "destructive" : "default"}
                >
                  {test.result}
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {test.value} {test.unit}
                </span>
              )}
            </div>
            
            {test.value !== undefined && (
              <div className="space-y-1">
                <Progress
                  value={(test.value / test.normal) * 100}
                  className="h-2"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Atual: {test.value}{test.unit}</span>
                  <span>Normal: {test.normal}{test.unit}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full" size="sm">
            Adicionar Teste
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

