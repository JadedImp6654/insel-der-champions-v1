export class MinigameRunScene extends Phaser.Scene {
  constructor() { super('MinigameRunScene'); }
  init(data) { this.returnMap = data.returnMap || 'mainland'; }

  create() {
    this.add.text(40, 40, 'Rennen: Erreiche das Ziel in 15s', { fontFamily: 'monospace', fontSize: '36px', color: '#fff' });
    this.track = this.add.rectangle(960, 560, 1680, 520, 0x224433).setStrokeStyle(4, 0xaaffaa);
    this.player = this.add.rectangle(180, 560, 30, 30, 0x66aaff);
    this.goal = this.add.rectangle(1740, 560, 36, 200, 0xffdd66);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.timer = 15;
    this.timerText = this.add.text(40, 90, '', { fontFamily: 'monospace', fontSize: '30px', color: '#ffef9a' });

    this.touchRight = this.add.circle(1780, 950, 80, 0x1d3d66, 0.45).setInteractive();
    this.add.text(1780, 950, 'GO', { fontFamily: 'monospace', fontSize: '28px', color: '#fff' }).setOrigin(0.5);
    this.touchGo = false;
    this.touchRight.on('pointerdown', () => (this.touchGo = true));
    this.touchRight.on('pointerup', () => (this.touchGo = false));
    this.touchRight.on('pointerout', () => (this.touchGo = false));
  }

  finish(win) { this.scene.start('OverworldScene', { map: this.returnMap, minigame: 'run', win }); }

  update(_, dt) {
    this.timer -= dt / 1000;
    this.timerText.setText(`Zeit: ${this.timer.toFixed(1)}`);
    const speed = 6;
    if (this.cursors.left.isDown) this.player.x -= speed;
    if (this.cursors.right.isDown || this.touchGo) this.player.x += speed;
    if (this.cursors.up.isDown) this.player.y -= speed;
    if (this.cursors.down.isDown) this.player.y += speed;
    this.player.x = Phaser.Math.Clamp(this.player.x, 140, 1780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 310, 810);

    if (this.player.x > 1715) this.finish(true);
    if (this.timer <= 0) this.finish(false);
  }
}
