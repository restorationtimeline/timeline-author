export interface BookInfo {
  isbn: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  language?: string;
  identifiers: {
    isbn_10?: string;
    isbn_13?: string;
    wikidata_id?: string;
    google_books_id?: string;
  };
  source_urls: {
    google_books?: string;
    wikidata?: string;
  };
}