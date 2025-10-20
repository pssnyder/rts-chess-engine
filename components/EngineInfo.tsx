
import React from 'react';
import type { EngineUpdate, Evaluation } from '../types';

interface EngineInfoProps {
  engineUpdate: EngineUpdate | null;
  turn: 'w' | 'b';
}

const EvaluationBar: React.FC<{ evaluation: Evaluation | null, turn: 'w' | 'b' }> = ({ evaluation, turn }) => {
  if (!evaluation) {
    return <div className="h-4 bg-gray-600 rounded-full w-full"></div>;
  }
  
  const evalNumber = evaluation.total;
  const perspective = turn === 'w' ? 1 : -1;
  const score = Math.max(-10, Math.min(10, evalNumber * perspective));
  const whiteWidth = 50 + score * 5;
  
  return (
    <div className="h-4 bg-gray-900 rounded-full w-full flex overflow-hidden border border-gray-600">
      <div className="bg-gray-200" style={{ width: `${whiteWidth}%` }}></div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string | number | null }> = ({ label, value }) => (
  <div className="flex justify-between items-baseline text-sm">
    <span className="text-gray-400">{label}</span>
    <span className="font-mono text-emerald-300">{value ?? '-'}</span>
  </div>
);

const EngineInfo: React.FC<EngineInfoProps> = ({ engineUpdate, turn }) => {
  const evalTotal = engineUpdate?.evaluation.total;
  const displayEval = evalTotal != null ? (evalTotal * (turn === 'w' ? 1 : -1)).toFixed(2) : '-';
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex-grow">
      <h2 className="text-xl font-bold mb-3 text-emerald-400">Engine Analysis</h2>
      <div className="flex items-center gap-4 mb-4">
        <EvaluationBar evaluation={engineUpdate?.evaluation ?? null} turn={turn} />
        <span className="font-bold text-lg font-mono w-20 text-right">{displayEval}</span>
      </div>
      <div className="space-y-2">
        <InfoItem label="Depth" value={engineUpdate?.depth} />
        <InfoItem label="Nodes/sec" value={engineUpdate?.nps?.toLocaleString()} />
        <InfoItem label="Nodes" value={engineUpdate?.nodes?.toLocaleString()} />
        <InfoItem label="Best Move" value={engineUpdate?.bestMove} />
        <hr className="border-gray-600 my-2" />
        <InfoItem label="Material" value={engineUpdate?.evaluation.material.toFixed(2)} />
        <InfoItem label="King Safety" value={engineUpdate?.evaluation.kingSafety.toFixed(2)} />
      </div>
    </div>
  );
};

export default EngineInfo;
