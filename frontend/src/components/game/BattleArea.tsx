import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameCard, CardType } from "@/components/game/GameCard";

interface BattleAreaProps {
  playerCard: CardType | null;
  opponentCard: CardType | null;
  gamePhase: "selection" | "reveal" | "result";
  gameResult: "win" | "lose" | "draw" | null;
}

export const BattleArea: React.FC<BattleAreaProps> = ({
  playerCard,
  opponentCard,
  gamePhase,
  gameResult,
}) => {
  return (
    <div className="relative h-64 w-full flex items-center justify-center">
      {/* 玩家選擇的卡 */}
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
            <GameCard
              card={playerCard}
              isFlipped={gamePhase !== "selection"}
              className={`${gameResult === "win" ? "ring-green-500 ring-4" : gameResult === "lose" ? "ring-red-500 ring-4" : ""}`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 對手選擇的卡 */}
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
            <GameCard
              card={opponentCard}
              isFlipped={gamePhase !== "selection"}
              className={gameResult === "lose" ? "ring-4 ring-green-500" : gameResult === "win" ? "ring-4 ring-red-500" : ""}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 對決指示器 */}
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