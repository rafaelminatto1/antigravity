import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus } from "lucide-react";

const activeUsers = [
    { name: "Dr. Rafael", avatar: "https://github.com/shadcn.png", status: "online" },
    { name: "Dra. Ana", avatar: "https://github.com/shadcn.png", status: "online" },
    { name: "Estagiário João", avatar: "https://github.com/shadcn.png", status: "idle" },
];

const comments = [
    {
        id: 1,
        user: "Dra. Ana",
        text: "Precisamos revisar o protocolo de reabilitação do paciente Silva.",
        time: "10 min atrás",
    },
    {
        id: 2,
        user: "Dr. Rafael",
        text: "Concordo, vou adicionar as novas observações.",
        time: "5 min atrás",
    },
];

export function CollaborationPanel() {
    return (
        <div className="flex h-full flex-col border-l bg-muted/10">
            <div className="flex items-center justify-between border-b p-4">
                <h3 className="font-semibold">Colaboração</h3>
                <Button variant="ghost" size="icon">
                    <UserPlus className="h-4 w-4" />
                </Button>
            </div>

            <div className="p-4">
                <h4 className="mb-3 text-xs font-medium text-muted-foreground uppercase">Online Agora</h4>
                <div className="flex -space-x-2 overflow-hidden">
                    {activeUsers.map((user, i) => (
                        <Avatar key={i} className="border-2 border-background ring-2 ring-background transition-transform hover:z-10 hover:scale-110">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="px-4 pb-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase">Comentários</h4>
                </div>
                <ScrollArea className="h-[calc(100%-120px)] px-4">
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div key={comment.id} className="rounded-lg border bg-card p-3 shadow-sm">
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="text-sm font-medium">{comment.user}</span>
                                    <span className="text-xs text-muted-foreground">{comment.time}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{comment.text}</p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            <div className="border-t p-4">
                <Button className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Novo Comentário
                </Button>
            </div>
        </div>
    );
}
