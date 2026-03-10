import { GAME_HEIGHT, GAME_WIDTH } from '../config.js';

export class MinigameRunScene extends Phaser.Scene {
  constructor() {
    super('MinigameRunScene');
  }

  init(data) {
    this.returnMap = data.returnMap || 'mainland';
  }

  create() {
    this.add.text(36, 28, 'Rennen: Erreiche das Ziel in 18s', { fontFamily: 'monospace', fontSize: '34px', color: '#fff' });
    this.track = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 0.55, GAME_WIDTH * 0.86, GAME_HEIGHT * 0.5, 0x224433).setStrokeStyle(4, 0xaaffaa);
    this.player = this.add.rectangle(GAME_WIDTH * 0.14, GAME_HEIGHT * 0.55, 30, 30, 0x66aaff);
    this.goal = this.add.rectangle(GAME_WIDTH * 0.86, GAME_HEIGHT * 0.55, 24, GAME_HEIGHT * 0.32, 0xffdd66);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.timer = 18;
    this.timerText = this.add.text(36, 72, '', { fontFamily: 'monospace', fontSize: '30px', color: '#ffef9a' });
    this.touchRight = false;
    if (this.sys.game.device.input.touch) {
      const b = this.add.circle(GAME_WIDTH - 120, GAME_HEIGHT - 120, 70, 0x12324d, 0.5).setInteractive().setStrokeStyle(3, 0x9de1ff);
      this.add.text(GAME_WIDTH - 120, GAME_HEIGHT - 120, 'GO', { fontFamily: 'monospace', fontSize: '34px', color: '#cff3ff' }).setOrigin(0.5);
      b.on('pointerdown', () => this.touchRight = true);
      b.on('pointerup', () => this.touchRight = false);
      b.on('pointerout', () => this.touchRight = false);
    }
  }

  finish(win) {
    this.scene.start('OverworldScene', { map: this.returnMap, minigame: 'run', win });
  }

  update(_, dt) {
    this.timer -= dt / 1000;
    this.timerText.setText(`Zeit: ${this.timer.toFixed(1)}`);
    const speed = 4.2;
    if (this.cursors.left.isDown) this.player.x -= speed;
    if (this.cursors.right.isDown || this.touchRight) this.player.x += speed;
    if (this.cursors.up.isDown) this.player.y -= speed;
    if (this.cursors.down.isDown) this.player.y += speed;

    this.player.x = Phaser.Math.Clamp(this.player.x, GAME_WIDTH * 0.1, GAME_WIDTH * 0.9);
    this.player.y = Phaser.Math.Clamp(this.player.y, GAME_HEIGHT * 0.32, GAME_HEIGHT * 0.79);

    if (this.player.x > GAME_WIDTH * 0.84) this.finish(true);
    if (this.timer <= 0) this.finish(false);
  }
}
