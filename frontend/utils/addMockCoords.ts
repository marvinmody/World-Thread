import { Repo } from '../types';

export const addMockCoords = (repos: Repo[]): Repo[] => {
  return repos.map((repo, i) => ({
    ...repo,
    lat: -60 + (i * 15) % 120,
    lng: -180 + (i * 25) % 360,
  }));
};
