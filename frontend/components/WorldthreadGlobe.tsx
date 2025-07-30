import { GlobeNode } from '../types';
import Globe from 'react-globe.gl';
import { useEffect, useRef, useState } from 'react';

interface Props {
  points: GlobeNode[];
  onPointClick?: (node: GlobeNode) => void;
}

export default function WorldthreadGlobe({ points, onPointClick }: Props) {
  const globeRef = useRef<any>(null);
  const [hoveredPoint, setHoveredPoint] = useState<GlobeNode | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<GlobeNode | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  useEffect(() => {
    if (globeRef.current) {
      // Smooth initial animation with full earth view
      globeRef.current.pointOfView({ 
        altitude: 2.2, 
        lat: 0, 
        lng: 0 
      }, 2000);
      
      // Configure auto-rotation
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      controls.enableZoom = true;
      controls.enablePan = true;
      controls.minDistance = 180;
      controls.maxDistance = 600;
    }
  }, []);

  // Manage auto-rotation state
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = isAutoRotating;
    }
  }, [isAutoRotating]);

  // Generate unique key for point comparison
  const getPointKey = (point: GlobeNode) => `${point.lat}-${point.lng}-${point.title}`;

  // Generate dynamic particle rings with varying intensities
  const generateRings = (points: GlobeNode[]) => {
    return points.flatMap((point, index) => [
      // Primary ring
      {
        lat: point.lat,
        lng: point.lng,
        maxR: 4,
        propagationSpeed: 1.5,
        repeatPeriod: 2000 + index * 300,
        altitude: 0.005,
      },
      // Secondary pulse ring
      {
        lat: point.lat,
        lng: point.lng,
        maxR: 2,
        propagationSpeed: 2.2,
        repeatPeriod: 1200 + index * 150,
        altitude: 0.008,
      }
    ]);
  };

  const handlePointClick = (point: any) => {
    const globeNode = point as GlobeNode;
    setSelectedPoint(globeNode);
    setIsAutoRotating(false);
    
    // Gentle zoom without extreme close-up
    if (globeRef.current) {
      globeRef.current.pointOfView({
        lat: globeNode.lat,
        lng: globeNode.lng,
        altitude: 1.5
      }, 800);
    }
    
    if (onPointClick) onPointClick(globeNode);
  };

  const handlePointHover = (point: any) => {
    const globeNode = point ? (point as GlobeNode) : null;
    setHoveredPoint(globeNode);
    setIsAutoRotating(!point);
  };

  const closeCard = () => {
    setSelectedPoint(null);
    setIsAutoRotating(true);
    
    // Return to full earth view
    if (globeRef.current) {
      globeRef.current.pointOfView({ 
        altitude: 2.2, 
        lat: 0, 
        lng: 0 
      }, 1000);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      {/* Globe Container - Full Screen */}
      <div className="absolute inset-0">
        <Globe
          ref={globeRef}
          // Premium dark Earth with subtle city lights
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          backgroundColor="rgba(0,0,12,1)"
          
          // Holographic atmosphere
          atmosphereColor="rgba(100, 255, 255, 0.08)"
          atmosphereAltitude={0.12}
          
          // Enhanced data points
          pointsData={points}
          pointLat={(d: any) => d.lat}
          pointLng={(d: any) => d.lng}
          pointAltitude={(d: any) => {
            const isHovered = hoveredPoint && getPointKey(hoveredPoint) === getPointKey(d);
            const isSelected = selectedPoint && getPointKey(selectedPoint) === getPointKey(d);
            if (isSelected) return 0.12;
            if (isHovered) return 0.08;
            return 0.04;
          }}
          pointRadius={(d: any) => {
            const isHovered = hoveredPoint && getPointKey(hoveredPoint) === getPointKey(d);
            const isSelected = selectedPoint && getPointKey(selectedPoint) === getPointKey(d);
            if (isSelected) return 1.2;
            if (isHovered) return 0.9;
            return 0.5;
          }}
          pointColor={(d: any) => {
            const isHovered = hoveredPoint && getPointKey(hoveredPoint) === getPointKey(d);
            const isSelected = selectedPoint && getPointKey(selectedPoint) === getPointKey(d);
            if (isSelected) return '#00ff88';
            if (isHovered) return '#00ddff';
            return '#ff0066';
          }}
          pointResolution={12}
          
          // Animated particle rings
          ringsData={generateRings(points)}
          ringColor={(d: any) => {
            const point = points.find(p => p.lat === d.lat && p.lng === d.lng);
            const isSelected = selectedPoint && point && getPointKey(selectedPoint) === getPointKey(point);
            return isSelected ? 'rgba(0, 255, 136, 0.4)' : 'rgba(0, 221, 255, 0.25)';
          }}
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod="repeatPeriod"
          ringAltitude="altitude"
          
          // Minimal, elegant tooltips
          pointLabel={(d: any) => {
            const isHovered = hoveredPoint && getPointKey(hoveredPoint) === getPointKey(d);
            if (!isHovered) return '';
            
            return `
              <div style="
                background: rgba(0, 0, 0, 0.85);
                border: 1px solid rgba(0, 221, 255, 0.3);
                border-radius: 6px;
                padding: 8px 12px;
                color: #00ddff;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 11px;
                font-weight: 500;
                backdrop-filter: blur(12px);
                box-shadow: 0 4px 20px rgba(0, 221, 255, 0.15);
                white-space: nowrap;
                pointer-events: none;
              ">
                ${d.title}
              </div>
            `;
          }}
          
          // Event handlers
          onPointClick={handlePointClick}
          onPointHover={handlePointHover}
          enablePointerInteraction={true}
        />
      </div>

      {/* Floating Article Card - Top Left */}
      {selectedPoint && (
        <div
          className={`absolute top-6 left-6 w-80 max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] overflow-hidden z-20 transition-all duration-300 ease-out transform ${
            selectedPoint ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-full opacity-0 scale-95'
          }`}
        >
          <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20">
            {/* Card Header */}
            <div className="relative p-5 border-b border-slate-700/50">
              <button
                onClick={closeCard}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white transition-all duration-200 hover:scale-110"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="pr-8">
                <h2 className="text-lg font-bold text-white leading-tight mb-2">
                  {selectedPoint.title}
                </h2>
                
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs">{selectedPoint.authors}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-cyan-400 mt-1.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{selectedPoint.published}</span>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
              {/* Abstract/Description */}
              {(selectedPoint as any).abstract && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Abstract</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {(selectedPoint as any).abstract}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-1 gap-3 pt-3 border-t border-slate-700/50">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide block mb-1">Location</span>
                  <div className="text-sm text-slate-300 font-mono">
                    {selectedPoint.lat.toFixed(2)}, {selectedPoint.lng.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide block mb-1">Node ID</span>
                  <div className="text-sm text-slate-300 font-mono">
                    {getPointKey(selectedPoint).slice(0, 12)}...
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3">
                {(selectedPoint as any).link && (
                  <a
                    href={(selectedPoint as any).link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25"
                  >
                    <span>Read Full Article</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator - Bottom Right */}
      <div className="absolute bottom-6 right-6 z-10">
        <div className="bg-slate-900/80 backdrop-blur-md rounded-lg px-4 py-2 border border-slate-700/50">
          <div className="flex items-center gap-3 text-sm">
            <div className="relative">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <div className="absolute inset-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
            </div>
            <span className="text-slate-300 font-medium">{points.length} Active Nodes</span>
            {!isAutoRotating && (
              <span className="text-cyan-400 text-xs">• Interactive</span>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 221, 255, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 221, 255, 0.5);
        }
      `}</style>
    </div>
  );
}