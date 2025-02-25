import { CardType, CardValue } from "@/components/game/GameCard";

// 生成唯一ID的輔助函數
function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function determineWinner(
  playerCard: CardType,
  opponentCard: CardType
): "win" | "lose" | "draw" {
  if (playerCard.value === opponentCard.value) {
    return "draw";
  }

  if (
    (playerCard.value === "rock" && opponentCard.value === "scissors") ||
    (playerCard.value === "paper" && opponentCard.value === "rock") ||
    (playerCard.value === "scissors" && opponentCard.value === "paper")
  ) {
    return "win";
  }

  return "lose";
}

export function getInitialDeck(): CardType[] {
  // 創建初始牌組，每種卡牌3張，每張有唯一ID
  const cardValues: CardValue[] = ["rock", "paper", "scissors"];
  const deck: CardType[] = [];
  
  cardValues.forEach(value => {
    for (let i = 0; i < 3; i++) {
      deck.push({
        id: `${value}-${generateId()}`,
        value: value
      });
    }
  });
  
  return deck;
}

export function transferCard(
  fromDeck: CardType[],
  toDeck: CardType[],
  cardToTransfer: CardType
): { updatedFromDeck: CardType[]; updatedToDeck: CardType[] } {
  // 根據ID找到要轉移的卡牌
  const cardIndex = fromDeck.findIndex(card => card.id === cardToTransfer.id);
  
  if (cardIndex === -1) {
    // 卡牌未找到，返回原始牌組
    return { updatedFromDeck: [...fromDeck], updatedToDeck: [...toDeck] };
  }
  
  // 創建新的牌組數組
  const updatedFromDeck = [...fromDeck];
  const updatedToDeck = [...toDeck];
  
  // 從源牌組中移除卡牌
  const [removedCard] = updatedFromDeck.splice(cardIndex, 1);
  
  // 將卡牌添加到目標牌組
  updatedToDeck.push(removedCard);
  
  return { updatedFromDeck, updatedToDeck };
} 