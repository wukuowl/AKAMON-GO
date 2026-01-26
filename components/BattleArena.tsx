import React from 'react';
import { Pokemon } from '../types';
import HealthBar from './HealthBar';
import ChromaKeyImage from './ChromaKeyImage';

interface BattleArenaProps {
  playerPokemon: Pokemon;
  playerHp: number;
  opponentPokemon: Pokemon;
  opponentHp: number;
  isPlayerAttacking: boolean;
  isOpponentAttacking: boolean;
  isPlayerHit: boolean;
  isOpponentHit: boolean;
}

const BattleArena: React.FC<BattleArenaProps> = ({
  playerPokemon,
  playerHp,
  opponentPokemon,
  opponentHp,
  isPlayerAttacking,
  isOpponentAttacking,
  isPlayerHit,
  isOpponentHit
}) => {
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-blue-300 to-green-300 overflow-hidden shadow-inner">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
          {/* Distant Hills */}
          <div className="absolute bottom-1/4 w-full h-1/3 bg-green-500 rounded-t-[100%] scale-150 translate-y-12 opacity-80"></div>
          <div className="absolute bottom-0 w-full h-1/4 bg-green-600"></div>
          {/* Clouds */}
          <div className="absolute top-10 left-20 w-32 h-12 bg-white opacity-40 rounded-full blur-xl"></div>
          <div className="absolute top-20 right-40 w-48 h-16 bg-white opacity-30 rounded-full blur-xl"></div>
      </div>

      {/* Opponent Area (Top Right Perspective) */}
      <div className="absolute top-[8%] right-[10%] w-[35%] md:w-[25%] z-10 flex flex-col items-end">
        <HealthBar 
          current={opponentHp} 
          max={opponentPokemon.maxHp} 
          label={opponentPokemon.name} 
        />
      </div>
      
      <div className="absolute top-[20%] right-[20%] w-[25%] h-[40%] flex items-end justify-center perspective-container">
         {/* Shadow */}
         <div className={`absolute bottom-2 w-[70%] h-[15%] bg-black opacity-20 rounded-[50%] blur-sm transition-opacity duration-500 ${opponentHp <= 0 ? 'opacity-0' : ''}`}></div>
         <img 
          src={opponentPokemon.frontImage} 
          alt={opponentPokemon.name}
          className={`
            w-full h-full object-contain rendering-pixelated 
            transition-transform duration-200
            ${opponentHp <= 0 ? 'animate-faint' : 
              isOpponentAttacking ? 'animate-attack-left' : 
              isOpponentHit ? 'animate-shake animate-damage' : 'animate-bounce'}
          `} 
          style={{ animationDuration: opponentHp <= 0 ? '1s' : '2s' }}
        />
      </div>

      {/* Player Area (Bottom Left Perspective) */}
      <div className="absolute bottom-[28%] left-[5%] w-[40%] md:w-[30%] z-10">
        <HealthBar 
          current={playerHp} 
          max={playerPokemon.maxHp} 
          label={playerPokemon.name} 
        />
      </div>

      <div className="absolute bottom-[2%] left-[12%] w-[30%] h-[50%] flex items-end justify-center">
        {/* Shadow */}
        <div className={`absolute bottom-4 w-[80%] h-[15%] bg-black opacity-20 rounded-[50%] blur-sm transition-opacity duration-500 ${playerHp <= 0 ? 'opacity-0' : ''}`}></div>
        {/* Use ChromaKeyImage for Player Sprite to remove Green Backgrounds */}
        <ChromaKeyImage 
          src={playerPokemon.backImage} 
          alt={playerPokemon.name}
          className={`
            w-full h-full object-contain rendering-pixelated
            ${playerHp <= 0 ? 'animate-faint' : 
              isPlayerAttacking ? 'animate-attack-right' : 
              isPlayerHit ? 'animate-shake animate-damage' : ''}
          `}
        />
      </div>
    </div>
  );
};

export default BattleArena;