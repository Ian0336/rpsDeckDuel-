import React from "react";
import { GameCard, CardType } from "@/components/game/GameCard";
import { motion } from "framer-motion";

interface PlayerDeckProps {
  cards: CardType[];
  isPlayer: boolean;
  onCardSelect?: (card: CardType) => void;
  selectedCard?: CardType | null;
}

export const PlayerDeck: React.FC<PlayerDeckProps> = ({
  cards,
  isPlayer,
  onCardSelect,
  selectedCard,
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">{isPlayer ? "Your Deck" : "Opponent's Deck"}</h2>
      <motion.div className="flex flex-wrap justify-center gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={`${card}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GameCard
              type={card}
              isFlipped={isPlayer || (selectedCard === card && !isPlayer)}
              isSelectable={isPlayer && !selectedCard}
              onClick={() => isPlayer && onCardSelect && onCardSelect(card)}
            />
          </motion.div>
        ))}
      </motion.div>
      <div className="mt-2 text-sm text-muted-foreground">
        {isPlayer ? (
          selectedCard ? (
            <p>You selected: {selectedCard}</p>
          ) : (
            <p>Select a card to play</p>
          )
        ) : (
          <p>Cards: {cards.length}</p>
        )}
      </div>
    </div>
  );
}; 