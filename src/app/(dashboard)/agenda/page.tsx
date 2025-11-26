"use client";

import { useState, useMemo } from "react";
import { CalendarView } from "@/components/appointments/CalendarView";
import { CalendarFilters } from "@/components/appointments/CalendarFilters";
import { AppointmentModal } from "@/components/appointments/AppointmentModal";
import { AppointmentDetailModal } from "@/components/appointments/AppointmentDetailModal";
import { useAppointments } from "@/lib/hooks/useAppointments";
import { Appointment } from "@/lib/services/appointmentService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Calendar, Clock, Users, CheckCircle2, AlertCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month' | 'agenda'>('week');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState<{
    therapistId?: string;
    status?: string;
  }>({});

  // Calcular range de datas baseado na view
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (view) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'agenda':
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() + 30);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return { start, end };
  }, [currentDate, view]);

  const { data: appointments = [], isLoading } = useAppointments({
    startDate: dateRange.start,
    endDate: dateRange.end,
    ...filters,
  });

  // Estatísticas dos agendamentos
  const stats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const scheduled = appointments.filter(a => a.status === 'scheduled').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const canceled = appointments.filter(a => a.status === 'canceled').length;
    const noShow = appointments.filter(a => a.status === 'no_show').length;

    return { total, confirmed, scheduled, completed, canceled, noShow };
  }, [appointments]);

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setIsCreateModalOpen(true);
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    if (view === 'day') {
      setCurrentDate(date);
    }
  };

  const handlePrevious = () => {
    const prev = new Date(currentDate);
    if (view === 'day') prev.setDate(prev.getDate() - 1);
    else if (view === 'week') prev.setDate(prev.getDate() - 7);
    else if (view === 'month') prev.setMonth(prev.getMonth() - 1);
    setCurrentDate(prev);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (view === 'day') next.setDate(next.getDate() + 1);
    else if (view === 'week') next.setDate(next.getDate() + 7);
    else if (view === 'month') next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header Reorganizado */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          {/* Primeira linha: Título e Botão */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Esquerda: Título e Data */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Agenda
              </h1>
              <p className="text-muted-foreground mt-1.5 text-xs sm:text-sm">
                {format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>

            {/* Direita: Botão Novo Agendamento */}
            <div className="flex justify-start sm:justify-end">
              <Button 
                onClick={handleCreateAppointment} 
                size="default"
                className="shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Novo Agendamento</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </div>
          </div>

          {/* Segunda linha: Navegação e Visualização */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Navegação de Datas */}
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1 w-full sm:w-auto justify-center sm:justify-start">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToday}
                className="h-8 px-3 text-xs font-medium flex-1 sm:flex-initial"
              >
                Hoje
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Seleção de Visualização */}
            <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-full sm:w-auto justify-center sm:justify-start">
              <Button
                variant={view === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('day')}
                className="h-8 px-2 sm:px-3 text-xs flex-1 sm:flex-initial"
              >
                Dia
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('week')}
                className="h-8 px-2 sm:px-3 text-xs flex-1 sm:flex-initial"
              >
                Semana
              </Button>
              <Button
                variant={view === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('month')}
                className="h-8 px-2 sm:px-3 text-xs flex-1 sm:flex-initial"
              >
                Mês
              </Button>
              <Button
                variant={view === 'agenda' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('agenda')}
                className="h-8 px-2 sm:px-3 text-xs flex-1 sm:flex-initial"
              >
                Lista
              </Button>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold mt-1">{stats.total}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-500/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confirmados</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">{stats.confirmed}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-500/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Agendados</p>
                  <p className="text-2xl font-bold mt-1 text-blue-600">{stats.scheduled}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-slate-500/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Realizados</p>
                  <p className="text-2xl font-bold mt-1 text-slate-600">{stats.completed}</p>
                </div>
                <Users className="h-8 w-8 text-slate-500/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-red-500/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cancelados</p>
                  <p className="text-2xl font-bold mt-1 text-red-600">{stats.canceled}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-amber-500/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Faltas</p>
                  <p className="text-2xl font-bold mt-1 text-amber-600">{stats.noShow}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-amber-500/60" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filtros */}
      <CalendarFilters
        filters={filters}
        onFiltersChange={setFilters}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />

      {/* Calendário */}
      <div className="flex-1 min-h-0">
        <Card className="h-full border-2 shadow-lg">
          <CardContent className="p-0 h-full">
            <CalendarView
              appointments={appointments}
              currentDate={currentDate}
              view={view}
              onDateChange={setCurrentDate}
              onAppointmentClick={handleAppointmentClick}
              onDateSelect={handleDateSelect}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modais */}
      <AppointmentModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        selectedDate={currentDate}
      />

      <AppointmentDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        appointment={selectedAppointment}
        onEdit={() => {
          setIsDetailModalOpen(false);
          setIsCreateModalOpen(true);
        }}
      />
    </div>
  );
}

