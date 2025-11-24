import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const transactions = [
    {
        id: "1",
        description: "Pagamento - Sessão Fisioterapia",
        amount: "+R$ 150,00",
        date: "Hoje, 14:30",
        type: "income",
        avatar: "https://github.com/shadcn.png",
        initials: "MS",
    },
    {
        id: "2",
        description: "Compra - Equipamentos",
        amount: "-R$ 450,00",
        date: "Ontem, 09:15",
        type: "expense",
        avatar: "",
        initials: "EQ",
    },
    {
        id: "3",
        description: "Pagamento - Avaliação",
        amount: "+R$ 200,00",
        date: "21/11/2025",
        type: "income",
        avatar: "https://github.com/shadcn.png",
        initials: "JP",
    },
    {
        id: "4",
        description: "Conta de Luz",
        amount: "-R$ 320,00",
        date: "20/11/2025",
        type: "expense",
        avatar: "",
        initials: "EN",
    },
];

export function TransactionList() {
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
                    {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={transaction.avatar} alt="Avatar" />
                                <AvatarFallback>{transaction.initials}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{transaction.description}</p>
                                <p className="text-xs text-muted-foreground">
                                    {transaction.date}
                                </p>
                            </div>
                            <div className={`ml-auto font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                {transaction.amount}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
