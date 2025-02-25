import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Player {
  id: string;
  name: string;
  status: "available" | "in-game";
}

interface MatchmakingListProps {
  players: Player[];
  onJoinMatch: (playerId: string) => void;
}

export const MatchmakingList: React.FC<MatchmakingListProps> = ({
  players,
  onJoinMatch,
}) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Available Players</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full pr-4">
          {players.length === 0 ? (
            <p className="text-center text-muted-foreground">No players available</p>
          ) : (
            <ul className="space-y-2">
              {players.map((player) => (
                <li
                  key={player.id}
                  className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0"
                >
                  <div>
                    <span className="font-medium">{player.name}</span>
                    <span
                      className={`ml-2 inline-block px-2 py-1 text-xs rounded-full ${
                        player.status === "available"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                      }`}
                    >
                      {player.status}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    disabled={player.status !== "available"}
                    onClick={() => onJoinMatch(player.id)}
                  >
                    Join
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}; 