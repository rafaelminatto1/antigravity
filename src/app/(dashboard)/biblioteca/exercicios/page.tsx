"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { libraryService, Exercise } from "@/lib/services/libraryService";
import { toast } from "sonner";

export default function ExerciciosPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    loadExercises();
  }, [search, category]);

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      const data = await libraryService.getExercises(undefined, {
        search: search || undefined,
        category: category !== "all" ? category : undefined,
      });
      setExercises(data);
    } catch (error) {
      console.error("Erro ao carregar exercícios:", error);
      toast.error("Erro ao carregar exercícios");
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyStars = (difficulty?: number) => {
    if (!difficulty) return "N/A";
    return "⭐".repeat(difficulty);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Biblioteca de Exercícios</h1>
          <p className="text-muted-foreground">
            Gerencie exercícios e prescrições
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Exercício
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar exercícios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="strength">Força</SelectItem>
            <SelectItem value="flexibility">Flexibilidade</SelectItem>
            <SelectItem value="balance">Equilíbrio</SelectItem>
            <SelectItem value="cardio">Cardio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum exercício encontrado
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{exercise.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {exercise.category && (
                  <Badge variant="secondary">{exercise.category}</Badge>
                )}
                {exercise.difficulty && (
                  <div className="text-sm">
                    Dificuldade: {getDifficultyStars(exercise.difficulty)}
                  </div>
                )}
                {exercise.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {exercise.description}
                  </p>
                )}
                {exercise.video_url && (
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Vídeo
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

