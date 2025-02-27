import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardType } from "@/components/game/GameCard";

export interface GameLogEntry {
  round: number;
  playerCard: CardType;
  opponentCard: CardType;
  result: "win" | "lose" | "draw";
  playerEffectivePoints: number;
  opponentEffectivePoints: number;
}

interface GameLogProps {
  logs: GameLogEntry[];
}

const elementIcons = {
  metal: "🔧",
  wood: "🌳",
  water: "💧",
  fire: "🔥",
  earth: "🪨",
};

const elementNames = {
  metal: "Metal",
  wood: "Wood",
  water: "Water", 
  fire: "Fire",
  earth: "Earth",
};

export const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Game Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full pr-4">
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground">No rounds played yet</p>
          ) : (
            <ul className="space-y-2">
              {logs.map((log, index) => (
                <li
                  key={index}
                  className="border-b pb-2 last:border-b-0 last:pb-0"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">Round {log.round}</span>
                    <span
                      className={
                        log.result === "win"
                          ? "text-green-500"
                          : log.result === "lose"
                          ? "text-red-500"
                          : "text-yellow-500"
                      }
                    >
                      {log.result === "win"
                        ? "You won!"
                        : log.result === "lose"
                        ? "You lost!"
                        : "Draw!"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <span>{elementIcons[log.playerCard.element]}</span>
                      <span>{elementNames[log.playerCard.element]}</span>
                      <span className="text-purple-600 font-medium">({log.playerEffectivePoints})</span>
                    </div>
                    <span>vs</span>
                    <div className="flex items-center gap-1">
                      <span>{elementIcons[log.opponentCard.element]}</span>
                      <span>{elementNames[log.opponentCard.element]}</span>
                      <span className="text-purple-600 font-medium">({log.opponentEffectivePoints})</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};