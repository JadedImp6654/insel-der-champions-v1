export class MinigameDodgeScene extends Phaser.Scene {
  constructor() { super('MinigameDodgeScene'); }
  init(data) { this.returnMap = data.returnMap || 'mainland'; }

  create() {
    this.add.text(40, 40, 'Ausweichen: Ueberlebe 12s', { fontFamily: 'monospace', fontSize: '36px', color: '#fff' });
    this.player = this.add.rectangle(960, 920, 34, 34, 0x66ddff);
    this.obstacles = [];
    this.keys = this.input.keyboard.addKeys({ left: 'A', right: 'D' });
    this.spawnTimer = 0;
    this.timeLeft = 12;
    this.timeText = this.add.text(40, 90, '', { fontFamily: 'monospace', fontSize: '30px', color: '#ffef9a' });

    this.leftBtn = this.add.circle(140, 950, 72, 0x1d3d66, 0.45).setInteractive();
    this.rightBtn = this.add.circle(300, 950, 72, 0x1d3d66, 0.45).setInteractive();
    this.add.text(140, 950, '◀', { fontFamily: 'monospace', fontSize: '32px', color: '#fff' }).setOrigin(0.5);
    this.add.text(300, 950, '▶', { fontFamily: 'monospace', fontSize: '32px', color: '#fff' }).setOrigin(0.5);
    this.touch = { left: false, right: false };
    this.leftBtn.on('pointerdown', () => (this.touch.left = true));
    this.leftBtn.on('pointerup', () => (this.touch.left = false));
    this.leftBtn.on('pointerout', () => (this.touch.left = false));
    this.rightBtn.on('pointerdown', () => (this.touch.right = true));
    this.rightBtn.on('pointerup', () => (this.touch.right = false));
    this.rightBtn.on('pointerout', () => (this.touch.right = false));
  }

  finish(win) { this.scene.start('OverworldScene', { map: this.returnMap, minigame: 'dodge', win }); }

  update(_, dt) {
    this.timeLeft -= dt / 1000;
    this.timeText.setText(`Zeit: ${this.timeLeft.toFixed(1)}`);

    if (this.keys.left.isDown || this.touch.left) this.player.x -= 8;
    if (this.keys.right.isDown || this.touch.right) this.player.x += 8;
    this.player.x = Phaser.Math.Clamp(this.player.x, 40, 1880);

    this.spawnTimer += dt;
    if (this.spawnTimer > 240) {
      this.spawnTimer = 0;
      const o = this.add.rectangle(Phaser.Math.Between(30, 1890), -10, 18, 18, 0xff6666);
      o.speed = Phaser.Math.Between(4, 10);
      this.obstacles.push(o);
    }

    for (const o of this.obstacles) {
      o.y += o.speed;
      if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), o.getBounds())) {
        this.finish(false);
        return;
      }
    }

    this.obstacles = this.obstacles.filter((o) => o.y < 1120);
    if (this.timeLeft <= 0) this.finish(true);
  }
}
