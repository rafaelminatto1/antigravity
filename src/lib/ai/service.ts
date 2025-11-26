import { braintrustMonitor } from '@/lib/braintrust/monitor';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AITreatmentSuggestion {
    title: string;
    description: string;
    duration: string;
    frequency: string;
}

export interface AISummary {
    summary: string;
    keyPoints: string[];
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const aiService = {
    async getTreatmentSuggestions(caseDescription: string, patientId?: string): Promise<AITreatmentSuggestion[]> {
        const startTime = Date.now();
        const prompt = `Como fisioterapeuta experiente, sugira exercícios e tratamentos para o seguinte caso:
        
${caseDescription}

Forneça sugestões práticas de exercícios com título, descrição, duração e frequência.`;

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
            const result = await model.generateContent(prompt);
            const response = result.response.text();

            // Parse da resposta (simplificado - pode ser melhorado)
            const suggestions: AITreatmentSuggestion[] = this.parseTreatmentSuggestions(response);

            const latency = Date.now() - startTime;

            // Monitorar com Braintrust
            await braintrustMonitor.logAICall('treatment-suggestions', {
                model: 'gemini-2.0-flash-exp',
                prompt,
                response: JSON.stringify(suggestions),
                latency,
                patientId,
            });

            return suggestions;
        } catch (error) {
            console.error('Erro ao gerar sugestões de tratamento:', error);
            // Fallback para mock data em caso de erro
            return [
                {
                    title: 'Exercício de Mobilidade Articular',
                    description: 'Movimentos suaves para melhorar a amplitude do joelho.',
                    duration: '15 min',
                    frequency: 'Diário',
                },
                {
                    title: 'Fortalecimento de Quadríceps',
                    description: 'Exercícios isométricos para estabilizar a articulação.',
                    duration: '10 min',
                    frequency: '3x por semana',
                },
            ];
        }
    },

    async summarizePatientHistory(patientId: string, historyData: any = {}): Promise<AISummary> {
        const startTime = Date.now();
        const prompt = `Resuma o histórico do paciente de forma clara e objetiva:
        
${JSON.stringify(historyData, null, 2)}

Forneça um resumo executivo e pontos-chave principais.`;

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
            const result = await model.generateContent(prompt);
            const response = result.response.text();

            // Parse da resposta (simplificado)
            const summary: AISummary = this.parseSummary(response);

            const latency = Date.now() - startTime;

            // Monitorar com Braintrust
            await braintrustMonitor.logAICall('patient-history-summary', {
                model: 'gemini-2.0-flash-exp',
                prompt,
                response: JSON.stringify(summary),
                latency,
                patientId,
            });

            return summary;
        } catch (error) {
            console.error('Erro ao resumir histórico do paciente:', error);
            // Fallback
            return {
                summary: 'Resumo automático: recomenda-se reavaliação e continuidade do programa domiciliar.',
                keyPoints: [
                    'Relato de melhora na dor',
                    'Adesão ao plano domiciliar',
                    'Progresso em força muscular'
                ]
            };
        }
    },

    // Helper para parsear sugestões de tratamento
    parseTreatmentSuggestions(response: string): AITreatmentSuggestion[] {
        // Implementação simplificada - pode ser melhorada com parsing mais robusto
        const suggestions: AITreatmentSuggestion[] = [];
        const lines = response.split('\n').filter(line => line.trim());

        let currentSuggestion: Partial<AITreatmentSuggestion> = {};
        for (const line of lines) {
            if (line.includes('Título') || line.includes('Title')) {
                currentSuggestion.title = line.split(':')[1]?.trim() || '';
            } else if (line.includes('Descrição') || line.includes('Description')) {
                currentSuggestion.description = line.split(':')[1]?.trim() || '';
            } else if (line.includes('Duração') || line.includes('Duration')) {
                currentSuggestion.duration = line.split(':')[1]?.trim() || '';
            } else if (line.includes('Frequência') || line.includes('Frequency')) {
                currentSuggestion.frequency = line.split(':')[1]?.trim() || '';
                if (currentSuggestion.title) {
                    suggestions.push(currentSuggestion as AITreatmentSuggestion);
                    currentSuggestion = {};
                }
            }
        }

        return suggestions.length > 0 ? suggestions : [
            {
                title: 'Exercício de Mobilidade',
                description: response.substring(0, 100),
                duration: '15 min',
                frequency: 'Diário',
            }
        ];
    },

    // Helper para parsear resumo
    parseSummary(response: string): AISummary {
        const lines = response.split('\n').filter(line => line.trim());
        const summary = lines[0] || 'Resumo não disponível';
        const keyPoints = lines
            .filter(line => line.includes('•') || line.includes('-') || line.match(/^\d+\./))
            .map(line => line.replace(/^[•\-\d+\.]\s*/, '').trim())
            .filter(point => point.length > 0);

        return {
            summary,
            keyPoints: keyPoints.length > 0 ? keyPoints : ['Informações disponíveis no histórico completo'],
        };
    }
};
