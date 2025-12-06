import React from 'react';
import { PlayerState } from '../types';

interface BoardProps {
  playerState: PlayerState;
  title: string;
  isActive: boolean;
  isOpponent?: boolean;
}

const BoardDisplay: React.FC<BoardProps> = ({ playerState, title, isActive, isOpponent }) => {
  const { board, activePiece, score, lines, level, nextPiece, gameOver } = playerState;

  // Create a display board that merges the static board with the active piece for rendering
  const renderBoard = board.map(row => row.map(c => ({...c})));

  if (activePiece) {
    activePiece.data.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const drawY = activePiece.position.y + y;
          const drawX = activePiece.position.x + x;
          if (drawY >= 0 && drawY < 20 && drawX >= 0 && drawX < 10) {
            renderBoard[drawY][drawX] = {
              type: activePiece.data.type,
              color: activePiece.data.color,
              locked: false
            };
          }
        }
      });
    });
  }

  return (
    <div className={`flex flex-col items-center bg-slate-900 p-6 rounded-xl border-4 transition-all duration-300 ${isActive ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'border-slate-700'} relative`}>
      <h2 className={`text-xl font-bold font-pixel mb-4 tracking-widest ${isOpponent ? 'text-red-400' : 'text-cyan-400'}`}>
        {title}
      </h2>
      
      <div className="flex gap-4">
        {/* Main Board */}
        <div className="bg-black p-1 border-2 border-slate-700 relative">
           {/* Grid Lines */}
           <div className="absolute inset-0 pointer-events-none opacity-10" 
                style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
           </div>

           {renderBoard.map((row, y) => (
             <div key={y} className="flex">
               {row.map((cell, x) => (
                 <div
                   key={`${x}-${y}`}
                   className="w-5 h-5 md:w-6 md:h-6 border-[1px] border-white/5"
                   style={{ 
                       backgroundColor: cell.type ? cell.color : 'transparent',
                       boxShadow: cell.type ? `inset 0 0 4px rgba(0,0,0,0.5)` : 'none'
                   }}
                 />
               ))}
             </div>
           ))}
        </div>

        {/* Sidebar Info */}
        <div className="flex flex-col gap-4 w-28 md:w-32">
           <div className="bg-slate-800 p-2 md:p-3 rounded border border-slate-600">
             <p className="text-[10px] text-slate-400 mb-1">SCORE</p>
             <p className="text-sm md:text-lg font-mono text-white">{score.toLocaleString()}</p>
           </div>
           
           <div className="bg-slate-800 p-2 md:p-3 rounded border border-slate-600">
             <p className="text-[10px] text-slate-400 mb-1">LINES</p>
             <p className="text-sm md:text-lg font-mono text-white">{lines}</p>
           </div>

           <div className="bg-slate-800 p-2 md:p-3 rounded border border-slate-600">
             <p className="text-[10px] text-slate-400 mb-1">LEVEL</p>
             <p className="text-sm md:text-lg font-mono text-white">{level}</p>
           </div>

           <div className="bg-slate-800 p-2 md:p-3 rounded border border-slate-600 flex flex-col items-center h-20 md:h-24 justify-center">
             <p className="text-[10px] text-slate-400 mb-2">NEXT</p>
             {nextPiece && (
               <div className="flex flex-col items-center gap-[2px]">
                  {/* Fixed rendering logic: Use Flex rows to respect matrix shape */}
                  {nextPiece.shape.map((row, rI) => (
                     <div key={rI} className="flex gap-[2px]">
                       {row.map((val, cI) => (
                          <div 
                            key={`${rI}-${cI}`} 
                            className="w-2 h-2 md:w-3 md:h-3" 
                            style={{ backgroundColor: val ? nextPiece.color : 'transparent' }}
                          />
                       ))}
                     </div>
                  ))}
               </div>
             )}
           </div>
        </div>
      </div>

      {gameOver && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 rounded-lg backdrop-blur-sm">
           <h3 className="text-2xl md:text-3xl text-red-500 font-pixel mb-4 animate-pulse text-center">GAME OVER</h3>
           <p className="text-white mb-2 font-mono">Final Score: {score}</p>
        </div>
      )}
    </div>
  );
};

export default BoardDisplay;