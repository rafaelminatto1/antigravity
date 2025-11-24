import { RichEditor } from "@/components/editor/rich-editor";
import { CollaborationPanel } from "@/components/editor/collaboration-panel";
import { Button } from "@/components/ui/button";
import { Save, Share2 } from "lucide-react";

export default function NotebooksPage() {
    return (
        <div className="flex h-[calc(100vh-100px)] gap-6">
            <div className="flex-1 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gradient">Notebooks</h2>
                        <p className="text-muted-foreground">
                            Documentação clínica e protocolos.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Share2 className="mr-2 h-4 w-4" />
                            Compartilhar
                        </Button>
                        <Button>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border bg-background shadow-lg">
                    <RichEditor />
                </div>
            </div>

            <div className="w-80 hidden xl:block rounded-xl border bg-background shadow-lg overflow-hidden">
                <CollaborationPanel />
            </div>
        </div>
    );
}
