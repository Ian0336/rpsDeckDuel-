import { CardType, ElementType } from "@/components/game/GameCard";
import { Card, GameState, initialGameState } from "@/types/game";

// 生成唯一ID的輔助函數
function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// 五行元素的順序：木 → 火 → 土 → 金 → 水 → 木
const elementCycle: ElementType[] = ["wood", "fire", "earth", "metal", "water"];

// 計算兩個元素之間的順時針距離
function getClockwiseDistance(fromElement: ElementType, toElement: ElementType): number {
  const fromIndex = elementCycle.indexOf(fromElement);
  const toIndex = elementCycle.indexOf(toElement);
  
  // 計算順時針距離
  return (toIndex - fromIndex + elementCycle.length) % elementCycle.length;
}

// 根據五行相生相剋規則計算實際點數
function calculateEffectivePoints(card: CardType, opponentCard: CardType): number {
  const distance = getClockwiseDistance(card.element, opponentCard.element);
  
  // 相生關係（距離為1）：點數加倍
  if (distance === 4) {
    return card.points + Math.ceil(opponentCard.points / 3) * 2;
  }
  
  // 相剋關係（距離為2）：點數減半
  if (distance === 3) {
    return Math.max(card.points - Math.ceil(opponentCard.points / 3) * 2, 0);
  }

  if (distance === 0) {
    return card.points + opponentCard.points;
  }
  
  // 其他關係：點數不變
  return card.points;
}

export function determineWinner(
  playerCard: CardType,
  opponentCard: CardType
): { result: "win" | "lose" | "draw"; playerEffectivePoints: number; opponentEffectivePoints: number } {
  const playerEffectivePoints = calculateEffectivePoints(playerCard, opponentCard);
  const opponentEffectivePoints = calculateEffectivePoints(opponentCard, playerCard);
  
  if (playerEffectivePoints > opponentEffectivePoints) {
    return { result: "win", playerEffectivePoints, opponentEffectivePoints };
  } else if (playerEffectivePoints < opponentEffectivePoints) {
    return { result: "lose", playerEffectivePoints, opponentEffectivePoints };
  } else {
    return { result: "draw", playerEffectivePoints, opponentEffectivePoints };
  }
}

export function getInitialDeck(): CardType[] {
  // 創建初始牌組，每種元素2張，每張有唯一ID，初始點數為1
  const elements: ElementType[] = ["metal", "wood", "water", "fire", "earth"];
  const deck: CardType[] = [];
  
  elements.forEach(element => {
    for (let i = 0; i < 2; i++) {
      deck.push({
        id: `${element}-${generateId()}`,
        element: element,
        points: 1
      });
    }
  });
  
  return deck;
}

export function updateValueTransfer(
  fromDeck: CardType[],
  toDeck: CardType[],
  cardToTransfer: CardType,
  myCard: CardType,
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
  
  // 如果卡牌是贏家，增加點數；如果是輸家，重置點數為1
  const updatedCard = {
    ...removedCard,
    points: 1
  };
  
  // 將更新後的卡牌添加到目標牌組
  updatedToDeck.push(updatedCard);

  // update to deck (winner card)
  const myCardIndex = toDeck.findIndex(card => card.id === myCard.id);
  if (myCardIndex !== -1) {
    updatedToDeck[myCardIndex] = {
      ...myCard,
      points: myCard.points + 1
    };
  }
  
  return { updatedFromDeck, updatedToDeck };
}

// 獲取元素關係描述
export function getElementRelationship(fromElement: ElementType, toElement: ElementType): {
  relationship: "generates" | "restricts" | "neutral";
  description: string;
} {
  const distance = getClockwiseDistance(fromElement, toElement);
  
  if (distance === 1) {
    return {
      relationship: "generates",
      description: `${elementNameMap[fromElement]}生${elementNameMap[toElement]}，效果加倍`
    };
  } else if (distance === 2) {
    return {
      relationship: "restricts",
      description: `${elementNameMap[fromElement]}克${elementNameMap[toElement]}，效果減半`
    };
  } else {
    return {
      relationship: "neutral",
      description: "無特殊關係"
    };
  }
}

// 中文元素名稱映射
const elementNameMap = {
  metal: "金",
  wood: "木",
  water: "水",
  fire: "火",
  earth: "土"
};

// 修改生成玩家牌组的函数，如果已有牌组则使用现有牌组
export const setupGame = (existingPlayerDeck?: Card[]): GameState => {
  const playerDeck = existingPlayerDeck || (getInitialDeck() as Card[]);
  const computerDeck = getInitialDeck() as Card[];
  
  return {
    ...initialGameState,
    playerDeck,
    computerDeck,
    gameStatus: 'playing',
  };
};

// 添加这些辅助函数
export const generatePlayerDeck = (): Card[] => {
  return getInitialDeck() as Card[];
};

export const generateComputerDeck = (): Card[] => {
  return getInitialDeck() as Card[];
}; 