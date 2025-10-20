import React from 'react';
import { EngineState } from '../types';
import { STARTING_FEN, STARTING_POSITIONS } from '../constants';

interface EngineControlsProps {
  engineState: EngineState;
  fen: string;
  setFen: (fen: string) => void;
  onAnalyze: () => void;
  onStop: () => void;
  onSimulate: () => void;
  onFlipBoard: () => void;
}

const EngineControls: React.FC<EngineControlsProps> = ({ engineState, fen, setFen, onAnalyze, onStop, onSimulate, onFlipBoard }) => {
  const isBusy = engineState === EngineState.Thinking || engineState === EngineState.Simulating;
  
  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFen(e.target.value);
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-3 text-emerald-400">Controls</h2>
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="start-pos" className="block text-sm font-medium text-gray-400 mb-1">Starting Position</label>
          <select 
            id="start-pos"
            onChange={handlePositionChange}
            value={STARTING_POSITIONS.find(p => p.fen === fen)?.fen || fen}
            disabled={isBusy}
            className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
          >
            {STARTING_POSITIONS.map(pos => (
                <option key={pos.name} value={pos.fen}>{pos.name}</option>
            ))}
            {!STARTING_POSITIONS.find(p => p.fen === fen) && (
                 <option key="custom" value={fen}>Custom FEN</option>
            )}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={fen}
            onChange={(e) => setFen(e.target.value)}
            placeholder="Or enter custom FEN string"
            className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
            disabled={isBusy}
          />
           <button
            onClick={() => setFen(STARTING_FEN)}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors disabled:opacity-50"
            disabled={isBusy}
          >
            Reset
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {engineState === EngineState.Idle ? (
            <>
              <button
                onClick={onAnalyze}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                Make Engine Move
              </button>
              <button
                onClick={onSimulate}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                Simulate Game
              </button>
            </>
          ) : (
            <button
              onClick={onStop}
              className="col-span-2 w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              {engineState === EngineState.Simulating ? 'Stop Simulation' : 'Stop Thinking'}
            </button>
          )}
        </div>
        <button
            onClick={onFlipBoard}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            disabled={isBusy}
        >
            Flip Board
        </button>
      </div>
    </div>
  );
};

export default EngineControls;