"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, File } from "lucide-react";
import { libraryService, ClinicalMaterial } from "@/lib/services/libraryService";
import { toast } from "sonner";

export default function MateriaisPage() {
  const [materials, setMaterials] = useState<ClinicalMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [specialty, setSpecialty] = useState<string>("all");

  useEffect(() => {
    loadMaterials();
  }, [search, category, specialty]);

  const loadMaterials = async () => {
    try {
      setIsLoading(true);
      const data = await libraryService.getClinicalMaterials({
        search: search || undefined,
        category: category !== "all" ? category : undefined,
        specialty: specialty !== "all" ? specialty : undefined,
      });
      setMaterials(data);
    } catch (error) {
      console.error("Erro ao carregar materiais:", error);
      toast.error("Erro ao carregar materiais");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (materialId: string, fileUrl: string) => {
    try {
      await libraryService.downloadMaterial(materialId);
      window.open(fileUrl, '_blank');
      toast.success("Download iniciado!");
    } catch (error) {
      console.error("Erro ao fazer download:", error);
      toast.error("Erro ao fazer download");
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Materiais Clínicos</h1>
          <p className="text-muted-foreground">
            Acesse fichas, escalas e formulários clínicos
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar materiais..."
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
            <SelectItem value="evaluation">Avaliação</SelectItem>
            <SelectItem value="scale">Escala</SelectItem>
            <SelectItem value="form">Formulário</SelectItem>
            <SelectItem value="protocol">Protocolo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Especialidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="orthopedics">Ortopedia</SelectItem>
            <SelectItem value="gerontology">Gerontologia</SelectItem>
            <SelectItem value="sports">Esportiva</SelectItem>
            <SelectItem value="neurology">Neurologia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : materials.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum material encontrado
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{material.name}</CardTitle>
                  <File className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {material.category && (
                    <Badge variant="secondary">{material.category}</Badge>
                  )}
                  {material.specialty && (
                    <Badge variant="outline">{material.specialty}</Badge>
                  )}
                </div>
                {material.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {material.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatFileSize(material.file_size)}</span>
                  <span>{material.download_count} downloads</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleDownload(material.id, material.file_url)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

