// 创建游戏相关的类型定义
export interface Card {
  id: string;
  element: ElementType;
  points: number;
}

export type ElementType = "metal" | "wood" | "water" | "fire" | "earth";

export interface GameState {
  playerDeck: Card[];
  computerDeck: Card[];
  gameStatus: 'idle' | 'playing' | 'ended';
  currentPlayer: 'player' | 'computer';
  winner: 'player' | 'computer' | null;
}

export const initialGameState: GameState = {
  playerDeck: [],
  computerDeck: [],
  gameStatus: 'idle',
  currentPlayer: 'player',
  winner: null
}; 