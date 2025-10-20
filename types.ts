
export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Color = 'w' | 'b';

export interface Piece {
  type: PieceSymbol;
  color: Color;
}

export interface Evaluation {
  material: number;
  kingSafety: number;
  checkmate: number;
  draw: number;
  total: number;
}

export interface EngineUpdate {
  depth: number;
  bestMove: string | null;
  evaluation: Evaluation;
  nodes: number;
  nps: number;
}

export enum EngineState {
  Idle = 'IDLE',
  Thinking = 'THINKING',
}

// Basic type definitions for chess.js loaded from CDN
export interface ChessJsMove {
  color: Color;
  from: string;
  to: string;
  piece: PieceSymbol;
  san: string;
  flags: string;
}

export interface IChessJs {
  new (fen?: string): IChessJs;
  fen(): string;
  load(fen: string): boolean;
  move(move: string | { from: string; to: string; promotion?: string }): ChessJsMove | null;
  moves(options: { verbose: true }): ChessJsMove[];
  moves(options?: { verbose?: false }): string[];
  turn(): Color;
  get(square: string): Piece | null;
  in_check(): boolean;
  in_checkmate(): boolean;
  in_stalemate(): boolean;
  in_draw(): boolean;
  history(): string[];
  undo(): ChessJsMove | null;
}

declare global {
  var Chess: IChessJs;
}
