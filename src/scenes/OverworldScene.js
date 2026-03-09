import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { MapGenerator } from '../engine/MapGenerator.js';
import { TileRenderer } from '../engine/TileRenderer.js';
import { SaveSystem } from '../engine/SaveSystem.js';
import { QuestSystem } from '../engine/QuestSystem.js';
import { DialogSystem } from '../engine/DialogSystem.js';
import { NPCSystem } from '../engine/NPCSystem.js';

export class OverworldScene extends Phaser.Scene {
  constructor() { super('OverworldScene'); }
  init(data) { this.returnData = data || {}; }

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
    this.time.delayedCall(0, () => { this.ui = this.scene.get('UISystem'); this.ui.bind(this); this.syncUI(); });

    this.keys = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D', interact: 'E', portal: 'SPACE', retry: 'R' });
    this.createTouchControls();

    this.events.on('dialog:end', () => {
      this.player.body.moves = true;
      this.syncUI();
      SaveSystem.save(this.saveData);
    });
  }

  createTouchControls() {
    this.touch = { up: false, down: false, left: false, right: false };
    const btn = (x, y, label) => {
      const c = this.add.circle(x, y, 44, 0x163a59, 0.45).setStrokeStyle(2, 0x84c6ff).setScrollFactor(0).setDepth(9999).setInteractive();
      this.add.text(x, y, label, { fontFamily: 'monospace', fontSize: '26px', color: '#d8eeff' }).setOrigin(0.5).setDepth(10000).setScrollFactor(0);
      return c;
    };
    const lx = 120, ly = GAME_HEIGHT - 130;
    this.btnLeft = btn(lx - 60, ly, '◀');
    this.btnRight = btn(lx + 60, ly, '▶');
    this.btnUp = btn(lx, ly - 60, '▲');
    this.btnDown = btn(lx, ly + 60, '▼');
    this.btnAction = btn(GAME_WIDTH - 110, GAME_HEIGHT - 130, 'A');
    this.btnPortal = btn(GAME_WIDTH - 220, GAME_HEIGHT - 70, 'P');

    const bindDir = (button, key) => {
      button.on('pointerdown', () => { this.touch[key] = true; });
      button.on('pointerup', () => { this.touch[key] = false; });
      button.on('pointerout', () => { this.touch[key] = false; });
    };
    bindDir(this.btnLeft, 'left'); bindDir(this.btnRight, 'right'); bindDir(this.btnUp, 'up'); bindDir(this.btnDown, 'down');
    this.btnAction.on('pointerdown', () => this.tryInteract());
    this.btnPortal.on('pointerdown', () => this.handlePortal());
  }

  syncUI() {
    if (!this.ui) return;
    this.ui.setQuest(this.questSystem.getActiveText());
    this.ui.setQuestLog(this.questSystem.getQuestLogText());
    this.events.emit('map:update', this.getMapText());
  }

  getMapText() {
    return [
      `Region: ${this.currentMapId}`,
      'Legende:',
      '- Portale: Lila Tore',
      '- Häuser/NPCs: Interagierbar',
      '- Sidequests: in Dörfern und POIs',
      `Position: (${Math.round(this.player.x / TILE_SIZE)}, ${Math.round(this.player.y / TILE_SIZE)})`,
    ].join('\n');
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
      this.player = this.physics.add.sprite((spawnX ?? this.saveData.player.x / TILE_SIZE) * TILE_SIZE, (spawnY ?? this.saveData.player.y / TILE_SIZE) * TILE_SIZE, 'player').setSize(20, 30).setOffset(6, 2);
      this.player.setCollideWorldBounds(true);
    } else {
      this.player.setPosition((spawnX ?? this.map.portals[0]?.x ?? 10) * TILE_SIZE, (spawnY ?? this.map.portals[0]?.y ?? 10) * TILE_SIZE);
    }

    this.physics.world.setBounds(0, 0, this.map.width * TILE_SIZE, this.map.height * TILE_SIZE);
    this.cameras.main.setBounds(0, 0, this.map.width * TILE_SIZE, this.map.height * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.physics.add.collider(this.player, this.tileRenderer.colliders);

    this.npcSystem = new NPCSystem(this, this.dialogSystem, this.questSystem);
    this.npcSystem.spawn(this.map.npcs || []);
    this.npcSystem.setInteractives(this.map.interactives || []);

    this.saveData.map = mapId;
  }

  startMinigame(name) {
    this.saveData.player = { x: this.player.x, y: this.player.y };
    SaveSystem.save(this.saveData);
    const sceneName = { run: 'MinigameRunScene', dodge: 'MinigameDodgeScene', timing: 'MinigameTimingScene' }[name];
    this.scene.start(sceneName, { returnMap: this.currentMapId });
  }

  handlePortal() {
    const tileX = Math.round(this.player.x / TILE_SIZE);
    const tileY = Math.round(this.player.y / TILE_SIZE);
    const portal = this.map.portals.find((p) => Math.abs(p.x - tileX) <= 1 && Math.abs(p.y - tileY) <= 1);
    if (!portal) return;
    if (portal.targetMap) { this.loadMap(portal.targetMap, portal.tx, portal.ty); this.syncUI(); return; }
    if (portal.targetMinigame) this.startMinigame(portal.targetMinigame);
  }

  tryInteract() {
    if (this.npcSystem.interactNearest(this.player)) {
      this.player.body.moves = false;
      this.syncUI();
    }
  }

  update() {
    if (!this.player || this.dialogSystem.active || this.ui?.questLogOpen || this.ui?.mapOpen) {
      if (this.player) this.player.setVelocity(0, 0);
      return;
    }

    const speed = 160;
    let vx = 0, vy = 0;
    if (this.keys.left.isDown || this.touch.left) vx = -speed;
    else if (this.keys.right.isDown || this.touch.right) vx = speed;
    if (this.keys.up.isDown || this.touch.up) vy = -speed;
    else if (this.keys.down.isDown || this.touch.down) vy = speed;
    this.player.setVelocity(vx, vy);

    if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) this.tryInteract();
    if (Phaser.Input.Keyboard.JustDown(this.keys.portal)) this.handlePortal();
    if (Phaser.Input.Keyboard.JustDown(this.keys.retry)) this.startMinigame('run');

    this.saveData.player = { x: this.player.x, y: this.player.y };
    SaveSystem.save(this.saveData);
    if (Math.random() < 0.02) this.events.emit('map:update', this.getMapText());
  }
}
