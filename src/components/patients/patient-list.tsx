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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { patientService } from "@/lib/services/patientService";

interface PatientListProps {
    initialPatients: any[];
}

export function PatientList({ initialPatients }: PatientListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
    const [patientToArchive, setPatientToArchive] = useState<any>(null);
    const [isArchiving, setIsArchiving] = useState(false);
    const router = useRouter();

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

    const handleArchiveClick = (patient: any) => {
        setPatientToArchive(patient);
        setArchiveDialogOpen(true);
    };

    const handleArchiveConfirm = async () => {
        if (!patientToArchive) return;

        setIsArchiving(true);
        try {
            await patientService.deletePatient(patientToArchive.id);
            toast.success("Paciente arquivado com sucesso!");
            setArchiveDialogOpen(false);
            setPatientToArchive(null);
            // Recarregar a página para atualizar a lista
            window.location.reload();
        } catch (error: any) {
            console.error("Erro ao arquivar paciente:", error);
            toast.error(error?.message || "Erro ao arquivar paciente");
        } finally {
            setIsArchiving(false);
        }
    };

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
                <Button variant="outline" size="icon" className="flex-shrink-0">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border bg-card/50 backdrop-blur-sm animate-in fade-in duration-300">
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
                            <TableRow key={patient.id} className="group transition-all hover:bg-muted/50">
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
                                            <DropdownMenuItem onClick={() => router.push(`/patients/${patient.id}/prontuario`)}>
                                                <FileText className="mr-2 h-4 w-4" />
                                                Ver Prontuário
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => router.push(`/patients/${patient.id}/evolution`)}>
                                                <Activity className="mr-2 h-4 w-4" />
                                                Nova Evolução
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-500"
                                                onClick={() => handleArchiveClick(patient)}
                                            >
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {filteredPatients.map((patient: any, index: number) => (
                    <div
                        key={patient.id}
                        className="rounded-lg border bg-card/50 backdrop-blur-sm p-4 space-y-3 animate-in slide-in-from-bottom fade-in duration-300 transition-all hover:shadow-md"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarImage src={patient.avatar || patient.avatar_url} />
                                    <AvatarFallback>{(patient.name || patient.full_name || "P")[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate">{patient.name || patient.full_name}</h3>
                                    <p className="text-xs text-muted-foreground">{patient.age ? `${patient.age} anos` : 'N/A'}</p>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => router.push(`/patients/${patient.id}/prontuario`)}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Ver Prontuário
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push(`/patients/${patient.id}/evolution`)}>
                                        <Activity className="mr-2 h-4 w-4" />
                                        Nova Evolução
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-red-500"
                                        onClick={() => handleArchiveClick(patient)}
                                    >
                                        Arquivar Paciente
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Condição:</span>
                                <span className="font-medium">{patient.condition || patient.diagnosis || "N/A"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge
                                    variant={patient.status === "Alta" || patient.status === "discharged" ? "secondary" : "default"}
                                    className={patient.status === "Alta" || patient.status === "discharged" ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : ""}
                                >
                                    {patient.status === "active" ? "Em Tratamento" : patient.status}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Última Visita:</span>
                                <span>{patient.lastVisit || "N/A"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Fisioterapeuta:</span>
                                <span>{patient.therapist || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Arquivar Paciente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja arquivar{" "}
                            <strong>{patientToArchive?.name || patientToArchive?.full_name}</strong>?
                            O paciente será marcado como inativo, mas os dados serão preservados.
                            Esta ação pode ser revertida posteriormente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isArchiving}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleArchiveConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isArchiving}
                        >
                            {isArchiving ? "Arquivando..." : "Arquivar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
