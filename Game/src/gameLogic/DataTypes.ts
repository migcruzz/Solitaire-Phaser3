export const SUITS = ['HEART', 'DIAMOND', 'SPADE', 'CLUB'] as const;
export type CardSuit = typeof SUITS[number];

export const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;
export type CardValue = typeof VALUES[number];

export const SUIT_COLORS = ['RED', 'BLACK'] as const;
export type CardSuitColor = typeof SUIT_COLORS[number];

export const CARD_SUIT_TO_COLOR: Record<CardSuit, CardSuitColor> = {
    CLUB: 'BLACK',
    SPADE: 'BLACK',
    DIAMOND: 'RED',
    HEART: 'RED',
};

SUITS.forEach(suit => {
    const c: CardSuitColor = CARD_SUIT_TO_COLOR[suit];
});
VALUES.forEach(v => {
    const cardValue: CardValue = v;
});
