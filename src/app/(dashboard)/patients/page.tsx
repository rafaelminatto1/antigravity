import { PatientsPageClient } from "@/components/patients/PatientsPageClient";
import { createClient } from "@/lib/supabase/server";

export default async function PatientsPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>;
}) {
    const params = await searchParams;
    const query = params.query || '';
    const supabase = await createClient();

    let dbQuery = supabase.from('patients').select('*').order('created_at', { ascending: false });

    if (query) {
        dbQuery = dbQuery.ilike('full_name', `%${query}%`);
    }

    const { data: patients } = await dbQuery;

    return (
        <PatientsPageClient initialPatients={patients || []} />
    );
}
