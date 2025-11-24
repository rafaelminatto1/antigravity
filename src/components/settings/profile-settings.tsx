"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

export function ProfileSettings() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fullName, setFullName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setFullName(user.user_metadata.full_name || "");
                setAvatarUrl(user.user_metadata.avatar_url);
            }
        }
        getUser();
    }, [supabase]);

    const handleUpdateProfile = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            if (error) throw error;
            toast.success("Perfil atualizado com sucesso!");
        } catch (error: any) {
            toast.error("Erro ao atualizar perfil: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }
        if (!user) return;

        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}-${Math.random()}.${fileExt}`;

        setUploading(true);

        try {
            // 1. Upload image
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update user metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            toast.success("Avatar atualizado com sucesso!");
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao fazer upload do avatar.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card className="glass-card border-none">
            <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualize seus dados cadastrais.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-muted/50">
                        <AvatarImage src={avatarUrl || ""} />
                        <AvatarFallback>{fullName?.[0] || user?.email?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                        <Label htmlFor="avatar-upload" className="cursor-pointer">
                            <div className="flex items-center gap-2 rounded-md border p-2 hover:bg-muted transition-colors">
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                <span className="text-sm font-medium">Alterar Foto</span>
                            </div>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                                disabled={uploading}
                            />
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            JPG, GIF ou PNG. Máximo de 2MB.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                            id="name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user?.email || ""} disabled className="bg-muted/50" />
                    </div>
                </div>

                <Button onClick={handleUpdateProfile} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                </Button>
            </CardContent>
        </Card>
    );
}
