import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from '../config.js';

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
    const u = Math.max(0.68, Math.min(1, GAME_WIDTH / 2560));
    const fs = (n) => `${Math.floor(n * u)}px`;

    this.dialogBg = this.add.rectangle(20, GAME_HEIGHT - Math.floor(220 * u), GAME_WIDTH - 40, Math.floor(190 * u), 0x06111f, 0.92).setOrigin(0, 0).setStrokeStyle(2, 0x90d7ff);
    this.dialogText = this.add.text(34, GAME_HEIGHT - Math.floor(205 * u), '', { fontFamily: 'monospace', fontSize: fs(28), color: '#d9f3ff', wordWrap: { width: GAME_WIDTH - 68 } });
    this.questText = this.add.text(20, 20, '', { fontFamily: 'monospace', fontSize: fs(28), color: '#ffed9a' }).setScrollFactor(0);
    this.hintText = this.add.text(GAME_WIDTH - 20, GAME_HEIGHT - 20, 'WASD/Touch | E Interagieren | SPACE Portal | Q Questlog | M Karte | ESC Schließen', { fontFamily: 'monospace', fontSize: fs(18), color: '#8ec6ff' }).setOrigin(1, 1);

    this.helpBox = this.add.rectangle(20, 70, Math.floor(GAME_WIDTH * 0.56), Math.floor(170 * u), 0x10253b, 0.85).setOrigin(0, 0).setStrokeStyle(2, 0x6db5ff);
    this.helpText = this.add.text(34, 84, 'SPIELANLEITUNG\n- Mit NPCs/Häusern sprechen (E)\n- Questlog: Q | Karte: M\n- ESC schließt offene Ansichten\n- Auf Mobil: Touch-Controller nutzen', { fontFamily: 'monospace', fontSize: fs(22), color: '#d4ecff' });

    this.questLogBg = this.add.rectangle(Math.floor(GAME_WIDTH * 0.42), 70, Math.floor(GAME_WIDTH * 0.56), GAME_HEIGHT - 120, 0x0e1b2d, 0.93).setOrigin(0, 0).setStrokeStyle(2, 0xe0c773);
    this.questLogTitle = this.add.text(Math.floor(GAME_WIDTH * 0.43), 82, 'QUESTLOG (Q)', { fontFamily: 'monospace', fontSize: fs(26), color: '#ffe390' });
    this.questLogText = this.add.text(Math.floor(GAME_WIDTH * 0.43), 120, '', { fontFamily: 'monospace', fontSize: fs(18), color: '#f2f5ff', wordWrap: { width: Math.floor(GAME_WIDTH * 0.53) } });

    this.mapBg = this.add.rectangle(Math.floor(GAME_WIDTH * 0.12), Math.floor(120 * u), Math.floor(GAME_WIDTH * 0.76), Math.floor(GAME_HEIGHT * 0.78), 0x081521, 0.95).setOrigin(0, 0).setStrokeStyle(2, 0x9ad8ff);
    this.mapTitle = this.add.text(Math.floor(GAME_WIDTH * 0.13), Math.floor(136 * u), 'KARTENANSICHT (M)', { fontFamily: 'monospace', fontSize: fs(28), color: '#aee6ff' });
    this.mapCanvas = this.add.graphics({ x: Math.floor(GAME_WIDTH * 0.14), y: Math.floor(180 * u) });

    this.dialogBg.setVisible(false);
    this.dialogText.setVisible(false);
    this.questLogBg.setVisible(false);
    this.questLogTitle.setVisible(false);
    this.questLogText.setVisible(false);
    this.mapBg.setVisible(false);
    this.mapTitle.setVisible(false);
    this.mapCanvas.setVisible(false);

    this.time.delayedCall(9000, () => {
      this.helpBox.setVisible(false);
      this.helpText.setVisible(false);
    });

    this.input.keyboard.on('keydown-SPACE', () => this.advance());
    this.input.keyboard.on('keydown-ENTER', () => this.advance());
    this.input.keyboard.on('keydown-Q', () => this.toggleQuestLog());
    this.input.keyboard.on('keydown-M', () => this.toggleMap());
    this.input.keyboard.on('keydown-ESC', () => this.closeOverlays());
  }

  bind(overworld) {
    this.overworld = overworld;
    overworld.events.on('dialog:start', (lines, cb) => this.showDialog(lines, cb));
    overworld.events.on('dialog:end', () => this.hideDialog());
  }

  closeOverlays() {
    if (this.questLogOpen) this.toggleQuestLog(false);
    if (this.mapOpen) this.toggleMap(false);
  }

  setQuest(text) {
    if (!this.questText) return;
    this.questText.setText(text);
  }

  setQuestLog(text) {
    if (!this.questLogText) return;
    this.questLogText.setText(text || 'Keine Quests verfügbar.');
  }

  setMapData(map, playerX, playerY) {
    this.mapData = { map, playerX, playerY };
    if (this.mapOpen) this.renderMap();
  }

  renderMap() {
    if (!this.mapData?.map) return;
    const { map, playerX, playerY } = this.mapData;
    this.mapCanvas.clear();
    const panelW = Math.floor(GAME_WIDTH * 0.7);
    const tile = Math.max(2, Math.min(8, Math.floor(panelW / map.width)));
    const ox = 0;
    const oy = 0;
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const t = map.ground[y][x];
        const c = t.includes('water') ? 0x2b6fb0 : t === 'sand' ? 0xd7c07d : t === 'path' ? 0x8f6743 : 0x3f9442;
        this.mapCanvas.fillStyle(c, 1).fillRect(ox + x * tile, oy + y * tile, tile, tile);
      }
    }
    this.mapCanvas.fillStyle(0xfff17b, 1).fillRect(ox + Math.floor(playerX / TILE_SIZE) * tile, oy + Math.floor(playerY / TILE_SIZE) * tile, tile, tile);
  }

  toggleQuestLog(force) {
    this.questLogOpen = force === undefined ? !this.questLogOpen : !!force;
    this.questLogBg.setVisible(this.questLogOpen);
    this.questLogTitle.setVisible(this.questLogOpen);
    this.questLogText.setVisible(this.questLogOpen);
  }

  toggleMap(force) {
    this.mapOpen = force === undefined ? !this.mapOpen : !!force;
    this.mapBg.setVisible(this.mapOpen);
    this.mapTitle.setVisible(this.mapOpen);
    this.mapCanvas.setVisible(this.mapOpen);
    if (this.mapOpen) this.renderMap();
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
