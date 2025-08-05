// For arXiv papers
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

// Unified node for globe visualization
export type GlobeNode = {
  type: 'arxiv' | 'crossref';
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
  topic?: string; // opt for crossref nodes
};


export interface Repo {
  name: string;
  stars: number;
  language?: string;
  lat: number;
  lng: number;
  [key: string]: any;
}
