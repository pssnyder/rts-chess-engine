
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Chessboard from './components/Chessboard';
import EngineControls from './components/EngineControls';
import EngineInfo from './components/EngineInfo';
import GeminiAnalysis from './components/GeminiAnalysis';
import ChessEngine from './services/chessEngine';
import { getTalStyleAnalysis } from './services/geminiService';
// FIX: EngineState is defined in types.ts, not constants.ts
import { STARTING_FEN } from './constants';
import { EngineState, type EngineUpdate, type IChessJs } from './types';

function App() {
  const [fen, setFen] = useState<string>(STARTING_FEN);
  const [engineState, setEngineState] = useState<EngineState>(EngineState.Idle);
  const [engineUpdate, setEngineUpdate] = useState<EngineUpdate | null>(null);
  const [geminiAnalysis, setGeminiAnalysis] = useState<string | null>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState<boolean>(false);
  
  const engineRef = useRef<ChessEngine | null>(null);
  const gameRef = useRef<IChessJs>(new Chess());

  const handleEngineUpdate = useCallback((update: EngineUpdate) => {
    setEngineUpdate(update);
  }, []);

  useEffect(() => {
    engineRef.current = new ChessEngine(handleEngineUpdate);
    return () => {
      engineRef.current?.stop();
    };
  }, [handleEngineUpdate]);

  const handleStart = useCallback(() => {
    try {
      if (!gameRef.current.load(fen)) {
        alert("Invalid FEN string.");
        return;
      }
      setEngineState(EngineState.Thinking);
      setEngineUpdate(null);
      setGeminiAnalysis(null);
      engineRef.current?.start(fen);
    } catch (e) {
      console.error(e);
      alert("An error occurred. Check the FEN string.");
      setEngineState(EngineState.Idle);
    }
  }, [fen]);
  
  const handleStop = useCallback(() => {
    engineRef.current?.stop();
    setEngineState(EngineState.Idle);

    if (engineUpdate && engineUpdate.bestMove && engineUpdate.evaluation) {
        setIsGeminiLoading(true);
        getTalStyleAnalysis(fen, engineUpdate.evaluation, engineUpdate.bestMove)
            .then(analysis => {
                setGeminiAnalysis(analysis);
            })
            .catch(err => {
                console.error(err);
                setGeminiAnalysis("Failed to load analysis.");
            })
            .finally(() => {
                setIsGeminiLoading(false);
            });
    }
  }, [engineUpdate, fen]);

  useEffect(() => {
    const isFenValid = gameRef.current.load(fen);
    if (!isFenValid) {
        // handle invalid fen if needed, e.g., show an error
    }
  }, [fen]);


  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-center text-emerald-400 tracking-wider">
            Ultralight Chess Engine
          </h1>
          <p className="text-center text-gray-400 mt-1">"Take your opponent into a dark forest where 2+2=5..." - Mikhail Tal</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Chessboard fen={fen} />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <EngineControls
              engineState={engineState}
              fen={fen}
              setFen={setFen}
              onStart={handleStart}
              onStop={handleStop}
            />
            <EngineInfo engineUpdate={engineUpdate} turn={gameRef.current.turn()} />
            <GeminiAnalysis analysis={geminiAnalysis} isLoading={isGeminiLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
