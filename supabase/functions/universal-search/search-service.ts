import { SearchResult, SearchProvider } from './types.ts';

export class SearchService {
  constructor(private providers: SearchProvider[]) {}

  private matchResults(results: SearchResult[]): SearchResult[] {
    const matchedResults = new Map<string, SearchResult>();

    results.forEach(result => {
      // Try to find a match based on identifiers
      let matchKey = '';
      
      if (result.identifiers?.isbn) {
        matchKey = `isbn:${result.identifiers.isbn[0]}`;
      } else if (result.identifiers?.wikidata) {
        matchKey = `wikidata:${result.identifiers.wikidata}`;
      } else if (result.identifiers?.viaf) {
        matchKey = `viaf:${result.identifiers.viaf}`;
      } else {
        // If no identifiers, use normalized title + authors as fallback
        const normalizedTitle = result.title.toLowerCase().trim();
        const normalizedAuthors = result.authors?.map(a => a.toLowerCase().trim()).sort().join(',') || '';
        matchKey = `title:${normalizedTitle}|authors:${normalizedAuthors}`;
      }

      if (matchedResults.has(matchKey)) {
        // Merge with existing result
        const existing = matchedResults.get(matchKey)!;
        existing.alternateSourceUrls = {
          ...existing.alternateSourceUrls,
          [result.source]: result.url
        };
        
        // Merge identifiers
        existing.identifiers = {
          ...existing.identifiers,
          ...result.identifiers
        };
        
        // Keep the most complete description
        if (result.description && (!existing.description || result.description.length > existing.description.length)) {
          existing.description = result.description;
        }
        
        // Keep the best image
        if (result.imageLinks?.thumbnail && !existing.imageLinks?.thumbnail) {
          existing.imageLinks = result.imageLinks;
        }
      } else {
        // Add as new result with initial alternateSourceUrls
        result.alternateSourceUrls = {
          [result.source]: result.url
        };
        matchedResults.set(matchKey, result);
      }
    });

    return Array.from(matchedResults.values());
  }

  async search(query: string): Promise<SearchResult[]> {
    try {
      // Execute all searches in parallel
      const results = await Promise.all(
        this.providers.map(provider => provider.search(query))
      );

      // Combine and match results
      const combinedResults = results.flat();
      const matchedResults = this.matchResults(combinedResults);

      console.log(`Found ${combinedResults.length} total results, merged into ${matchedResults.length} unique items`);
      
      return matchedResults;
    } catch (error) {
      console.error('Search service error:', error);
      return [];
    }
  }
}
