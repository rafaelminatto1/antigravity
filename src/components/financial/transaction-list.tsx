import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
    category?: string;
}

interface TransactionListProps {
    transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
    return (
        <Card className="glass-card border-none col-span-3">
            <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
                <CardDescription>
                    Últimas movimentações financeiras.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {transactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Nenhuma transação encontrada.</p>
                    ) : (
                        transactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>
                                        {transaction.type === 'income' ? '+' : '-'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{transaction.description}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(transaction.date), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                                    </p>
                                </div>
                                <div className={`ml-auto font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                    {transaction.type === 'income' ? '+' : '-'}
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(transaction.amount))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
