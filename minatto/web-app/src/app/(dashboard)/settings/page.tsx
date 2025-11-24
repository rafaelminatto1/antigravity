import { LGPDCompliance } from "@/components/settings/lgpd-compliance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
                    <Card className="glass-card border-none">
                        <CardHeader>
                            <CardTitle>Informações Pessoais</CardTitle>
                            <CardDescription>Atualize seus dados cadastrais.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>DR</AvatarFallback>
                                </Avatar>
                                <Button variant="outline">Alterar Foto</Button>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome Completo</Label>
                                    <Input id="name" defaultValue="Dr. Rafael" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" defaultValue="rafael@manusfisio.com" />
                                </div>
                            </div>
                            <Button>Salvar Alterações</Button>
                        </CardContent>
                    </Card>
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
