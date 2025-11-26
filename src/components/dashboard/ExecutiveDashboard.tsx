"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICards } from "./kpi-cards";
import { reportsService, ExecutiveDashboard } from "@/lib/services/reportsService";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ExecutiveDashboardComponent() {
  const [dashboard, setDashboard] = useState<ExecutiveDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadDashboard();
  }, [period]);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const data = await reportsService.getExecutiveDashboard(undefined, getPeriodDates());
      setDashboard(data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPeriodDates = () => {
    const end = new Date();
    let start = new Date();

    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start = new Date(start.getFullYear(), start.getMonth(), 1);
        break;
      case 'year':
        start = new Date(start.getFullYear(), 0, 1);
        break;
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const COLORS = ['#5034FF', '#00CA72', '#F59E0B', '#EF4444', '#64748B'];

  if (isLoading || !dashboard) {
    return <div className="text-center py-8 text-muted-foreground">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Executivo</h2>
        <Select value={period} onValueChange={(value) => setPeriod(value as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Semana</SelectItem>
            <SelectItem value="month">Mês</SelectItem>
            <SelectItem value="year">Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <KPICards
        activePatients={dashboard.activePatients}
        occupancyRate={dashboard.occupancyRate}
        monthlyRevenue={dashboard.monthlyRevenue}
        noShowRate={dashboard.noShowRate}
        averageNPS={dashboard.averageNPS}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução de Receita */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboard.revenueEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#5034FF" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pacientes por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Pacientes por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboard.patientsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {dashboard.patientsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sessões por Fisioterapeuta */}
        <Card>
          <CardHeader>
            <CardTitle>Sessões por Fisioterapeuta</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboard.sessionsByTherapist}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="therapist" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#5034FF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Origem dos Pacientes */}
        <Card>
          <CardHeader>
            <CardTitle>Origem dos Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboard.patientOrigin}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {dashboard.patientOrigin.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

