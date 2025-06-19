import {Card} from './Card';
import {CARD_SUIT} from './DataTypes';
import {Deck} from './Deck';
import {FoundationPile} from './FoundationPile';
import {exhaustiveGuard} from './Shuffle';

export class Solitaire {
    #deck: Deck;
    #foundationPileSpade: FoundationPile;
    #foundationPileClub: FoundationPile;
    #foundationPileHeart: FoundationPile;
    #foundationPileDiamond: FoundationPile;
    #tableauPiles: Card[][];

    constructor() {
        this.#deck = new Deck();
        this.#foundationPileClub = new FoundationPile(CARD_SUIT.CLUB);
        this.#foundationPileSpade = new FoundationPile(CARD_SUIT.SPADE);
        this.#foundationPileHeart = new FoundationPile(CARD_SUIT.HEART);
        this.#foundationPileDiamond = new FoundationPile(CARD_SUIT.DIAMOND);
        this.#tableauPiles = [[], [], [], [], [], [], []];
    }

    get drawPile(): Card[] {
        return this.#deck.drawPile;
    }

    get discardPile(): Card[] {
        return this.#deck.discardPile;
    }

    get tableauPiles(): Card[][] {
        return this.#tableauPiles;
    }

    get foundationPiles(): FoundationPile[] {
        return [
            this.#foundationPileSpade,
            this.#foundationPileClub,
            this.#foundationPileHeart,
            this.#foundationPileDiamond,
        ];
    }

    get wonGame(): boolean {
        return (
            this.#foundationPileClub.value === 13 &&
            this.#foundationPileDiamond.value === 13 &&
            this.#foundationPileHeart.value === 13 &&
            this.#foundationPileSpade.value === 13
        );
    }

    // Starts a new game by resetting and dealing cards to the tableau piles.
    public newGame(): void {
        this.#deck.reset();
        this.#tableauPiles = [[], [], [], [], [], [], []];
        this.#foundationPileClub.reset();
        this.#foundationPileDiamond.reset();
        this.#foundationPileHeart.reset();
        this.#foundationPileSpade.reset();

        for (let i = 0; i < 7; i += 1) {
            for (let j = i; j < 7; j += 1) {
                const card = this.#deck.draw() as Card;
                if (j === i) {
                    card.flip();
                }
                this.#tableauPiles[j].push(card);
            }
        }
    }

    // Draws a card from the draw pile, flips it, and adds it to the discard pile.
    public drawCard(): boolean {
        const card = this.#deck.draw();
        if (card === undefined) {
            return false;
        }
        card.flip();
        this.#deck.discardPile.push(card);
        return true;
    }

    // Shuffles the discard pile back into the draw pile if the draw pile is empty.
    public shuffleDiscardPile(): boolean {
        if (this.#deck.drawPile.length !== 0) {
            return false;
        }

        this.#deck.shuffleInDiscardPile();
        return true;
    }

    // Moves the top card from the discard pile to the appropriate foundation pile if valid.
    public playDiscardPileCardToFoundation(): boolean {
        const card = this.#deck.discardPile[this.#deck.discardPile.length - 1];
        if (card === undefined) {
            return false;
        }
        if (!this.#isValidMoveToAddCardToFoundation(card)) {
            return false;
        }
        this.#addCardToFoundation(card);
        this.#deck.discardPile.pop();

        return true;
    }

    // Moves the top card from the discard pile to a tableau pile if valid.
    public playDiscardPileCardToTableau(targetTableauIndex: number): boolean {
        const card = this.#deck.discardPile[this.#deck.discardPile.length - 1];
        if (card === undefined) {
            return false;
        }
        const targetTableauPile = this.#tableauPiles[targetTableauIndex];
        if (targetTableauPile === undefined) {
            return false;
        }
        if (!this.#isValidMoveToAddCardToTableau(card, targetTableauPile)) {
            return false;
        }
        this.#tableauPiles[targetTableauIndex].push(card);
        this.#deck.discardPile.pop();

        return true;
    }

