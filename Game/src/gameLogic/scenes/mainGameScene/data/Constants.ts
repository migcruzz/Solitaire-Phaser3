// Constants.ts
export const DEBUG = false;
export const SCALE = 1.5;
export const CARD_BACK_FRAME = 52;
export const FOUNDATION_PILE_X_POSITIONS = [360, 425, 490, 555];
export const FOUNDATION_PILE_Y_POSITION = 5;
export const DISCARD_PILE_X_POSITION = 85;
export const DISCARD_PILE_Y_POSITION = 5;
export const DRAW_PILE_X_POSITION = 5;
export const DRAW_PILE_Y_POSITION = 5;
export const TABLEAU_PILE_X_POSITION = 40;
export const TABLEAU_PILE_Y_POSITION = 92;
export const SUIT_FRAMES = {
    HEART: 26,
    DIAMOND: 13,
    SPADE: 39,
    CLUB: 0,
} as const;

export const ZONE_TYPE = {
    FOUNDATION: 'FOUNDATION',
    TABLEAU: 'TABLEAU',
} as const;


export type ZoneType = keyof typeof ZONE_TYPE;
