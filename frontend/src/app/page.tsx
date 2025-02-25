"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MatchmakingList, Player } from "@/components/game/MatchmakingList";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  
  // 配對狀態
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([
    { id: "1", name: "玩家 1", status: "available" },
    { id: "2", name: "玩家 2", status: "available" },
    { id: "3", name: "玩家 3", status: "in-game" },
    { id: "4", name: "玩家 4", status: "available" },
  ]);

  // 加入對戰
  const handleJoinMatch = (playerId: string) => {
    // 在實際應用中，這裡會連接到後端
    // 現在我們只是模擬加入對戰
    setAvailablePlayers((prev) =>
      prev.map((player) =>
        player.id === playerId ? { ...player, status: "in-game" } : player
      )
    );
    router.push('/game');
  };

  // 開始與電腦對戰
  const startComputerGame = () => {
    router.push('/game');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">石頭剪刀布卡牌決鬥</h1>
        <p className="text-muted-foreground">
          選擇你的卡牌，擊敗對手，贏得他們的卡片！
        </p>
      </header>

      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <MatchmakingList players={availablePlayers} onJoinMatch={handleJoinMatch} />
        </motion.div>
        
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
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M15 12c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"/>
                <path d="M12 8v1"/>
                <path d="M12 15v1"/>
                <path d="M8 12H7"/>
                <path d="M17 12h-1"/>
                <path d="M9.879 9.879l-.707-.707"/>
                <path d="M14.121 14.121l.707.707"/>
                <path d="M9.879 14.121l-.707.707"/>
                <path d="M14.121 9.879l.707-.707"/>
              </svg>
              開始與電腦對戰
            </motion.span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
