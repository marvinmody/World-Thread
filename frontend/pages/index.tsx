// pages/index.tsx
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const WorldthreadGlobe = dynamic(() => import('../components/WorldthreadGlobe'), { ssr: false });

export default function Home() {
  return (
    <main className="p-0 text-white bg-black min-h-screen">
      <div className="h-screen w-full">
        <WorldthreadGlobe
          showTopicSelector={true}
          onPointClick={(node) => {
            console.log('Node clicked:', node);
          }}
        />
      </div>
    </main>
  );
}