import React from "react";
import { GameCard, CardType } from "@/components/game/GameCard";
import { motion, AnimatePresence } from "framer-motion";

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
  
  // 計算每張卡片的偏移量
  const getCardOffset = (index: number, total: number) => {
    return {
      x: (index - total / 2) * 60 + 40,
      rotate: (index - total / 2) * 6 * (isPlayer ? 1 : -1) + (isPlayer ? 0 : 180),
      y: Math.abs(index - total / 2) * 5 * (isPlayer ? 1 : -1)
    };
  };

  // 處理卡片點擊
  const handleCardClick = (card: CardType, index: number) => {
    if (isPlayer && !selectedCard) {
      onCardSelect && onCardSelect(card);
    }
  };
  
  if(isPlayer){
    console.log(cards);
  }

  return (
    <div className="flex flex-col items-center gap-4 relative">
      <motion.h2 
        className="text-xl font-bold flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {isPlayer ? (
          <>
            <span className="text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            Your Deck
          </>
        ) : (
          <>
            <span className="text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            Opponent's Deck
          </>
        )}
      </motion.h2>
      
      {/* Card Count Badge */}
      {/* <motion.div 
        className={`absolute top-0 right-0 mt-2 mr-2 px-3 py-1 rounded-full ${
          isPlayer ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
        } font-bold text-sm flex items-center gap-1 z-30`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
        {cards.length}
      </motion.div> */}
      
      
      {/* 卡片區域 */}
      <div 
        className={`relative h-48 w-full flex items-center justify-center ${
          isPlayer && !selectedCard ? "cursor-pointer" : ""
        }`}
        onClick={() => isPlayer && !selectedCard}
      >
        <AnimatePresence>
          {cards.map((card, index) => {
            // 如果卡片被選中，不在這裡渲染它
            if (selectedCard && card.id === selectedCard.id) return null;
            
            return (
              <motion.div
                key={card.id}
                className={`absolute z-${10 + index}`}
                initial={{ 
                  opacity: 0,
                  x: 0,
                  y: -50,
                  rotate: 0,
                  scale: 0.8
                }}
                animate={{ 
                  opacity: 1,
                  x: getCardOffset(index, cards.length).x,
                  y: getCardOffset(index, cards.length).y,
                  rotate: getCardOffset(index, cards.length).rotate,
                  scale: 1,
                  zIndex: 10 + index
                }}
                whileHover={isPlayer && !selectedCard ? { 
                  y: -20,
                  scale: 1.1,
                  zIndex: 50,
                  transition: { type: "keyframes", stiffness: 300, damping: 10 }
                } : {}}
                transition={{ 
                  type: "keyframes",
                  stiffness: 300,
                  damping: 20,
                  delay: index * 0.03
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(card, index);
                }}
              >
                <GameCard
                  card={card}
                  isFlipped={true}
                  isSelectable={isPlayer && !selectedCard}
                  onClick={() => {}}  // 處理在外層div
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* 空牌組提示 */}
        {cards.length === 0 && (
          <motion.div 
            className={`px-4 py-2 rounded-lg ${
              isPlayer ? "bg-blue-50 text-blue-500" : "bg-red-50 text-red-500"
            } border border-dashed`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            沒有卡片了
          </motion.div>
        )}
      </div>
      
      {/* 選擇狀態 */}
      <motion.div 
        className={`mt-2 text-sm ${
          isPlayer ? "text-blue-600" : "text-red-600"
        } font-medium bg-opacity-20 px-3 py-1 rounded-lg`}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        {isPlayer ? (
          selectedCard ? (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>You selected: <strong>{selectedCard.value}</strong> <span className="text-xs opacity-70">#{selectedCard.id.slice(0, 4)}</span></span>
            </div>
          ) : (
            <div className="flex items-center gap-2 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>選擇一張卡牌</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <span>Cards remaining: <strong>{cards.length}</strong></span>
          </div>
        )}
      </motion.div>
    </div>
  );
}; 