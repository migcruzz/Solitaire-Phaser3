import {Solitaire} from '../../../algorithms/SolitaireCoreLogic';

// Sets up all drag and drop event listeners
export function setupDragAndDrop(
    scene: Phaser.Scene,
    solitaire: Solitaire,
    drawPileCards: Phaser.GameObjects.Image[],
    discardPileCards: Phaser.GameObjects.Image[],
    foundationPileCards: Phaser.GameObjects.Image[],
    tableauContainers: Phaser.GameObjects.Container[],
) {
    createDragStartEventListener(scene, tableauContainers);
    createOnDragEventListener(scene, tableauContainers);
    createDragEndEventListener(scene, tableauContainers);
    createDropEventListener(scene, solitaire, discardPileCards, foundationPileCards, tableauContainers);
}

// Handles the drag start event
function createDragStartEventListener(scene: Phaser.Scene, tableauContainers: Phaser.GameObjects.Container[]) {
    scene.input.on(
        Phaser.Input.Events.DRAG_START,
        (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            gameObject.setData({x: gameObject.x, y: gameObject.y});
            const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
            if (tableauPileIndex !== undefined) {
                tableauContainers[tableauPileIndex].setDepth(2);
            } else {
                gameObject.setDepth(2);
            }
            gameObject.setAlpha(0.8);
        },
    );
}

// Handles the drag event
function createOnDragEventListener(scene: Phaser.Scene, tableauContainers: Phaser.GameObjects.Container[]) {
    scene.input.on(
        Phaser.Input.Events.DRAG,
        (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
            gameObject.setPosition(dragX, dragY);
            gameObject.setDepth(0);

            const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
            const cardIndex = gameObject.getData('cardIndex') as number;
            if (tableauPileIndex !== undefined) {
                const numberOfCardsToMove = getNumberOfCardsToMoveAsPartOfStack(tableauContainers, tableauPileIndex, cardIndex);
                for (let i = 1; i <= numberOfCardsToMove; i += 1) {
                    tableauContainers[tableauPileIndex]
                        .getAt<Phaser.GameObjects.Image>(cardIndex + i)
                        .setPosition(dragX, dragY + 20 * i);
                }
            }
        },
    );
}

// Handles the drag end event
function createDragEndEventListener(scene: Phaser.Scene, tableauContainers: Phaser.GameObjects.Container[]) {
    scene.input.on(
        Phaser.Input.Events.DRAG_END,
        (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            const tableauPileIndex = gameObject.getData('pileIndex') as number | undefined;
            if (tableauPileIndex !== undefined) {
                tableauContainers[tableauPileIndex].setDepth(0);
            } else {
                gameObject.setDepth(0);
            }

            if (gameObject.active) {
                gameObject.setPosition(gameObject.getData('x') as number, gameObject.getData('y') as number);
                gameObject.setAlpha(1);

                const cardIndex = gameObject.getData('cardIndex') as number;
                if (tableauPileIndex !== undefined) {
                    const numberOfCardsToMove = getNumberOfCardsToMoveAsPartOfStack(tableauContainers, tableauPileIndex, cardIndex);
                    for (let i = 1; i <= numberOfCardsToMove; i += 1) {
                        const cardToMove = tableauContainers[tableauPileIndex].getAt<Phaser.GameObjects.Image>(cardIndex + i);
                        cardToMove.setPosition(cardToMove.getData('x') as number, cardToMove.getData('y') as number);
                    }
                }
            }
        },
    );
}

// Handles the drop event
function createDropEventListener(
    scene: Phaser.Scene,
    solitaire: Solitaire,
    discardPileCards: Phaser.GameObjects.Image[],
    foundationPileCards: Phaser.GameObjects.Image[],
    tableauContainers: Phaser.GameObjects.Container[],
) {
    scene.input.on(
        Phaser.Input.Events.DROP,
        (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
            // Handle drop logic here, call update functions as needed
        },
    );
}

// Returns the number of cards to move as part of a stack
function getNumberOfCardsToMoveAsPartOfStack(
    tableauContainers: Phaser.GameObjects.Container[],
    tableauPileIndex: number,
    cardIndex: number,
): number {
    const lastCardIndex = tableauContainers[tableauPileIndex].length - 1;
    if (lastCardIndex === cardIndex) {
        return 0;
    }
    return lastCardIndex - cardIndex;
}
