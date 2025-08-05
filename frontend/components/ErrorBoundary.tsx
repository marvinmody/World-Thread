// components/ErrorBoundary.tsx
'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Globe Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="w-screen h-screen bg-black flex items-center justify-center">
          <div className="bg-black/90 backdrop-blur-md p-6 rounded-lg border border-red-500/50 text-white">
            <h2 className="text-xl font-bold text-red-400 mb-4">Globe Error</h2>
            <p className="text-gray-300 mb-4">
              Something went wrong with the research globe. This might be due to:
            </p>
            <ul className="text-sm text-gray-400 list-disc list-inside mb-4">
              <li>API connection issues</li>
              <li>Network connectivity problems</li>
              <li>Browser compatibility issues</li>
            </ul>
            <button 
              onClick={() => window.location.reload()}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500 text-cyan-400 px-4 py-2 rounded font-mono transition-colors"
            >
              🔄 RELOAD GLOBE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;