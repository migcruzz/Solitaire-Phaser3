import { DemoScene } from './scene';
import * as Phaser from 'util';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1d1d1d',
  scene: DemoScene
};

new Phaser.Game(config);
