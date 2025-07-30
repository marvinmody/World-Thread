// utils/fetchSemanticPapers.ts
export async function fetchSemanticPapers(query: string, limit = 20) {
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,abstract,year,authors,url`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch Semantic Scholar papers');

  const data = await response.json();
  return data.data;
}
