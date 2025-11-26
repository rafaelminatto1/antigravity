"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { sessionService } from "@/lib/services/sessionService";
import { patientService } from "@/lib/services/patientService";

export default function AderenciaPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Calcular taxa de aderência
      const patients = await patientService.getPatients();
      const activePatients = patients.filter(p => p.status === 'active');
      
      // Buscar sessões completadas
      const allSessions = [];
      for (const patient of activePatients.slice(0, 10)) {
        try {
          const sessions = await sessionService.getPatientSessions(patient.id, 100);
          allSessions.push(...sessions);
        } catch (error) {
          console.error(`Erro ao buscar sessões do paciente ${patient.id}:`, error);
        }
      }

      const completedSessions = allSessions.length;
      const totalExpected = activePatients.length * 12; // Assumindo 12 sessões esperadas por paciente
      const adherenceRate = totalExpected > 0 ? (completedSessions / totalExpected) * 100 : 0;

      setData({
        adherenceRate: Math.round(adherenceRate * 10) / 10,
        completedSessions,
        totalExpected,
        activePatients: activePatients.length,
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;
  }

  const chartData = [
    { name: 'Sessões Completadas', value: data.completedSessions },
    { name: 'Sessões Esperadas', value: data.totalExpected },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Taxa de Aderência</h1>
          <p className="text-muted-foreground">
            Acompanhe a aderência dos pacientes ao tratamento
          </p>
        </div>
        <Select value={period} onValueChange={(value) => setPeriod(value as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Mês</SelectItem>
            <SelectItem value="quarter">Trimestre</SelectItem>
            <SelectItem value="year">Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Taxa de Aderência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.adherenceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.completedSessions} de {data.totalExpected} sessões
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.activePatients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Em tratamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Sessões Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.completedSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              No período selecionado
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparativo de Aderência</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#5034FF" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

