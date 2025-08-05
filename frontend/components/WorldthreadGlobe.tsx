//WorldthreadGlobe.tsx
'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import type { GlobeMethods } from 'react-globe.gl';
import { GlobeNode } from '@/types';
import { fetchTopicNodes } from '@/utils/fetchTopicNodes';

interface Props {
  points?: GlobeNode[];
  onPointClick?: (node: GlobeNode) => void;
  topics?: string[];
  showTopicSelector?: boolean;
  useMultiSource?: boolean;
  autoRotateTopics?: boolean;
}

const AVAILABLE_TOPICS = [
  { value: 'all', label: 'All Topics' },
  { value: 'AI', label: 'AI' },
  { value: 'Space', label: 'Space' },
  { value: 'Environment', label: 'Environment' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Climate', label: 'Climate' },
  { value: 'Medicine', label: 'Medicine' },
  { value: 'Quantum', label: 'Quantum' },
  { value: 'Robotics', label: 'Robotics' },
  { value: 'Biology', label: 'Biology' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Economics', label: 'Economics' },
  { value: 'Psychology', label: 'Psychology' },
  { value: 'Sociology', label: 'Sociology' },
  { value: 'History', label: 'History' },
  { value: 'Education', label: 'Education' },
];

// Topic color mapping
const topicColorMap: Record<string, string> = {
  AI: '#00ffff',           // Cyan
  Space: '#ff00ff',        // Magenta
  Environment: '#00ff00',   // Green
  Technology: '#ffa500',    // Orange
  Climate: '#00ff80',       // Light green
  Medicine: '#ff6b6b',      // Red
  Quantum: '#9d4edd',       // Purple
  Robotics: '#ff9500',      // Orange-red
  Biology: '#32cd32',       // Lime green
  Physics: '#1e90ff',       // Dodger blue
  Chemistry: '#ffd700',     // Gold
  Economics: '#dc143c',     // Crimson
  Psychology: '#ff69b4',    // Hot pink
  Sociology: '#20b2aa',     // Light sea green
  History: '#daa520',       // Goldenrod
  Education: '#4169e1',     // Royal blue
  semantic_scholar: '#00ffff', // Cyan
  crossref: '#ffa500',      // Orange
  all: '#ffffff',           // White
};

const getNodeColor = (node: GlobeNode) => {
  return node.topic ? topicColorMap[node.topic] || topicColorMap[node.type] || '#ffffff' : '#ffffff';
};

export default function WorldthreadGlobe({ 
  points, 
  onPointClick, 
  topics, 
  showTopicSelector = true,
  useMultiSource = false,
  autoRotateTopics = false
}: Props) {
  const globeRef = useRef<GlobeMethods>(null);
  const [hoveredPoint, setHoveredPoint] = useState<GlobeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GlobeNode | null>(null);
  const [nodes, setNodes] = useState<GlobeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('all'); // Changed default to 'all'
  const [topicIndex, setTopicIndex] = useState(0);

  // Use provided points or fetch nodes based on topics
  const displayPoints = points || nodes;

  // Auto-rotate through topics
  useEffect(() => {
    if (autoRotateTopics && !points) {
      const interval = setInterval(() => {
        setTopicIndex((prev) => (prev + 1) % AVAILABLE_TOPICS.length);
        setSelectedTopic(AVAILABLE_TOPICS[(topicIndex + 1) % AVAILABLE_TOPICS.length].value);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [topicIndex, autoRotateTopics, points]);

  // Main data fetching effect
  useEffect(() => {
    if (!points && showTopicSelector) {
      const loadData = async () => {
        setLoading(true);
        try {
          console.log(`🔍 Loading data for topic: ${selectedTopic}`);
          const fetchedNodes = await fetchTopicNodes(selectedTopic);
          console.log(`✅ Loaded ${fetchedNodes.length} nodes`);
          setNodes(fetchedNodes);
        } catch (err) {
          console.error('❌ Error loading nodes:', err);
          setNodes([]);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [selectedTopic, points, showTopicSelector]);

  // Load multiple topics if provided (fallback behavior)
  useEffect(() => {
    if (!points && topics && !showTopicSelector) {
      const loadData = async () => {
        setLoading(true);
        try {
          const allResults: GlobeNode[] = [];
          for (const topic of topics) {
            const fetchedNodes = await fetchTopicNodes(topic);
            allResults.push(...fetchedNodes);
          }
          setNodes(allResults);
        } catch (err) {
          console.error('❌ Error loading nodes:', err);
          setNodes([]);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [points, topics, showTopicSelector]);

  // Default behavior - load all nodes on mount if no other options
  useEffect(() => {
    if (!points && !topics && showTopicSelector && nodes.length === 0) {
      setLoading(true);
      fetchTopicNodes('all')
        .then(fetchedNodes => {
          console.log(`✅ Default loaded ${fetchedNodes.length} nodes`);
          setNodes(fetchedNodes);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [points, topics, showTopicSelector, nodes.length]);

  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      if (controls) {
        globeRef.current.pointOfView({ altitude: 3.2, lat: 25, lng: 0 }, 2000);
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.enableZoom = true;
        controls.enablePan = true;
      }
    }
  }, []);

  const getPointKey = (point: GlobeNode) => `${point.lat}-${point.lng}-${point.title}`;

  const rings = useMemo(
    () =>
      displayPoints.map((point, index) => ({
        lat: point.lat,
        lng: point.lng,
        maxR: 5,
        propagationSpeed: 2,
        repeatPeriod: 1000 + index * 200,
      })),
    [displayPoints]
  );

  const handleNodeClick = (node: GlobeNode) => {
    setSelectedNode(node);
    onPointClick?.(node);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Topic Selector */}
      {showTopicSelector && !points && (
        <div className="absolute top-6 left-6 z-20 bg-black/60 backdrop-blur-md p-3 rounded-lg border border-cyan-500/50">
          <label className="block text-sm text-cyan-300 mb-2 font-mono">
            SELECT TOPIC:
          </label>
          <select
            className="bg-black/80 text-cyan-400 border border-cyan-400/50 px-3 py-2 rounded font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            disabled={loading || autoRotateTopics}
          >
            {AVAILABLE_TOPICS.map((topic) => (
              <option key={topic.value} value={topic.value} className="bg-black">
                {topic.label}
              </option>
            ))}
          </select>
          {loading && (
            <div className="text-xs text-cyan-300 mt-2 flex items-center gap-2">
              <div className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              Loading {selectedTopic} nodes...
            </div>
          )}
        </div>
      )}

      {/* Status Indicator */}
      <div className={`absolute top-4 z-10 text-cyan-400 font-mono text-sm ${(showTopicSelector && !points) || selectedNode ? 'right-4' : 'left-4'}`}>
        <div className="bg-black/30 backdrop-blur-md rounded-lg p-3 border border-cyan-500/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span>{loading ? 'SCANNING NETWORK...' : 'GLOBAL NETWORK ACTIVE'}</span>
          </div>
          <div className="text-xs text-cyan-300 mt-1">
            {displayPoints.length} NODES CONNECTED
          </div>
          {showTopicSelector && !points && (
            <div className="text-xs text-cyan-300 mt-1">
              TOPIC: {selectedTopic.toUpperCase()}
            </div>
          )}
          <div className="text-xs text-green-400 mt-1">
            🔬 RESEARCH PAPERS
          </div>
        </div>
      </div>

      {/* Node Detail Panel */}
      {selectedNode && (
        <div className="absolute top-4 right-4 w-96 bg-black/90 backdrop-blur-md p-4 rounded-lg border border-cyan-500/50 text-white z-50 max-h-96 overflow-y-auto">
          <h2 className="text-xl font-bold text-cyan-400 mb-3">{selectedNode.title}</h2>
          
          <div className="mb-3">
            <span className="text-xs font-mono text-cyan-300">AUTHORS:</span>
            <p className="text-sm text-white mt-1">{selectedNode.authors}</p>
          </div>
          
          <div className="mb-3">
            <span className="text-xs font-mono text-cyan-300">PUBLISHED:</span>
            <p className="text-sm text-yellow-400 mt-1">{selectedNode.published}</p>
          </div>
          
          <div className="mb-3">
            <span className="text-xs font-mono text-cyan-300">TOPIC:</span>
            <span 
              className="inline-block ml-2 px-2 py-1 rounded text-xs font-mono"
              style={{ 
                backgroundColor: getNodeColor(selectedNode) + '20',
                color: getNodeColor(selectedNode),
                border: `1px solid ${getNodeColor(selectedNode)}`
              }}
            >
              {(selectedNode.topic || selectedNode.type || 'UNKNOWN').toUpperCase()}
            </span>
          </div>
          
          {selectedNode.abstract && (
            <div className="mb-4">
              <span className="text-xs font-mono text-cyan-300">ABSTRACT:</span>
              <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                {selectedNode.abstract}
              </p>
            </div>
          )}
          
          <div className="flex gap-2 mt-4">
            {selectedNode.link && selectedNode.link !== "#" && (
              <a 
                href={selectedNode.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500 text-cyan-400 px-3 py-2 rounded text-sm font-mono transition-colors text-center"
              >
                📄 VIEW PAPER
              </a>
            )}
            <button 
              onClick={() => setSelectedNode(null)}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500 text-red-400 px-3 py-2 rounded text-sm font-mono transition-colors"
            >
              ✕ CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-15">
          <div className="bg-black/70 backdrop-blur-md rounded-lg p-6 border border-cyan-500/30">
            <div className="text-cyan-400 font-mono text-center">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <div>
                Scanning {selectedTopic === 'all' ? 'global' : selectedTopic} network...
              </div>
              <div className="text-xs text-cyan-300 mt-2">
                Fetching from research databases
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Globe */}
      <Globe
        ref={globeRef as React.MutableRefObject<GlobeMethods>}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        backgroundColor="rgba(0,0,8,1)"
        atmosphereColor="rgba(0, 255, 255, 0.15)"
        atmosphereAltitude={0.15}
        pointsData={displayPoints}
        pointLat={(d: any) => (d as GlobeNode).lat}
        pointLng={(d: any) => (d as GlobeNode).lng}
        pointAltitude={(d: any) =>
          hoveredPoint && getPointKey(hoveredPoint) === getPointKey(d as GlobeNode) ? 0.08 : 0.04
        }
        pointRadius={(d: any) =>
          hoveredPoint && getPointKey(hoveredPoint) === getPointKey(d as GlobeNode) ? 0.8 : 0.4
        }
        pointColor={(d: any) => {
          const node = d as GlobeNode;
          const baseColor = getNodeColor(node);
          return hoveredPoint && getPointKey(hoveredPoint) === getPointKey(node) 
            ? '#ffffff' 
            : baseColor;
        }}
        pointResolution={8}
        ringsData={rings}
        ringColor={(d: any) => {
          const point = displayPoints.find(p => p.lat === (d as any).lat && p.lng === (d as any).lng);
          return point ? getNodeColor(point) + '80' : 'rgba(0, 255, 255, 0.3)';
        }}
        ringMaxRadius={(d: any) => (d as typeof rings[0]).maxR}
        ringPropagationSpeed={(d: any) => (d as typeof rings[0]).propagationSpeed}
        ringRepeatPeriod={(d: any) => (d as typeof rings[0]).repeatPeriod}
        ringAltitude={0.01}
        pointLabel={(d: any) => {
          const node = d as GlobeNode;
          const nodeColor = getNodeColor(node);
          const topicText = node.topic || node.type || 'UNKNOWN';
          return `
            <div style="
              background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,20,40,0.9));
              border: 1px solid ${nodeColor};
              border-radius: 8px;
              padding: 12px;
              color: ${nodeColor};
              font-family: 'Courier New', monospace;
              font-size: 12px;
              box-shadow: 0 0 20px ${nodeColor}30;
              backdrop-filter: blur(10px);
              min-width: 200px;
            ">
              <div style="color: #ffffff; font-weight: bold; margin-bottom: 6px; font-size: 14px;">
                ▲ ${node.title}
              </div>
              <div style="color: #00ff80; margin-bottom: 4px;">
                👤 ${node.authors}
              </div>
              <div style="color: #ffaa00; font-size: 10px;">
                📅 ${node.published}
              </div>
              <div style="color: ${nodeColor}; font-size: 10px; margin-top: 6px;">
                🏷️ ${topicText.toUpperCase()}
              </div>
              <div style="color: #ff0080; font-size: 10px; margin-top: 2px;">
                🌐 LAT: ${node.lat.toFixed(2)} LNG: ${node.lng.toFixed(2)}
              </div>
            </div>
          `;
        }}
        onPointClick={(point: any) => {
          handleNodeClick(point as GlobeNode);
        }}
        onPointHover={(point: any) => {
          setHoveredPoint(point as GlobeNode | null);
          if (globeRef.current) {
            const controls = globeRef.current.controls();
            if (controls) controls.autoRotate = !point;
          }
        }}
        enablePointerInteraction
      />

      {/* CSS */}
      <style jsx global>{`
        html, body, #__next {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          background: black;
        }
        
        .scanning-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00ffff, transparent);
          animation: scan 3s linear infinite;
        }

        @keyframes scan {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }

        .scanning-line::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: #00ffff;
          box-shadow: 0 0 10px #00ffff;
        }
      `}</style>
    </div>
  );
}