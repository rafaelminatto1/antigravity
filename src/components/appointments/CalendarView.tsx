"use client";

import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Appointment } from "@/lib/services/appointmentService";
import { EventInput } from "@fullcalendar/core";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface CalendarViewProps {
  appointments: Appointment[];
  currentDate: Date;
  view: 'day' | 'week' | 'month' | 'agenda';
  onDateChange: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onDateSelect: (date: Date) => void;
  isLoading?: boolean;
}

const statusColors: Record<string, string> = {
  scheduled: '#5034FF',
  confirmed: '#00CA72',
  completed: '#64748B',
  canceled: '#EF4444',
  no_show: '#F59E0B',
};

const statusLabels: Record<string, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  completed: 'Realizado',
  canceled: 'Cancelado',
  no_show: 'Faltou',
};

export function CalendarView({
  appointments,
  currentDate,
  view,
  onDateChange,
  onAppointmentClick,
  onDateSelect,
  isLoading = false,
}: CalendarViewProps) {
  // Converter appointments para eventos do FullCalendar
  const events: EventInput[] = useMemo(() => {
    return appointments.map((apt) => ({
      id: apt.id,
      title: apt.patients?.full_name || 'Paciente',
      start: apt.start_time,
      end: apt.end_time,
      backgroundColor: statusColors[apt.status] || statusColors.scheduled,
      borderColor: statusColors[apt.status] || statusColors.scheduled,
      extendedProps: {
        appointment: apt,
        status: apt.status,
        statusLabel: statusLabels[apt.status] || 'Agendado',
        therapist: apt.profiles?.full_name || 'N/A',
      },
    }));
  }, [appointments]);

  const handleEventClick = (info: any) => {
    const appointment = info.event.extendedProps.appointment as Appointment;
    if (appointment) {
      onAppointmentClick(appointment);
    }
  };

  const handleDateClick = (info: any) => {
    onDateSelect(info.date);
  };

  const handleDatesSet = (info: any) => {
    onDateChange(info.start);
  };

  const getViewName = () => {
    switch (view) {
      case 'day':
        return 'timeGridDay';
      case 'week':
        return 'timeGridWeek';
      case 'month':
        return 'dayGridMonth';
      case 'agenda':
        return 'listWeek';
      default:
        return 'timeGridWeek';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={getViewName()}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        locale="pt-br"
        events={events}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        datesSet={handleDatesSet}
        initialDate={currentDate}
        height="auto"
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        slotDuration="00:30:00"
        allDaySlot={false}
        weekends={true}
        editable={true}
        droppable={true}
        eventResizableFromStart={true}
        eventDisplay="block"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: 'short',
        }}
        dayHeaderFormat={{
          weekday: 'short',
          day: 'numeric',
        }}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5, 6],
          startTime: '08:00',
          endTime: '20:00',
        }}
        eventContent={(eventInfo) => {
          const statusLabel = eventInfo.event.extendedProps.statusLabel;
          const therapist = eventInfo.event.extendedProps.therapist;
          
          return (
            <div className="p-1 text-xs">
              <div className="font-semibold truncate">{eventInfo.event.title}</div>
              <div className="text-muted-foreground truncate">{therapist}</div>
              <div className="text-xs opacity-75">{statusLabel}</div>
            </div>
          );
        }}
      />
    </div>
  );
}

