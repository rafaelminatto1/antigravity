/**
 * Braintrust AI Observability Monitor
 * 
 * Monitora qualidade, custos e performance das chamadas de IA
 * para sugestões de tratamento e resumos de pacientes.
 * 
 * Documentação: https://www.braintrust.dev/docs
 */

// import * as braintrust from 'braintrust';

interface AICallMetadata {
  model: string;
  prompt: string;
  response: string;
  cost?: number;
  latency?: number;
  userId?: string;
  patientId?: string;
}

export class BraintrustMonitor {
  private isEnabled: boolean;
  private projectName: string;

  constructor() {
    this.isEnabled = !!process.env.BRAINTRUST_API_KEY;
    this.projectName = process.env.BRAINTRUST_PROJECT_NAME || 'fisioflow-ai';

    if (!this.isEnabled) {
      // console.warn('BRAINTRUST_API_KEY não configurada - monitoramento desabilitado');
    }
  }

  /**
   * Registra uma chamada de IA para monitoramento
   */
  async logAICall(
    eventName: string,
    metadata: AICallMetadata
  ): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    try {
      /*
      await braintrust.log({
        name: eventName,
        type: 'chat',
        input: {
          messages: [
            {
              role: 'user',
              content: metadata.prompt,
            },
          ],
        },
        output: {
          messages: [
            {
              role: 'assistant',
              content: metadata.response,
            },
          ],
        },
        metadata: {
          model: metadata.model,
          cost: metadata.cost,
          latency: metadata.latency,
          userId: metadata.userId,
          patientId: metadata.patientId,
        },
        project: this.projectName,
      });
      */
    } catch (error) {
      console.error('Erro ao registrar chamada de IA no Braintrust:', error);
      // Não lança erro para não quebrar o fluxo principal
    }
  }

  /**
   * Avalia qualidade de uma resposta de IA
   */
  async evaluateResponse(
    prompt: string,
    response: string,
    expectedCriteria?: string[]
  ): Promise<{
    score: number;
    feedback: string;
  }> {
    if (!this.isEnabled) {
      return { score: 0, feedback: 'Braintrust não configurado' };
    }

    try {
      /*
      // Usa Braintrust para avaliar a resposta
      const evaluation = await braintrust.evaluate({
        name: 'treatment-suggestion-eval',
        data: [
          {
            input: { prompt },
            expected: expectedCriteria?.join(', ') || '',
          },
        ],
        task: async (input) => {
          return response;
        },
        scores: [
          {
            name: 'relevance',
            scorer: braintrust.Scorers.relevance,
          },
          {
            name: 'safety',
            scorer: braintrust.Scorers.safety,
          },
        ],
      });

      return {
        score: evaluation.summary?.scores?.relevance || 0,
        feedback: evaluation.summary?.feedback || '',
      };
      */
      return { score: 0, feedback: 'Avaliação desabilitada temporariamente' };
    } catch (error) {
      console.error('Erro ao avaliar resposta no Braintrust:', error);
      return { score: 0, feedback: 'Erro na avaliação' };
    }
  }

  /**
   * Compara diferentes modelos de IA
   */
  async compareModels(
    prompt: string,
    responses: Array<{ model: string; response: string }>
  ): Promise<Array<{ model: string; score: number }>> {
    if (!this.isEnabled) {
      return responses.map(r => ({ model: r.model, score: 0 }));
    }

    try {
      /*
      const evaluations = await Promise.all(
        responses.map(async (r) => {
          const evalResult = await this.evaluateResponse(prompt, r.response);
          return {
            model: r.model,
            score: evalResult.score,
          };
        })
      );

      return evaluations;
      */
      return responses.map(r => ({ model: r.model, score: 0 }));
    } catch (error) {
      console.error('Erro ao comparar modelos no Braintrust:', error);
      return responses.map(r => ({ model: r.model, score: 0 }));
    }
  }
}

export const braintrustMonitor = new BraintrustMonitor();
