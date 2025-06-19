// used for drawing out game objects for debugging our player input
const DEBUG = false;
// the scale factor that will be applied to our card image game objects
const SCALE = 1.5;
// the frame of the card spritesheet that represents the back of a card
const CARD_BACK_FRAME = 52;
// the x & y positions of were the foundation piles will be placed in our game area
const FOUNDATION_PILE_X_POSITIONS = [360, 425, 490, 555];
const FOUNDATION_PILE_Y_POSITION = 5;
// the x & y position of were the discard pile will be placed in our game area
const DISCARD_PILE_X_POSITION = 85;
const DISCARD_PILE_Y_POSITION = 5;
// the x & y position of were the draw pile will be placed in our game area
const DRAW_PILE_X_POSITION = 5;
const DRAW_PILE_Y_POSITION = 5;
// the x & y position of were the tableau pile will be placed in our game area
const TABLEAU_PILE_X_POSITION = 40;
const TABLEAU_PILE_Y_POSITION = 92;
// the starting frame of the card suit in the card spritesheet that represents the various cards
const SUIT_FRAMES = {
    HEART: 26,
    DIAMOND: 13,
    SPADE: 39,
    CLUB: 0,
};
type ZoneType = keyof typeof ZONE_TYPE;
// the different type of drop zones, or areas players can drop cards in the game
const ZONE_TYPE = {
    FOUNDATION: 'FOUNDATION',
    TABLEAU: 'TABLEAU',
} as const;