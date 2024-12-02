import { SearchResult, SearchProvider } from '../types';

export class GoogleBooksProvider implements SearchProvider {
  constructor(private apiKey: string) {}

  async search(query: string): Promise<SearchResult[]> {
    if (!this.apiKey) {
      console.error('Google Books search error: API key not found');
      return [];
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${this.apiKey}`
      );
      const data = await response.json();
      
      return (data.items || []).map((item: any) => ({
        id: item.id,
        title: item.volumeInfo.title,
        subtitle: item.volumeInfo.subtitle,
        description: item.volumeInfo.description || '',
        url: item.volumeInfo.infoLink,
        source: 'google_books',
        type: 'book',
        authors: item.volumeInfo.authors,
        publishedDate: item.volumeInfo.publishedDate,
        imageLinks: item.volumeInfo.imageLinks,
        identifiers: {
          isbn: item.volumeInfo.industryIdentifiers
            ?.filter((id: any) => id.type.includes('ISBN'))
            ?.map((id: any) => id.identifier),
          oclc: item.volumeInfo.industryIdentifiers
            ?.find((id: any) => id.type === 'OTHER' && id.identifier.startsWith('OCLC'))
            ?.identifier
        }
      }));
    } catch (error) {
      console.error('Google Books search error:', error);
      return [];
    }
  }
}