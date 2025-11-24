"use client";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const notifications = [
    {
        id: 1,
        title: "Nova consulta agendada",
        description: "Maria Silva agendou para amanhã às 14h.",
        time: "Há 5 min",
        read: false,
    },
    {
        id: 2,
        title: "Relatório pendente",
        description: "Finalize a evolução do paciente João Santos.",
        time: "Há 1 hora",
        read: false,
    },
    {
        id: 3,
        title: "Novo comentário",
        description: "Dra. Ana comentou no notebook 'Protocolo LCA'.",
        time: "Há 2 horas",
        read: true,
    },
];

export function NotificationPopover() {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                    <h4 className="font-semibold leading-none">Notificações</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                        Você tem 2 notificações não lidas.
                    </p>
                </div>
                <ScrollArea className="h-[300px]">
                    <div className="divide-y">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.read ? "bg-primary/5" : ""
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h5 className="text-sm font-medium">{notification.title}</h5>
                                    <span className="text-xs text-muted-foreground">
                                        {notification.time}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {notification.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-2 border-t">
                    <Button variant="ghost" className="w-full text-xs h-8">
                        Marcar todas como lidas
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
