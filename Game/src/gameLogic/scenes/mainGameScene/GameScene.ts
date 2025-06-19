import * as Phaser from 'phaser';
import {SCENE_KEYS} from './data/DataTypes';
import {Solitaire} from '../../algorithms/SolitaireCoreLogic';
import {setupBoard} from './functions/BoardRenderer';
import {updateBoardState} from './functions/UpdateBoard';
import {setupDragAndDrop} from "./functions/MovementsManager";

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

        // Setup all board elements
        const boardRefs = setupBoard(this, this.#solitaire);
        this.#drawPileCards = boardRefs.drawPileCards;
        this.#discardPileCards = boardRefs.discardPileCards;
        this.#foundationPileCards = boardRefs.foundationPileCards;
        this.#tableauContainers = boardRefs.tableauContainers;

        // Setup drag and drop events
        setupDragAndDrop(this, this.#solitaire, this.#drawPileCards, this.#discardPileCards, this.#foundationPileCards, this.#tableauContainers);

        // Setup board state updates
        updateBoardState(this, this.#solitaire, this.#drawPileCards, this.#discardPileCards, this.#foundationPileCards, this.#tableauContainers);
    }
}
