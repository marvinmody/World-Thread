// utils/mapArxivToNodes.ts

import { GlobeNode } from '@/types';


export async function getArxivGlobeNodes(topic?: string): Promise<GlobeNode[]> {
  const topics = topic ? [topic] : ['AI', 'Space', 'Environmental'];
  const allNodes = await Promise.all(
    topics.map(async (t) => {
      const response = await fetch(`http://localhost:8000/arxiv?topic=${encodeURIComponent(t)}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.map((node: any) => ({ ...node, topic: t })); // <– adds topic tag
    })
  );
  
  return allNodes.flat();
}

