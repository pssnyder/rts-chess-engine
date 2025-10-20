import React from 'react';
import type { Piece } from '../types';

interface ChessboardProps {
  fen: string;
}

const getPieceImageUrl = (piece: Piece): string => {
  const color = piece.color; // 'w' or 'b'
  const pieceType = piece.type.toUpperCase(); // 'P', 'N', 'B', 'R', 'Q', 'K'
  // Use local images from the /images/ folder
  return `/images/${color}${pieceType}.png`;
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
                {piece && (
                  <img src={getPieceImageUrl(piece)} alt={`${piece.color} ${piece.type}`} className="w-full h-full object-contain" />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Chessboard;