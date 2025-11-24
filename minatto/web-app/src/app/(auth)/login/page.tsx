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
import { toast } from "sonner";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            router.push("/");
            router.refresh();
        } catch (error: any) {
            console.error("Login error:", error);
            // You might want to add a toast notification here
            alert("Erro ao fazer login: " + error.message);
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
                <CardTitle className="text-2xl font-bold text-gradient">Bem-vindo de volta</CardTitle>
                <CardDescription>
                    Entre com suas credenciais para acessar o sistema
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
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
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Senha</Label>
                            <Link href="#" className="text-xs text-primary hover:underline">
                                Esqueceu a senha?
                            </Link>
                        </div>
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
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Entrar"}
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        Não tem uma conta?{" "}
                        <Link href="/register" className="text-primary hover:underline font-medium">
                            Criar conta
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
