import React from 'react';
import type { Piece, Color } from '../types';

interface ChessboardProps {
  fen: string;
  onSquareClick: (square: string) => void;
  selectedSquare: string | null;
  legalMoves: string[];
  lastMove: { from: string; to: string } | null;
  orientation: Color;
}

const pieceEmoji: { [color: string]: { [piece: string]: string } } = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟︎', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
};

const PieceIcon: React.FC<{ piece: Piece }> = ({ piece }) => {
  const emoji = pieceEmoji[piece.color][piece.type];
  const pieceName = {
      p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King'
  }[piece.type];
  
  return (
    <span
      className="text-4xl md:text-5xl select-none"
      role="img"
      aria-label={`${piece.color === 'w' ? 'White' : 'Black'} ${pieceName}`}
    >
      {emoji}
    </span>
  );
};


const Chessboard: React.FC<ChessboardProps> = ({ fen, onSquareClick, selectedSquare, legalMoves, lastMove, orientation }) => {
  const board = React.useMemo(() => {
    const boardState = fen.split(' ')[0];
    const rows = boardState.split('/');
    const boardRep: (Piece | null)[][] = [];
    
    for (const row of rows) {
      const newRow: (Piece | null)[] = [];
      for (const char of row) {
        if (isNaN(parseInt(char))) {
          const color = char === char.toUpperCase() ? 'w' : 'b';
          const type = char.toLowerCase() as Piece['type'];
          newRow.push({ type, color });
        } else {
          for (let i = 0; i < parseInt(char); i++) {
            newRow.push(null);
          }
        }
      }
      boardRep.push(newRow);
    }
    return boardRep;
  }, [fen]);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const finalBoard = orientation === 'w' ? board : [...board].reverse().map(row => [...row].reverse());

  return (
    <div className="aspect-square w-full max-w-[70vh] shadow-2xl rounded-lg overflow-hidden border-4 border-gray-700">
      {finalBoard.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((piece, colIndex) => {
            const rank = orientation === 'w' ? 8 - rowIndex : rowIndex + 1;
            const file = orientation === 'w' ? files[colIndex] : files[7 - colIndex];
            const squareName = `${file}${rank}`;

            const isLight = (rowIndex + colIndex) % 2 !== 0;

            const isSelected = squareName === selectedSquare;
            const isLastMove = lastMove && (squareName === lastMove.from || squareName === lastMove.to);
            const isLegalMove = legalMoves.includes(squareName);

            let bgClass = isLight ? 'bg-gray-400' : 'bg-emerald-800';
            if (isSelected) {
              bgClass = 'bg-yellow-600/80';
            } else if (isLastMove) {
              bgClass = isLight ? 'bg-yellow-300/80' : 'bg-yellow-500/80';
            }

            return (
              <div
                key={squareName}
                className={`w-[12.5%] aspect-square flex items-center justify-center relative cursor-pointer ${bgClass} transition-colors duration-150`}
                onClick={() => onSquareClick(squareName)}
                role="button"
                aria-label={`Square ${squareName}`}
              >
                {isLegalMove && (
                  <div className="absolute w-1/3 h-1/3 rounded-full bg-black/20" aria-hidden="true"></div>
                )}
                {piece && <PieceIcon piece={piece} />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Chessboard;