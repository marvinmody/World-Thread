// frontend/utils/mapLanguageToCoords.ts
export const mapLanguageToCoords = (lang: string) => {
  const langMap: Record<string, [number, number]> = {
    JavaScript: [37.7749, -122.4194], // San Francisco
    Python: [51.5074, -0.1278],       // London
    Go: [35.6895, 139.6917],          // Tokyo
    Rust: [52.52, 13.405],            // Berlin
  };
  return langMap[lang] || [0, 0]; // Default fallback
};
