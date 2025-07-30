// utils/mapSemanticToNodes.ts
import { fetchSemanticPapers } from './fetchSemanticPapers';
import { geocodeAffiliation } from './geocodeAffiliation';
import { GlobeNode } from '../types';

export async function getSemanticGlobeNodes(query: string): Promise<GlobeNode[]> {
  const papers = await fetchSemanticPapers(query);
  const nodes: GlobeNode[] = [];

  for (const paper of papers) {
    const author = paper.authors?.[0];
    const affiliation = author?.affiliations?.[0]?.name || author?.name;
    if (!affiliation) continue;

    const coords = await geocodeAffiliation(affiliation);
    if (!coords) continue;

    nodes.push({
      lat: coords.lat,
      lng: coords.lng,
      title: paper.title,
      authors: author.name,
      published: paper.year,
      abstract: paper.abstract,
      link: paper.url
    });
  }

  return nodes;
}
