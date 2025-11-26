"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { waitlistService, WaitlistItem, WaitlistStatus, WaitlistPriority } from "@/lib/services/waitlistService";
import { format, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Clock, User, Calendar, AlertCircle } from "lucide-react";

interface WaitlistTableProps {
  onSelectItem?: (item: WaitlistItem) => void;
}

export function WaitlistTable({ onSelectItem }: WaitlistTableProps) {
  const [items, setItems] = useState<WaitlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<{
    status?: WaitlistStatus;
    priority?: WaitlistPriority;
  }>({});

  useEffect(() => {
    loadWaitlist();
  }, [filters]);

  const loadWaitlist = async () => {
    try {
      setIsLoading(true);
      const data = await waitlistService.getWaitlist(undefined, filters);
      setItems(data);
    } catch (error) {
      console.error("Erro ao carregar lista de espera:", error);
      toast.error("Erro ao carregar lista de espera");
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: WaitlistPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusColor = (status: WaitlistStatus) => {
    switch (status) {
      case 'waiting':
        return 'bg-gray-500';
      case 'notified':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-green-500';
      case 'expired':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-400';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: WaitlistStatus) => {
    const labels: Record<WaitlistStatus, string> = {
      waiting: 'Aguardando',
      notified: 'Notificado',
      confirmed: 'Confirmado',
      expired: 'Expirado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority: WaitlistPriority) => {
    const labels: Record<WaitlistPriority, string> = {
      normal: 'Normal',
      high: 'Alta',
      urgent: 'Urgente',
    };
    return labels[priority] || priority;
  };

  const getWaitTime = (createdAt: string) => {
    const hours = differenceInHours(new Date(), new Date(createdAt));
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Espera</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lista de Espera</CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value === 'all' ? undefined : value as WaitlistStatus })
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="waiting">Aguardando</SelectItem>
                <SelectItem value="notified">Notificado</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.priority || 'all'}
              onValueChange={(value) =>
                setFilters({ ...filters, priority: value === 'all' ? undefined : value as WaitlistPriority })
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum item na lista de espera
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Fisioterapeuta</TableHead>
                <TableHead>Data/Horário Desejado</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tempo na Fila</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectItem?.(item)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {(item.patients as any)?.full_name || 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.physiotherapist_id ? (
                      <span>{(item.physiotherapists as any)?.full_name || 'N/A'}</span>
                    ) : (
                      <span className="text-muted-foreground">Qualquer</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.desired_date ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(item.desired_date), "dd/MM/yyyy", { locale: ptBR })}
                        {item.desired_time && ` às ${item.desired_time}`}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Flexível</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(item.priority)}>
                      {getPriorityLabel(item.priority)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {getWaitTime(item.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem?.(item);
                      }}
                    >
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

