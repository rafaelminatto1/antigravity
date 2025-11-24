"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  Phone,
  Mail,
  FileText,
  Play,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Appointment } from "@/lib/services/appointmentService";
import { useConfirmAppointment, useCancelAppointment, useDeleteAppointment } from "@/lib/hooks/useAppointments";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AppointmentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onEdit?: () => void;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  scheduled: { label: 'Agendado', color: 'bg-blue-500/10 text-blue-500', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-green-500/10 text-green-500', icon: CheckCircle2 },
  completed: { label: 'Realizado', color: 'bg-gray-500/10 text-gray-500', icon: CheckCircle2 },
  canceled: { label: 'Cancelado', color: 'bg-red-500/10 text-red-500', icon: XCircle },
  no_show: { label: 'Faltou', color: 'bg-orange-500/10 text-orange-500', icon: AlertCircle },
};

export function AppointmentDetailModal({
  open,
  onOpenChange,
  appointment,
  onEdit,
}: AppointmentDetailModalProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  const confirmMutation = useConfirmAppointment();
  const cancelMutation = useCancelAppointment();
  const deleteMutation = useDeleteAppointment();

  if (!appointment) return null;

  const status = statusConfig[appointment.status] || statusConfig.scheduled;
  const StatusIcon = status.icon;

  const handleConfirm = async () => {
    await confirmMutation.mutateAsync(appointment.id);
  };

  const handleCancel = async () => {
    await cancelMutation.mutateAsync({ id: appointment.id });
    setShowCancelDialog(false);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(appointment.id);
    setShowDeleteDialog(false);
    onOpenChange(false);
  };

  const handleStartSession = () => {
    router.push(`/sessions/${appointment.id}/evolution`);
    onOpenChange(false);
  };

  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">
                  {appointment.patients?.full_name || 'Paciente'}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Agendamento de Fisioterapia
                </DialogDescription>
              </div>
              <Badge className={status.color}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {status.label}
              </Badge>
            </div>
          </DialogHeader>

          <Tabs defaultValue="details" className="mt-4">
            <TabsList>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="patient">Paciente</TabsTrigger>
              <TabsTrigger value="evolution">Evolução</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
              <TabsTrigger value="notes">Notas</TabsTrigger>
            </TabsList>

            {/* Tab: Detalhes */}
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Data e Hora</span>
                  </div>
                  <div className="font-medium">
                    {format(startTime, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(startTime, "HH:mm", { locale: ptBR })} - {format(endTime, "HH:mm", { locale: ptBR })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Fisioterapeuta</span>
                  </div>
                  <div className="font-medium">
                    {appointment.profiles?.full_name || 'N/A'}
                  </div>
                </div>

                {appointment.duration_minutes && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Duração</span>
                    </div>
                    <div className="font-medium">
                      {appointment.duration_minutes} minutos
                    </div>
                  </div>
                )}

                {appointment.confirmed_at && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Confirmado em</span>
                    </div>
                    <div className="font-medium">
                      {format(new Date(appointment.confirmed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {appointment.status === 'scheduled' && (
                  <Button onClick={handleConfirm} variant="outline" size="sm">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirmar
                  </Button>
                )}

                {appointment.status !== 'completed' && appointment.status !== 'canceled' && (
                  <Button onClick={handleStartSession} size="sm">
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar Atendimento
                  </Button>
                )}

                {onEdit && (
                  <Button onClick={onEdit} variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                )}

                {appointment.status !== 'canceled' && appointment.status !== 'completed' && (
                  <Button
                    onClick={() => setShowCancelDialog(true)}
                    variant="outline"
                    size="sm"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                )}

                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </TabsContent>

            {/* Tab: Paciente */}
            <TabsContent value="patient" className="space-y-4 mt-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {appointment.patients?.full_name?.charAt(0) || 'P'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {appointment.patients?.full_name || 'Paciente'}
                  </h3>
                  {appointment.patients?.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Phone className="h-4 w-4" />
                      {appointment.patients.phone}
                    </div>
                  )}
                  {appointment.patients?.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Mail className="h-4 w-4" />
                      {appointment.patients.email}
                    </div>
                  )}
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Ver Prontuário Completo
              </Button>
            </TabsContent>

            {/* Tab: Evolução */}
            <TabsContent value="evolution" className="space-y-4 mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma evolução registrada ainda</p>
                <Button
                  onClick={handleStartSession}
                  className="mt-4"
                  variant="outline"
                >
                  Iniciar Evolução
                </Button>
              </div>
            </TabsContent>

            {/* Tab: Financeiro */}
            <TabsContent value="financial" className="space-y-4 mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <p>Informações financeiras serão exibidas aqui</p>
              </div>
            </TabsContent>

            {/* Tab: Notas */}
            <TabsContent value="notes" className="space-y-4 mt-4">
              {appointment.notes ? (
                <div className="p-4 bg-muted rounded-md">
                  <p className="whitespace-pre-wrap">{appointment.notes}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma nota adicionada</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Dialog de Cancelamento */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este agendamento? Esta ação pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter Agendamento</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive">
              Cancelar Agendamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O agendamento será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

