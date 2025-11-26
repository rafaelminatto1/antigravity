"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: `${name} ${surname}`,
                        avatar_url: `https://ui-avatars.com/api/?name=${name}+${surname}`,
                    },
                },
            });

            if (error) {
                throw error;
            }

            alert("Cadastro realizado com sucesso! Verifique seu email para confirmar.");
            router.push("/auth/login");
        } catch (error: any) {
            console.error("Register error:", error);
            alert("Erro ao cadastrar: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md glass-card border-none shadow-2xl">
            <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Activity className="h-6 w-6" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gradient">Criar Conta</CardTitle>
                <CardDescription>
                    Comece a gerenciar sua clínica hoje mesmo
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                placeholder="João"
                                className="bg-background/50"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="surname">Sobrenome</Label>
                            <Input
                                id="surname"
                                placeholder="Silva"
                                className="bg-background/50"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="nome@exemplo.com"
                            className="bg-background/50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            className="bg-background/50"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button className="w-full shadow-lg hover:shadow-xl transition-all" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar Conta"}
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        Já tem uma conta?{" "}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Fazer login
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
