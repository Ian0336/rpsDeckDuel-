"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlayerDeck } from "@/components/game/PlayerDeck";
import { GameLog, GameLogEntry } from "@/components/game/GameLog";
import { MatchmakingList, Player } from "@/components/game/MatchmakingList";
import { CardType } from "@/components/game/GameCard";
import { determineWinner, getInitialDeck, transferCard } from "@/lib/game-logic";
import { motion } from "framer-motion";

export default function Home() {
  // 遊戲狀態
  const [playerDeck, setPlayerDeck] = useState<CardType[]>(getInitialDeck());
  const [opponentDeck, setOpponentDeck] = useState<CardType[]>(getInitialDeck());
  const [playerSelectedCard, setPlayerSelectedCard] = useState<CardType | null>(null);
  const [opponentSelectedCard, setOpponentSelectedCard] = useState<CardType | null>(null);
  const [gameResult, setGameResult] = useState<"win" | "lose" | "draw" | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([]);
  const [gamePhase, setGamePhase] = useState<"selection" | "reveal" | "result">("selection");
  const [isGameActive, setIsGameActive] = useState(false);
  
  // 配對狀態
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([
    { id: "1", name: "玩家 1", status: "available" },
    { id: "2", name: "玩家 2", status: "available" },
    { id: "3", name: "玩家 3", status: "in-game" },
    { id: "4", name: "玩家 4", status: "available" },
  ]);
  const [showMatchmaking, setShowMatchmaking] = useState(true);

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
    setShowMatchmaking(false);
  };

  // 加入對戰
  const handleJoinMatch = (playerId: string) => {
    // 在實際應用中，這裡會連接到後端
    // 現在我們只是模擬加入對戰
    setAvailablePlayers((prev) =>
      prev.map((player) =>
        player.id === playerId ? { ...player, status: "in-game" } : player
      )
    );
    startNewGame();
  };

  // 返回配對列表
  const handleReturnToMatchmaking = () => {
    setIsGameActive(false);
    setShowMatchmaking(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">石頭剪刀布卡牌決鬥</h1>
        <p className="text-muted-foreground">
          選擇你的卡牌，擊敗對手，贏得他們的卡片！
        </p>
      </header>

      {showMatchmaking ? (
        <div className="flex flex-col items-center gap-6">
          <MatchmakingList players={availablePlayers} onJoinMatch={handleJoinMatch} />
          <Button onClick={startNewGame} size="lg">
            開始與電腦對戰
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8">
          {/* 遊戲區域 */}
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 玩家區域 */}
            <div className="flex flex-col items-center gap-4">
              <PlayerDeck
                cards={playerDeck}
                isPlayer={true}
                onCardSelect={handleCardSelect}
                selectedCard={playerSelectedCard}
              />
              
              {gameResult && (
                <div className="mt-4 text-center">
                  <p className={`text-xl font-bold ${
                    gameResult === "win" 
                      ? "text-green-500" 
                      : gameResult === "lose" 
                      ? "text-red-500" 
                      : "text-yellow-500"
                  }`}>
                    {gameResult === "win" 
                      ? "你贏了這回合！" 
                      : gameResult === "lose" 
                      ? "你輸了這回合！" 
                      : "平局！"}
                  </p>
                </div>
              )}
            </div>

            {/* 對手區域 */}
            <div className="flex flex-col items-center gap-4">
              <PlayerDeck
                cards={opponentDeck}
                isPlayer={false}
                selectedCard={opponentSelectedCard}
              />
            </div>
          </div>

          {/* 遊戲日誌 */}
          <div className="w-full max-w-4xl mt-8">
            <GameLog logs={gameLog} />
          </div>

          {/* 控制按鈕 */}
          <div className="flex gap-4 mt-6">
            {!isGameActive && (
              <Button onClick={startNewGame} variant="default">
                開始新遊戲
              </Button>
            )}
            <Button onClick={handleReturnToMatchmaking} variant="outline">
              返回配對列表
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
