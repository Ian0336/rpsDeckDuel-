'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CardType } from '@/components/game/GameCard';
import { getInitialDeck } from '@/lib/game-logic';
import { GameState, initialGameState } from '@/types/game';

// Add missing functions
const generatePlayerDeck = (): CardType[] => {
  return getInitialDeck();
};

const generateComputerDeck = (): CardType[] => {
  return getInitialDeck();
};

export interface GameContextType {
  gameState: GameState;
  playerDeck: CardType[];  // All cards owned by the player
  setPlayerDeck: (deck: CardType[]) => void;
  selectedGameDeck: CardType[];  // 7 cards selected by player for the game
  setSelectedGameDeck: (deck: CardType[]) => void;
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
  const [playerDeck, setPlayerDeck] = useState<CardType[]>([]);
  const [selectedGameDeck, setSelectedGameDeck] = useState<CardType[]>([]);
  const [opponentDeck, setOpponentDeck] = useState<CardType[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize deck, only executed on first load
  useEffect(() => {
    // Check if decks are saved in local storage
    const savedPlayerDeck = localStorage.getItem('playerDeck');
    const savedOpponentDeck = localStorage.getItem('opponentDeck');
    const savedSelectedGameDeck = localStorage.getItem('selectedGameDeck');

    if (savedPlayerDeck && savedOpponentDeck) {
      setPlayerDeck(JSON.parse(savedPlayerDeck));
      setOpponentDeck(JSON.parse(savedOpponentDeck));
      
      if (savedSelectedGameDeck) {
        setSelectedGameDeck(JSON.parse(savedSelectedGameDeck));
      }
    } else {
      setPlayerDeck(getInitialDeck());
      setOpponentDeck(getInitialDeck());
    }
    
    setHasInitialized(true);
  }, []);

  // Save to local storage when decks change
  useEffect(() => {
    if (hasInitialized) {
      localStorage.setItem('playerDeck', JSON.stringify(playerDeck));
      localStorage.setItem('opponentDeck', JSON.stringify(opponentDeck));
      localStorage.setItem('selectedGameDeck', JSON.stringify(selectedGameDeck));
    }
  }, [playerDeck, opponentDeck, selectedGameDeck, hasInitialized]);

  // Function to reset decks
  const resetDecks = () => {
    const newPlayerDeck = getInitialDeck();
    const newOpponentDeck = getInitialDeck();
    
    setPlayerDeck(newPlayerDeck);
    setOpponentDeck(newOpponentDeck);
    setSelectedGameDeck([]);
    
    localStorage.setItem('playerDeck', JSON.stringify(newPlayerDeck));
    localStorage.setItem('opponentDeck', JSON.stringify(newOpponentDeck));
    localStorage.setItem('selectedGameDeck', JSON.stringify([]));
  };

  // Initialize game but keep player deck
  const startGame = () => {
    // Generate new player deck if empty
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

  // Implement playCard function
  const playCard = (cardIndex: number) => {
    // Implement player card playing logic here
    console.log(`Playing card at index ${cardIndex}`);
    // Implement specific game rules logic
  };

  // Reset game but keep deck
  const resetGame = () => {
    setGameState({
      ...initialGameState,
      playerDeck: playerDeck, // Keep current player deck
    });
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        playerDeck,
        setPlayerDeck,
        selectedGameDeck,
        setSelectedGameDeck,
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