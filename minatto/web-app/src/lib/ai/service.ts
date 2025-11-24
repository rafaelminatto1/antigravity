export interface AISummary {
    summary: string;
    keyPoints: string[];
}

export interface AITreatmentSuggestion {
    title: string;
    description: string;
    duration: string;
    frequency: string;
}

export const aiService = {
    async summarizePatientHistory(patientId: string): Promise<AISummary> {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        return {
            summary: "Paciente apresenta quadro de evolução positiva no pós-operatório de LCA. Relata diminuição da dor (EVA 3/10) e ganho de amplitude de movimento. Adesão aos exercícios domiciliares tem sido consistente.",
            keyPoints: [
                "Melhora na ADM de flexão (110°)",
                "Redução do edema residual",
                "Fortalecimento de quadríceps em progresso",
                "Caminhada sem muletas iniciada"
            ]
        };
    },

    async getTreatmentSuggestions(condition: string): Promise<AITreatmentSuggestion[]> {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (condition.toLowerCase().includes("lca")) {
            return [
                {
                    title: "Protocolo de Fortalecimento Avançado",
                    description: "Foco em cadeia cinética fechada e propriocepção dinâmica.",
                    duration: "4 semanas",
                    frequency: "3x/semana"
                },
                {
                    title: "Treino Neuromuscular",
                    description: "Exercícios de aterrissagem e mudança de direção controlada.",
                    duration: "2 semanas",
                    frequency: "2x/semana"
                }
            ];
        }

        return [
            {
                title: "Terapia Manual e Mobilização",
                description: "Alívio da dor e ganho de mobilidade articular.",
                duration: "2 semanas",
                frequency: "2x/semana"
            },
            {
                title: "Exercícios de Estabilização",
                description: "Fortalecimento do core e estabilizadores locais.",
                duration: "4 semanas",
                frequency: "3x/semana"
            }
        ];
    }
};
