import { TILE_SIZE } from '../config.js';

export class NPCSystem {
  constructor(scene, dialogSystem, questSystem) {
    this.scene = scene;
    this.dialogSystem = dialogSystem;
    this.questSystem = questSystem;
    this.npcs = [];
  }

  spawn(npcs) {
    this.npcs = npcs.map((n) => {
      const sprite = this.scene.add.sprite(n.x * TILE_SIZE, n.y * TILE_SIZE, `npc_${n.palette}`).setOrigin(0.5, 1);
      return { ...n, sprite };
    });
  }

  interactNearest(player) {
    const nearest = this.npcs
      .map((n) => ({ npc: n, dist: Phaser.Math.Distance.Between(player.x, player.y, n.sprite.x, n.sprite.y) }))
      .sort((a, b) => a.dist - b.dist)[0];

    if (!nearest || nearest.dist > 20) return false;

    if (nearest.npc.id === 'mira') {
      const completed = this.questSystem.tryCompleteAtMira();
      const lines = completed
        ? ['Fantastisch! Du bist Champion der Inseln!']
        : [...nearest.npc.dialog, this.questSystem.getActiveText()];
      this.dialogSystem.start(lines);
    } else {
      this.dialogSystem.start(nearest.npc.dialog);
    }
    return true;
  }
}
