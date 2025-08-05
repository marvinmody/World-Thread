// utils/fetchTopicNodes.ts
import { GlobeNode } from '@/types';

interface ApiResponse {
  nodes: any[];
  total: number;
  failed_topics: string[];
  has_fallback: boolean;
  freshness_window?: string;
  cache_hit?: boolean;
}

/**
 * Get date for freshness filtering (60 days ago)
 */
function getFreshnessDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 60);
  return date;
}

/**
 * Check if a paper is fresh (within last 60 days)
 */
function isPaperFresh(publishedDate: string): boolean {
  if (!publishedDate) return false;
  
  try {
    const pubDate = new Date(publishedDate);
    const freshnessDate = getFreshnessDate();
    return pubDate >= freshnessDate;
  } catch {
    return false;
  }
}

/**
 * Enhanced fetch with performance optimizations
 */
export async function fetchTopicNodes(
  topic?: string, 
  offset = 0, 
  recentOnly = true, // Default to fresh articles
  batchSize = 20 // Smaller batches for faster response
): Promise<GlobeNode[]> {
  try {
    const params = new URLSearchParams();
    
    if (topic && topic !== 'all') {
      params.append('topic', topic);
    }
    
    if (offset > 0) {
      params.append('offset', offset.toString());
    }
    
    // Always request recent articles by default
    params.append('recent_only', recentOnly.toString());
    
    if (batchSize !== 20) {
      params.append('batch_size', batchSize.toString());
    }
    
    const url = `http://localhost:8000/papers${params.toString() ? '?' + params.toString() : ''}`;
    
    console.log(`🔍 Fetching fresh articles from: ${url}`);
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(60000) // couldnt do 15, maybe 60 works better
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data: ApiResponse = await response.json();
    console.log(`✅ Received ${data.nodes.length} nodes for topic: ${topic || 'all'}`);
    
    if (data.freshness_window) {
      console.log(`📅 Freshness window: ${data.freshness_window}`);
    }
    
    if (data.cache_hit) {
      console.log(`⚡ Cache hit - fast response`);
    }
    
    if (data.failed_topics.length > 0) {
      console.warn(`⚠️ Failed topics: ${data.failed_topics.join(', ')}`);
    }

    // Client-side freshness validation as backup
    const freshnessDate = getFreshnessDate();
    
    const nodes = data.nodes
      .filter((node: any) => {
        // Double-check freshness on client side
        if (recentOnly && !node.is_fallback) {
          return isPaperFresh(node.published);
        }
        return true;
      })
      .map((node: any): GlobeNode => ({
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
        isRecent: node.is_recent || false,
        isFallback: node.is_fallback || false,
      }));
    
    return nodes;
  } catch (error) {
    console.error('❌ Error fetching topic nodes:', error);
    return [];
  }
}

/**
 * Progressive loading with freshness priority
 */
export async function fetchTopicNodesBatched(
  topic: string,
  onBatch: (nodes: GlobeNode[]) => void,
  recentOnly = true,
  totalToFetch = 40,
  batchSize = 10 // Smaller batches for progressive loading
): Promise<void> {
  try {
    const numBatches = Math.ceil(totalToFetch / batchSize);
    console.log(`🚀 Progressive load: ${numBatches} batches of ${batchSize} for "${topic}" (fresh articles only: ${recentOnly})`);

    for (let i = 0; i < numBatches; i++) {
      const offset = i * batchSize;
      
      const nodes = await fetchTopicNodes(topic, offset, recentOnly, batchSize);
      
      if (nodes.length > 0) {
        // Filter out non-fresh articles if requested
        const freshNodes = recentOnly ? 
          nodes.filter(node => node.isFallback || isPaperFresh(node.published)) :
          nodes;
          
        if (freshNodes.length > 0) {
          onBatch(freshNodes);
        }
      }

      if (nodes.length < batchSize) {
        console.log("🏁 Reached end of fresh results");
        break;
      }

      // Short delay between batches for smooth UX
      if (i < numBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  } catch (error) {
    console.error('❌ Error in batched fetch:', error);
  }
}

/**
 * Fetch with metadata and freshness info
 */
export async function fetchTopicNodesWithMeta(
  topic?: string, 
  offset = 0, 
  recentOnly = true,
  batchSize = 20
): Promise<{ 
  nodes: GlobeNode[], 
  hasFallback: boolean, 
  failedTopics: string[],
  freshnessWindow?: string 
}> {
  try {
    const params = new URLSearchParams();
    
    if (topic && topic !== 'all') {
      params.append('topic', topic);
    }
    
    if (offset > 0) {
      params.append('offset', offset.toString());
    }
    
    params.append('recent_only', recentOnly.toString());
    
    if (batchSize !== 20) {
      params.append('batch_size', batchSize.toString());
    }
    
    const url = `http://localhost:8000/papers${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data: ApiResponse = await response.json();
    
    const nodes = data.nodes.map((node: any): GlobeNode => ({
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
      isRecent: node.is_recent || false,
      isFallback: node.is_fallback || false,
    }));
    
    return {
      nodes,
      hasFallback: data.has_fallback,
      failedTopics: data.failed_topics,
      freshnessWindow: data.freshness_window
    };
  } catch (error) {
    console.error('❌ Error fetching topic nodes with meta:', error);
    return {
      nodes: [],
      hasFallback: false,
      failedTopics: [],
      freshnessWindow: undefined
    };
  }
}

/**
 * Check if articles need refresh (daily check)
 */
export function shouldRefreshArticles(): boolean {
  const lastRefresh = localStorage.getItem('lastArticleRefresh');
  if (!lastRefresh) return true;
  
  const lastRefreshDate = new Date(lastRefresh);
  const now = new Date();
  
  // Refresh if it's a new day
  return lastRefreshDate.toDateString() !== now.toDateString();
}

/**
 * Mark articles as refreshed
 */
export function markArticlesRefreshed(): void {
  localStorage.setItem('lastArticleRefresh', new Date().toISOString());
}

/**
 * Enhanced API status check
 */
export async function checkApiStatus(): Promise<{
  semanticScholar: string, 
  crossref: string,
  freshnessWindow?: string
}> {
  try {
    const response = await fetch('http://localhost:8000/health');
    const data = await response.json();
    return {
      semanticScholar: data.api_key_configured ? 'available_with_key' : 'available',
      crossref: 'available',
      freshnessWindow: data.freshness_window
    };
  } catch (error) {
    console.error('Error checking API status:', error);
    return {
      semanticScholar: 'unknown',
      crossref: 'unknown'
    };
  }
}