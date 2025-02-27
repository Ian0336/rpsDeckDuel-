"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MatchmakingList, Player } from "@/components/game/MatchmakingList";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGameContext } from "@/contexts/GameContext";

export default function Home() {
  const router = useRouter();
  const { resetDecks, setSelectedGameDeck } = useGameContext();
  
  // Matchmaking status
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([
    { id: "1", name: "Player 1", status: "available" },
    { id: "2", name: "Player 2", status: "available" },
    { id: "3", name: "Player 3", status: "in-game" },
    { id: "4", name: "Player 4", status: "available" },
  ]);

  // Join match
  const handleJoinMatch = (playerId: string) => {
    // In real application, this would connect to backend
    // For now we just simulate joining a match
    setAvailablePlayers((prev) =>
      prev.map((player) =>
        player.id === playerId ? { ...player, status: "in-game" } : player
      )
    );
    router.push('/deck-selection');
  };

  // Start computer game
  const startComputerGame = () => {
    // Clear any previously selected game deck
    setSelectedGameDeck([]);
    router.push('/deck-selection');
  };

  // Reset all decks
  const handleResetDecks = () => {
    resetDecks();
    alert('All decks have been reset!');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-8 text-center">Wuxing Deck Duel</h1>
        
        <div className="grid gap-4 w-full max-w-md">
          <Button 
            className="py-8 text-xl"
            onClick={() => router.push('/deck-selection')}
          >
            Choose Deck and Start Game
          </Button>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button 
              onClick={startComputerGame} 
              size="lg"
              className="relative overflow-hidden group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            >
              <motion.span 
                className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                whileHover={{ scale: 1.5, opacity: 0.2 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="relative z-10 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Play Against Computer
              </motion.span>
            </Button>
          </motion.div>
          
          <Button 
            variant="outline"
            onClick={handleResetDecks}
            className="mt-4"
          >
            Reset All Decks
          </Button>
          
          <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
            <p>Choose 7 cards for a 5-round battle!</p>
            <p>Win the duel to claim your opponent's cards!</p>
          </div>
        </div>
      </div>
    </main>
  );
}
