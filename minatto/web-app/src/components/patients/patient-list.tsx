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
import { Search, Filter, MoreHorizontal, FileText, Activity, Sparkles } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { PatientAISummary } from "./patient-ai-summary";

interface PatientListProps {
    initialPatients: any[];
}

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

// ... existing imports

export function PatientList({ initialPatients }: PatientListProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [selectedPatientSummary, setSelectedPatientSummary] = useState<any>(null);

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    const patients = initialPatients.length > 0 ? initialPatients : [
        // ... mock data
    ];

    // Remove client-side filtering since it's handled by server
    const filteredPatients = patients;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar pacientes..."
                        className="pl-8 bg-background/50"
                        defaultValue={searchParams.get('query')?.toString()}
                        onChange={(e) => handleSearch(e.target.value)}
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
                                            <DropdownMenuItem onClick={() => setSelectedPatientSummary(patient)}>
                                                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                                                Resumo IA
                                            </DropdownMenuItem>
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

            <Dialog open={!!selectedPatientSummary} onOpenChange={(open) => !open && setSelectedPatientSummary(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Análise Inteligente</DialogTitle>
                    </DialogHeader>
                    {selectedPatientSummary && (
                        <PatientAISummary
                            patientId={selectedPatientSummary.id}
                            patientName={selectedPatientSummary.name || selectedPatientSummary.full_name}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
