import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const WorldthreadGlobe = dynamic(() => import('../components/WorldthreadGlobe'), { ssr: false });

type Repo = {
  name: string;
  stars: string;
  description: string;
  language: string;
  lat?: number;
  lng?: number;
};

export default function Home() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);

  // Assign mock geo coords to each repo
  const addMockCoords = (repos: Repo[]) =>
    repos.map((repo, i) => ({
      ...repo,
      lat: -60 + (i * 15) % 120,
      lng: -180 + (i * 25) % 360
    }));

  useEffect(() => {
    fetch('http://localhost:8000/trending')
      .then(res => res.json())
      .then(data => {
        const reposWithCoords = addMockCoords(data);
        setRepos(reposWithCoords);
      })
      .catch(err => console.error('Failed to fetch:', err));
  }, []);

  return (
    <main className="p-8 text-white bg-black min-h-screen relative">
      <h1 className="text-3xl font-bold mb-6">🌐 Worldthread GitHub Trending</h1>

      {repos.length > 0 && (
        <div className="h-[500px] w-full mb-10">
          <WorldthreadGlobe repos={repos} onRepoClick={setSelectedRepo} />
        </div>
      )}

      {selectedRepo && (
        <div className="fixed bottom-4 left-4 bg-white text-black p-4 rounded shadow-md w-[300px] z-50">
          <h2 className="text-lg font-bold mb-1">{selectedRepo.name}</h2>
          <p className="text-sm mb-2">{selectedRepo.description}</p>
          <p className="text-sm">⭐ {selectedRepo.stars} | {selectedRepo.language}</p>
        </div>
      )}

      {repos.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-4 mt-10">
          {repos.map((repo, i) => (
            <li key={i} className="border p-4 rounded-lg bg-gray-800">
              <h2 className="text-xl font-semibold">{repo.name}</h2>
              <p className="text-sm text-gray-400">{repo.description}</p>
              <p className="mt-2">
                ⭐ {repo.stars} &nbsp;&nbsp;&bull;&nbsp;&nbsp; 🧠 {repo.language || 'N/A'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
