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

export default function GamePage() {
  const router = useRouter();
  
  // 遊戲狀態
  const [playerDeck, setPlayerDeck] = useState<CardType[]>(getInitialDeck());
  const [opponentDeck, setOpponentDeck] = useState<CardType[]>(getInitialDeck());
  const [playerSelectedCard, setPlayerSelectedCard] = useState<CardType | null>(null);
  const [opponentSelectedCard, setOpponentSelectedCard] = useState<CardType | null>(null);
  const [gameResult, setGameResult] = useState<"win" | "lose" | "draw" | null>(null);
  const [playerEffectivePoints, setPlayerEffectivePoints] = useState<number | undefined>(undefined);
  const [opponentEffectivePoints, setOpponentEffectivePoints] = useState<number | undefined>(undefined);
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
        const battleResult = determineWinner(playerSelectedCard, opponentSelectedCard);
        setGameResult(battleResult.result);
        setPlayerEffectivePoints(battleResult.playerEffectivePoints);
        setOpponentEffectivePoints(battleResult.opponentEffectivePoints);
        
        // 添加到遊戲日誌
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
          const { updatedFromDeck, updatedToDeck } = updateValueTransfer(
            opponentDeck,
            playerDeck,
            opponentSelectedCard,
            playerSelectedCard
          );
          setOpponentDeck(updatedFromDeck);
          setPlayerDeck(updatedToDeck);
        } else if (gameResult === "lose") {
          // 玩家失敗，給予卡片給對手
          const { updatedFromDeck, updatedToDeck } = updateValueTransfer(
            playerDeck,
            opponentDeck,
            playerSelectedCard,
            opponentSelectedCard
          );
          setPlayerDeck(updatedFromDeck);
          setOpponentDeck(updatedToDeck);
        }
        
        // 檢查遊戲是否結束
        if (playerDeck.length === 0 || opponentDeck.length === 0) {
          setIsGameActive(false);
        } else {
          // 準備下一回合
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
  }, [gamePhase, gameResult, playerSelectedCard, opponentSelectedCard, playerDeck, opponentDeck]);

  // 處理玩家選擇卡片
  const handleCardSelect = (card: CardType) => {
    if (gamePhase === "selection" && !playerSelectedCard) {
      setPlayerSelectedCard(card);
    }
  };

  // 開始新遊戲
  const handleNewGame = () => {
    setPlayerDeck(getInitialDeck());
    setOpponentDeck(getInitialDeck());
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
  };

  // 返回配對列表
  const handleReturnToMatchmaking = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* 固定在頂部的對手區域 */}
      <div className="w-full bg-opacity-0 border-b border-red-100 p-4 sticky top-0 z-10">
        <PlayerDeck
          cards={opponentDeck}
          isPlayer={false}
          selectedCard={opponentSelectedCard}
        />
      </div>

      {/* 中央浮動狀態顯示 */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
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
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {gameResult === "win" 
                ? `你贏了！ ${playerEffectivePoints} vs ${opponentEffectivePoints}` 
                : gameResult === "lose" 
                ? `你輸了！ ${playerEffectivePoints} vs ${opponentEffectivePoints}` 
                : `平局！ ${playerEffectivePoints} vs ${opponentEffectivePoints}`}
            </motion.div>
          )}
        </AnimatePresence>
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
          playerEffectivePoints={playerEffectivePoints}
          opponentEffectivePoints={opponentEffectivePoints}
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </motion.button>
      </div>

      {/* 控制面板 */}
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
              <h3 className="font-bold text-lg">遊戲控制</h3>
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
                開始新遊戲
              </Button>
              
              <Button 
                variant="outline"
                className="w-full"
                onClick={handleReturnToMatchmaking}
              >
                返回配對列表
              </Button>
              
              {!isGameActive && (
                <div className={`p-3 rounded-md mt-4 text-center font-bold ${playerDeck.length === 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                  {playerDeck.length === 0 ? "你輸了！所有卡片都被對手奪走了。" : "你贏了！奪走了對手所有的卡片。"}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 遊戲日誌 */}
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
              <h3 className="font-bold text-lg">遊戲日誌</h3>
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

      {/* 中間填充空間 */}
      <div className="flex-1"></div>

      {/* 固定在底部的玩家區域 */}
      <div className="w-full bg-blue-50 bg-opacity-30 border-t border-blue-100 p-4 sticky bottom-0 z-10">
        <PlayerDeck
          cards={playerDeck}
          isPlayer={true}
          onCardSelect={handleCardSelect}
          selectedCard={playerSelectedCard}
        />
      </div>
    </div>
  );
} 