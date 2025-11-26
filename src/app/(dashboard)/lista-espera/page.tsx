"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { WaitlistTable } from "@/components/waitlist/WaitlistTable";
import { AddToWaitlistModal } from "@/components/waitlist/AddToWaitlistModal";
import { WaitlistMetrics } from "@/components/waitlist/WaitlistMetrics";
import { WaitlistItem } from "@/lib/services/waitlistService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ListaEsperaPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WaitlistItem | null>(null);

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lista de Espera</h1>
          <p className="text-muted-foreground">
            Gerencie pacientes aguardando disponibilidade de horários
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar à Lista
        </Button>
      </div>

      {/* Métricas */}
      <WaitlistMetrics />

      {/* Tabela */}
      <WaitlistTable
        onSelectItem={(item) => setSelectedItem(item)}
      />

      {/* Modais */}
      <AddToWaitlistModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={() => {
          // Recarregar tabela seria feito via invalidação de query se usar react-query
        }}
      />

      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes da Lista de Espera</DialogTitle>
              <DialogDescription>
                Informações sobre o item selecionado
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Paciente</label>
                <p className="text-sm">{(selectedItem.patients as any)?.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="text-sm">{selectedItem.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Prioridade</label>
                <p className="text-sm">{selectedItem.priority}</p>
              </div>
              {selectedItem.notes && (
                <div>
                  <label className="text-sm font-medium">Observações</label>
                  <p className="text-sm">{selectedItem.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

