import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type CardType = {
  id: string;
  element: "metal" | "wood" | "water" | "fire" | "earth";
  point: number;
};

interface GameCardProps {
  card: CardType;
  isFlipped?: boolean;
  isSelectable?: boolean;
  onClick?: () => void;
  className?: string;
}

const elementIcons = {
  metal: "🔧",
  wood: "🌳",
  water: "💧",
  fire: "🔥",
  earth: "🪨",
};

const elementColors = {
  metal: "bg-gray-100 dark:bg-gray-800",
  wood: "bg-green-100 dark:bg-green-900",
  water: "bg-blue-100 dark:bg-blue-900",
  fire: "bg-red-100 dark:bg-red-900",
  earth: "bg-yellow-100 dark:bg-yellow-900",
};

const elementNames = {
  metal: "Metal",
  wood: "Wood", 
  water: "Water",
  fire: "Fire",
  earth: "Earth",
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
            elementColors[card.element]
          )}
        >
          <CardContent className="flex flex-col items-center justify-center h-full gap-2">
            <span className="text-6xl">{elementIcons[card.element]}</span>
            <span className="text-xl font-bold capitalize">{elementNames[card.element]}</span>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-purple-600">{card.point}</span>
              <span className="text-xs text-gray-500">pts</span>
            </div>
            <span className="text-xs text-gray-500">#{card.id.slice(0, 4)}</span>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};