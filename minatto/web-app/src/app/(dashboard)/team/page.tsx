import { MemberList } from "@/components/team/member-list";
import { MentorshipDashboard } from "@/components/team/mentorship-dashboard";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TeamPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gradient">Equipe</h2>
                    <p className="text-muted-foreground">
                        Gerencie fisioterapeutas, estagiários e equipe administrativa.
                    </p>
                </div>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Adicionar Membro
                </Button>
            </div>

            <Tabs defaultValue="members" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="members">Membros</TabsTrigger>
                    <TabsTrigger value="mentorship">Mentoria & Estágio</TabsTrigger>
                </TabsList>

                <TabsContent value="members">
                    <MemberList />
                </TabsContent>

                <TabsContent value="mentorship">
                    <MentorshipDashboard />
                </TabsContent>
            </Tabs>
        </div>
    );
}
