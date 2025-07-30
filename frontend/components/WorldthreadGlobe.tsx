import { useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';

type Repo = {
  name: string;
  stars: string;
  description: string;
  language: string;
  lat: number;
  lng: number;
};

export default function WorldthreadGlobe({ repos }: { repos: Repo[] }) {
  const globeRef = useRef<any>(null);

  useEffect(() => {
    if (globeRef.current && repos.length > 0) {
      const { lat, lng } = repos[0];
      globeRef.current.controls().target.set(lng, lat, 0);
      globeRef.current.controls().update();
    }
  }, [repos]);

  return (
    <div className="w-full h-[500px]">
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        pointsData={repos}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={() => 0.02}
        pointColor={() => '#facc15'}
      />
    </div>
  );
}
