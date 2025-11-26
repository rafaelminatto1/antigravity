"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { financialService, Package } from "@/lib/services/financialService";
import { PackageForm } from "@/components/financial/PackageForm";
import { toast } from "sonner";

export default function PacotesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setIsLoading(true);
      const data = await financialService.getPackages();
      setPackages(data);
    } catch (error) {
      console.error("Erro ao carregar pacotes:", error);
      toast.error("Erro ao carregar pacotes");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'partial':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: 'Pago',
      pending: 'Pendente',
      partial: 'Parcial',
    };
    return labels[status] || status;
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pacotes</h1>
          <p className="text-muted-foreground">
            Gerencie pacotes de sessões dos pacientes
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pacote
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacotes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : packages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum pacote cadastrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Sessões</TableHead>
                  <TableHead>Usadas</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => {
                  const balance = pkg.total_sessions - pkg.used_sessions;
                  return (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">
                        {(pkg.patients as any)?.full_name || 'N/A'}
                      </TableCell>
                      <TableCell>{pkg.total_sessions}</TableCell>
                      <TableCell>{pkg.used_sessions}</TableCell>
                      <TableCell>
                        <Badge variant={balance > 0 ? "default" : "destructive"}>
                          {balance}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        R$ {Number(pkg.total_value).toFixed(2).replace('.', ',')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(pkg.payment_status)}>
                          {getStatusLabel(pkg.payment_status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PackageForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={loadPackages}
      />
    </div>
  );
}

