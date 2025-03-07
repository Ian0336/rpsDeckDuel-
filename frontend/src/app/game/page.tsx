"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlayerDeck } from "@/components/game/PlayerDeck";
import { BattleArea } from "@/components/game/BattleArea";
import { GameLog, GameLogEntry } from "@/components/game/GameLog";
import { CardType } from "@/components/game/GameCard";
import { determineWinner, getInitialDeck, updateValueTransfer } from "@/lib/game-logic";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGameContext } from "@/contexts/GameContext";

export default function GamePage() {
  const router = useRouter();
  const { gameState, playerDeck, setPlayerDeck, startGame, playCard, resetGame, selectedGameDeck } = useGameContext();
  
  // Game state
  const [opponentDeck, setOpponentDeck] = useState<CardType[]>(getInitialDeck());
  const [playerSelectedCard, setPlayerSelectedCard] = useState<CardType | null>(null);
  const [opponentSelectedCard, setOpponentSelectedCard] = useState<CardType | null>(null);
  const [gameResult, setGameResult] = useState<"win" | "lose" | "draw" | null>(null);
  const [playerEffectivePoints, setPlayerEffectivePoints] = useState<number | undefined>(undefined);
  const [opponentEffectivePoints, setOpponentEffectivePoints] = useState<number | undefined>(undefined);
  const [roundNumber, setRoundNumber] = useState(1);
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([]);
  const [gamePhase, setGamePhase] = useState<"selection" | "reveal" | "result" | "gameEnd">("selection");
  const [isGameActive, setIsGameActive] = useState(true);
  
  // Additional game states
  const [playerGameDeck, setPlayerGameDeck] = useState<CardType[]>([]);
  const [opponentGameDeck, setOpponentGameDeck] = useState<CardType[]>([]);
  const [playerUsedCards, setPlayerUsedCards] = useState<CardType[]>([]);
  const [opponentUsedCards, setOpponentUsedCards] = useState<CardType[]>([]);
  const [roundResults, setRoundResults] = useState<Array<{
    result: "win" | "lose" | "draw",
    playerCard: CardType,
    opponentCard: CardType
  }>>([]);
  const [finalGameResult, setFinalGameResult] = useState<"win" | "lose" | "draw" | null>(null);
  
  // UI states
  const [showGameLog, setShowGameLog] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  // Initialize game deck
  useEffect(() => {
    if (gameState.gameStatus === 'idle' && playerDeck.length > 0) {
      // Randomly select 7 cards as opponent's game deck
      const shuffledOpponentDeck = [...opponentDeck].sort(() => Math.random() - 0.5);
      const selectedOpponentCards = shuffledOpponentDeck.slice(0, 7);
      setOpponentGameDeck(selectedOpponentCards);
      
      setPlayerGameDeck(selectedGameDeck);
      
      startGame();
    }
  }, [gameState.gameStatus, playerDeck, opponentDeck, startGame]);
  
  // AI opponent logic
  useEffect(() => {
    if (isGameActive && gamePhase === "selection" && playerSelectedCard) {
      // Simulate opponent card selection (after short delay)
      const timer = setTimeout(() => {
        const availableCards = opponentGameDeck.filter(card => 
          !opponentUsedCards.some(usedCard => usedCard.id === card.id)
        );
        
        if (availableCards.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableCards.length);
          setOpponentSelectedCard(availableCards[randomIndex]);
          setGamePhase("reveal");
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isGameActive, gamePhase, playerSelectedCard, opponentGameDeck, opponentUsedCards]);

  // Handle round results
  useEffect(() => {
    if (gamePhase === "reveal" && playerSelectedCard && opponentSelectedCard) {
      // Short delay to determine winner (to show cards)
      const timer = setTimeout(() => {
        const battleResult = determineWinner(playerSelectedCard, opponentSelectedCard);
        setGameResult(battleResult.result);
        setPlayerEffectivePoints(battleResult.playerEffectivePoints);
        setOpponentEffectivePoints(battleResult.opponentEffectivePoints);
        
        // Add to game log
        setGameLog((prev) => [
          ...prev,
          {
            round: roundNumber,
            playerCard: playerSelectedCard,
            opponentCard: opponentSelectedCard,
            result: battleResult.result,
            playerEffectivePoints: battleResult.playerEffectivePoints,
            opponentEffectivePoints: battleResult.opponentEffectivePoints
          },
        ]);
        
        // Add to round results
        setRoundResults(prev => [
          ...prev,
          {
            result: battleResult.result,
            playerCard: playerSelectedCard,
            opponentCard: opponentSelectedCard
          }
        ]);
        
        setGamePhase("result");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [gamePhase, playerSelectedCard, opponentSelectedCard, roundNumber]);

  // Handle round end and game end
  useEffect(() => {
    if (gamePhase === "result" && playerSelectedCard && opponentSelectedCard && gameResult) {
      const timer = setTimeout(() => {
        // Add used cards to used list
        if (playerSelectedCard) {
          setPlayerUsedCards(prev => [...prev, playerSelectedCard]);
        }
        
        if (opponentSelectedCard) {
          setOpponentUsedCards(prev => [...prev, opponentSelectedCard]);
        }
        
        // Check if reached 5 rounds
        if (roundNumber >= 5) {
          // Calculate final result
          const wins = roundResults.filter(r => r.result === "win").length;
          const losses = roundResults.filter(r => r.result === "lose").length;
          
          let finalResult: "win" | "lose" | "draw" = "draw";
          if (wins > losses) {
            finalResult = "win";
          } else if (losses > wins) {
            finalResult = "lose";
          }
          
          setFinalGameResult(finalResult);
          
          // Transfer cards based on final result
          if (finalResult === "win") {
            // Player wins, gets some opponent cards
            const opponentCardsToTransfer = roundResults
              .filter(r => r.result === "win")
              .map(r => r.opponentCard);
              
            // Update decks
            const newPlayerDeck = [...playerDeck, ...opponentCardsToTransfer] as CardType[];
            const newOpponentDeck = opponentDeck.filter(card => 
              !opponentCardsToTransfer.some(c => c.id === card.id)
            );
            
            setPlayerDeck(newPlayerDeck);
            setOpponentDeck(newOpponentDeck);
          } else if (finalResult === "lose") {
            // Player loses, gives cards to opponent
            const playerCardsToTransfer = roundResults
              .filter(r => r.result === "lose")
              .map(r => r.playerCard);
              
            // Update decks
            const newOpponentDeck = [...opponentDeck, ...playerCardsToTransfer];
            const newPlayerDeck = playerDeck.filter(card => 
              !playerCardsToTransfer.some(c => c.id === card.id)
            ) as CardType[];
            
            setPlayerDeck(newPlayerDeck);
            setOpponentDeck(newOpponentDeck);
          }
          
          setGamePhase("gameEnd");
          setIsGameActive(false);
        } else {
          // Prepare next round
          setRoundNumber(prev => prev + 1);
          setPlayerSelectedCard(null);
          setOpponentSelectedCard(null);
          setGameResult(null);
          setPlayerEffectivePoints(undefined);
          setOpponentEffectivePoints(undefined);
          setGamePhase("selection");
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [gamePhase, gameResult, playerSelectedCard, opponentSelectedCard, playerDeck, opponentDeck, roundNumber, roundResults]);

  // Handle player card selection
  const handleCardSelect = (card: CardType) => {
    if (gamePhase === "selection" && !playerSelectedCard) {
      // Check if card is already used
      const isCardUsed = playerUsedCards.some(usedCard => usedCard.id === card.id);
      
      // Check if card is in game deck
      const isCardInGameDeck = playerGameDeck.some(deckCard => deckCard.id === card.id);
      
      if (isCardInGameDeck && !isCardUsed) {
        setPlayerSelectedCard(card);
      }
    }
  };

  // Start new game
  const handleNewGame = () => {
    // Reset game state
    setPlayerSelectedCard(null);
    setOpponentSelectedCard(null);
    setGameResult(null);
    setPlayerEffectivePoints(undefined);
    setOpponentEffectivePoints(undefined);
    setRoundNumber(1);
    setGameLog([]);
    setGamePhase("selection");
    setIsGameActive(true);
    setShowControls(false);
    
    // Reset additional game states
    setPlayerUsedCards([]);
    setOpponentUsedCards([]);
    setRoundResults([]);
    setFinalGameResult(null);
    
    // Return to deck selection to choose new cards
    router.push('/deck-selection');
  };

  // Return to matchmaking
  const handleReturnToMatchmaking = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Fixed opponent area at top */}
      <div className="w-full bg-opacity-0 border-b border-red-100 p-4 sticky top-0 z-10">
        <PlayerDeck
          cards={gamePhase === "gameEnd" ? opponentDeck : opponentGameDeck.filter(card => 
            !opponentUsedCards.some(usedCard => usedCard.id === card.id)
          )}
          isPlayer={false}
          selectedCard={opponentSelectedCard}
        />
      </div>

      {/* Centered floating status display */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
        <AnimatePresence>
          {gameResult && gamePhase === "result" && (
            <motion.div 
              className={`px-6 py-3 rounded-full font-bold text-lg shadow-lg ${
                gameResult === "win" 
                  ? "bg-green-100 text-green-700" 
                  : gameResult === "lose" 
                  ? "bg-red-100 text-red-700" 
                  : "bg-yellow-100 text-yellow-700"
              }`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "tween", stiffness: 400, damping: 10 }}
            >
              {gameResult === "win" 
                ? `You won! ${playerEffectivePoints} vs ${opponentEffectivePoints}` 
                : gameResult === "lose" 
                ? `You lost! ${playerEffectivePoints} vs ${opponentEffectivePoints}` 
                : `Draw! ${playerEffectivePoints} vs ${opponentEffectivePoints}`}
            </motion.div>
          )}
          
          {finalGameResult && gamePhase === "gameEnd" && (
            <motion.div 
              className={`px-6 py-3 rounded-full font-bold text-lg shadow-lg ${
                finalGameResult === "win" 
                  ? "bg-green-100 text-green-700" 
                  : finalGameResult === "lose" 
                  ? "bg-red-100 text-red-700" 
                  : "bg-yellow-100 text-yellow-700"
              }`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "tween", stiffness: 400, damping: 10 }}
            >
              {finalGameResult === "win" 
                ? `Game Over! You won!` 
                : finalGameResult === "lose" 
                ? `Game Over! You lost!` 
                : `Game Over! Draw!`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Round info - Fixed between opponent and player areas */}
      <div className="flex justify-center items-center py-4">
        <motion.div 
          className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium shadow-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Round {roundNumber}/5 - {
            gamePhase === "selection" 
              ? "Select Card" 
              : gamePhase === "reveal" 
              ? "Battle in progress..." 
              : gamePhase === "result" 
              ? "Resolving..." 
              : "Game Over"
          }
        </motion.div>
      </div>

      {/* Central battle area */}
      <div className="flex-1 flex items-center justify-center">
        <BattleArea
          playerCard={playerSelectedCard}
          opponentCard={opponentSelectedCard}
          gamePhase={gamePhase}
          gameResult={gameResult}
          playerEffectivePoints={playerEffectivePoints}
          opponentEffectivePoints={opponentEffectivePoints}
        />
      </div>

      {/* Side control panel - Collapsible */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-20 flex flex-col gap-2">
        <motion.button
          className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowControls(!showControls)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </motion.button>
        
        <motion.button
          className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-lg hover:bg-purple-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowGameLog(!showGameLog)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </motion.button>
      </div>

      {/* Control panel */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            className="fixed left-20 top-1/2 transform -translate-y-1/2 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-64"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Game Controls</h3>
              <Button 
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowControls(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full"
                onClick={handleNewGame}
              >
                Start New Game
              </Button>
              
              <Button 
                variant="outline"
                className="w-full"
                onClick={handleReturnToMatchmaking}
              >
                Return to Matchmaking
              </Button>
              
              {gamePhase === "gameEnd" && (
                <div className={`p-3 rounded-md mt-4 text-center font-bold ${
                  finalGameResult === "win" 
                    ? "bg-green-100 text-green-700" 
                    : finalGameResult === "lose" 
                    ? "bg-red-100 text-red-700" 
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {finalGameResult === "win" 
                    ? "You won! You got opponent's cards." 
                    : finalGameResult === "lose" 
                    ? "You lost! You lost some cards." 
                    : "Draw! No cards transferred."}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game log */}
      <AnimatePresence>
        {showGameLog && (
          <motion.div 
            className="fixed right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-80 h-96 flex flex-col"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Game Log</h3>
              <Button 
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowGameLog(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <GameLog logs={gameLog} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Middle spacing */}
      <div className="flex-1"></div>

      {/* Fixed player area at bottom */}
      <div className="w-full bg-blue-50 bg-opacity-30 border-t border-blue-100 p-4 sticky bottom-0 z-10">
        <PlayerDeck
          cards={gamePhase === "gameEnd" ? playerDeck : playerGameDeck.filter(card => 
            !playerUsedCards.some(usedCard => usedCard.id === card.id)
          )}
          isPlayer={true}
          onCardSelect={handleCardSelect}
          selectedCard={playerSelectedCard}
        />
      </div>
    </div>
  );
} 