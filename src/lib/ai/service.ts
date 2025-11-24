export interface AITreatmentSuggestion {
    title: string;
    description: string;
    duration: string;
    frequency: string;
}

export const aiService = {
    async getTreatmentSuggestions(_case: string): Promise<AITreatmentSuggestion[]> {
        // Mock data – replace with real AI integration later
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
    },
};
