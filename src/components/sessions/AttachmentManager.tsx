"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, File, Download, Trash2 } from "lucide-react";
import { prontuarioService, MedicalAttachment } from "@/lib/services/prontuarioService";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AttachmentManagerProps {
  patientId: string;
  sessionId?: string;
}

export function AttachmentManager({ patientId, sessionId }: AttachmentManagerProps) {
  const [attachments, setAttachments] = useState<MedicalAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadData, setUploadData] = useState({
    description: "",
    category: "other" as MedicalAttachment['category'],
  });

  useEffect(() => {
    loadAttachments();
  }, [patientId, sessionId]);

  const loadAttachments = async () => {
    try {
      setIsLoading(true);
      const data = await prontuarioService.getAttachments(patientId, sessionId);
      setAttachments(data);
    } catch (error) {
      console.error("Erro ao carregar anexos:", error);
      toast.error("Erro ao carregar anexos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const attachment = await prontuarioService.uploadAttachment(patientId, file, {
        sessionId,
        description: uploadData.description,
        category: uploadData.category,
      });
      
      toast.success("Arquivo enviado com sucesso!");
      setAttachments([attachment, ...attachments]);
      setShowUploadForm(false);
      setUploadData({ description: "", category: "other" });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      toast.error("Erro ao enviar arquivo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm("Tem certeza que deseja excluir este anexo?")) return;

    try {
      await prontuarioService.deleteAttachment(attachmentId);
      toast.success("Anexo excluído com sucesso!");
      setAttachments(attachments.filter(a => a.id !== attachmentId));
    } catch (error) {
      console.error("Erro ao excluir anexo:", error);
      toast.error("Erro ao excluir anexo");
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCategoryLabel = (category?: string) => {
    const labels: Record<string, string> = {
      exam: "Exame",
      image: "Imagem",
      document: "Documento",
      other: "Outro",
    };
    return labels[category || "other"] || "Outro";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Anexos</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Novo Anexo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showUploadForm && (
          <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
            <div className="space-y-2">
              <Label htmlFor="file">Arquivo</Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={uploadData.category}
                onValueChange={(value) => setUploadData({ ...uploadData, category: value as MedicalAttachment['category'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exam">Exame</SelectItem>
                  <SelectItem value="image">Imagem</SelectItem>
                  <SelectItem value="document">Documento</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                placeholder="Descrição do arquivo..."
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadForm(false);
                  setUploadData({ description: "", category: "other" });
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando anexos...</div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum anexo cadastrado
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{attachment.file_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{getCategoryLabel(attachment.category)}</span>
                      <span>•</span>
                      <span>{formatFileSize(attachment.file_size)}</span>
                      <span>•</span>
                      <span>
                        {format(new Date(attachment.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    {attachment.description && (
                      <p className="text-sm text-muted-foreground mt-1">{attachment.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(attachment.file_url, "_blank")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(attachment.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

