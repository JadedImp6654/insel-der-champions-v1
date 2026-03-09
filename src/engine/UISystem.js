import { GAME_HEIGHT, GAME_WIDTH } from '../config.js';

export class UISystem extends Phaser.Scene {
  constructor() {
    super('UISystem');
    this.lines = [];
    this.lineIndex = 0;
    this.charIndex = 0;
    this.typing = false;
    this.finishedCallback = null;
    this.questLogOpen = false;
  }

  create() {
    this.dialogBg = this.add.rectangle(20, GAME_HEIGHT - 220, GAME_WIDTH - 40, 190, 0x06111f, 0.92).setOrigin(0, 0).setStrokeStyle(2, 0x90d7ff);
    this.dialogText = this.add.text(34, GAME_HEIGHT - 205, '', { fontFamily: 'monospace', fontSize: '28px', color: '#d9f3ff', wordWrap: { width: GAME_WIDTH - 68 } });
    this.questText = this.add.text(20, 20, '', { fontFamily: 'monospace', fontSize: '28px', color: '#ffed9a' }).setScrollFactor(0);
    this.hintText = this.add.text(GAME_WIDTH - 20, GAME_HEIGHT - 20, 'WASD: Laufen | E: Interagieren | SPACE: Portal/Dialog | Q: Questlog | R: Retry-Minigame', { fontFamily: 'monospace', fontSize: '18px', color: '#8ec6ff' }).setOrigin(1, 1);

    this.helpBox = this.add.rectangle(20, 70, 880, 160, 0x10253b, 0.85).setOrigin(0, 0).setStrokeStyle(2, 0x6db5ff);
    this.helpText = this.add.text(34, 84, 'SPIELANLEITUNG\n- Sprich mit NPCs und Häusern (E).\n- Nutze Portale mit SPACE.\n- Gewinne 3 Prüfungen.\n- Entdecke Sidequests und Easter Eggs.', { fontFamily: 'monospace', fontSize: '22px', color: '#d4ecff' });

    this.questLogBg = this.add.rectangle(980, 70, GAME_WIDTH - 1000, GAME_HEIGHT - 120, 0x0e1b2d, 0.93).setOrigin(0, 0).setStrokeStyle(2, 0xe0c773);
    this.questLogTitle = this.add.text(996, 82, 'QUESTLOG (Q)', { fontFamily: 'monospace', fontSize: '26px', color: '#ffe390' });
    this.questLogText = this.add.text(996, 120, '', { fontFamily: 'monospace', fontSize: '18px', color: '#f2f5ff', wordWrap: { width: GAME_WIDTH - 1040 } });

    this.dialogBg.setVisible(false);
    this.dialogText.setVisible(false);
    this.questLogBg.setVisible(false);
    this.questLogTitle.setVisible(false);
    this.questLogText.setVisible(false);

    this.time.delayedCall(7000, () => {
      this.helpBox.setVisible(false);
      this.helpText.setVisible(false);
    });

    this.input.keyboard.on('keydown-SPACE', () => this.advance());
    this.input.keyboard.on('keydown-ENTER', () => this.advance());
    this.input.keyboard.on('keydown-Q', () => this.toggleQuestLog());
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

  setQuestLog(text) {
    if (!this.questLogText) return;
    this.questLogText.setText(text || 'Keine Quests verfügbar.');
  }

  toggleQuestLog() {
    this.questLogOpen = !this.questLogOpen;
    this.questLogBg.setVisible(this.questLogOpen);
    this.questLogTitle.setVisible(this.questLogOpen);
    this.questLogText.setVisible(this.questLogOpen);
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
    if (this.charTimer < 12) return;
    this.charTimer = 0;
    this.charIndex++;
    const line = this.lines[this.lineIndex];
    this.dialogText.setText(line.slice(0, this.charIndex));
    if (this.charIndex >= line.length) this.typing = false;
  }
}
