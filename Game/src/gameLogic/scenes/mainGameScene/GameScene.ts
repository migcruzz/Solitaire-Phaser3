import * as Phaser from 'phaser';
import {ASSET_KEYS, CARD_HEIGHT, CARD_WIDTH, SCENE_KEYS} from './data/DataTypes';
import {Solitaire} from '../../algorithms/SolitaireCoreLogic';
import {
    CARD_BACK_FRAME,
    DEBUG,
    DISCARD_PILE_X_POSITION,
    DISCARD_PILE_Y_POSITION,
    DRAW_PILE_X_POSITION,
    DRAW_PILE_Y_POSITION,
    FOUNDATION_PILE_X_POSITIONS,
    FOUNDATION_PILE_Y_POSITION,
    SCALE,
    SUIT_FRAMES,
    TABLEAU_PILE_X_POSITION,
    TABLEAU_PILE_Y_POSITION,
    ZONE_TYPE,
    ZoneType
} from "./data/Constants";
import {FoundationPile} from "../../algorithms/FoundationPile";
import {Card} from "../../algorithms/Card";

// Main Phaser Scene for Solitaire
export class GameScene extends Phaser.Scene {
    #solitaire!: Solitaire;
    #drawPileCards!: Phaser.GameObjects.Image[];
    #discardPileCards!: Phaser.GameObjects.Image[];
    #foundationPileCards!: Phaser.GameObjects.Image[];
    #tableauContainers!: Phaser.GameObjects.Container[];

    constructor() {
        super({key: SCENE_KEYS.GAME});
    }

    public create(): void {
        this.cameras.main.fadeIn(1000);
        this.#solitaire = new Solitaire();
        this.#solitaire.newGame();

        // Board Rendering
        this.#createDrawPile();
        this.#createDiscardPile();
        this.#createFoundationPiles();
        this.#createTableauPiles();

        // Input and Drag Events
        this.#setupDragAndDrop();
        this.#createDropZones();
    }

    // --- Board Rendering Functions ---

    // Creates the draw pile visuals and interaction zone
    #createDrawPile(): void {
        this.#drawCardLocationBox(DRAW_PILE_X_POSITION, DRAW_PILE_Y_POSITION);
        this.#drawPileCards = [];
        for (let i = 0; i < 3; i += 1) {
            this.#drawPileCards.push(this.#createCard(DRAW_PILE_X_POSITION + i * 5, DRAW_PILE_Y_POSITION, false));
        }
        const drawZone = this.add
            .zone(0, 0, CARD_WIDTH * SCALE + 20, CARD_HEIGHT * SCALE + 12)
            .setOrigin(0)
            .setInteractive();
        drawZone.on(Phaser.Input.Events.POINTER_DOWN, () => this.#onDrawPileClick());
        if (DEBUG) {
            this.add.rectangle(drawZone.x, drawZone.y, drawZone.width, drawZone.height, 0xff0000, 0.5).setOrigin(0);
        }
    }

