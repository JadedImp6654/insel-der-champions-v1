import { GAME_HEIGHT, GAME_WIDTH } from '../config.js';

export class MinigameTimingScene extends Phaser.Scene {
  constructor() {
    super('MinigameTimingScene');
  }

  init(data) {
    this.returnMap = data.returnMap || 'mainland';
  }

  create() {
    this.add.text(36, 28, 'Timing: SPACE/TAP im Zielbereich (4 Treffer)', { fontFamily: 'monospace', fontSize: '34px', color: '#fff' });
    this.zone = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 0.56, GAME_WIDTH * 0.72, 42, 0x224422);
    this.marker = this.add.rectangle(GAME_WIDTH * 0.2, GAME_HEIGHT * 0.56, 16, 46, 0xffffff);
    this.target = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 0.56, 120, 48, 0x66ff66, 0.6);
    this.dir = 1;
    this.hits = 0;
    this.misses = 0;
    this.info = this.add.text(36, 72, '', { fontFamily: 'monospace', fontSize: '30px', color: '#ffef9a' });
    this.key = this.input.keyboard.addKey('SPACE');
    this.tap = false;
    if (this.sys.game.device.input.touch) {
      const b = this.add.circle(GAME_WIDTH - 120, GAME_HEIGHT - 120, 70, 0x12324d, 0.5).setInteractive().setStrokeStyle(3, 0x9de1ff);
      this.add.text(GAME_WIDTH - 120, GAME_HEIGHT - 120, 'TAP', { fontFamily: 'monospace', fontSize: '30px', color: '#cff3ff' }).setOrigin(0.5);
      b.on('pointerdown', () => this.tap = true);
      b.on('pointerup', () => this.tap = false);
      b.on('pointerout', () => this.tap = false);
    }
  }

  finish(win) {
    this.scene.start('OverworldScene', { map: this.returnMap, minigame: 'timing', win });
  }

  update() {
    this.marker.x += this.dir * 7;
    if (this.marker.x >= GAME_WIDTH * 0.8) this.dir = -1;
    if (this.marker.x <= GAME_WIDTH * 0.2) this.dir = 1;

    if (Phaser.Input.Keyboard.JustDown(this.key) || this.tap) {
      this.tap = false;
      const hit = Math.abs(this.marker.x - this.target.x) < 55;
      if (hit) this.hits++;
      else this.misses++;
      if (this.hits >= 4) this.finish(true);
      if (this.misses >= 3) this.finish(false);
    }

    this.info.setText(`Treffer: ${this.hits}/4  Fehler: ${this.misses}/3`);
  }
}
