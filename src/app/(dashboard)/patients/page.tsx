import { PatientList } from "@/components/patients/patient-list";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function PatientsPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>;
}) {
    const params = await searchParams;
    const query = params.query || '';
    const supabase = await createClient();

    let dbQuery = supabase.from('patients').select('*');

    if (query) {
        dbQuery = dbQuery.ilike('full_name', `%${query}%`);
    }

    const { data: patients } = await dbQuery;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gradient">Pacientes</h2>
                    <p className="text-muted-foreground">
                        Gerencie prontuários, evoluções e histórico clínico.
                    </p>
                </div>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Novo Paciente
                </Button>
            </div>

            <PatientList initialPatients={patients || []} />
        </div>
    );
}
