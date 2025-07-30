// utils/geocodeAffiliation.ts
const cache = new Map<string, { lat: number; lng: number }>();

export async function geocodeAffiliation(affiliation: string): Promise<{ lat: number; lng: number } | null> {
  if (!affiliation) return null;
  if (cache.has(affiliation)) return cache.get(affiliation)!;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(affiliation)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Worldthread/1.0 (your@email.com)' } // required by Nominatim policy
  });

  const json = await res.json();
  if (json.length === 0) return null;

  const coords = { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) };
  cache.set(affiliation, coords);
  return coords;
}
