export class MinigameDodgeScene extends Phaser.Scene {
  constructor() {
    super('MinigameDodgeScene');
  }

  init(data) {
    this.returnMap = data.returnMap || 'mainland';
  }

  create() {
    this.add.text(16, 12, 'Ausweichen: Ueberlebe 12s', { fontFamily: 'monospace', fontSize: '8px', color: '#fff' });
    this.player = this.add.rectangle(160, 150, 10, 10, 0x66ddff);
    this.obstacles = [];
    this.keys = this.input.keyboard.addKeys({ left: 'A', right: 'D' });
    this.spawnTimer = 0;
    this.timeLeft = 12;
    this.timeText = this.add.text(16, 24, '', { fontFamily: 'monospace', fontSize: '8px', color: '#ffef9a' });
  }

  finish(win) {
    this.scene.start('OverworldScene', { map: this.returnMap, minigame: 'dodge', win });
  }

  update(_, dt) {
    this.timeLeft -= dt / 1000;
    this.timeText.setText(`Zeit: ${this.timeLeft.toFixed(1)}`);

    if (this.keys.left.isDown) this.player.x -= 2.2;
    if (this.keys.right.isDown) this.player.x += 2.2;
    this.player.x = Phaser.Math.Clamp(this.player.x, 10, 310);

    this.spawnTimer += dt;
    if (this.spawnTimer > 380) {
      this.spawnTimer = 0;
      const o = this.add.rectangle(Phaser.Math.Between(10, 310), -4, 6, 6, 0xff6666);
      o.speed = Phaser.Math.Between(1, 2.8);
      this.obstacles.push(o);
    }

    for (const o of this.obstacles) {
      o.y += o.speed;
      if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), o.getBounds())) {
        this.finish(false);
        return;
      }
    }

    this.obstacles = this.obstacles.filter((o) => o.y < 190);
    if (this.timeLeft <= 0) this.finish(true);
  }
}