    // Creates the discard pile visuals
    #createDiscardPile(): void {
        this.#drawCardLocationBox(DISCARD_PILE_X_POSITION, DISCARD_PILE_Y_POSITION);
        this.#discardPileCards = [
            this.#createCard(DISCARD_PILE_X_POSITION, DISCARD_PILE_Y_POSITION, true).setVisible(false),
            this.#createCard(DISCARD_PILE_X_POSITION, DISCARD_PILE_Y_POSITION, true).setVisible(false)
        ];
    }

    // Creates the foundation piles visuals
    #createFoundationPiles(): void {
        this.#foundationPileCards = [];
        FOUNDATION_PILE_X_POSITIONS.forEach((x) => {
            this.#drawCardLocationBox(x, FOUNDATION_PILE_Y_POSITION);
            const card = this.#createCard(x, FOUNDATION_PILE_Y_POSITION, false).setVisible(false);
            this.#foundationPileCards.push(card);
        });
    }

    // Creates the tableau piles visuals
    #createTableauPiles(): void {
        this.#tableauContainers = [];
        this.#solitaire.tableauPiles.forEach((pile, pileIndex) => {
            const x = TABLEAU_PILE_X_POSITION + pileIndex * 85;
            const tableauContainer = this.add.container(x, TABLEAU_PILE_Y_POSITION, []);
            this.#tableauContainers.push(tableauContainer);
            pile.forEach((card, cardIndex) => {
                const cardGameObject = this.#createCard(0, cardIndex * 20, false, cardIndex, pileIndex);
                tableauContainer.add(cardGameObject);
                if (card.isFaceUp) {
                    cardGameObject.setFrame(this.#getCardFrame(card));
                    this.input.setDraggable(cardGameObject);
                }
            });
        });
    }

    // Draws the outline for a card location
    #drawCardLocationBox(x: number, y: number): void {
        this.add.rectangle(x, y, 56, 78).setOrigin(0).setStrokeStyle(2, 0x000000, 0.5);
    }

    // Creates a card game object
    #createCard(
        x: number,
        y: number,
        draggable: boolean,
        cardIndex?: number,
        pileIndex?: number,
    ): Phaser.GameObjects.Image {
        return this.add
            .image(x, y, ASSET_KEYS.CARDS, CARD_BACK_FRAME)
            .setOrigin(0)
            .setScale(SCALE)
            .setInteractive({draggable})
            .setData({x, y, cardIndex, pileIndex});
    }

    // --- Drag & Drop and Input Functions ---

    // Sets up all drag and drop event listeners
    #setupDragAndDrop(): void {
        this.#createDragStartEventListener();
        this.#createOnDragEventListener();
        this.#createDragEndEventListener();
        this.#createDropEventListener();
    }

    // Handles drag start event
    #createDragStartEventListener(): void {
        this.input.on(
            Phaser.Input.Events.DRAG_START,
            (_: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
                gameObject.setData({x: gameObject.x, y: gameObject.y});
                const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
                if (tableauPileIndex !== undefined) {
                    this.#tableauContainers[tableauPileIndex].setDepth(2);
                } else {
                    gameObject.setDepth(2);
                }
                gameObject.setAlpha(0.8);
            },
        );
    }

    // Handles drag move event
    #createOnDragEventListener(): void {
        this.input.on(
            Phaser.Input.Events.DRAG,
            (_: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
                gameObject.setPosition(dragX, dragY).setDepth(0);
                const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
                const cardIndex = gameObject.getData('cardIndex') as number;
                if (tableauPileIndex !== undefined) {
                    const numberOfCardsToMove = this.#getNumberOfCardsToMoveAsPartOfStack(tableauPileIndex, cardIndex);
                    for (let i = 1; i <= numberOfCardsToMove; i += 1) {
                        this.#tableauContainers[tableauPileIndex]
                            .getAt<Phaser.GameObjects.Image>(cardIndex + i)
                            .setPosition(dragX, dragY + 20 * i);
                    }
                }
            },
        );
    }

    // Handles drag end event
    #createDragEndEventListener(): void {
        this.input.on(
            Phaser.Input.Events.DRAG_END,
            (_: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
                const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
                if (tableauPileIndex !== undefined) {
                    this.#tableauContainers[tableauPileIndex].setDepth(0);
                } else {
                    gameObject.setDepth(0);
                }
                if (gameObject.active) {
                    gameObject.setPosition(gameObject.getData('x'), gameObject.getData('y')).setAlpha(1);
                    const cardIndex = gameObject.getData('cardIndex') as number;
                    if (tableauPileIndex !== undefined) {
                        const numberOfCardsToMove = this.#getNumberOfCardsToMoveAsPartOfStack(tableauPileIndex, cardIndex);
                        for (let i = 1; i <= numberOfCardsToMove; i += 1) {
                            const cardToMove = this.#tableauContainers[tableauPileIndex].getAt<Phaser.GameObjects.Image>(cardIndex + i);
                            cardToMove.setPosition(cardToMove.getData('x'), cardToMove.getData('y'));
                        }
                    }
                }
            },
        );
    }

    // Handles drop event
    #createDropEventListener(): void {
        this.input.on(
            Phaser.Input.Events.DROP,
            (_: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
                const zoneType = dropZone.getData('zoneType') as ZoneType;
                if (zoneType === ZONE_TYPE.FOUNDATION) {
                    this.#handleMoveCardToFoundation(gameObject);
                    return;
                }
                const tableauIndex = dropZone.getData('tableauIndex') as number;
                this.#handleMoveCardTableau(gameObject, tableauIndex);
            },
        );
    }

    // --- Game Logic Helpers ---

    // Handles click on the draw pile
    #onDrawPileClick(): void {
        if (this.#solitaire.drawPile.length === 0 && this.#solitaire.discardPile.length === 0) return;
        if (this.#solitaire.drawPile.length === 0) {
            this.#solitaire.shuffleDiscardPile();
            this.#discardPileCards.forEach(card => card.setVisible(false));
            this.#showCardsInDrawPile();
            return;
        }
        this.#solitaire.drawCard();
        this.#showCardsInDrawPile();
        this.#discardPileCards[0].setFrame(this.#discardPileCards[1].frame).setVisible(this.#discardPileCards[1].visible);
        const card = this.#solitaire.discardPile[this.#solitaire.discardPile.length - 1];
        this.#discardPileCards[1].setFrame(this.#getCardFrame(card)).setVisible(true);
    }

    // Handles moving card to foundation pile
    #handleMoveCardToFoundation(gameObject: Phaser.GameObjects.Image): void {
        let isValidMove = false;
        let isCardFromDiscardPile = false;
        const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
        if (tableauPileIndex === undefined) {
            isValidMove = this.#solitaire.playDiscardPileCardToFoundation();
            isCardFromDiscardPile = true;
        } else {
            isValidMove = this.#solitaire.moveTableauCardToFoundation(tableauPileIndex);
        }
        if (!isValidMove) return;
        if (isCardFromDiscardPile) {
            this.#updateCardGameObjectsInDiscardPile();
        } else {
            this.#handleRevealingNewTableauCards(tableauPileIndex as number);
        }
        if (!isCardFromDiscardPile) {
            gameObject.destroy();
        }
        this.#updateFoundationPiles();
    }

    // Handles moving card(s) to tableau pile
    #handleMoveCardTableau(gameObject: Phaser.GameObjects.Image, targetTableauPileIndex: number): void {
        let isValidMove = false;
        let isCardFromDiscardPile = false;
        const originalTargetPileSize = this.#tableauContainers[targetTableauPileIndex].length;
        const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
        const tableauCardIndex = gameObject.getData('cardIndex') as number;
        if (tableauPileIndex === undefined) {
            isValidMove = this.#solitaire.playDiscardPileCardToTableau(targetTableauPileIndex);
            isCardFromDiscardPile = true;
        } else {
            isValidMove = this.#solitaire.moveTableauCardsToAnotherTableau(
                tableauPileIndex,
                tableauCardIndex,
                targetTableauPileIndex,
            );
        }
        if (!isValidMove) return;
        if (isCardFromDiscardPile) {
            const card = this.#createCard(
                0,
                originalTargetPileSize * 20,
                true,
                originalTargetPileSize,
                targetTableauPileIndex,
            );
            card.setFrame(gameObject.frame);
            this.#tableauContainers[targetTableauPileIndex].add(card);
            this.#updateCardGameObjectsInDiscardPile();
            return;
        }
        const numberOfCardsToMove = this.#getNumberOfCardsToMoveAsPartOfStack(tableauPileIndex as number, tableauCardIndex);
        for (let i = 0; i <= numberOfCardsToMove; i += 1) {
            const cardGameObject =
                this.#tableauContainers[tableauPileIndex as number].getAt<Phaser.GameObjects.Image>(tableauCardIndex);
            this.#tableauContainers[tableauPileIndex as number].removeAt(tableauCardIndex);
            this.#tableauContainers[targetTableauPileIndex].add(cardGameObject);
            const cardIndex = originalTargetPileSize + i;
            cardGameObject.setData({
                x: 0,
                y: cardIndex * 20,
                cardIndex,
                pileIndex: targetTableauPileIndex,
            });
        }
        this.#tableauContainers[tableauPileIndex as number].setDepth(0);
        this.#handleRevealingNewTableauCards(tableauPileIndex as number);
    }

    // Determines how many cards move together as a stack
    #getNumberOfCardsToMoveAsPartOfStack(tableauPileIndex: number, cardIndex: number): number {
        const lastCardIndex = this.#tableauContainers[tableauPileIndex].length - 1;
        return lastCardIndex === cardIndex ? 0 : lastCardIndex - cardIndex;
    }

    // --- Board State Update Functions ---

    // Updates discard pile visuals
    #updateCardGameObjectsInDiscardPile(): void {
        this.#discardPileCards[1].setFrame(this.#discardPileCards[0].frame).setVisible(this.#discardPileCards[0].visible);
        const discardPileCard = this.#solitaire.discardPile[this.#solitaire.discardPile.length - 2];
        if (discardPileCard === undefined) {
            this.#discardPileCards[0].setVisible(false);
        } else {
            this.#discardPileCards[0].setFrame(this.#getCardFrame(discardPileCard)).setVisible(true);
        }
    }

    // Flips tableau cards if needed
    #handleRevealingNewTableauCards(tableauPileIndex: number): void {
        this.#tableauContainers[tableauPileIndex].setDepth(0);
        const flipTableauCard = this.#solitaire.flipTopTableauCard(tableauPileIndex);
        if (flipTableauCard) {
            const tableauPile = this.#solitaire.tableauPiles[tableauPileIndex];
            const tableauCard = tableauPile[tableauPile.length - 1];
            const cardGameObject = this.#tableauContainers[tableauPileIndex].getAt<Phaser.GameObjects.Image>(
                tableauPile.length - 1,
            );
            cardGameObject.setFrame(this.#getCardFrame(tableauCard));
            this.input.setDraggable(cardGameObject);
        }
    }

    // Updates foundation piles visuals
    #updateFoundationPiles(): void {
        this.#solitaire.foundationPiles.forEach((pile: FoundationPile, pileIndex: number) => {
            if (pile.value === 0) return;
            this.#foundationPileCards[pileIndex].setVisible(true).setFrame(this.#getCardFrame(pile));
        });
    }

    // Updates draw pile visuals
    #showCardsInDrawPile(): void {
        const numberOfCardsToShow = Math.min(this.#solitaire.drawPile.length, 3);
        this.#drawPileCards.forEach((card, cardIndex) => {
            card.setVisible(cardIndex < numberOfCardsToShow);
        });
    }

    // --- Utility Functions ---

    // Returns the frame index for a given card or foundation pile
    #getCardFrame(data: Card | FoundationPile): number {
        return SUIT_FRAMES[data.suit] + data.value - 1;
    }

    // Creates all drop zones for foundations and tableau
    #createDropZones(): void {
        let zone = this.add.zone(350, 0, 270, 85)
            .setOrigin(0)
            .setRectangleDropZone(270, 85)
            .setData({zoneType: ZONE_TYPE.FOUNDATION});
        if (DEBUG) {
            this.add.rectangle(350, 0, zone.width, zone.height, 0xff0000, 0.2).setOrigin(0);
        }
        for (let i = 0; i < 7; i += 1) {
            zone = this.add
                .zone(30 + i * 85, 92, 75.5, 585)
                .setOrigin(0)
                .setRectangleDropZone(75.5, 585)
                .setData({zoneType: ZONE_TYPE.TABLEAU, tableauIndex: i})
                .setDepth(-1);
            if (DEBUG) {
                this.add.rectangle(30 + i * 85, 92, zone.width, zone.height, 0xff0000, 0.5).setOrigin(0);
            }
        }
    }
}
