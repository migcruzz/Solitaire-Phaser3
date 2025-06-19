import {Solitaire} from '../../../algorithms/SolitaireCoreLogic';
import {ASSET_KEYS} from '../data/DataTypes';


export function setupBoard(scene: Phaser.Scene, solitaire: Solitaire) {
    // Creates all board elements and returns references
    const drawPileCards = createDrawPile(scene);
    const discardPileCards = createDiscardPile(scene);
    const foundationPileCards = createFoundationPiles(scene);
    const tableauContainers = createTableauPiles(scene, solitaire);

    return {drawPileCards, discardPileCards, foundationPileCards, tableauContainers};
}

// Creates the draw pile visuals
function createDrawPile(scene: Phaser.Scene): Phaser.GameObjects.Image[] {
    drawCardLocationBox(scene, DRAW_PILE_X_POSITION, DRAW_PILE_Y_POSITION);
    const cards: Phaser.GameObjects.Image[] = [];
    for (let i = 0; i < 3; i += 1) {
        cards.push(createCard(scene, DRAW_PILE_X_POSITION + i * 5, DRAW_PILE_Y_POSITION, false));
    }
    return cards;
}

// Creates the discard pile visuals
function createDiscardPile(scene: Phaser.Scene): Phaser.GameObjects.Image[] {
    drawCardLocationBox(scene, DISCARD_PILE_X_POSITION, DISCARD_PILE_Y_POSITION);
    const bottomCard = createCard(scene, DISCARD_PILE_X_POSITION, DISCARD_PILE_Y_POSITION, true).setVisible(false);
    const topCard = createCard(scene, DISCARD_PILE_X_POSITION, DISCARD_PILE_Y_POSITION, true).setVisible(false);
    return [bottomCard, topCard];
}

// Creates the foundation piles visuals
function createFoundationPiles(scene: Phaser.Scene): Phaser.GameObjects.Image[] {
    const cards: Phaser.GameObjects.Image[] = [];
    FOUNDATION_PILE_X_POSITIONS.forEach((x) => {
        drawCardLocationBox(scene, x, FOUNDATION_PILE_Y_POSITION);
        const card = createCard(scene, x, FOUNDATION_PILE_Y_POSITION, false).setVisible(false);
        cards.push(card);
    });
    return cards;
}

// Creates the tableau piles visuals
function createTableauPiles(scene: Phaser.Scene, solitaire: Solitaire): Phaser.GameObjects.Container[] {
    const containers: Phaser.GameObjects.Container[] = [];
    solitaire.tableauPiles.forEach((pile, pileIndex) => {
        const x = TABLEAU_PILE_X_POSITION + pileIndex * 85;
        const tableauContainer = scene.add.container(x, TABLEAU_PILE_Y_POSITION, []);
        containers.push(tableauContainer);
        pile.forEach((card, cardIndex) => {
            const cardGameObject = createCard(scene, 0, cardIndex * 20, false, cardIndex, pileIndex);
            tableauContainer.add(cardGameObject);
            if (card.isFaceUp) {

            }
        });
    });
    return containers;
}

// Draws the outline for a card location
function drawCardLocationBox(scene: Phaser.Scene, x: number, y: number): void {
    scene.add.rectangle(x, y, 56, 78).setOrigin(0).setStrokeStyle(2, 0x000000, 0.5);
}

// Creates a card game object
function createCard(
    scene: Phaser.Scene,
    x: number,
    y: number,
    draggable: boolean,
    cardIndex?: number,
    pileIndex?: number,
): Phaser.GameObjects.Image {
    return scene.add
        .image(x, y, ASSET_KEYS.CARDS, 0)
        .setOrigin(0)
        .setScale(SCALE)
        .setInteractive({draggable})
        .setData({
            x,
            y,
            cardIndex,
            pileIndex,
        });
}
