import { TILE_SIZE } from '../config.js';

export class NPCSystem {
  constructor(scene, dialogSystem, questSystem) {
    this.scene = scene;
    this.dialogSystem = dialogSystem;
    this.questSystem = questSystem;
    this.npcs = [];
    this.interactives = [];
  }

  spawn(npcs) {
    this.npcs = npcs.map((n) => {
      const sprite = this.scene.add.sprite(n.x * TILE_SIZE, n.y * TILE_SIZE, `npc_${n.palette}`).setOrigin(0.5, 1);
      return { ...n, sprite, kind: 'npc', ix: n.x, iy: n.y };
    });
  }

  setInteractives(interactives = []) {
    this.interactives = interactives.map((i) => ({ ...i, kind: i.kind || 'poi', ix: i.x, iy: i.y }));
  }

  interactNearest(player) {
    const candidates = [
      ...this.npcs.map((n) => ({ ...n, px: n.sprite.x, py: n.sprite.y })),
      ...this.interactives.map((i) => ({ ...i, px: i.ix * TILE_SIZE, py: i.iy * TILE_SIZE })),
    ];
    const nearest = candidates
      .map((c) => ({ c, dist: Phaser.Math.Distance.Between(player.x, player.y, c.px, c.py) }))
      .sort((a, b) => a.dist - b.dist)[0];

    if (!nearest || nearest.dist > 88) return false;
    const target = nearest.c;

    if (target.kind === 'npc') {
      if (target.id === 'mira') {
        const completed = this.questSystem.tryCompleteAtMira();
        const lines = completed
          ? ['Fantastisch! Du bist Champion der Inseln!', this.questSystem.getActiveText()]
          : [...target.dialog, this.questSystem.getActiveText()];
        this.dialogSystem.start(lines);
      } else {
        if (target.questId) this.questSystem.completeQuest(target.questId);
        this.dialogSystem.start([...target.dialog, this.questSystem.getActiveText()]);
      }
    } else {
      if (target.kind === 'easteregg') this.questSystem.markEasterEgg(target.id);
      this.dialogSystem.start([...(target.dialog || ['Hier gibt es etwas Interessantes.']), this.questSystem.getActiveText()]);
    }

    return true;
  }
}
