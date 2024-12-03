import { BookInfo } from "../types.ts";

export function mergeBookData(
  googleData: Partial<BookInfo>,
  wikidataData: Partial<BookInfo>
): BookInfo {
  // Merge authors without duplicates
  const authors = Array.from(new Set([
    ...(googleData.authors || []),
    ...(wikidataData.authors || [])
  ]));

  // Merge identifiers
  const identifiers = {
    ...(googleData.identifiers || {}),
    ...(wikidataData.identifiers || {})
  };

  // Merge source URLs
  const source_urls = {
    ...(googleData.source_urls || {}),
    ...(wikidataData.source_urls || {})
  };

  // Prefer Google Books data for most fields, fall back to Wikidata
  return {
    isbn: identifiers.isbn_13 || identifiers.isbn_10 || "",
    title: googleData.title || wikidataData.title || "",
    subtitle: googleData.subtitle,
    authors,
    publisher: googleData.publisher || wikidataData.publisher,
    publishedDate: googleData.publishedDate || wikidataData.publishedDate,
    description: googleData.description,
    pageCount: googleData.pageCount || wikidataData.pageCount,
    categories: googleData.categories,
    imageLinks: googleData.imageLinks,
    language: googleData.language,
    identifiers,
    source_urls,
  };
}