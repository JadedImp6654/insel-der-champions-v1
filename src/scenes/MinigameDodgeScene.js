import { GAME_HEIGHT, GAME_WIDTH } from '../config.js';

export class MinigameDodgeScene extends Phaser.Scene {
  constructor() {
    super('MinigameDodgeScene');
  }

  init(data) {
    this.returnMap = data.returnMap || 'mainland';
  }

  create() {
    this.add.text(36, 28, 'Ausweichen: Überlebe 16s', { fontFamily: 'monospace', fontSize: '34px', color: '#fff' });
    this.player = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 0.86, 34, 34, 0x66ddff);
    this.obstacles = [];
    this.keys = this.input.keyboard.addKeys({ left: 'A', right: 'D' });
    this.spawnTimer = 0;
    this.timeLeft = 16;
    this.timeText = this.add.text(36, 72, '', { fontFamily: 'monospace', fontSize: '30px', color: '#ffef9a' });
    this.touch = { left: false, right: false };
    if (this.sys.game.device.input.touch) {
      const l = this.add.circle(110, GAME_HEIGHT - 110, 68, 0x12324d, 0.5).setInteractive().setStrokeStyle(3, 0x9de1ff);
      const r = this.add.circle(250, GAME_HEIGHT - 110, 68, 0x12324d, 0.5).setInteractive().setStrokeStyle(3, 0x9de1ff);
      this.add.text(110, GAME_HEIGHT - 110, '◀', { fontFamily: 'monospace', fontSize: '44px', color: '#cff3ff' }).setOrigin(0.5);
      this.add.text(250, GAME_HEIGHT - 110, '▶', { fontFamily: 'monospace', fontSize: '44px', color: '#cff3ff' }).setOrigin(0.5);
      l.on('pointerdown', () => this.touch.left = true); l.on('pointerup', () => this.touch.left = false); l.on('pointerout', () => this.touch.left = false);
      r.on('pointerdown', () => this.touch.right = true); r.on('pointerup', () => this.touch.right = false); r.on('pointerout', () => this.touch.right = false);
    }
  }

  finish(win) {
    this.scene.start('OverworldScene', { map: this.returnMap, minigame: 'dodge', win });
  }

  update(_, dt) {
    this.timeLeft -= dt / 1000;
    this.timeText.setText(`Zeit: ${this.timeLeft.toFixed(1)}`);

    if (this.keys.left.isDown || this.touch.left) this.player.x -= 6;
    if (this.keys.right.isDown || this.touch.right) this.player.x += 6;
    this.player.x = Phaser.Math.Clamp(this.player.x, 30, GAME_WIDTH - 30);

    this.spawnTimer += dt;
    if (this.spawnTimer > 220) {
      this.spawnTimer = 0;
      const o = this.add.rectangle(Phaser.Math.Between(24, GAME_WIDTH - 24), -10, 18, 18, 0xff6666);
      o.speed = Phaser.Math.Between(3, 7);
      this.obstacles.push(o);
    }

    for (const o of this.obstacles) {
      o.y += o.speed;
      if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), o.getBounds())) {
        this.finish(false);
        return;
      }
    }

    this.obstacles = this.obstacles.filter((o) => o.y < GAME_HEIGHT + 20);
    if (this.timeLeft <= 0) this.finish(true);
  }
}
