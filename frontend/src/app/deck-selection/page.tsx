"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CardType } from "@/components/game/GameCard";
import { getInitialDeck } from "@/lib/game-logic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGameContext } from "@/contexts/GameContext";
import { GameCard } from "@/components/game/GameCard";

export default function DeckSelectionPage() {
  const router = useRouter();
  const { playerDeck, setSelectedGameDeck } = useGameContext();
  
  const [availableCards, setAvailableCards] = useState<CardType[]>([]);
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [isSelectionComplete, setIsSelectionComplete] = useState(false);

  // Initialize available cards from player's full collection
  useEffect(() => {
    if (playerDeck.length > 0) {
      setAvailableCards(playerDeck.map(card => ({
        id: card.id,
        element: card.element,
        point: card.point
      })));
    } else {
      const initialDeck = getInitialDeck();
      setAvailableCards(initialDeck);
    }
  }, [playerDeck]);

  // Handle card selection
  const handleCardSelect = (card: CardType) => {
    if (selectedCards.some(c => c.id === card.id)) {
      // Card is already selected, remove it
      setSelectedCards(prev => prev.filter(c => c.id !== card.id));
    } else if (selectedCards.length < 7) {
      // Card is not selected and we have less than 7 cards, add it
      setSelectedCards(prev => [...prev, card]);
    }
  };

  // Check if selection is complete
  useEffect(() => {
    setIsSelectionComplete(selectedCards.length === 7);
  }, [selectedCards]);

  // Start game with selected cards
  const handleStartGame = () => {
    if (isSelectionComplete) {
      setSelectedGameDeck(selectedCards.map(card => ({
        id: card.id,
        element: card.element,
        point: card.point
      })));
      router.push('/game');
    }
  };
  console.log(playerDeck);
  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose Your Deck</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select 7 cards from your collection to enter the game. You will use these cards for a 5-round battle.
        </p>
        <div className="mt-4 text-lg font-medium">
          Selected: <span className={selectedCards.length === 7 ? "text-green-600" : "text-blue-600"}>
            {selectedCards.length}/7
          </span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {availableCards.map((card) => {
          const isSelected = selectedCards.some(c => c.id === card.id);
          return (
            <div
              key={card.id}
              className={`relative ${isSelected ? "ring-4 ring-blue-500 rounded-lg" : ""}`}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer flex items-center justify-center w-full h-full"
                onClick={() => handleCardSelect(card)}
              >
                <GameCard 
                  card={card} 
                  isFlipped={true}
                  onClick={() => handleCardSelect(card)}
                />
              </motion.div>
              {isSelected && (
                <div className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-4 flex justify-center">
        <Button
          size="lg"
          className="px-8 py-6 text-lg"
          disabled={!isSelectionComplete}
          onClick={handleStartGame}
        >
          Start Game
        </Button>
      </div>
    </div>
  );
}