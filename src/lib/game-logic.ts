import { CardType } from "@/components/game/GameCard";

export function determineWinner(
  playerCard: CardType,
  opponentCard: CardType
): "win" | "lose" | "draw" {
  if (playerCard === opponentCard) {
    return "draw";
  }

  if (
    (playerCard === "rock" && opponentCard === "scissors") ||
    (playerCard === "paper" && opponentCard === "rock") ||
    (playerCard === "scissors" && opponentCard === "paper")
  ) {
    return "win";
  }

  return "lose";
}

export function getInitialDeck(): CardType[] {
  // Start with 3 of each card type
  return [
    "rock", "rock", "rock",
    "paper", "paper", "paper",
    "scissors", "scissors", "scissors"
  ];
}

export function transferCard(
  fromDeck: CardType[],
  toDeck: CardType[],
  cardType: CardType
): { updatedFromDeck: CardType[]; updatedToDeck: CardType[] } {
  // Find the index of the first occurrence of the card
  const cardIndex = fromDeck.indexOf(cardType);
  
  if (cardIndex === -1) {
    // Card not found, return decks unchanged
    return { updatedFromDeck: [...fromDeck], updatedToDeck: [...toDeck] };
  }
  
  // Create new arrays
  const updatedFromDeck = [...fromDeck];
  const updatedToDeck = [...toDeck];
  
  // Remove the card from the source deck
  updatedFromDeck.splice(cardIndex, 1);
  
  // Add the card to the destination deck
  updatedToDeck.push(cardType);
  
  return { updatedFromDeck, updatedToDeck };
} 