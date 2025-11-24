import { KnowledgeSearch } from '@/components/knowledge/knowledge-search';
import { DocumentList } from '@/components/knowledge/document-list';
import { UploadDocument } from '@/components/knowledge/upload-document';

export default async function KnowledgePage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gradient">
                        Base de Conhecimento
                    </h2>
                    <p className="text-muted-foreground">
                        Pesquise documentos, protocolos e estudos com IA
                    </p>
                </div>
                <UploadDocument />
            </div>

            <KnowledgeSearch />
            <DocumentList />
        </div>
    );
}
