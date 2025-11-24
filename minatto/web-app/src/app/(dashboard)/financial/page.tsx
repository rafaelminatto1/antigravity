import { FinancialOverview } from "@/components/financial/financial-overview";
import { TransactionList } from "@/components/financial/transaction-list";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";

export default function FinancialPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gradient">Financeiro</h2>
                    <p className="text-muted-foreground">
                        Acompanhe o fluxo de caixa e saúde financeira da clínica.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Relatório
                    </Button>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Transação
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <FinancialOverview />
                <TransactionList />
            </div>
        </div>
    );
}
