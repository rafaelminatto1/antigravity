"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, MoreHorizontal, FileText, Activity } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface PatientListProps {
    initialPatients: any[];
}

export function PatientList({ initialPatients }: PatientListProps) {
    const [searchTerm, setSearchTerm] = useState("");

    // If no patients from DB, use mock data for display purposes if needed, 
    // but ideally we want to show empty state or the real data.
    // For now, let's merge or just use initialPatients.
    // If initialPatients is empty, we might want to show some mock data for the demo 
    // OR just show empty state. Let's assume we want to show what's in DB.

    const patients = initialPatients.length > 0 ? initialPatients : [
        {
            id: "1",
            name: "Maria Silva",
            age: 45,
            condition: "Pós-op LCA",
            status: "Em Tratamento",
            lastVisit: "20/11/2025",
            therapist: "Dr. Rafael",
            avatar: "https://github.com/shadcn.png",
        },
        {
            id: "2",
            name: "João Santos",
            age: 62,
            condition: "Lombalgia Crônica",
            status: "Em Tratamento",
            lastVisit: "18/11/2025",
            therapist: "Dra. Ana",
            avatar: "",
        },
        {
            id: "3",
            name: "Pedro Oliveira",
            age: 28,
            condition: "Tendinite Ombro",
            status: "Alta",
            lastVisit: "15/11/2025",
            therapist: "Dr. Rafael",
            avatar: "",
        },
    ];

    const filteredPatients = patients.filter((patient: any) =>
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar pacientes..."
                        className="pl-8 bg-background/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <div className="rounded-md border bg-card/50 backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Paciente</TableHead>
                            <TableHead>Condição</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Última Visita</TableHead>
                            <TableHead>Fisioterapeuta</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPatients.map((patient: any) => (
                            <TableRow key={patient.id} className="group">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={patient.avatar || patient.avatar_url} />
                                            <AvatarFallback>{(patient.name || patient.full_name || "P")[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span>{patient.name || patient.full_name}</span>
                                            <span className="text-xs text-muted-foreground">{patient.age ? `${patient.age} anos` : 'N/A'}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{patient.condition || patient.diagnosis || "N/A"}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={patient.status === "Alta" || patient.status === "discharged" ? "secondary" : "default"}
                                        className={patient.status === "Alta" || patient.status === "discharged" ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : ""}
                                    >
                                        {patient.status === "active" ? "Em Tratamento" : patient.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{patient.lastVisit || "N/A"}</TableCell>
                                <TableCell>{patient.therapist || "N/A"}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                            <DropdownMenuItem>
                                                <FileText className="mr-2 h-4 w-4" />
                                                Ver Prontuário
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Activity className="mr-2 h-4 w-4" />
                                                Nova Evolução
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-500">
                                                Arquivar Paciente
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
