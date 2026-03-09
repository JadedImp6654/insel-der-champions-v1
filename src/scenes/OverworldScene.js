import { TILE_SIZE } from '../config.js';
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
    if (this.returnData.minigame) {
      this.saveData.minigames[this.returnData.minigame] = !!this.returnData.win;
    }

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
      this.ui.setQuest(this.questSystem.getActiveText());
    });

    this.keys = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D', interact: 'E', portal: 'SPACE' });

    this.events.on('dialog:end', () => {
      this.player.body.moves = true;
      if (this.ui?.setQuest) this.ui.setQuest(this.questSystem.getActiveText());
      SaveSystem.save(this.saveData);
    });
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
      this.player = this.physics.add.sprite((spawnX ?? this.saveData.player.x / TILE_SIZE) * TILE_SIZE, (spawnY ?? this.saveData.player.y / TILE_SIZE) * TILE_SIZE, 'player').setSize(10, 14).setOffset(3, 2);
      this.player.setCollideWorldBounds(true);
    } else {
      this.player.setPosition((spawnX ?? this.map.portals[0]?.x ?? 10) * TILE_SIZE, (spawnY ?? this.map.portals[0]?.y ?? 10) * TILE_SIZE);
    }

    this.physics.world.setBounds(0, 0, this.map.width * TILE_SIZE, this.map.height * TILE_SIZE);
    this.cameras.main.setBounds(0, 0, this.map.width * TILE_SIZE, this.map.height * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.physics.add.collider(this.player, this.tileRenderer.colliders);

    this.npcSystem = new NPCSystem(this, this.dialogSystem, this.questSystem);
    this.npcSystem.spawn(this.map.npcs);

    this.saveData.map = mapId;
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

    if (portal.targetMinigame) {
      this.saveData.player = { x: this.player.x, y: this.player.y };
      SaveSystem.save(this.saveData);
      const sceneName = {
        run: 'MinigameRunScene',
        dodge: 'MinigameDodgeScene',
        timing: 'MinigameTimingScene',
      }[portal.targetMinigame];
      this.scene.start(sceneName, { returnMap: this.currentMapId });
    }
  }

  update() {
    if (!this.player || this.dialogSystem.active) {
      if (this.player) this.player.setVelocity(0, 0);
      return;
    }

    const speed = 115;
    let vx = 0;
    let vy = 0;
    if (this.keys.left.isDown) vx = -speed;
    else if (this.keys.right.isDown) vx = speed;
    if (this.keys.up.isDown) vy = -speed;
    else if (this.keys.down.isDown) vy = speed;

    this.player.setVelocity(vx, vy);

    if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
      if (this.npcSystem.interactNearest(this.player)) this.player.body.moves = false;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.portal)) this.handlePortal();

    this.saveData.player = { x: this.player.x, y: this.player.y };
    SaveSystem.save(this.saveData);
  }
}
