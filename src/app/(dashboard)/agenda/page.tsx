"use client";

import { useState, useMemo } from "react";
import { CalendarView } from "@/components/appointments/CalendarView";
import { CalendarFilters } from "@/components/appointments/CalendarFilters";
import { AppointmentModal } from "@/components/appointments/AppointmentModal";
import { AppointmentDetailModal } from "@/components/appointments/AppointmentDetailModal";
import { useAppointments } from "@/lib/hooks/useAppointments";
import { Appointment } from "@/lib/services/appointmentService";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie agendamentos e sessões de fisioterapia
          </p>
        </div>
        <Button onClick={handleCreateAppointment} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Filtros */}
      <CalendarFilters
        filters={filters}
        onFiltersChange={setFilters}
        view={view}
        onViewChange={setView}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />

      {/* Calendário */}
      <div className="flex-1 mt-6">
        <CalendarView
          appointments={appointments}
          currentDate={currentDate}
          view={view}
          onDateChange={setCurrentDate}
          onAppointmentClick={handleAppointmentClick}
          onDateSelect={handleDateSelect}
          isLoading={isLoading}
        />
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

