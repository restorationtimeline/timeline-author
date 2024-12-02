import { SearchResult, SearchProvider } from '../types.ts';

export class YouTubeProvider implements SearchProvider {
  constructor(private apiKey: string) {}

  async search(query: string): Promise<SearchResult[]> {
    if (!this.apiKey) {
      console.error('YouTube search error: API key not found');
      return [];
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${this.apiKey}&type=video`
      );
      const data = await response.json();
      
      return (data.items || []).map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        source: 'youtube',
        type: 'video'
      }));
    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  }
}