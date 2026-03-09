import { GAME_HEIGHT, GAME_WIDTH } from '../config.js';

export class UISystem extends Phaser.Scene {
  constructor() {
    super('UISystem');
    this.lines = [];
    this.lineIndex = 0;
    this.charIndex = 0;
    this.typing = false;
    this.finishedCallback = null;
  }

  create() {
    this.dialogBg = this.add.rectangle(10, GAME_HEIGHT - 98, GAME_WIDTH - 20, 88, 0x06111f, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x90d7ff);
    this.dialogText = this.add.text(18, GAME_HEIGHT - 90, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#d9f3ff',
      wordWrap: { width: GAME_WIDTH - 36 },
      lineSpacing: 3,
    });
    this.questText = this.add.text(10, 10, '', { fontFamily: 'monospace', fontSize: '14px', color: '#ffed9a' }).setScrollFactor(0);
    this.hintText = this.add.text(GAME_WIDTH - 8, GAME_HEIGHT - 8, 'WASD: Laufen | E: Interagieren | SPACE: Portal/Weiter', { fontFamily: 'monospace', fontSize: '10px', color: '#8ec6ff' }).setOrigin(1, 1);

    this.dialogBg.setVisible(false);
    this.dialogText.setVisible(false);

    this.input.keyboard.on('keydown-SPACE', () => this.advance());
    this.input.keyboard.on('keydown-ENTER', () => this.advance());
  }

  bind(overworld) {
    this.overworld = overworld;
    overworld.events.on('dialog:start', (lines, cb) => this.showDialog(lines, cb));
    overworld.events.on('dialog:end', () => this.hideDialog());
  }

  setQuest(text) {
    if (!this.questText) return;
    this.questText.setText(text);
  }

  showDialog(lines, cb) {
    this.lines = lines;
    this.lineIndex = 0;
    this.charIndex = 0;
    this.finishedCallback = cb;
    this.dialogBg.setVisible(true);
    this.dialogText.setVisible(true);
    this.dialogText.setText('');
    this.typing = true;
  }

  hideDialog() {
    this.dialogBg.setVisible(false);
    this.dialogText.setVisible(false);
    this.lines = [];
  }

  advance() {
    if (!this.lines.length) return;
    if (this.typing) {
      this.dialogText.setText(this.lines[this.lineIndex]);
      this.typing = false;
      return;
    }
    this.lineIndex++;
    this.charIndex = 0;
    if (this.lineIndex >= this.lines.length) {
      const cb = this.finishedCallback;
      this.finishedCallback = null;
      this.hideDialog();
      if (cb) cb();
      return;
    }
    this.dialogText.setText('');
    this.typing = true;
  }

  update(_, dt) {
    if (!this.typing || !this.lines.length) return;
    this.charTimer = (this.charTimer || 0) + dt;
    if (this.charTimer < 18) return;
    this.charTimer = 0;
    this.charIndex++;
    const line = this.lines[this.lineIndex];
    this.dialogText.setText(line.slice(0, this.charIndex));
    if (this.charIndex >= line.length) this.typing = false;
  }
}
