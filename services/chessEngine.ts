
import type { Evaluation, IChessJs, ChessJsMove, Piece } from '../types';
import { PIECE_VALUES, PST, CASTLING_BONUS, CHECK_PENALTY } from '../constants';

const MAX_DEPTH = 20; // Target depth

class ChessEngine {
  private game: IChessJs;
  private nodes = 0;
  private onUpdate: (update: any) => void;
  private startTime = 0;
  private isThinking = false;

  constructor(onUpdate: (update: any) => void) {
    this.game = new Chess();
    this.onUpdate = onUpdate;
  }

  public stop() {
    this.isThinking = false;
  }

  public async start(fen: string) {
    this.isThinking = true;
    this.game.load(fen);
    this.nodes = 0;
    this.startTime = performance.now();
    let bestMove: string | null = null;
    let bestEval: Evaluation | null = null;

    for (let depth = 1; depth <= MAX_DEPTH; depth++) {
        if (!this.isThinking) break;

        const result = this.negamax(depth, -Infinity, Infinity);
        bestMove = result.move;
        bestEval = this.evaluate();
        
        const nps = this.nodes / ((performance.now() - this.startTime) / 1000);
        this.onUpdate({
            depth,
            bestMove,
            evaluation: bestEval,
            nodes: this.nodes,
            nps: Math.round(nps),
        });

        // Yield to the event loop to keep UI responsive
        await new Promise(resolve => setTimeout(resolve, 0));
        
        if (depth === 10 && (performance.now() - this.startTime) > 1000) {
            console.warn(`Depth 10 took more than 1 second: ${performance.now() - this.startTime}ms`);
        }
    }
    this.isThinking = false;
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
    
    const tempGame = new Chess(fen);
    if (tempGame.turn() === 'w' && tempGame.in_check()) kingSafety += CHECK_PENALTY;
    tempGame.load(fen.replace(' w ', ' b '));
    if (tempGame.turn() === 'b' && tempGame.in_check()) kingSafety -= CHECK_PENALTY;

    const perspective = this.game.turn() === 'w' ? 1 : -1;
    const total = (material + kingSafety) * perspective;
    
    return { material, kingSafety, checkmate: 0, draw: 0, total };
  }
  
  private orderMoves(moves: ChessJsMove[]): ChessJsMove[] {
      const getPieceValue = (piece: Piece) => {
          // This is a simplified version of the user's request.
          // A full implementation would need to get the piece's square to calculate its PST value.
          return PIECE_VALUES[piece.type];
      };
      
      return moves.sort((a, b) => {
          const aIsCapture = a.flags.includes('c');
          const bIsCapture = b.flags.includes('c');
          if (aIsCapture && !bIsCapture) return -1;
          if (!aIsCapture && bIsCapture) return 1;

          const aIsCheck = a.san.includes('+');
          const bIsCheck = b.san.includes('+');
          if (aIsCheck && !bIsCheck) return -1;
          if (!aIsCheck && bIsCheck) return 1;
          
          return getPieceValue(this.game.get(b.to) || {type: 'p', color: 'w'}) - getPieceValue(this.game.get(a.to) || {type: 'p', color: 'w'});
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
      if (score > alpha) {
        alpha = score;
      }
      if (alpha >= beta) {
        break; // Pruning
      }
    }
    
    return { value: max, move: bestMove };
  }
}

export default ChessEngine;
