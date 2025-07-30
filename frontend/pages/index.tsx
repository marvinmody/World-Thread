import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ArxivPaper, GlobeNode } from '../types';

const WorldthreadGlobe = dynamic(() => import('../components/WorldthreadGlobe'), { ssr: false });

export default function Home() {
  const [papers, setPapers] = useState<ArxivPaper[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/arxiv')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          console.error("Invalid arXiv data format:", data);
          return;
        }
        setPapers(data);
      })
      .catch(err => console.error('Failed to fetch arXiv data:', err));
  }, []);

  const paperNodes: GlobeNode[] = useMemo(() => {
  return papers.map((paper, i) => ({
    type: 'arxiv',
    lat: 30 + i * 1.5,
    lng: -90 + i * 2,
    name: paper.title, // Use title as the fallback name
    title: paper.title,
    summary: paper.summary,
    authors: paper.authors,
    published: paper.published
  }));
}, [papers]);


  return (
    <main className="p-8 text-white bg-black min-h-screen relative">
      <h1 className="text-3xl font-bold mb-6">🧠 Worldthread arXiv AI Papers</h1>

      <div className="h-[600px] w-full mb-10">
        <WorldthreadGlobe
          points={paperNodes}
          onPointClick={(node) => {
            if (node.type === 'arxiv') {
              alert(`📄 ${node.name}\n\n${node.summary.slice(0, 200)}...`);
            }
          }}
        />
      </div>
    </main>
  );
}
