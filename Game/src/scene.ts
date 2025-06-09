export class DemoScene extends Phaser.Scene {
  constructor() {
    super({ key: 'demo' });
  }

  create(): void {
    const msg = greet('Jogador');
    this.add.text(100, 100, msg, { fontSize: '24px', color: '#00ff00' });
  }
}

import { greet } from './util';
