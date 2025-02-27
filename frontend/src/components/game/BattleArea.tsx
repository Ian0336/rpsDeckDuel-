import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameCard, CardType } from "@/components/game/GameCard";
import { getElementRelationship } from "@/lib/game-logic";

interface BattleAreaProps {
  playerCard: CardType | null;
  opponentCard: CardType | null;
  gamePhase: "selection" | "reveal" | "result" | "gameEnd";
  gameResult: "win" | "lose" | "draw" | null;
  playerEffectivePoints?: number;
  opponentEffectivePoints?: number;
}

export const BattleArea: React.FC<BattleAreaProps> = ({
  playerCard,
  opponentCard,
  gamePhase,
  gameResult,
  playerEffectivePoints,
  opponentEffectivePoints,
}) => {
  // Calculate element relationships
  const playerRelationship = playerCard && opponentCard && gamePhase !== "selection" 
    ? getElementRelationship(playerCard.element, opponentCard.element)
    : null;
    
  const opponentRelationship = playerCard && opponentCard && gamePhase !== "selection"
    ? getElementRelationship(opponentCard.element, playerCard.element)
    : null;

  return (
    <div className="relative h-64 w-full flex items-center justify-center">
      {/* Player's selected card */}
      <AnimatePresence>
        {playerCard && (
          <motion.div
            key={`battle-player-${playerCard.id}`}
            className="absolute z-20"
            initial={{ 
              opacity: 0, 
              y: 100, 
              x: -100,
              rotate: 0,
              scale: 0.8 
            }}
            animate={{ 
              opacity: 1, 
              y: gamePhase === "selection" ? 20 : 0,
              x: -80,
              rotate: gamePhase === "selection" ? -5 : 0,
              scale: 1 
            }}
            exit={{ 
              opacity: 0, 
              y: 100, 
              scale: 0.8 
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20 
            }}
          >
            <div className="relative">
              <GameCard
                card={playerCard}
                isFlipped={gamePhase !== "selection"}
                className={`${gameResult === "win" ? "ring-green-500 ring-4" : gameResult === "lose" ? "ring-red-500 ring-4" : ""}`}
              />
              
              {/* Effective points display */}
              {gamePhase === "result" && playerEffectivePoints !== undefined && (
                <motion.div
                  className="absolute -top-4 -right-4 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  {playerEffectivePoints}
                </motion.div>
              )}
              
              {/* Element relationship indicator */}
              {playerRelationship && gamePhase !== "selection" && (
                <motion.div
                  className={`absolute -bottom-8 left-0 right-0 text-center text-xs font-medium px-2 py-1 rounded-full ${
                    playerRelationship.relationship === "generates" 
                      ? "bg-green-100 text-green-800" 
                      : playerRelationship.relationship === "restricts"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {playerRelationship.description}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opponent's selected card */}
      <AnimatePresence>
        {opponentCard && (
          <motion.div
            key={`battle-opponent-${opponentCard.id}`}
            className="absolute z-20"
            initial={{ 
              opacity: 0, 
              y: -100, 
              x: 100,
              rotate: 0,
              scale: 0.8 
            }}
            animate={{ 
              opacity: 1, 
              y: gamePhase === "selection" ? -20 : 0,
              x: 80,
              rotate: gamePhase === "selection" ? 5 : 0,
              scale: 1 
            }}
            exit={{ 
              opacity: 0, 
              y: -100, 
              scale: 0.8 
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20 
            }}
          >
            <div className="relative">
              <GameCard
                card={opponentCard}
                isFlipped={gamePhase !== "selection"}
                className={gameResult === "lose" ? "ring-4 ring-green-500" : gameResult === "win" ? "ring-4 ring-red-500" : ""}
              />
              
              {/* Effective points display */}
              {gamePhase === "result" && opponentEffectivePoints !== undefined && (
                <motion.div
                  className="absolute -top-4 -right-4 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  {opponentEffectivePoints}
                </motion.div>
              )}
              
              {/* Element relationship indicator */}
              {opponentRelationship && gamePhase !== "selection" && (
                <motion.div
                  className={`absolute -top-8 left-0 right-0 text-center text-xs font-medium px-2 py-1 rounded-full ${
                    opponentRelationship.relationship === "generates" 
                      ? "bg-green-100 text-green-800" 
                      : opponentRelationship.relationship === "restricts"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {opponentRelationship.description}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battle indicator */}
      {playerCard && opponentCard && gamePhase !== "selection" && (
        <motion.div
          className="absolute z-10"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-yellow-500"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
        </motion.div>
      )}
    </div>
  );
};