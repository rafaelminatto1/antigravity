/**
 * Mixedbread Search API Service
 * 
 * Integração com Mixedbread para busca multimodal e multilíngue
 * na knowledge base de fisioterapia.
 * 
 * Documentação: https://mixedbread.ai/docs
 */

interface MixedbreadSearchOptions {
  query: string;
  limit?: number;
  filters?: Record<string, any>;
  language?: string;
}

interface MixedbreadSearchResult {
  id: string;
  title: string;
  content: string;
  score: number;
  metadata?: Record<string, any>;
}

export class MixedbreadService {
  private apiKey: string;
  private baseUrl = 'https://api.mixedbread.ai/v1';

  constructor() {
    this.apiKey = process.env.MIXEDBREAD_API_KEY || '';
    if (!this.apiKey) {
      console.warn('MIXEDBREAD_API_KEY não configurada');
    }
  }

  /**
   * Realiza busca multimodal na knowledge base
   */
  async search(options: MixedbreadSearchOptions): Promise<MixedbreadSearchResult[]> {
    if (!this.apiKey) {
      throw new Error('MIXEDBREAD_API_KEY não configurada');
    }

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          query: options.query,
          limit: options.limit || 10,
          filters: options.filters,
          language: options.language || 'pt',
        }),
      });

      if (!response.ok) {
        throw new Error(`Mixedbread API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Erro ao buscar no Mixedbread:', error);
      throw error;
    }
  }

  /**
   * Indexa um documento na knowledge base
   */
  async indexDocument(document: {
    id: string;
    title: string;
    content: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    if (!this.apiKey) {
      throw new Error('MIXEDBREAD_API_KEY não configurada');
    }

    try {
      const response = await fetch(`${this.baseUrl}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(document),
      });

      if (!response.ok) {
        throw new Error(`Mixedbread API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro ao indexar documento no Mixedbread:', error);
      throw error;
    }
  }

  /**
   * Remove um documento indexado
   */
  async deleteDocument(documentId: string): Promise<void> {
    if (!this.apiKey) {
      throw new Error('MIXEDBREAD_API_KEY não configurada');
    }

    try {
      const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Mixedbread API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro ao deletar documento no Mixedbread:', error);
      throw error;
    }
  }
}

export const mixedbreadService = new MixedbreadService();

