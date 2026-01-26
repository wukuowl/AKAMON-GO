import React from 'react';
import { Pokemon, Move } from '../types';

interface ControlsProps {
  pokemon: Pokemon;
  onMoveSelect: (move: Move) => void;
  disabled: boolean;
  onReset: () => void;
  winner: 'player' | 'opponent' | null;
}

const Controls: React.FC<ControlsProps> = ({ pokemon, onMoveSelect, disabled, onReset, winner }) => {
  
  if (winner) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 space-y-3 bg-gray-800 text-white">
        <h2 className="text-xl md:text-2xl font-bold text-yellow-400 animate-pulse">
          {winner === 'player' ? 'VICTORY!' : 'DEFEATED'}
        </h2>
        <p className="text-sm md:text-base text-gray-300">
          {winner === 'player' ? 'Opponent neutralized.' : 'Mission failed.'}
        </p>
        <button 
          onClick={onReset}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-lg transition-transform transform hover:scale-105 active:scale-95"
        >
          Rematch
        </button>
      </div>
    );
  }

  return (
    <div className="h-full p-4 flex flex-col justify-center bg-gray-300">
      <div className="grid grid-cols-2 gap-3 h-full">
        {pokemon.moves.map((move) => (
          <button
            key={move.id}
            onClick={() => onMoveSelect(move)}
            disabled={disabled}
            className={`
              relative p-2 md:p-3 rounded-lg text-left transition-all duration-200 border-l-[6px] shadow-sm
              flex flex-col justify-center
              ${disabled 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed border-gray-500' 
                : 'bg-white hover:bg-gray-50 text-gray-900 shadow-md active:translate-y-1 active:shadow-sm'
              }
              ${getTypeColor(move.type)}
            `}
          >
            <span className="font-black block text-sm md:text-lg leading-tight">{move.name}</span>
            <div className="flex justify-between items-center mt-1 w-full">
               <span className="text-[10px] md:text-xs font-bold uppercase opacity-60 bg-gray-200 px-1 rounded">{move.type}</span>
               <span className="text-[10px] md:text-xs font-mono opacity-80">PWR:{move.power}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Helper for Tailwind classes based on move type (for the border)
function getTypeColor(type: string): string {
  switch (type) {
    case 'fire': return 'border-red-500';
    case 'water': return 'border-blue-500';
    case 'grass': return 'border-green-500';
    case 'electric': return 'border-yellow-500';
    default: return 'border-gray-500';
  }
}

export default Controls;