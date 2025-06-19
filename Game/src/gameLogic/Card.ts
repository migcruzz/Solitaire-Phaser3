import {
    CARD_SUIT_TO_COLOR,
    CardSuit,
    CardSuitColor,
    CardValue
} from './DataTypes';

export class Card {
    #faceUp: boolean;

    /**
     * @param suit - The suit of the card (Clubs, Diamonds, Hearts, Spades)
     * @param value - The value of the card (Ace through King)
     * @param isFaceUp - Whether the card starts face-up (default: false)
     */
    constructor(
        suit: CardSuit,
        value: CardValue,
        isFaceUp = false
    ) {
        this.#faceUp = isFaceUp;
        Object.freeze(this);
    }

    /** The suit of this card. */
    get suit(): CardSuit {
        return this.suit;
    }

    /** The value of this card. */
    get value(): CardValue {
        return this.value;
    }

    /** Whether the card is currently face-up. */
    get isFaceUp(): boolean {
        return this.#faceUp;
    }

    /** The color of the card (red or black) based on its suit. */
    get color(): CardSuitColor {
        return CARD_SUIT_TO_COLOR[this.suit];
    }

    /**
     * Flip the card over.
     * If it’s face-down, it becomes face-up, and vice versa.
     */
    public flip(): void {
        this.#faceUp = !this.#faceUp;
    }

    /** Returns a human-readable string, e.g. "Ace of Spades". */
    public toString(): string {
        return `${this.value} of ${this.suit}`;
    }
}
