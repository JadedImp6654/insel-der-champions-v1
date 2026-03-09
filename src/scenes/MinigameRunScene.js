export class MinigameRunScene extends Phaser.Scene {
  constructor() {
    super('MinigameRunScene');
  }

  init(data) {
    this.returnMap = data.returnMap || 'mainland';
  }

  create() {
    this.add.text(16, 12, 'Rennen: Erreiche das Ziel in 15s', { fontFamily: 'monospace', fontSize: '8px', color: '#fff' });
    this.track = this.add.rectangle(160, 95, 280, 90, 0x224433).setStrokeStyle(1, 0xaaffaa);
    this.player = this.add.rectangle(30, 95, 8, 8, 0x66aaff);
    this.goal = this.add.rectangle(290, 95, 10, 40, 0xffdd66);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.timer = 15;
    this.timerText = this.add.text(16, 24, '', { fontFamily: 'monospace', fontSize: '8px', color: '#ffef9a' });
  }

  finish(win) {
    this.scene.start('OverworldScene', { map: this.returnMap, minigame: 'run', win });
  }

  update(_, dt) {
    this.timer -= dt / 1000;
    this.timerText.setText(`Zeit: ${this.timer.toFixed(1)}`);
    const speed = 1.5;
    if (this.cursors.left.isDown) this.player.x -= speed;
    if (this.cursors.right.isDown) this.player.x += speed;
    if (this.cursors.up.isDown) this.player.y -= speed;
    if (this.cursors.down.isDown) this.player.y += speed;
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 300);
    this.player.y = Phaser.Math.Clamp(this.player.y, 55, 135);

    if (this.player.x > 284) this.finish(true);
    if (this.timer <= 0) this.finish(false);
  }
}
