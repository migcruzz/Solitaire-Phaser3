import * as Phaser from 'phaser';
import {ASSET_KEYS, CARD_HEIGHT, CARD_WIDTH, SCENE_KEYS} from './data/DataTypes';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({key: SCENE_KEYS.PRELOAD});
    }

    public preload(): void {

        this.load.image(ASSET_KEYS.CLICK_TO_START, '../../../public/assets/clickToStart.png');
        this.load.spritesheet(ASSET_KEYS.CARDS, '../../../public/assets/cards.png', {
            frameWidth: CARD_WIDTH,
            frameHeight: CARD_HEIGHT,
        });

        this.load.audio('background_music', '../../../public/assets/soft-piano-music.mp3');
    }

    public create(): void {
        this.scene.start(SCENE_KEYS.TITLE);
    }
}