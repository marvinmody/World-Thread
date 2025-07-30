import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ArxivPaper, GlobeNode } from '../types';
import { getSemanticGlobeNodes } from '@/utils/mapSemanticToNodes';

const WorldthreadGlobe = dynamic(() => import('../components/WorldthreadGlobe'), { ssr: false });

export default function Home() {
  const [arxivPapers, setArxivPapers] = useState<ArxivPaper[]>([]);
  const [semanticNodes, setSemanticNodes] = useState<GlobeNode[]>([]);

  // Fetch arXiv papers from backend
  useEffect(() => {
    fetch('http://localhost:8000/arxiv')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          console.error("Invalid arXiv data format:", data);
          return;
        }
        setArxivPapers(data);
      })
      .catch(err => console.error('Failed to fetch arXiv data:', err));
  }, []);

  // Fetch Semantic Scholar nodes with geolocation
  useEffect(() => {
    const fetchSemantic = async () => {
      const nodes = await getSemanticGlobeNodes("artificial intelligence");
      setSemanticNodes(nodes);
    };
    fetchSemantic();
  }, []);

  // Convert arXiv papers to globe nodes (mock coordinates for now)
  const arxivNodes: GlobeNode[] = useMemo(() => {
    return arxivPapers.map((paper, i) => ({
      type: 'arxiv',
      lat: 30 + i * 1.5, // Replace with real lat/lng if available
      lng: -90 + i * 2,
      name: paper.title,
      title: paper.title,
      summary: paper.summary,
      authors: paper.authors,
      published: paper.published,
    }));
  }, [arxivPapers]);

  // Combine both data sources
  const allNodes = useMemo(() => [...semanticNodes, ...arxivNodes], [semanticNodes, arxivNodes]);

  return (
    <main className="p-8 text-white bg-black min-h-screen relative">
      <h1 className="text-3xl font-bold mb-6">🌐 Worldthread: AI Research Map</h1>

      <div className="h-[600px] w-full mb-10">
        <WorldthreadGlobe
          points={allNodes}
          onPointClick={(node) => {
            if (node.type === 'arxiv' || node.type === 'semantic') {
              alert(`📄 ${node.title}\n\n${node.summary?.slice(0, 200) ?? ''}...`);
            }
          }}
        />
      </div>
    </main>
  );
}
