// utils/fetchCrossrefPapers.ts
export async function fetchCrossrefPapers(query: string, rows = 20) {
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${rows}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch Crossref papers');

  const data = await response.json();
  return data.message.items; // Crossref returns papers under message.items
}
