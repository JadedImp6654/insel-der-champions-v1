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
    this.mapOpen = false;
  }

  create() {
    this.dialogBg = this.add.rectangle(20, GAME_HEIGHT - 220, GAME_WIDTH - 40, 190, 0x06111f, 0.92).setOrigin(0, 0).setStrokeStyle(2, 0x90d7ff);
    this.dialogText = this.add.text(34, GAME_HEIGHT - 205, '', { fontFamily: 'monospace', fontSize: '28px', color: '#d9f3ff', wordWrap: { width: GAME_WIDTH - 68 } });
    this.questText = this.add.text(20, 20, '', { fontFamily: 'monospace', fontSize: '28px', color: '#ffed9a' }).setScrollFactor(0);
    this.hintText = this.add.text(GAME_WIDTH - 20, GAME_HEIGHT - 20, 'WASD/Touch: Laufen | E: Interagieren | SPACE: Portal/Dialog | Q: Questlog | M: Karte | ESC: Schließen', { fontFamily: 'monospace', fontSize: '18px', color: '#8ec6ff' }).setOrigin(1, 1);

    this.helpBox = this.add.rectangle(20, 70, 980, 180, 0x10253b, 0.85).setOrigin(0, 0).setStrokeStyle(2, 0x6db5ff);
    this.helpText = this.add.text(34, 84, 'SPIELANLEITUNG\n- Interagiere mit NPCs, Häusern und Punkten (E oder Touch-Aktion).\n- Nutze Portale via SPACE.\n- Questlog (Q) und Weltkarte (M) helfen bei Navigation.\n- Sidequests, Easter Eggs und Minigames bringen Fortschritt.', { fontFamily: 'monospace', fontSize: '20px', color: '#d4ecff' });

    this.questLogBg = this.add.rectangle(980, 70, GAME_WIDTH - 1000, GAME_HEIGHT - 120, 0x0e1b2d, 0.93).setOrigin(0, 0).setStrokeStyle(2, 0xe0c773);
    this.questLogTitle = this.add.text(996, 82, 'QUESTLOG (Q)', { fontFamily: 'monospace', fontSize: '26px', color: '#ffe390' });
    this.questLogText = this.add.text(996, 120, '', { fontFamily: 'monospace', fontSize: '18px', color: '#f2f5ff', wordWrap: { width: GAME_WIDTH - 1040 } });

    this.mapBg = this.add.rectangle(180, 180, GAME_WIDTH - 360, GAME_HEIGHT - 360, 0x0b1e2f, 0.95).setOrigin(0, 0).setStrokeStyle(3, 0x8ec6ff);
    this.mapTitle = this.add.text(200, 200, 'KARTE (M)', { fontFamily: 'monospace', fontSize: '30px', color: '#bce4ff' });
    this.mapText = this.add.text(200, 250, 'Lade Kartendaten ...', { fontFamily: 'monospace', fontSize: '22px', color: '#e8f4ff', wordWrap: { width: GAME_WIDTH - 420 } });

    [this.dialogBg, this.dialogText, this.questLogBg, this.questLogTitle, this.questLogText, this.mapBg, this.mapTitle, this.mapText].forEach((o) => o.setVisible(false));

    this.time.delayedCall(9000, () => { this.helpBox.setVisible(false); this.helpText.setVisible(false); });

    this.input.keyboard.on('keydown-SPACE', () => this.advance());
    this.input.keyboard.on('keydown-ENTER', () => this.advance());
    this.input.keyboard.on('keydown-Q', () => this.toggleQuestLog());
    this.input.keyboard.on('keydown-M', () => this.toggleMap());
    this.input.keyboard.on('keydown-ESC', () => this.closePanels());
  }

  bind(overworld) {
    this.overworld = overworld;
    overworld.events.on('dialog:start', (lines, cb) => this.showDialog(lines, cb));
    overworld.events.on('dialog:end', () => this.hideDialog());
    overworld.events.on('map:update', (txt) => this.setMapText(txt));
  }

  closePanels() {
    if (this.lines.length) {
      this.typing = false;
      this.lineIndex = this.lines.length - 1;
      this.advance();
      return;
    }
    if (this.questLogOpen) this.toggleQuestLog(false);
    if (this.mapOpen) this.toggleMap(false);
  }

  setQuest(text) { if (this.questText) this.questText.setText(text); }
  setQuestLog(text) { if (this.questLogText) this.questLogText.setText(text || 'Keine Quests verfügbar.'); }
  setMapText(text) { if (this.mapText) this.mapText.setText(text); }

  toggleQuestLog(force) {
    this.questLogOpen = typeof force === 'boolean' ? force : !this.questLogOpen;
    this.questLogBg.setVisible(this.questLogOpen); this.questLogTitle.setVisible(this.questLogOpen); this.questLogText.setVisible(this.questLogOpen);
  }

  toggleMap(force) {
    this.mapOpen = typeof force === 'boolean' ? force : !this.mapOpen;
    this.mapBg.setVisible(this.mapOpen); this.mapTitle.setVisible(this.mapOpen); this.mapText.setVisible(this.mapOpen);
  }

  showDialog(lines, cb) {
    this.lines = lines; this.lineIndex = 0; this.charIndex = 0; this.finishedCallback = cb;
    this.dialogBg.setVisible(true); this.dialogText.setVisible(true); this.dialogText.setText(''); this.typing = true;
  }

  hideDialog() { this.dialogBg.setVisible(false); this.dialogText.setVisible(false); this.lines = []; }

  advance() {
    if (!this.lines.length) return;
    if (this.typing) { this.dialogText.setText(this.lines[this.lineIndex]); this.typing = false; return; }
    this.lineIndex++; this.charIndex = 0;
    if (this.lineIndex >= this.lines.length) { const cb = this.finishedCallback; this.finishedCallback = null; this.hideDialog(); if (cb) cb(); return; }
    this.dialogText.setText(''); this.typing = true;
  }

  update(_, dt) {
    if (!this.typing || !this.lines.length) return;
    this.charTimer = (this.charTimer || 0) + dt;
    if (this.charTimer < 12) return;
    this.charTimer = 0; this.charIndex++;
    const line = this.lines[this.lineIndex];
    this.dialogText.setText(line.slice(0, this.charIndex));
    if (this.charIndex >= line.length) this.typing = false;
  }
}
