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

  useEffect(() => {
    if (globeRef.current) {
      // Smooth initial animation
      globeRef.current.pointOfView({ altitude: 3.2, lat: 25, lng: 0 }, 2000);
      
      // Auto-rotate the globe
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      globeRef.current.controls().enableZoom = true;
      globeRef.current.controls().enablePan = true;
    }
  }, []);

  // Generate unique key for point comparison
  const getPointKey = (point: GlobeNode) => `${point.lat}-${point.lng}-${point.title}`;

  // Generate dynamic particle rings around points
  const generateRings = (points: GlobeNode[]) => {
    return points.map((point, index) => ({
      lat: point.lat,
      lng: point.lng,
      maxR: 5,
      propagationSpeed: 2,
      repeatPeriod: 1000 + index * 200,
    }));
  };

  return (
    <div className="relative w-full h-full">
      {/* Futuristic overlay UI */}
      <div className="absolute top-4 left-4 z-10 text-cyan-400 font-mono text-sm">
        <div className="bg-black/30 backdrop-blur-md rounded-lg p-3 border border-cyan-500/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span>GLOBAL NETWORK ACTIVE</span>
          </div>
          <div className="text-xs text-cyan-300 mt-1">
            {points.length} NODES CONNECTED
          </div>
        </div>
      </div>

      {/* Scanning lines effect */}
      <div className="absolute inset-0 pointer-events-none z-5">
        <div className="scanning-line"></div>
      </div>

      <Globe
        ref={globeRef}
        // Futuristic dark globe texture
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        backgroundColor="rgba(0,0,8,1)"
        
        // Atmospheric glow
        atmosphereColor="rgba(0, 255, 255, 0.15)"
        atmosphereAltitude={0.15}
        
        // Enhanced points with pulsing effect
        pointsData={points}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointAltitude={(d: any) => {
          const isHovered = hoveredPoint && getPointKey(hoveredPoint) === getPointKey(d);
          return isHovered ? 0.08 : 0.04;
        }}
        pointRadius={(d: any) => {
          const isHovered = hoveredPoint && getPointKey(hoveredPoint) === getPointKey(d);
          return isHovered ? 0.8 : 0.4;
        }}
        pointColor={(d: any) => {
          const isHovered = hoveredPoint && getPointKey(hoveredPoint) === getPointKey(d);
          return isHovered ? '#00ffff' : '#ff0080';
        }}
        pointResolution={8}
        
        // Animated rings around points
        ringsData={generateRings(points)}
        ringColor={() => 'rgba(0, 255, 255, 0.3)'}
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        ringAltitude={0.01}
        
        // Holographic labels
        pointLabel={(d: any) => `
          <div style="
            background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,20,40,0.9));
            border: 1px solid #00ffff;
            border-radius: 8px;
            padding: 12px;
            color: #00ffff;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            box-shadow: 0 0 20px rgba(0,255,255,0.3);
            backdrop-filter: blur(10px);
            min-width: 200px;
          ">
            <div style="color: #ffffff; font-weight: bold; margin-bottom: 6px; font-size: 14px;">
              ▲ ${d.title}
            </div>
            <div style="color: #00ff80; margin-bottom: 4px;">
              👤 ${d.authors}
            </div>
            <div style="color: #ffaa00; font-size: 10px;">
              📅 ${d.published}
            </div>
            <div style="color: #ff0080; font-size: 10px; margin-top: 6px;">
              🌐 LAT: ${d.lat.toFixed(2)} LNG: ${d.lng.toFixed(2)}
            </div>
          </div>
        `}
        
        // Interactive events
        onPointClick={(point: any) => {
          if (onPointClick) onPointClick(point);
        }}
        onPointHover={(point: any) => {
          setHoveredPoint(point);
          if (globeRef.current) {
            globeRef.current.controls().autoRotate = !point;
          }
        }}
        
        // Enhanced controls
        enablePointerInteraction={true}
      />

      <style jsx>{`
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
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
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