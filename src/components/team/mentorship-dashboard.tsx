"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GraduationCap, BookOpen, Star, TrendingUp } from "lucide-react";

const interns = [
    {
        id: "1",
        name: "Ana Clara",
        role: "Estagiária - 6º Período",
        avatar: "https://github.com/shadcn.png",
        progress: 75,
        skills: [
            { name: "Avaliação Cinético-Funcional", level: 80 },
            { name: "Terapia Manual", level: 60 },
            { name: "Eletrotermofototerapia", level: 90 },
        ],
        lastFeedback: "Ótima evolução na abordagem com pacientes neurológicos.",
    },
    {
        id: "2",
        name: "Lucas Pereira",
        role: "Estagiário - 8º Período",
        avatar: "https://github.com/shadcn.png",
        progress: 90,
        skills: [
            { name: "Avaliação Cinético-Funcional", level: 95 },
            { name: "Terapia Manual", level: 85 },
            { name: "Eletrotermofototerapia", level: 90 },
        ],
        lastFeedback: "Pronto para assumir casos mais complexos de ortopedia.",
    }
];

export function MentorshipDashboard() {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {interns.map((intern) => (
                <Card key={intern.id} className="glass-card border-none">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                            <AvatarImage src={intern.avatar} />
                            <AvatarFallback>{intern.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{intern.name}</CardTitle>
                                <Badge variant="outline" className="bg-primary/5">
                                    <GraduationCap className="mr-1 h-3 w-3" />
                                    {intern.progress}% Concluído
                                </Badge>
                            </div>
                            <CardDescription>{intern.role}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm font-medium">
                                <span className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                    Progresso Geral
                                </span>
                                <span>{intern.progress}%</span>
                            </div>
                            <Progress value={intern.progress} className="h-2" />
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-blue-500" />
                                Competências
                            </h4>
                            <div className="space-y-3">
                                {intern.skills.map((skill) => (
                                    <div key={skill.name} className="space-y-1">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>{skill.name}</span>
                                            <span>{skill.level}%</span>
                                        </div>
                                        <Progress value={skill.level} className="h-1.5 bg-muted" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg bg-muted/50 p-3 text-sm">
                            <div className="flex items-center gap-2 font-medium mb-1 text-primary">
                                <Star className="h-3 w-3 fill-primary" />
                                Último Feedback
                            </div>
                            <p className="text-muted-foreground italic">"{intern.lastFeedback}"</p>
                        </div>

                        <Button className="w-full" variant="outline">
                            Ver Relatório Completo
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
