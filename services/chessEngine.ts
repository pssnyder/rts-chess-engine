import type { Evaluation, IChessJs, ChessJsMove, Piece } from '../types';
import { PIECE_VALUES, PST, CASTLING_BONUS, CHECK_PENALTY } from '../constants';

const MAX_SEARCH_DEPTH = 10; // Per-move search depth for simulation

class ChessEngine {
  private game: IChessJs;
  private nodes = 0;
  private onUpdate: (update: any) => void;
  private startTime = 0;
  private isThinking = false;
  private currentBestMove: string | null = null;

  constructor(onUpdate: (update: any) => void) {
    this.game = new Chess();
    this.onUpdate = onUpdate;
  }

  public stop() {
    this.isThinking = false;
  }

  public async findBestMove(fen: string, searchDepth: number = MAX_SEARCH_DEPTH): Promise<string | null> {
    this.isThinking = true;
    this.game.load(fen);
    this.nodes = 0;
    this.startTime = performance.now();
    this.currentBestMove = null;

    for (let depth = 1; depth <= searchDepth; depth++) {
        if (!this.isThinking) break;

        const result = this.negamax(depth, -Infinity, Infinity);
        this.currentBestMove = result.move;
        
        const nps = this.nodes / ((performance.now() - this.startTime) / 1000);
        this.onUpdate({
            depth,
            bestMove: this.currentBestMove,
            evaluation: this.evaluate(),
            nodes: this.nodes,
            nps: Math.round(nps),
        });

        // Yield to the event loop to keep UI responsive
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    this.isThinking = false;
    return this.currentBestMove;
  }
  
  private evaluate(): Evaluation {
    if (this.game.in_checkmate()) {
      const total = this.game.turn() === 'w' ? -Infinity : Infinity;
      return { material: 0, kingSafety: 0, checkmate: total, draw: 0, total };
    }
    if (this.game.in_draw() || this.game.in_stalemate()) {
      return { material: 0, kingSafety: 0, checkmate: 0, draw: 1, total: 0 };
    }

    let material = 0;
    let kingSafety = 0;
    const fen = this.game.fen();
    const [boardState, turn, castling] = fen.split(' ');

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = String.fromCharCode(97 + j) + (8 - i);
            const piece = this.game.get(square);
            if (piece) {
                const pstIndex = i * 8 + j;
                const pstValue = piece.color === 'w' ? PST[piece.type][pstIndex] : PST[piece.type][63 - pstIndex];
                const value = PIECE_VALUES[piece.type] + pstValue;
                material += piece.color === 'w' ? value : -value;
            }
        }
    }

    if (castling.includes('K') || castling.includes('Q')) kingSafety += CASTLING_BONUS;
    if (castling.includes('k') || castling.includes('q')) kingSafety -= CASTLING_BONUS;
    
    if (this.game.in_check()) {
       kingSafety += this.game.turn() === 'w' ? CHECK_PENALTY : -CHECK_PENALTY;
    }

    const perspective = this.game.turn() === 'w' ? 1 : -1;
    const total = (material + kingSafety) * perspective;
    
    return { material, kingSafety, checkmate: 0, draw: 0, total };
  }
  
  private orderMoves(moves: ChessJsMove[]): ChessJsMove[] {
      // Basic move ordering: captures, checks, then quiet moves.
      return moves.sort((a, b) => {
          const aIsCapture = a.flags.includes('c');
          const bIsCapture = b.flags.includes('c');
          if (aIsCapture !== bIsCapture) return aIsCapture ? -1 : 1;

          const aIsCheck = a.san.includes('+');
          const bIsCheck = b.san.includes('+');
          if (aIsCheck !== bIsCheck) return aIsCheck ? -1 : 1;
          
          return 0; // No further sorting for simplicity
      });
  }

  private negamax(depth: number, alpha: number, beta: number): { value: number, move: string | null } {
    if (depth === 0 || !this.isThinking) {
      this.nodes++;
      return { value: this.evaluate().total, move: null };
    }

    let max = -Infinity;
    let bestMove = null;
    
    const moves = this.game.moves({ verbose: true });
    if (moves.length === 0) { // Handle stalemate/checkmate at leaf
        return { value: this.evaluate().total, move: null };
    }

    const orderedMoves = this.orderMoves(moves);

    for (const move of orderedMoves) {
      this.game.move(move.san);
      const { value } = this.negamax(depth - 1, -beta, -alpha);
      const score = -value;
      this.game.undo();
      
      if (!this.isThinking) break;

      if (score > max) {
        max = score;
        bestMove = move.san;
      }
      alpha = Math.max(alpha, score);

      if (alpha >= beta) {
        break; // Pruning
      }
    }
    
    return { value: max, move: bestMove };
  }
}

export default ChessEngine;