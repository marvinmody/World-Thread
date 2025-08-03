import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ArxivPaper, GlobeNode } from '../types';
import { getCrossrefGlobeNodes } from '@/utils/mapCrossrefToNodes';

const WorldthreadGlobe = dynamic(() => import('../components/WorldthreadGlobe'), { ssr: false });

export default function Home() {
  const [arxivPapers, setArxivPapers] = useState<ArxivPaper[]>([]);
  const [semanticNodes, setSemanticNodes] = useState<GlobeNode[]>([]);

  // Fetch arXiv papers from your backend
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

  // Fetch Crossref papers with geolocation
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const nodes = await getCrossrefGlobeNodes("artificial intelligence");
        setSemanticNodes(nodes); // ❗ FIXED: was incorrectly using setPapers
      } catch (err) {
        console.error('Failed to fetch Crossref globe nodes:', err);
      }
    };
    fetchNodes();
  }, []);

  // Convert arXiv papers to globe nodes (with mock coordinates)
  const arxivNodes: GlobeNode[] = useMemo(() => {
    return arxivPapers.map((paper, i) => ({
      type: 'arxiv',
      lat: 30 + i * 1.5,
      lng: -90 + i * 2,
      name: paper.title,
      title: paper.title,
      summary: paper.summary,
      authors: paper.authors,
      published: paper.published,
    }));
  }, [arxivPapers]);

  // Combine both sources into one globe node list
  const allNodes = useMemo(() => [...semanticNodes, ...arxivNodes], [semanticNodes, arxivNodes]);

  return (
    <main className="p-8 text-white bg-black min-h-screen relative">
      <h1 className="text-3xl font-bold mb-6">🌐 Worldthread: AI Research Map</h1>

      <div className="h-[600px] w-full mb-10">
        <WorldthreadGlobe
          points={allNodes} // ✅ FIXED: was incorrectly using `papers`
          onPointClick={(node) => {
            if (node.type === 'crossref') {
              alert(`📄 ${node.title}\n\n${node.abstract?.slice(0, 200) ?? 'No abstract'}...`);
            } else if (node.type === 'arxiv') {
              alert(`📄 ${node.title}\n\n${node.summary?.slice(0, 200) ?? 'No summary'}...`);
            }
          }}
        />
      </div>
    </main>
  );
}
