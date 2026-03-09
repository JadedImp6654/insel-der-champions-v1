import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { MapGenerator } from '../engine/MapGenerator.js';
import { TileRenderer } from '../engine/TileRenderer.js';
import { SaveSystem } from '../engine/SaveSystem.js';
import { QuestSystem } from '../engine/QuestSystem.js';
import { DialogSystem } from '../engine/DialogSystem.js';
import { NPCSystem } from '../engine/NPCSystem.js';

export class OverworldScene extends Phaser.Scene {
  constructor() {
    super('OverworldScene');
  }

  init(data) {
    this.returnData = data || {};
  }

  create() {
    this.saveData = SaveSystem.load();
    if (this.returnData.minigame) this.saveData.minigames[this.returnData.minigame] = !!this.returnData.win;

    this.maps = MapGenerator.getMaps();
    this.questSystem = new QuestSystem(this.saveData);
    this.questSystem.progressAfterMinigame();
    this.dialogSystem = new DialogSystem(this);

    this.currentMapId = this.returnData.map || this.saveData.map || 'mainland';
    this.loadMap(this.currentMapId, this.returnData.x, this.returnData.y);

    if (!this.scene.isActive('UISystem')) this.scene.launch('UISystem');
    this.time.delayedCall(0, () => {
      this.ui = this.scene.get('UISystem');
      this.ui.bind(this);
      this.syncUI();
    });

    this.keys = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D', interact: 'E', portal: 'SPACE' });
    this.setupTouchControls();

    this.events.on('dialog:end', () => {
      this.player.body.moves = true;
      this.syncUI();
      SaveSystem.save(this.saveData);
    });
  }

  setupTouchControls() {
    this.touch = { up: false, down: false, left: false, right: false, interact: false, portal: false };
    if (!this.sys.game.device.input.touch) return;

    const size = Math.max(84, Math.floor(Math.min(GAME_WIDTH, GAME_HEIGHT) * 0.07));
    const addBtn = (x, y, key, label) => {
      const b = this.add.circle(x, y, size / 2, 0x0a2236, 0.5).setScrollFactor(0).setDepth(9999).setStrokeStyle(3, 0x88d4ff).setInteractive();
      this.add.text(x, y, label, { fontFamily: 'monospace', fontSize: `${Math.floor(size * 0.42)}px`, color: '#bce9ff' }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);
      b.on('pointerdown', () => { this.touch[key] = true; });
      b.on('pointerup', () => { this.touch[key] = false; });
      b.on('pointerout', () => { this.touch[key] = false; });
    };

    const baseY = GAME_HEIGHT - size * 1.1;
    addBtn(size * 1.4, baseY, 'left', '◀');
    addBtn(size * 2.6, baseY, 'right', '▶');
    addBtn(size * 2.0, baseY - size * 1.0, 'up', '▲');
    addBtn(size * 2.0, baseY + size * 0.9, 'down', '▼');

    addBtn(GAME_WIDTH - size * 2.0, baseY - size * 0.5, 'interact', 'E');
    addBtn(GAME_WIDTH - size * 0.9, baseY + size * 0.2, 'portal', 'SP');
  }

  syncUI() {
    if (!this.ui) return;
    this.ui.setQuest(this.questSystem.getActiveText());
    this.ui.setQuestLog(this.questSystem.getQuestLogText());
    this.ui.setMapData(this.map, this.player.x, this.player.y);
  }

  loadMap(mapId, spawnX, spawnY) {
    if (this.mapLayer) this.mapLayer.destroy(true);
    if (this.tileRenderer) this.tileRenderer.colliders.clear(true, true);
    if (this.npcSystem?.npcs) this.npcSystem.npcs.forEach((n) => n.sprite.destroy());

    this.map = this.maps[mapId];
    this.currentMapId = mapId;
    this.tileRenderer = new TileRenderer(this);
    this.mapLayer = this.tileRenderer.render(this.map);

    if (!this.player) {
      this.player = this.physics.add.sprite((spawnX ?? this.saveData.player.x / TILE_SIZE) * TILE_SIZE, (spawnY ?? this.saveData.player.y / TILE_SIZE) * TILE_SIZE, 'player').setSize(24, 36).setOffset(4, 0);
      this.player.setCollideWorldBounds(true);
    } else {
      this.player.setPosition((spawnX ?? this.map.portals[0]?.x ?? 10) * TILE_SIZE, (spawnY ?? this.map.portals[0]?.y ?? 10) * TILE_SIZE);
    }

    this.physics.world.setBounds(0, 0, this.map.width * TILE_SIZE, this.map.height * TILE_SIZE);
    this.cameras.main.setBounds(0, 0, this.map.width * TILE_SIZE, this.map.height * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.physics.add.collider(this.player, this.tileRenderer.colliders);

    this.npcSystem = new NPCSystem(this, this.dialogSystem, this.questSystem);
    this.npcSystem.spawn(this.map.npcs || []);
    this.npcSystem.setInteractives(this.map.interactives || []);

    this.saveData.map = mapId;
    this.syncUI();
  }

  startMinigame(name) {
    this.saveData.player = { x: this.player.x, y: this.player.y };
    SaveSystem.save(this.saveData);
    const sceneName = { run: 'MinigameRunScene', dodge: 'MinigameDodgeScene', timing: 'MinigameTimingScene' }[name];
    this.scene.start(sceneName, { returnMap: this.currentMapId });
  }

  tryStartLocationMinigame() {
    const tx = Math.round(this.player.x / TILE_SIZE);
    const ty = Math.round(this.player.y / TILE_SIZE);
    const s = (this.map.minigameSpots || []).find((m) => Math.abs(m.x - tx) <= 1 && Math.abs(m.y - ty) <= 1);
    if (!s) return false;
    this.startMinigame(s.minigame);
    return true;
  }

  handlePortal() {
    const tileX = Math.round(this.player.x / TILE_SIZE);
    const tileY = Math.round(this.player.y / TILE_SIZE);
    const portal = this.map.portals.find((p) => Math.abs(p.x - tileX) <= 1 && Math.abs(p.y - tileY) <= 1);
    if (!portal) return;

    if (portal.targetMap) {
      this.loadMap(portal.targetMap, portal.tx, portal.ty);
      return;
    }
    if (portal.targetMinigame) this.startMinigame(portal.targetMinigame);
  }

  update() {
    if (!this.player || this.dialogSystem.active) {
      if (this.player) this.player.setVelocity(0, 0);
      return;
    }

    const speed = 170;
    let vx = 0;
    let vy = 0;
    if (this.keys.left.isDown || this.touch.left) vx = -speed;
    else if (this.keys.right.isDown || this.touch.right) vx = speed;
    if (this.keys.up.isDown || this.touch.up) vy = -speed;
    else if (this.keys.down.isDown || this.touch.down) vy = speed;
    this.player.setVelocity(vx, vy);

    if (Phaser.Input.Keyboard.JustDown(this.keys.interact) || this.touch.interact) {
      this.touch.interact = false;
      if (!this.tryStartLocationMinigame()) {
        if (this.npcSystem.interactNearest(this.player)) {
          this.player.body.moves = false;
          this.syncUI();
        }
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.portal) || this.touch.portal) {
      this.touch.portal = false;
      this.handlePortal();
    }

    this.saveData.player = { x: this.player.x, y: this.player.y };
    SaveSystem.save(this.saveData);
    if (this.ui?.mapOpen) this.ui.setMapData(this.map, this.player.x, this.player.y);
  }
}
