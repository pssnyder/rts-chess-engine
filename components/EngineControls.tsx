
import React from 'react';
// FIX: Changed to a value import since EngineState is an enum used at runtime.
import { EngineState } from '../types';
import { STARTING_FEN } from '../constants';

interface EngineControlsProps {
  engineState: EngineState;
  fen: string;
  setFen: (fen: string) => void;
  onStart: () => void;
  onStop: () => void;
}

const EngineControls: React.FC<EngineControlsProps> = ({ engineState, fen, setFen, onStart, onStop }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-3 text-emerald-400">Controls</h2>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={fen}
            onChange={(e) => setFen(e.target.value)}
            placeholder="Enter FEN string"
            className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
            disabled={engineState === EngineState.Thinking}
          />
           <button
            onClick={() => setFen(STARTING_FEN)}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors disabled:opacity-50"
            disabled={engineState === EngineState.Thinking}
          >
            Reset
          </button>
        </div>
        <div className="flex gap-2">
          {engineState === EngineState.Idle ? (
            <button
              onClick={onStart}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Start Engine
            </button>
          ) : (
            <button
              onClick={onStop}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Stop Engine
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EngineControls;
