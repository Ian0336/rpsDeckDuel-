import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type CardValue = "rock" | "paper" | "scissors";

export interface CardType {
  id: string;
  value: CardValue;
}

interface GameCardProps {
  card: CardType;
  isFlipped?: boolean;
  isSelectable?: boolean;
  onClick?: () => void;
  className?: string;
}

const cardIcons = {
  rock: "✊",
  paper: "✋",
  scissors: "✌️",
};

const cardColors = {
  rock: "bg-red-100 dark:bg-red-900",
  paper: "bg-blue-100 dark:bg-blue-900",
  scissors: "bg-yellow-100 dark:bg-yellow-900",
};

export const GameCard: React.FC<GameCardProps> = ({
  card,
  isFlipped = false,
  isSelectable = false,
  onClick,
  className,
}) => {
  return (
    <motion.div
      className={cn(
        "perspective-500 cursor-default",
        isSelectable && "cursor-pointer hover:scale-105 transition-transform",
        className
      )}
      onClick={isSelectable ? onClick : undefined}
      whileHover={isSelectable ? { scale: 1.05 } : {}}
      whileTap={isSelectable ? { scale: 0.95 } : {}}
    >
      <motion.div
        className="relative w-32 h-48 preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Card Back */}
        <Card
          className={cn(
            "absolute w-full h-full backface-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center",
            isFlipped ? "hidden" : ""
          )}
        >
          <CardContent className="flex items-center justify-center h-full">
            <span className="text-4xl">🎮</span>
          </CardContent>
        </Card>

        {/* Card Front */}
        <Card
          className={cn(
            "absolute w-full h-full backface-hidden rotateY-180 flex flex-col items-center justify-center",
            cardColors[card.value]
          )}
        >
          <CardContent className="flex flex-col items-center justify-center h-full gap-2">
            <span className="text-6xl">{cardIcons[card.value]}</span>
            <span className="text-xl font-bold capitalize">{card.value}</span>
            <span className="text-xs text-gray-500">#{card.id.slice(0, 4)}</span>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}; 