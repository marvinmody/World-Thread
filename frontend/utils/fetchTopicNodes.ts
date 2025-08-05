// utils/fetchTopicNodes.ts
import { GlobeNode } from '@/types';

export async function fetchTopicNodes(topic?: string): Promise<GlobeNode[]> {
  try {
    const url = topic && topic !== 'all' 
      ? `http://localhost:8000/papers?topic=${encodeURIComponent(topic)}`
      : 'http://localhost:8000/papers'; // Fetch all topics
    
    console.log(`🔍 Fetching from: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Received ${data.length} nodes for topic: ${topic || 'all'}`);
    
    // Transform backend data to GlobeNode format
    return data.map((node: any) => ({
      type: node.type || 'semantic_scholar',
      lat: node.lat,
      lng: node.lng,
      label: node.title,
      name: node.title,
      title: node.title,
      summary: node.abstract || node.summary || 'No abstract available',
      authors: node.authors || 'Unknown authors',
      abstract: node.abstract || node.summary || 'No abstract available',
      published: node.published || 'Unknown date',
      link: node.link || '#',
      topic: node.topic || topic || 'Unknown',
    }));
  } catch (error) {
    console.error('❌ Error fetching topic nodes:', error);
    return [];
  }
}