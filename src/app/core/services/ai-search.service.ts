/**
 * AI Search Service
 *
 * Processes natural language search queries through Fiuto AI,
 * interprets intent, and returns structured search results.
 */
import { Injectable, inject } from '@angular/core';
import { FiutoAiGlobalService } from './fiuto-ai-global.service';

export interface AiSearchInterpretation {
  query: string;
  category?: string;
  filters?: Record<string, string>;
  summary?: string;
  relatedSearches?: string[];
}

@Injectable({ providedIn: 'root' })
export class AiSearchService {
  private readonly fiutoAi = inject(FiutoAiGlobalService);

  /**
   * Process a natural language query through AI.
   * Returns structured interpretation for the search service.
   */
  async processNaturalQuery(query: string): Promise<AiSearchInterpretation> {
    const response = await this.fiutoAi.sendMessage(
      `L'utente cerca: "${query}". Interpreta la richiesta e rispondi in modo conciso. Se possibile, suggerisci risultati o azioni nell'app.`,
      { route: 'search', mode: 'search' }
    );

    return {
      query,
      summary: response,
    };
  }

  /**
   * Get AI summary for search results.
   */
  async summarizeResults(results: unknown[], query: string): Promise<string> {
    if (!results.length) {
      return `Non ho trovato risultati per "${query}". Prova con termini diversi!`;
    }

    return this.fiutoAi.sendMessage(
      `Ho trovato ${results.length} risultati per "${query}". Dai un breve commento utile.`,
      { route: 'search', mode: 'search' }
    );
  }

  /**
   * Get related search suggestions.
   */
  async getRelatedSearches(query: string): Promise<string[]> {
    const response = await this.fiutoAi.sendMessage(
      `Suggerisci 3 ricerche correlate a "${query}" nell'ambito degli animali domestici. Rispondi solo con le 3 frasi separate da |`,
      { route: 'search', mode: 'search' }
    );

    return response.split('|').map(s => s.trim()).filter(Boolean).slice(0, 3);
  }
}
