'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CardType } from '@/components/game/GameCard';
import { getInitialDeck } from '@/lib/game-logic';
import { Card, GameState, initialGameState } from '@/types/game';

// 添加缺失的函数
const generatePlayerDeck = (): Card[] => {
  return getInitialDeck() as Card[];
};

const generateComputerDeck = (): Card[] => {
  return getInitialDeck() as Card[];
};

export interface GameContextType {
  gameState: GameState;
  playerDeck: Card[];
  setPlayerDeck: (deck: Card[]) => void;
  opponentDeck: CardType[];
  setOpponentDeck: React.Dispatch<React.SetStateAction<CardType[]>>;
  resetDecks: () => void;
  hasInitialized: boolean;
  startGame: () => void;
  playCard: (cardIndex: number) => void;
  resetGame: () => void;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [opponentDeck, setOpponentDeck] = useState<CardType[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  // 初始化牌組，只在第一次加載時執行
  useEffect(() => {
    // 檢查本地存儲中是否有保存的牌組
    const savedPlayerDeck = localStorage.getItem('playerDeck');
    const savedOpponentDeck = localStorage.getItem('opponentDeck');

    if (savedPlayerDeck && savedOpponentDeck) {
      setPlayerDeck(JSON.parse(savedPlayerDeck));
      setOpponentDeck(JSON.parse(savedOpponentDeck));
    } else {
      setPlayerDeck(getInitialDeck() as Card[]);
      setOpponentDeck(getInitialDeck());
    }
    
    setHasInitialized(true);
  }, []);

  // 當牌組變化時，保存到本地存儲
  useEffect(() => {
    if (hasInitialized) {
      localStorage.setItem('playerDeck', JSON.stringify(playerDeck));
      localStorage.setItem('opponentDeck', JSON.stringify(opponentDeck));
    }
  }, [playerDeck, opponentDeck, hasInitialized]);

  // 重置牌組的函數
  const resetDecks = () => {
    const newPlayerDeck = getInitialDeck() as Card[];
    const newOpponentDeck = getInitialDeck();
    
    setPlayerDeck(newPlayerDeck);
    setOpponentDeck(newOpponentDeck);
    
    localStorage.setItem('playerDeck', JSON.stringify(newPlayerDeck));
    localStorage.setItem('opponentDeck', JSON.stringify(newOpponentDeck));
  };

  // 初始化游戏，但保留玩家牌组
  const startGame = () => {
    // 如果玩家牌组为空，则生成一个新的牌组
    const currentPlayerDeck = playerDeck.length > 0 
      ? playerDeck 
      : generatePlayerDeck();
    
    if (playerDeck.length === 0) {
      setPlayerDeck(currentPlayerDeck);
    }

    const computerDeck = generateComputerDeck();
    
    setGameState({
      ...initialGameState,
      playerDeck: currentPlayerDeck,
      computerDeck,
      gameStatus: 'playing',
    });
  };

  // 实现 playCard 函数
  const playCard = (cardIndex: number) => {
    // 这里实现玩家出牌的逻辑
    console.log(`Playing card at index ${cardIndex}`);
    // 根据您的游戏规则实现具体逻辑
  };

  // 重置游戏但保留牌组
  const resetGame = () => {
    setGameState({
      ...initialGameState,
      playerDeck: playerDeck, // 保留当前玩家牌组
    });
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        playerDeck,
        setPlayerDeck,
        opponentDeck,
        setOpponentDeck,
        resetDecks,
        hasInitialized,
        startGame,
        playCard,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}; 