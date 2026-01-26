import React, { useState, useEffect, useRef, useCallback } from 'react';
import { POKEMON_ROSTER, TYPE_CHART, MOVES } from './constants';
import { BattleState, Move, Pokemon } from './types';
import BattleArena from './components/BattleArena';
import Controls from './components/Controls';
import { getAiMove } from './services/geminiService';
import { playSound } from './services/audioService';

const getRandomMoves = (count: number): Move[] => {
  const allMoves = Object.values(MOVES);
  const shuffled = [...allMoves].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Initial state factory
const createInitialState = (): BattleState => {
  // Player is always the last pokemon in the roster (The new Custom one)
  const playerBase = POKEMON_ROSTER[POKEMON_ROSTER.length - 1];
  
  // Create a copy of the player pokemon with randomized moves
  const playerPokemon: Pokemon = {
    ...playerBase,
    moves: getRandomMoves(4)
  };

  // Randomly select opponent, ensuring it's not the player
  let opponentIdx = Math.floor(Math.random() * (POKEMON_ROSTER.length - 1));
  
  return {
    playerPokemon: playerPokemon,
    playerHp: playerPokemon.maxHp,
    opponentPokemon: { ...POKEMON_ROSTER[opponentIdx] },
    opponentHp: POKEMON_ROSTER[opponentIdx].maxHp,
    turn: 'player',
    winner: null,
    logs: [`Wild ${POKEMON_ROSTER[opponentIdx].name} appeared!`, `Go! ${playerPokemon.name}!`],
  };
};

const App: React.FC = () => {
  // Game State
  const [gameState, setGameState] = useState<BattleState>(createInitialState());
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Animation States
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [opponentAttacking, setOpponentAttacking] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [opponentHit, setOpponentHit] = useState(false);

  // Scroll logs to bottom
  const logsEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.logs]);

  // Restart Game
  const resetGame = () => {
    setGameState(createInitialState());
    setIsProcessing(false);
    // Optional: Play a start sound
  };

  // Logic: Calculate Damage
  const calculateDamage = (attacker: Pokemon, defender: Pokemon, move: Move): { damage: number, effectiveness: number } => {
    // Simplified Pokemon Damage Formula
    const level = 50;
    const a = attacker.attack;
    const d = defender.defense;
    const power = move.power;
    
    // Type Effectiveness
    let typeMult = 1;
    if (TYPE_CHART[move.type] && TYPE_CHART[move.type][defender.type] !== undefined) {
      typeMult = TYPE_CHART[move.type][defender.type];
    }

    // STAB (Same Type Attack Bonus)
    const stab = attacker.type === move.type ? 1.5 : 1;
    
    // Random (0.85 to 1.0)
    const random = (Math.floor(Math.random() * 16) + 85) / 100;

    const baseDamage = Math.floor((((2 * level / 5 + 2) * power * a / d) / 50 + 2));
    const finalDamage = Math.floor(baseDamage * typeMult * stab * random);

    return { damage: finalDamage, effectiveness: typeMult };
  };

  const addLog = (msg: string) => {
    setGameState(prev => ({ ...prev, logs: [...prev.logs, msg] }));
  };

  // Player Turn Logic
  const handlePlayerMove = async (move: Move) => {
    if (gameState.turn !== 'player' || isProcessing || gameState.winner) return;

    setIsProcessing(true);
    addLog(`${gameState.playerPokemon.name} used ${move.name}!`);
    
    // SFX: Attack Start
    playSound('attack');
    setPlayerAttacking(true);

    // 1. Animate Attack
    setTimeout(() => {
      setPlayerAttacking(false);
      setOpponentHit(true);
      
      // SFX: Impact
      playSound('hit');

      // 2. Calculate and Apply Damage
      const { damage, effectiveness } = calculateDamage(gameState.playerPokemon, gameState.opponentPokemon, move);
      
      const newOpponentHp = Math.max(0, gameState.opponentHp - damage);
      
      setGameState(prev => ({ ...prev, opponentHp: newOpponentHp }));
      
      let effectivenessMsg = "";
      if (effectiveness > 1) effectivenessMsg = " It's super effective!";
      if (effectiveness < 1) effectivenessMsg = " It's not very effective...";

      addLog(`Dealt ${damage} damage!${effectivenessMsg}`);

      // 3. End Animation & Check Win
      setTimeout(() => {
        setOpponentHit(false);

        if (newOpponentHp <= 0) {
          // SFX: Faint / Win
          playSound('faint');
          setTimeout(() => playSound('win'), 1000);

          setGameState(prev => ({ ...prev, winner: 'player', logs: [...prev.logs, `${prev.opponentPokemon.name} fainted! You won!`] }));
          setIsProcessing(false);
        } else {
          setGameState(prev => ({ ...prev, turn: 'opponent' }));
          // Processing stays true until AI finishes
        }
      }, 500);
    }, 500);
  };

  // AI Turn Logic
  const handleAiTurn = useCallback(async () => {
    // Small delay before AI thinks to feel natural
    await new Promise(r => setTimeout(r, 1000));
    
    try {
      // 1. Get AI Decision
      addLog(`Opponent is thinking...`);
      const aiDecision = await getAiMove(gameState);
      
      // 2. Announce
      if (aiDecision.commentary) {
        addLog(`Trainer: "${aiDecision.commentary}"`);
      }
      
      const move = gameState.opponentPokemon.moves[aiDecision.moveIndex];
      addLog(`${gameState.opponentPokemon.name} used ${move.name}!`);
      
      // SFX: Attack Start
      playSound('attack');
      setOpponentAttacking(true);

      // 3. Animate Attack
      setTimeout(() => {
        setOpponentAttacking(false);
        setPlayerHit(true);

        // SFX: Impact
        playSound('hit');

        // 4. Calculate Damage
        const { damage, effectiveness } = calculateDamage(gameState.opponentPokemon, gameState.playerPokemon, move);
        const newPlayerHp = Math.max(0, gameState.playerHp - damage);

        setGameState(prev => ({ ...prev, playerHp: newPlayerHp }));
        
        let effectivenessMsg = "";
        if (effectiveness > 1) effectivenessMsg = " It's super effective!";
        if (effectiveness < 1) effectivenessMsg = " It's not very effective...";
        
        addLog(`Dealt ${damage} damage!${effectivenessMsg}`);

        // 5. End Animation & Check Loss
        setTimeout(() => {
          setPlayerHit(false);
          setIsProcessing(false); // Player can act again if alive

          if (newPlayerHp <= 0) {
             // SFX: Faint
            playSound('faint');
            setGameState(prev => ({ ...prev, winner: 'opponent', logs: [...prev.logs, `${prev.playerPokemon.name} fainted! You lost...`] }));
          } else {
            setGameState(prev => ({ ...prev, turn: 'player' }));
          }
        }, 500);

      }, 500);

    } catch (e) {
      console.error(e);
      setIsProcessing(false);
      // Fallback if AI fails completely
      setGameState(prev => ({ ...prev, turn: 'player' })); 
      addLog("The opponent hesitated!");
    }
  }, [gameState.opponentHp, gameState.playerHp, gameState.turn]);

  // Trigger AI turn
  useEffect(() => {
    if (gameState.turn === 'opponent' && !gameState.winner) {
      handleAiTurn();
    }
  }, [gameState.turn, gameState.winner]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 p-4 font-mono">
      {/* Main 16:9 Container */}
      <div className="w-full max-w-7xl aspect-video bg-gray-900 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border-8 border-gray-800 flex flex-col relative">
        
        {/* Header */}
        <div className="bg-red-700 p-2 md:p-3 flex justify-between items-center text-white border-b-4 border-red-900 shadow-md z-20 h-[10%] min-h-[50px]">
          <h1 className="text-xl md:text-2xl font-bold tracking-tighter italic drop-shadow-md">GEMINI BATTLE</h1>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
            <div className="text-xs md:text-sm font-bold bg-red-900 px-3 py-1 rounded shadow-inner border border-red-800">
              {isProcessing ? 'Turn in progress...' : (gameState.turn === 'player' ? 'YOUR TURN' : 'ENEMY TURN')}
            </div>
          </div>
        </div>

        {/* Game Content Area */}
        <div className="flex-grow flex flex-col relative h-[90%]">
          
          {/* Top Section: Battle Arena (65% height) */}
          <div className="h-[65%] w-full relative z-10 border-b-4 border-gray-700">
            <BattleArena 
              playerPokemon={gameState.playerPokemon}
              playerHp={gameState.playerHp}
              opponentPokemon={gameState.opponentPokemon}
              opponentHp={gameState.opponentHp}
              isPlayerAttacking={playerAttacking}
              isOpponentAttacking={opponentAttacking}
              isPlayerHit={playerHit}
              isOpponentHit={opponentHit}
            />
          </div>

          {/* Bottom Section: HUD (35% height) */}
          <div className="h-[35%] w-full flex bg-gray-800 z-20">
            
            {/* Left: Message Log (50% width) */}
            <div className="w-1/2 border-r-4 border-gray-700 p-4 bg-gray-800 flex flex-col relative">
               <div className="absolute top-0 left-0 bg-gray-700 text-gray-300 text-[10px] px-2 py-0.5 rounded-br uppercase font-bold tracking-widest">
                  Battle Log
               </div>
               <div className="flex-grow overflow-y-auto mt-4 space-y-2 pr-2 custom-scrollbar">
                  {gameState.logs.map((log, i) => (
                    <div key={i} className={`text-sm md:text-base border-b border-gray-700 pb-1 last:border-0 animate-fade-in ${log.includes('Thinking') ? 'text-yellow-400 italic' : 'text-gray-100'}`}>
                      {log.includes('!') ? '➤ ' : ''}{log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
               </div>
            </div>

            {/* Right: Controls (50% width) */}
            <div className="w-1/2 bg-gray-300 relative">
               <div className="absolute top-0 right-0 bg-gray-400 text-gray-700 text-[10px] px-2 py-0.5 rounded-bl uppercase font-bold tracking-widest z-10">
                  Command
               </div>
               <Controls 
                  pokemon={gameState.playerPokemon}
                  onMoveSelect={handlePlayerMove}
                  disabled={gameState.turn !== 'player' || isProcessing || !!gameState.winner}
                  onReset={resetGame}
                  winner={gameState.winner}
                />
            </div>

          </div>
        </div>
        
      </div>
      <div className="text-gray-500 text-xs mt-4">
        Powered by Google Gemini • Using PokeAPI Sprites
      </div>
    </div>
  );
};

export default App;