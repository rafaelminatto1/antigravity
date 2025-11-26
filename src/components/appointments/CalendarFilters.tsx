"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface CalendarFiltersProps {
  filters: {
    therapistId?: string;
    status?: string;
  };
  onFiltersChange: (filters: { therapistId?: string; status?: string }) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function CalendarFilters({
  filters,
  onFiltersChange,
  currentDate,
  onDateChange,
}: CalendarFiltersProps) {
  const [therapists, setTherapists] = useState<Array<{ id: string; full_name: string }>>([]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchTherapists = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('role', ['physiotherapist', 'admin'])
        .order('full_name');

      if (!error && data) {
        setTherapists(data);
      }
    };

    fetchTherapists();
  }, [supabase]);

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = !!filters.therapistId || !!filters.status;

  return (
    <Card className="border-2 shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Date Picker */}
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-full sm:w-[240px] justify-start text-left font-normal",
                  !currentDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {currentDate ? format(currentDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => {
                  if (date) {
                    onDateChange(date);
                    setDatePickerOpen(false);
                  }
                }}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Therapist Filter */}
          <Select
            value={filters.therapistId || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                therapistId: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Todos os profissionais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os profissionais</SelectItem>
              {therapists.map((therapist) => (
                <SelectItem key={therapist.id} value={therapist.id}>
                  {therapist.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                status: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="scheduled">Agendado</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="completed">Realizado</SelectItem>
              <SelectItem value="canceled">Cancelado</SelectItem>
              <SelectItem value="no_show">Faltou</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-destructive w-full sm:w-auto sm:ml-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Limpar filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

