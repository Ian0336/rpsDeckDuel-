// 创建游戏相关的类型定义
import { CardType } from "@/components/game/GameCard";
export type ElementType = "metal" | "wood" | "water" | "fire" | "earth";

export interface GameState {
  playerDeck: CardType[];
  computerDeck: CardType[];
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