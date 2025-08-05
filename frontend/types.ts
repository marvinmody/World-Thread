// types.ts
export interface ArxivPaper {
  type: 'paper';
  title: string;
  summary: string;
  link: string;
  published: string;
  authors: string;
  category: string;
  lat: number;
  lng: number;
}

// Enhanced unified node for globe visualization
export type GlobeNode = {
  type: 'arxiv' | 'crossref' | 'semantic_scholar' | 'fallback';
  lat: number;
  lng: number;
  label: string;
  name: string;
  title: string;
  summary: string;
  authors?: string;
  abstract?: string;
  published?: string;
  link?: string;
  category?: string;
  topic?: string;
  isRecent?: boolean;
  isFallback?: boolean; // New field for fallback nodes
};

export interface Repo {
  name: string;
  stars: number;
  language?: string;
  lat: number;
  lng: number;
  [key: string]: any;
}