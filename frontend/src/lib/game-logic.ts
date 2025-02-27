import { CardType } from "@/components/game/GameCard";
import { ElementType } from "@/types/game";
import { GameState, initialGameState } from "@/types/game";

// Helper function to generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Five elements order: Wood → Fire → Earth → Metal → Water → Wood
const elementCycle: ElementType[] = ["wood", "fire", "earth", "metal", "water"];

// Calculate clockwise distance between two elements
function getClockwiseDistance(fromElement: ElementType, toElement: ElementType): number {
  const fromIndex = elementCycle.indexOf(fromElement);
  const toIndex = elementCycle.indexOf(toElement);
  
  // Calculate clockwise distance
  return (toIndex - fromIndex + elementCycle.length) % elementCycle.length;
}

// Calculate effective points based on the five elements generation/restriction rules
function calculateEffectivePoints(card: CardType, opponentCard: CardType): number {
  const distance = getClockwiseDistance(card.element, opponentCard.element);
  
  // Generation relationship (distance of 1): double points
  if (distance === 4) {
    return card.point + Math.ceil(opponentCard.point / 5) * 4;
  }
  
  // Restriction relationship (distance of 2): halve points
  if (distance === 3) {
    return Math.max(card.point - Math.ceil(opponentCard.point / 5) * 4, 0);
  }

  if (distance === 0) {
    return card.point + opponentCard.point;
  }
  
  // Other relationships: points unchanged
  return card.point;
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
  // Create initial deck with 2 cards of each element, unique IDs, initial points of 1
  const elements: ElementType[] = ["metal", "wood", "water", "fire", "earth"];
  const deck: CardType[] = [];
  
  elements.forEach(element => {
    for (let i = 0; i < 2; i++) {
      deck.push({
        id: `${element}-${generateId()}`,
        element: element,
        point: 1
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
  // Find card to transfer by ID
  const cardIndex = fromDeck.findIndex(card => card.id === cardToTransfer.id);
  
  if (cardIndex === -1) {
    // Card not found, return original decks
    return { updatedFromDeck: [...fromDeck], updatedToDeck: [...toDeck] };
  }
  
  // Create new deck arrays
  const updatedFromDeck = [...fromDeck];
  const updatedToDeck = [...toDeck];
  
  // Remove card from source deck
  const [removedCard] = updatedFromDeck.splice(cardIndex, 1);
  
  // If card is winner, increase points; if loser, reset points to 1
  const updatedCard = {
    ...removedCard,
    point: 1
  };
  
  // Add updated card to target deck
  updatedToDeck.push(updatedCard);

  // update to deck (winner card)
  const myCardIndex = toDeck.findIndex(card => card.id === myCard.id);
  if (myCardIndex !== -1) {
    updatedToDeck[myCardIndex] = {
      ...myCard,
      point: myCard.point + 1
    };
  }
  
  return { updatedFromDeck, updatedToDeck };
}

// Get element relationship description
export function getElementRelationship(fromElement: ElementType, toElement: ElementType): {
  relationship: "generates" | "restricts" | "neutral";
  description: string;
} {
  const distance = getClockwiseDistance(fromElement, toElement);
  
  if (distance === 1) {
    return {
      relationship: "generates",
      description: `${elementNameMap[fromElement]} generates ${elementNameMap[toElement]}, effect doubled`
    };
  } else if (distance === 2) {
    return {
      relationship: "restricts",
      description: `${elementNameMap[fromElement]} restricts ${elementNameMap[toElement]}, effect halved`
    };
  } else {
    return {
      relationship: "neutral",
      description: "No special relationship"
    };
  }
}

// Chinese element name mapping
const elementNameMap = {
  metal: "Metal",
  wood: "Wood",
  water: "Water",
  fire: "Fire",
  earth: "Earth"
};

// Modified function to generate player deck, uses existing deck if available
export const setupGame = (existingPlayerDeck?: CardType[]): GameState => {
  const playerDeck = existingPlayerDeck || (getInitialDeck() as CardType[]);
  const computerDeck = getInitialDeck() as CardType[];
  
  return {
    ...initialGameState,
    playerDeck,
    computerDeck,
    gameStatus: 'playing',
  };
};

// Helper functions
export const generatePlayerDeck = (): CardType[] => {
    return getInitialDeck() as CardType[];
};

export const generateComputerDeck = (): CardType[] => {
  return getInitialDeck() as CardType[];
}; 