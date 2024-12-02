import { SearchResult } from '../types';

export async function searchGoogleBooks(query: string): Promise<SearchResult[]> {
  const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
  if (!GOOGLE_API_KEY) {
    console.error('Google Books search error: API key not found');
    return [];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`
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
      imageLinks: item.volumeInfo.imageLinks
    }));
  } catch (error) {
    console.error('Google Books search error:', error);
    return [];
  }
}