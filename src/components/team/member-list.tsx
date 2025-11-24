import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Mail, Phone } from "lucide-react";

const teamMembers = [
    {
        name: "Dr. Rafael",
        role: "Fisioterapeuta Sênior",
        specialty: "Ortopedia",
        email: "rafael@manusfisio.com",
        phone: "(11) 99999-9999",
        status: "active",
        avatar: "https://github.com/shadcn.png",
        patients: 45,
    },
    {
        name: "Dra. Ana",
        role: "Fisioterapeuta",
        specialty: "Neurologia",
        email: "ana@manusfisio.com",
        phone: "(11) 98888-8888",
        status: "active",
        avatar: "https://github.com/shadcn.png",
        patients: 32,
    },
    {
        name: "João Silva",
        role: "Estagiário",
        specialty: "Geral",
        email: "joao@manusfisio.com",
        phone: "(11) 97777-7777",
        status: "training",
        avatar: "https://github.com/shadcn.png",
        patients: 12,
    },
];

export function MemberList() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
                <Card key={member.email} className="glass-card border-none overflow-hidden transition-all hover:shadow-lg">
                    <div className="h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
                    <CardContent className="relative pt-0">
                        <div className="absolute -top-12 left-6">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>{member.name[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="absolute top-4 right-6">
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </div>

                        <div className="mt-14 space-y-1">
                            <h3 className="text-xl font-semibold">{member.name}</h3>
                            <p className="text-sm text-muted-foreground">{member.role} • {member.specialty}</p>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Badge variant={member.status === "active" ? "default" : "secondary"}>
                                {member.status === "active" ? "Ativo" : "Em Treinamento"}
                            </Badge>
                            <Badge variant="outline">{member.patients} Pacientes</Badge>
                        </div>

                        <div className="mt-6 space-y-3 border-t pt-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Mail className="mr-2 h-4 w-4" />
                                {member.email}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Phone className="mr-2 h-4 w-4" />
                                {member.phone}
                            </div>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <Button className="w-full" variant="outline">Ver Perfil</Button>
                            <Button className="w-full">Mensagem</Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
