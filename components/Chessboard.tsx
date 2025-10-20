import React from 'react';
import type { Piece } from '../types';

interface ChessboardProps {
  fen: string;
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


const Chessboard: React.FC<ChessboardProps> = ({ fen }) => {
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

  return (
    <div className="aspect-square w-full max-w-[70vh] shadow-2xl rounded-lg overflow-hidden border-4 border-gray-700">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((piece, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 !== 0;
            const bgClass = isLight ? 'bg-gray-400' : 'bg-emerald-800';

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`w-[12.5%] aspect-square flex items-center justify-center ${bgClass}`}
              >
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