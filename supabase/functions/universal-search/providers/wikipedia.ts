import { SearchResult, SearchProvider } from '../types';

export class WikipediaProvider implements SearchProvider {
  async search(query: string): Promise<SearchResult[]> {
    try {
      // First get search results
      const searchResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
      );
      const searchData = await searchResponse.json();
      
      // Then get Wikidata IDs for each result
      const results = await Promise.all((searchData.query?.search || []).map(async (item: any) => {
        try {
          const pageResponse = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&titles=${encodeURIComponent(item.title)}&format=json&origin=*`
          );
          const pageData = await pageResponse.json();
          const page = Object.values(pageData.query.pages)[0] as any;
          const wikidataId = page.pageprops?.wikibase_item;

          return {
            id: item.pageid.toString(),
            title: item.title,
            description: item.snippet.replace(/<\/?[^>]+(>|$)/g, ""),
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
            source: 'wikipedia',
            type: 'article',
            identifiers: wikidataId ? {
              wikidata: wikidataId
            } : undefined
          };
        } catch (error) {
          console.error('Wikipedia page data error:', error);
          return null;
        }
      }));

      return results.filter((result): result is SearchResult => result !== null);
    } catch (error) {
      console.error('Wikipedia search error:', error);
      return [];
    }
  }
}