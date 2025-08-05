// utils/mapCrossrefToNodes.ts
import { GlobeNode } from '@/types';
import { fetchCrossrefPapers } from './fetchCrossrefPapers';
import { geocodeAffiliation } from './geocodeAffiliation';

export async function getCrossrefGlobeNodes(topic: string): Promise<GlobeNode[]> {
  try {
    console.log(`🔍 Fetching Crossref papers for: ${topic}`);
    const papers = await fetchCrossrefPapers(topic, 20);
    const nodes: GlobeNode[] = [];

    for (const paper of papers.slice(0, 10)) { // Limit to avoid rate limits
      try {
        // Get first author's affiliation
        const firstAuthor = paper.author?.[0];
        const affiliation = firstAuthor?.affiliation?.[0]?.name;
        
        if (!affiliation) continue;
        
        const coords = await geocodeAffiliation(affiliation);
        if (!coords) continue;

        const node: GlobeNode = {
          type: 'crossref',
          lat: coords.lat,
          lng: coords.lng,
          label: paper.title?.[0] || 'Untitled',
          name: paper.title?.[0] || 'Untitled',
          title: paper.title?.[0] || 'Untitled',
          summary: paper.abstract || 'No abstract available',
          authors: paper.author?.map((a: any) => `${a.given} ${a.family}`).join(', ') || 'Unknown',
          abstract: paper.abstract || 'No abstract available',
          published: paper.published?.['date-parts']?.[0]?.[0]?.toString() || 'Unknown',
          link: paper.URL || '#',
          topic: topic,
        };

        nodes.push(node);
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1100));
      } catch (error) {
        console.error('Error processing paper:', error);
        continue;
      }
    }

    console.log(`✅ Processed ${nodes.length} Crossref nodes for ${topic}`);
    return nodes;
  } catch (error) {
    console.error('❌ Error fetching Crossref nodes:', error);
    return [];
  }
}