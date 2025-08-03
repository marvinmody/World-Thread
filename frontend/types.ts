

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
  type: 'arxiv';
  lat: number;
  lng: number;
  name: string; // REQUIRED by react-globe.gl
  title: string;
  summary: string;
  authors: string;
  published: string;
}
