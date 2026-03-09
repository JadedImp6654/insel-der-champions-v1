export class MinigameTimingScene extends Phaser.Scene {
  constructor() { super('MinigameTimingScene'); }
  init(data) { this.returnMap = data.returnMap || 'mainland'; }

  create() {
    this.add.text(40, 40, 'Timing: Druecke SPACE/Touch in der Zone (3 Treffer)', { fontFamily: 'monospace', fontSize: '34px', color: '#fff' });
    this.zone = this.add.rectangle(960, 540, 1240, 90, 0x224422);
    this.marker = this.add.rectangle(220, 540, 24, 92, 0xffffff);
    this.target = this.add.rectangle(960, 540, 140, 96, 0x66ff66, 0.6);
    this.dir = 1;
    this.hits = 0;
    this.misses = 0;
    this.info = this.add.text(40, 100, '', { fontFamily: 'monospace', fontSize: '30px', color: '#ffef9a' });
    this.key = this.input.keyboard.addKey('SPACE');

    this.tapBtn = this.add.circle(1760, 930, 90, 0x1d3d66, 0.45).setInteractive();
    this.add.text(1760, 930, 'TAP', { fontFamily: 'monospace', fontSize: '30px', color: '#fff' }).setOrigin(0.5);
    this.tap = false;
    this.tapBtn.on('pointerdown', () => (this.tap = true));
  }

  finish(win) { this.scene.start('OverworldScene', { map: this.returnMap, minigame: 'timing', win }); }

  update() {
    this.marker.x += this.dir * 8;
    if (this.marker.x >= 1700) this.dir = -1;
    if (this.marker.x <= 220) this.dir = 1;

    if (Phaser.Input.Keyboard.JustDown(this.key) || this.tap) {
      this.tap = false;
      const hit = Math.abs(this.marker.x - this.target.x) < 70;
      if (hit) this.hits++; else this.misses++;
      if (this.hits >= 3) this.finish(true);
      if (this.misses >= 3) this.finish(false);
    }

    this.info.setText(`Treffer: ${this.hits}/3  Fehler: ${this.misses}/3`);
  }
}
