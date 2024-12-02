import { SearchResult, SearchProvider } from './types';

export class SearchService {
  constructor(private providers: SearchProvider[]) {}

  async search(query: string): Promise<SearchResult[]> {
    try {
      // Execute all searches in parallel
      const results = await Promise.all(
        this.providers.map(provider => provider.search(query))
      );

      // Combine all results
      return results.flat();
    } catch (error) {
      console.error('Search service error:', error);
      return [];
    }
  }
}