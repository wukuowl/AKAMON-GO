export type ElementType = 'fire' | 'water' | 'grass' | 'electric' | 'normal';

export interface Move {
  id: string;
  name: string;
  type: ElementType;
  power: number;
  accuracy: number; // 0-100
  description: string;
}

export interface Pokemon {
  id: number;
  name: string;
  type: ElementType;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  moves: Move[];
  frontImage: string;
  backImage: string;
}

export interface BattleState {
  playerPokemon: Pokemon;
  playerHp: number;
  opponentPokemon: Pokemon;
  opponentHp: number;
  turn: 'player' | 'opponent';
  winner: 'player' | 'opponent' | null;
  logs: string[];
}

export interface AiMoveResponse {
  moveIndex: number;
  commentary: string;
}
