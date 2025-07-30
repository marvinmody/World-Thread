export interface Repo {
  type: 'repo';
  name: string;
  description: string;
  stars: number;
  language: string;
  lat: number;
  lng: number;
}

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

export interface GlobeNode {
  type: 'repo' | 'arxiv';
  lat: number;
  lng: number;
  name: string;
  description?: string;
  stars?: number;
  language?: string;
  link?: string;
  authors?: string;
  published?: string;
}