    // Flips the top card of a tableau pile if it is face down.
    public flipTopTableauCard(tableauIndex: number): boolean {
        const tableauPile = this.#tableauPiles[tableauIndex];
        if (tableauPile === undefined) {
            return false;
        }
        const card = tableauPile[tableauPile.length - 1];
        if (card === undefined) {
            return false;
        }
        if (card.isFaceUp) {
            return false;
        }
        card.flip();
        return true;
    }

    // Moves one or more cards from one tableau pile to another if the move is valid.
    public moveTableauCardsToAnotherTableau(
        initialTableauIndex: number,
        cardIndex: number,
        targetTableauIndex: number,
    ): boolean {
        const initialTableauPile = this.#tableauPiles[initialTableauIndex];
        const targetTableauPile = this.#tableauPiles[targetTableauIndex];
        if (initialTableauPile === undefined || targetTableauPile === undefined) {
            return false;
        }
        const card = initialTableauPile[cardIndex];
        if (card === undefined) {
            return false;
        }
        if (!card.isFaceUp) {
            return false;
        }
        if (!this.#isValidMoveToAddCardToTableau(card, targetTableauPile)) {
            return false;
        }
        const cardsToMove = initialTableauPile.splice(cardIndex);
        cardsToMove.forEach((card) => targetTableauPile.push(card));

        return true;
    }

    // Moves the top card of a tableau pile to the appropriate foundation pile if valid.
    public moveTableauCardToFoundation(tableauIndex: number): boolean {
        const tableauPile = this.#tableauPiles[tableauIndex];
        if (tableauPile === undefined) {
            return false;
        }
        const card = tableauPile[tableauPile.length - 1];
        if (card === undefined) {
            return false;
        }
        if (!this.#isValidMoveToAddCardToFoundation(card)) {
            return false;
        }
        this.#addCardToFoundation(card);
        tableauPile.pop();

        return true;
    }

    // Adds a card to the correct foundation pile based on its suit.
    #addCardToFoundation(card: Card): void {
        let foundationPile: FoundationPile;
        switch (card.suit) {
            case CARD_SUIT.CLUB:
                foundationPile = this.#foundationPileClub;
                break;
            case CARD_SUIT.SPADE:
                foundationPile = this.#foundationPileSpade;
                break;
            case CARD_SUIT.HEART:
                foundationPile = this.#foundationPileHeart;
                break;
            case CARD_SUIT.DIAMOND:
                foundationPile = this.#foundationPileDiamond;
                break;
            default:
                exhaustiveGuard(card.suit);
        }
        foundationPile.addCard();
    }

    // Checks if a card can be added to the correct foundation pile.
    #isValidMoveToAddCardToFoundation(card: Card): boolean {
        let foundationPile: FoundationPile;
        switch (card.suit) {
            case CARD_SUIT.CLUB:
                foundationPile = this.#foundationPileClub;
                break;
            case CARD_SUIT.SPADE:
                foundationPile = this.#foundationPileSpade;
                break;
            case CARD_SUIT.HEART:
                foundationPile = this.#foundationPileHeart;
                break;
            case CARD_SUIT.DIAMOND:
                foundationPile = this.#foundationPileDiamond;
                break;
            default:
                exhaustiveGuard(card.suit);
        }
        return card.value === foundationPile.value + 1;
    }

    // Checks if a card can be added to a tableau pile.
    #isValidMoveToAddCardToTableau(card: Card, tableauPile: Card[]): boolean {
        if (tableauPile.length === 0) {
            return card.value === 13;
        }
        const lastTableauCard = tableauPile[tableauPile.length - 1];
        if (lastTableauCard.value === 1) {
            return false;
        }
        if (lastTableauCard.color === card.color) {
            return false;
        }
        if (lastTableauCard.value !== card.value + 1) {
            return false;
        }
        return true;
    }
}
