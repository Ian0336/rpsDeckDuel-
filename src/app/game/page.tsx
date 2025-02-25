"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlayerDeck } from "@/components/game/PlayerDeck";
import { BattleArea } from "@/components/game/BattleArea";
import { GameLog, GameLogEntry } from "@/components/game/GameLog";
import { CardType } from "@/components/game/GameCard";
import { determineWinner, getInitialDeck, transferCard } from "@/lib/game-logic";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function GamePage() {
  const router = useRouter();
  
  // 遊戲狀態
  const [playerDeck, setPlayerDeck] = useState<CardType[]>(getInitialDeck());
  const [opponentDeck, setOpponentDeck] = useState<CardType[]>(getInitialDeck());
  const [playerSelectedCard, setPlayerSelectedCard] = useState<CardType | null>(null);
  const [opponentSelectedCard, setOpponentSelectedCard] = useState<CardType | null>(null);
  const [gameResult, setGameResult] = useState<"win" | "lose" | "draw" | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([]);
  const [gamePhase, setGamePhase] = useState<"selection" | "reveal" | "result">("selection");
  const [isGameActive, setIsGameActive] = useState(true);
  
  // UI 狀態
  const [showGameLog, setShowGameLog] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  // AI 對手邏輯
  useEffect(() => {
    if (isGameActive && gamePhase === "selection" && playerSelectedCard) {
      // 模擬對手選擇卡片（短暫延遲後）
      const timer = setTimeout(() => {
        const availableCards = opponentDeck;
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        setOpponentSelectedCard(availableCards[randomIndex]);
        setGamePhase("reveal");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isGameActive, gamePhase, playerSelectedCard, opponentDeck]);

  // 處理回合結果
  useEffect(() => {
    if (gamePhase === "reveal" && playerSelectedCard && opponentSelectedCard) {
      // 短暫延遲後確定勝者（以顯示卡片）
      const timer = setTimeout(() => {
        const result = determineWinner(playerSelectedCard, opponentSelectedCard);
        setGameResult(result);
        
        // 添加到遊戲日誌
        setGameLog((prev) => [
          ...prev,
          {
            round: roundNumber,
            playerCard: playerSelectedCard,
            opponentCard: opponentSelectedCard,
            result,
          },
        ]);
        
        setGamePhase("result");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [gamePhase, playerSelectedCard, opponentSelectedCard, roundNumber]);

  // 處理卡片轉移
  useEffect(() => {
    if (gamePhase === "result" && playerSelectedCard && opponentSelectedCard && gameResult) {
      // 根據結果轉移卡片
      const timer = setTimeout(() => {
        if (gameResult === "win") {
          // 玩家獲勝，獲得對手的卡片
          const { updatedFromDeck, updatedToDeck } = transferCard(
            opponentDeck,
            playerDeck,
            opponentSelectedCard
          );
          setOpponentDeck(updatedFromDeck);
          setPlayerDeck(updatedToDeck);
        } else if (gameResult === "lose") {
          // 玩家失敗，給予卡片給對手
          const { updatedFromDeck, updatedToDeck } = transferCard(
            playerDeck,
            opponentDeck,
            playerSelectedCard
          );
          setPlayerDeck(updatedFromDeck);
          setOpponentDeck(updatedToDeck);
        }
        // 平局不轉移卡片

        // 重置下一回合
        setRoundNumber((prev) => prev + 1);
        setPlayerSelectedCard(null);
        setOpponentSelectedCard(null);
        setGameResult(null);
        setGamePhase("selection");
        
        // 檢查遊戲結束
        if (playerDeck.length === 0 || opponentDeck.length === 0) {
          setIsGameActive(false);
          setShowControls(true); // 遊戲結束時顯示控制面板
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [gamePhase, playerSelectedCard, opponentSelectedCard, gameResult, playerDeck, opponentDeck]);

  // 處理卡片選擇
  const handleCardSelect = (card: CardType) => {
    if (gamePhase === "selection" && !playerSelectedCard) {
      setPlayerSelectedCard(card);
    }
  };

  // 開始新遊戲
  const startNewGame = () => {
    setPlayerDeck(getInitialDeck());
    setOpponentDeck(getInitialDeck());
    setPlayerSelectedCard(null);
    setOpponentSelectedCard(null);
    setGameResult(null);
    setRoundNumber(1);
    setGameLog([]);
    setGamePhase("selection");
    setIsGameActive(true);
    setShowControls(false);
  };

  // 返回配對列表
  const handleReturnToMatchmaking = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* 固定在頂部的對手區域 */}
      <div className="w-full  bg-opacity-0 border-b border-red-100 p-4 sticky top-0 z-10">
        <PlayerDeck
          cards={opponentDeck.sort((a, b) => a.value.localeCompare(b.value))}
          isPlayer={false}
          selectedCard={opponentSelectedCard}
        />
      </div>

      {/* 回合信息 - 固定在對手和玩家區域之間 */}
      <div className="flex justify-center items-center py-4">
        <motion.div 
          className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium shadow-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          回合 {roundNumber} - {gamePhase === "selection" ? "選擇卡片" : gamePhase === "reveal" ? "對決中..." : "結算中..."}
        </motion.div>
      </div>

      {/* 中央對決區域 */}
      <div className="flex-1 flex items-center justify-center">
        <BattleArea
          playerCard={playerSelectedCard}
          opponentCard={opponentSelectedCard}
          gamePhase={gamePhase}
          gameResult={gameResult}
        />
      </div>

      {/* 側邊控制面板 - 可折疊 */}
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
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </motion.button>
      </div>

      {/* 控制面板抽屜 */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            className="fixed left-0 top-0 bottom-0 bg-white/95 shadow-lg z-10 p-6 flex flex-col justify-center gap-4 w-64"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <h3 className="text-xl font-bold mb-4">遊戲控制</h3>
            
            {!isGameActive && (
              <Button 
                onClick={startNewGame} 
                variant="default"
                className="relative overflow-hidden group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 w-full"
              >
                <motion.span 
                  className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
                  whileHover={{ scale: 1.5, opacity: 0.2 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="relative z-10 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/>
                    <path d="M12 5v14"/>
                  </svg>
                  開始新遊戲
                </motion.span>
              </Button>
            )}
            
            <Button 
              onClick={handleReturnToMatchmaking} 
              variant="outline"
              className="relative overflow-hidden group border-2 hover:border-blue-500 transition-all duration-300 w-full"
            >
              <motion.span 
                className="absolute inset-0 bg-blue-100 opacity-0 group-hover:opacity-20"
                whileHover={{ scale: 1.5, opacity: 0.2 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="relative z-10 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5"/>
                  <path d="M12 19l-7-7 7-7"/>
                </svg>
                返回配對列表
              </motion.span>
            </Button>
            
            <Button 
              onClick={() => setShowControls(false)} 
              variant="ghost"
              className="mt-auto"
            >
              關閉
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 遊戲日誌抽屜 */}
      <AnimatePresence>
        {showGameLog && (
          <motion.div 
            className="fixed right-0 top-0 bottom-0 bg-white/95 shadow-lg z-10 p-6 flex flex-col w-80"
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">遊戲日誌</h3>
              <Button 
                onClick={() => setShowGameLog(false)} 
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
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

      {/* 中間填充空間 */}
      <div className="flex-1"></div>

      {/* 固定在底部的玩家區域 */}
      <div className="w-full  bg-opacity-0 border-t border-blue-100 p-4 sticky bottom-0 z-10">
        <PlayerDeck
          cards={playerDeck.sort((a, b) => a.value.localeCompare(b.value))}
          isPlayer={true}
          onCardSelect={handleCardSelect}
          selectedCard={playerSelectedCard}
        />
      </div>
    </div>
  );
} 