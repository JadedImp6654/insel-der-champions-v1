export class MinigameTimingScene extends Phaser.Scene {
  constructor() {
    super('MinigameTimingScene');
  }

  init(data) {
    this.returnMap = data.returnMap || 'mainland';
  }

  create() {
    this.add.text(16, 12, 'Timing: Druecke SPACE in der Zone (3 Treffer)', { fontFamily: 'monospace', fontSize: '8px', color: '#fff' });
    this.zone = this.add.rectangle(160, 90, 70, 16, 0x224422);
    this.marker = this.add.rectangle(40, 90, 6, 18, 0xffffff);
    this.target = this.add.rectangle(160, 90, 24, 18, 0x66ff66, 0.6);
    this.dir = 1;
    this.hits = 0;
    this.misses = 0;
    this.info = this.add.text(16, 24, '', { fontFamily: 'monospace', fontSize: '8px', color: '#ffef9a' });
    this.key = this.input.keyboard.addKey('SPACE');
  }

  finish(win) {
    this.scene.start('OverworldScene', { map: this.returnMap, minigame: 'timing', win });
  }

  update() {
    this.marker.x += this.dir * 2.4;
    if (this.marker.x >= 280) this.dir = -1;
    if (this.marker.x <= 40) this.dir = 1;

    if (Phaser.Input.Keyboard.JustDown(this.key)) {
      const hit = Math.abs(this.marker.x - this.target.x) < 12;
      if (hit) this.hits++;
      else this.misses++;
      if (this.hits >= 3) this.finish(true);
      if (this.misses >= 3) this.finish(false);
    }

    this.info.setText(`Treffer: ${this.hits}/3  Fehler: ${this.misses}/3`);
  }
}
