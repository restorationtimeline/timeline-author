export async function fetchWikidataInfo(isbn: string): Promise<Partial<BookInfo>> {
  const sparqlQuery = `
    SELECT ?book ?bookLabel ?author ?authorLabel ?publisher ?publisherLabel ?publicationDate ?pages WHERE {
      ?book wdt:P212 "${isbn}".
      OPTIONAL { ?book wdt:P50 ?author. }
      OPTIONAL { ?book wdt:P123 ?publisher. }
      OPTIONAL { ?book wdt:P577 ?publicationDate. }
      OPTIONAL { ?book wdt:P1104 ?pages. }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
    }
  `;

  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'BookInfoBot/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`Wikidata query error: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.results.bindings.length) {
    return {};
  }

  const result = data.results.bindings[0];
  const wikidataId = result.book.value.split('/').pop();

  return {
    title: result.bookLabel?.value,
    authors: result.authorLabel ? [result.authorLabel.value] : [],
    publisher: result.publisherLabel?.value,
    publishedDate: result.publicationDate?.value,
    pageCount: result.pages?.value ? parseInt(result.pages.value) : undefined,
    identifiers: {
      wikidata_id: wikidataId,
    },
    source_urls: {
      wikidata: `https://www.wikidata.org/wiki/${wikidataId}`,
    },
  };
}