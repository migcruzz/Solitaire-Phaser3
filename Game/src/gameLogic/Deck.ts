import {Card} from './Card';
import {SUITS, VALUES} from './DataTypes';
import {shuffleArray} from './Shuffle';

export class Deck {
    #cards: readonly Card[];
    #drawPile: Card[];
    #discardPile: Card[];

    constructor() {
        // Build full 52-card deck once, then reset piles
        this.#cards = SUITS.flatMap(suit =>
            VALUES.map(value => new Card(suit, value))
        );
        this.reset();
        this.#drawPile = []
        this.#discardPile = []
    }

    /** All cards in the deck (immutable). */
    get cards(): readonly Card[] {
        return this.#cards;
    }

    /** The current draw pile (top card is at index 0). */
    get drawPile(): readonly Card[] {
        return [...this.#drawPile];
    }

    /** The current discard pile (top card is at end of array). */
    get discardPile(): readonly Card[] {
        return [...this.#discardPile];
    }

    /**
     * Draw the top card from the draw pile.
     * @returns The drawn Card, or `undefined` if the pile is empty.
     */
    public draw(): Card | undefined {
        return this.#drawPile.shift();
    }

    /** Shuffle the remaining draw pile in place. */
    public shuffle(): void {
        shuffleArray(this.#drawPile);
    }

    /**
     * Recycle all cards from discard back into draw pile:
     * - Flip any face-up cards face-down
     * - Push them onto the draw pile
     * - Shuffle the draw pile
     */
    public recycle(): void {
        while (this.#discardPile.length) {
            const card = this.#discardPile.pop()!;
            if (card.isFaceUp) {
                card.flip();
            }
            this.#drawPile.push(card);
        }
        this.shuffle();
    }

    /**
     * Reset the deck:
     * - Move all cards back into the draw pile
     * - Empty the discard pile
     * - Shuffle the draw pile
     */
    public reset(): void {
        this.#drawPile = [...this.#cards];
        this.#discardPile = [];
        this.shuffle();
    }
}
