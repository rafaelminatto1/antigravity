"use client";

import { useState } from "react";
import { PatientList } from "@/components/patients/patient-list";
import { PatientForm } from "@/components/patients/PatientForm";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Patient } from "@/lib/services/patientService";

interface PatientsPageClientProps {
    initialPatients: Patient[];
}

export function PatientsPageClient({ initialPatients }: PatientsPageClientProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [patients, setPatients] = useState<Patient[]>(initialPatients);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSuccess = () => {
        // Recarregar a página para atualizar a lista
        window.location.reload();
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gradient">Pacientes</h2>
                    <p className="text-muted-foreground">
                        Gerencie prontuários, evoluções e histórico clínico.
                    </p>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Novo Paciente
                </Button>
            </div>

            <PatientList key={refreshKey} initialPatients={patients} />

            <PatientForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSuccess={handleSuccess}
            />
        </div>
    );
}


