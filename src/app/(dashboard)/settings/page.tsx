import { LGPDCompliance } from "@/components/settings/lgpd-compliance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileSettings } from "@/components/settings/profile-settings";

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gradient">Configurações</h2>
                <p className="text-muted-foreground">
                    Gerencie suas preferências e conformidade legal.
                </p>
            </div>

            <Tabs defaultValue="lgpd" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Perfil</TabsTrigger>
                    <TabsTrigger value="notifications">Notificações</TabsTrigger>
                    <TabsTrigger value="lgpd">Privacidade & LGPD</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <ProfileSettings />
                </TabsContent>

                <TabsContent value="notifications">
                    <Card className="glass-card border-none">
                        <CardHeader>
                            <CardTitle>Preferências de Notificação</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Configurações de notificação em breve.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="lgpd">
                    <LGPDCompliance />
                </TabsContent>
            </Tabs>
        </div>
    );
}
