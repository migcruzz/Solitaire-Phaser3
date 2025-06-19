import * as Phaser from 'phaser';
import {PreloadScene} from './gameLogic/scenes/mainGameScene/ScenePreloader';
import {TitleScene} from './gameLogic/scenes/menuScene/MenuScene';
import {GameScene} from './gameLogic/scenes/mainGameScene/GameScene';

const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    pixelArt: true,
    scale: {
        parent: 'game-container',
        width: 640,
        height: 360,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        mode: Phaser.Scale.FIT,
    },
    backgroundColor: '#387F3C',
    scene: [PreloadScene, TitleScene, GameScene],
};

window.onload = () => {
    new Phaser.Game(gameConfig);
};