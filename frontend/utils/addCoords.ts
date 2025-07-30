import { Repo } from '../types';

const mapLanguageToCoords = (lang: string): [number, number] => {
  const langMap: Record<string, [number, number]> = {
    JavaScript: [37.7749, -122.4194], // San Francisco
    Python: [51.5074, -0.1278],       // London
    Go: [35.6895, 139.6917],          // Tokyo
    Rust: [52.52, 13.405],            // Berlin
    TypeScript: [40.7128, -74.0060],  // New York
  };
  return langMap[lang] || [0, 0]; // fallback to equator
};

export const addCoords = (repos: Omit<Repo, 'lat' | 'lng'>[]): Repo[] => {
  return repos.map(repo => {
    const [lat, lng] = mapLanguageToCoords(repo.language);
    return { ...repo, lat, lng };
  });
};
