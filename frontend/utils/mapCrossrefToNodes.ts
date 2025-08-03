// utils/mapCrossrefToNodes.ts
import { fetchCrossrefPapers } from './fetchCrossrefPapers';
import { geocodeAffiliation } from './geocodeAffiliation';
import { GlobeNode } from '../types';

export async function getCrossrefGlobeNodes(query: string): Promise<GlobeNode[]> {
  const papers = await fetchCrossrefPapers(query);
  const nodes: GlobeNode[] = [];

  for (const paper of papers) {
    const author = paper.author?.[0];
    const affiliation = author?.affiliation?.[0]?.name || author?.family || author?.given;
    if (!affiliation) continue;

    const coords = await geocodeAffiliation(affiliation);
    if (!coords) continue;

    nodes.push({
      lat: coords.lat,
      lng: coords.lng,
      type: 'crossref', // <-- important!
      title: item.title?.[0] || 'Untitled',
      authors: item.author?.map(a => `${a.given} ${a.family}`).join(', ') || 'Unknown',
      published: item.published?.['date-parts']?.[0]?.[0] || 0,
      abstract: item.abstract || '',
      link: item.URL || ''
    });
  }

  return nodes;
}
