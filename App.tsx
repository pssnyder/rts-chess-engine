
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Chessboard from './components/Chessboard';
import EngineControls from './components/EngineControls';
import EngineInfo from './components/EngineInfo';
import GeminiAnalysis from './components/GeminiAnalysis';
import ChessEngine from './services/chessEngine';
import { getTalStyleAnalysis } from './services/geminiService';
import { STARTING_FEN } from './constants';
import { EngineState, type EngineUpdate, type IChessJs } from './types';

// Add game_over to IChessJs in types.ts if it's missing
declare global {
  interface Window {
    Chess: IChessJs;
  }
}

function App() {
  const [fen, setFen] = useState<string>(STARTING_FEN);
  const [engineState, setEngineState] = useState<EngineState>(EngineState.Idle);
  const [engineUpdate, setEngineUpdate] = useState<EngineUpdate | null>(null);
  const [geminiAnalysis, setGeminiAnalysis] = useState<string | null>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState<boolean>(false);
  
  const engineRef = useRef<ChessEngine | null>(null);
  // FIX: Corrected gameRef initialization. The fallback to `new Function()` caused a type error
  // as it does not create an object that conforms to IChessJs. This change assumes `Chess`
  // is globally available, consistent with other parts of the app like ChessEngine.
  const gameRef = useRef<IChessJs>(new Chess());
  const isSimulatingRef = useRef(false);

  const handleEngineUpdate = useCallback((update: EngineUpdate) => {
    setEngineUpdate(update);
  }, []);

  useEffect(() => {
    engineRef.current = new ChessEngine(handleEngineUpdate);
    return () => {
      isSimulatingRef.current = false;
      engineRef.current?.stop();
    };
  }, [handleEngineUpdate]);

  const handleAnalyze = useCallback(() => {
    try {
      if (!gameRef.current.load(fen)) {
        alert("Invalid FEN string.");
        return;
      }
      setEngineState(EngineState.Thinking);
      setEngineUpdate(null);
      setGeminiAnalysis(null);
      engineRef.current?.findBestMove(fen, 20); // Deeper search for analysis
    } catch (e) {
      console.error(e);
      alert("An error occurred. Check the FEN string.");
      setEngineState(EngineState.Idle);
    }
  }, [fen]);

  const handleSimulate = useCallback(async () => {
    if (!gameRef.current.load(fen)) {
      alert("Invalid FEN string.");
      return;
    }
    
    setEngineState(EngineState.Simulating);
    setGeminiAnalysis(null);
    isSimulatingRef.current = true;

    while (isSimulatingRef.current && !gameRef.current.game_over()) {
      const bestMove = await engineRef.current?.findBestMove(gameRef.current.fen());
      
      if (bestMove && isSimulatingRef.current) {
        gameRef.current.move(bestMove);
        setFen(gameRef.current.fen());
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay for visibility
      } else {
        break; // Engine was stopped or no move found
      }
    }

    isSimulatingRef.current = false;
    setEngineState(EngineState.Idle);

  }, [fen]);
  
  const handleStop = useCallback(() => {
    isSimulatingRef.current = false;
    engineRef.current?.stop();
    setEngineState(EngineState.Idle);

    if (engineUpdate && engineUpdate.bestMove && engineUpdate.evaluation) {
        setIsGeminiLoading(true);
        getTalStyleAnalysis(gameRef.current.fen(), engineUpdate.evaluation, engineUpdate.bestMove)
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
  }, [engineUpdate]);

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
              onAnalyze={handleAnalyze}
              onSimulate={handleSimulate}
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
