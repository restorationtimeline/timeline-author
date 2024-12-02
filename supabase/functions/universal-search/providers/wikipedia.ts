import { SearchResult } from '../types';

export async function searchWikipedia(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
    );
    const data = await response.json();
    
    return (data.query?.search || []).map((item: any) => ({
      id: item.pageid.toString(),
      title: item.title,
      description: item.snippet.replace(/<\/?[^>]+(>|$)/g, ""),
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
      source: 'wikipedia',
      type: 'article'
    }));
  } catch (error) {
    console.error('Wikipedia search error:', error);
    return [];
  }
}