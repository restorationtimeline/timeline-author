const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");

export async function fetchGoogleBooksInfo(isbn: string): Promise<Partial<BookInfo>> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${GOOGLE_API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Books API error: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.items || data.items.length === 0) {
    return {};
  }

  const book = data.items[0].volumeInfo;
  const googleId = data.items[0].id;

  return {
    title: book.title,
    subtitle: book.subtitle,
    authors: book.authors || [],
    publisher: book.publisher,
    publishedDate: book.publishedDate,
    description: book.description,
    pageCount: book.pageCount,
    categories: book.categories,
    imageLinks: book.imageLinks,
    language: book.language,
    identifiers: {
      isbn_10: book.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier,
      isbn_13: book.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier,
      google_books_id: googleId,
    },
    source_urls: {
      google_books: `https://books.google.com/books?id=${googleId}`,
    },
  };
}