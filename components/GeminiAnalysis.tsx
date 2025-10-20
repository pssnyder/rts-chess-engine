
import React from 'react';

interface GeminiAnalysisProps {
  analysis: string | null;
  isLoading: boolean;
}

const GeminiAnalysis: React.FC<GeminiAnalysisProps> = ({ analysis, isLoading }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-3 text-emerald-400">Tal's Take</h2>
      {isLoading ? (
        <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      ) : (
        <div className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
          {analysis || "Start the engine to get Mikhail Tal's take on the position."}
        </div>
      )}
    </div>
  );
};

export default GeminiAnalysis;
