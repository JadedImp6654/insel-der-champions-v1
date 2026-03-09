function makeTile(scene, key, draw) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  draw(g);
  g.generateTexture(key, 16, 16);
  g.destroy();
}

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  create() {
    const px = (g, x, y, c) => g.fillStyle(c, 1).fillRect(x, y, 1, 1);

    makeTile(this, 'tile_water', (g) => {
      g.fillStyle(0x1b4c8a).fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y += 2) for (let x = (y % 4) ? 1 : 0; x < 16; x += 4) px(g, x, y, 0x66b0ff);
    });
    makeTile(this, 'tile_grass', (g) => {
      g.fillStyle(0x3b8d3e).fillRect(0, 0, 16, 16);
      for (let i = 0; i < 20; i++) px(g, Phaser.Math.Between(0, 15), Phaser.Math.Between(0, 15), 0x6cc56a);
    });
    makeTile(this, 'tile_sand', (g) => {
      g.fillStyle(0xd7c27b).fillRect(0, 0, 16, 16);
      for (let i = 0; i < 22; i++) px(g, Phaser.Math.Between(0, 15), Phaser.Math.Between(0, 15), 0xe8dca5);
    });
    makeTile(this, 'tile_path', (g) => {
      g.fillStyle(0x8d6d45).fillRect(0, 0, 16, 16);
      for (let i = 0; i < 18; i++) px(g, Phaser.Math.Between(0, 15), Phaser.Math.Between(0, 15), 0xa8865d);
    });
    makeTile(this, 'tile_tree', (g) => {
      g.fillStyle(0x1f5f2d).fillRect(4, 2, 8, 9);
      g.fillStyle(0x5f3d1f).fillRect(7, 11, 2, 5);
      g.fillStyle(0x2f7c39).fillRect(2, 4, 3, 5).fillRect(11, 5, 3, 4);
    });
    makeTile(this, 'tile_rock', (g) => {
      g.fillStyle(0x7f8790).fillRect(4, 5, 8, 6);
      g.fillStyle(0xa0a8b0).fillRect(6, 6, 3, 2);
    });
    makeTile(this, 'tile_house', (g) => {
      g.fillStyle(0x824a2a).fillRect(2, 7, 12, 8);
      g.fillStyle(0xc23f32).fillRect(1, 3, 14, 5);
      g.fillStyle(0xedd7ac).fillRect(7, 10, 2, 5);
    });
    makeTile(this, 'tile_foam', (g) => {
      g.fillStyle(0xffffff, 0.8).fillRect(6, 6, 2, 1).fillRect(9, 10, 2, 1).fillRect(3, 12, 2, 1);
    });

    makeTile(this, 'player', (g) => {
      g.fillStyle(0x2f4dff).fillRect(5, 3, 6, 5);
      g.fillStyle(0xf0d4b2).fillRect(5, 8, 6, 4);
      g.fillStyle(0x2f4dff).fillRect(4, 12, 3, 4).fillRect(9, 12, 3, 4);
      g.fillStyle(0x1d2f9d).fillRect(4, 14, 3, 2).fillRect(9, 14, 3, 2);
    });

    const npcDraw = (key, shirt) => makeTile(this, key, (g) => {
      g.fillStyle(0x5d3b2b).fillRect(5, 3, 6, 4);
      g.fillStyle(0xf4cfac).fillRect(5, 7, 6, 4);
      g.fillStyle(shirt).fillRect(5, 11, 6, 3);
      g.fillStyle(0x3e2a21).fillRect(5, 14, 2, 2).fillRect(9, 14, 2, 2);
    });

    npcDraw('npc_pink', 0xc25ab8);
    npcDraw('npc_blue', 0x4a83d9);

    this.scene.start('OverworldScene');
  }
}
