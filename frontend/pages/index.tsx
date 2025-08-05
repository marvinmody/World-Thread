// pages/index.tsx
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { shouldRefreshArticles, markArticlesRefreshed, checkApiStatus } from '../utils/fetchTopicNodes';

const WorldthreadGlobe = dynamic(() => import('../components/WorldthreadGlobe'), { ssr: false });

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [freshnessInfo, setFreshnessInfo] = useState<string>('');

  useEffect(() => {
    // Check if we need to refresh articles on page load
    const initializeApp = async () => {
      const status = await checkApiStatus();
      
      if (status.freshnessWindow) {
        setFreshnessInfo(status.freshnessWindow);
      }
      
      if (shouldRefreshArticles()) {
        console.log('🔄 New day detected, refreshing articles...');
        markArticlesRefreshed();
        setRefreshKey(prev => prev + 1); // Force re-render of globe
      }
    };

    initializeApp();

    // Set up daily refresh check (every hour when page is active)
    const refreshInterval = setInterval(() => {
      if (shouldRefreshArticles()) {
        console.log('🔄 Daily refresh triggered');
        markArticlesRefreshed();
        setRefreshKey(prev => prev + 1);
      }
    }, 3600000); // Check every hour

    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <main className="p-0 text-white bg-black min-h-screen">
      {freshnessInfo && (
        <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg text-sm">
          📅 Fresh articles: {freshnessInfo}
        </div>
      )}
      
      <div className="h-screen w-full">
        <WorldthreadGlobe
          key={refreshKey} // Force re-render when refreshKey changes
          showTopicSelector={true}
          onPointClick={(node) => {
            console.log('Node clicked:', node);
          }}
        />
      </div>
    </main>
  );
}