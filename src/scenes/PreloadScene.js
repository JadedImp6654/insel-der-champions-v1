function makeTile(scene, key, draw) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  draw(g);
  g.generateTexture(key, 16, 16);
  g.destroy();
}

function dither(g, c, count = 25) {
  g.fillStyle(c, 1);
  for (let i = 0; i < count; i++) g.fillRect(Phaser.Math.Between(0, 15), Phaser.Math.Between(0, 15), 1, 1);
}

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  create() {
    makeTile(this, 'tile_water_deep', (g) => {
      g.fillStyle(0x10355f).fillRect(0, 0, 16, 16);
      dither(g, 0x1f508d, 28);
      dither(g, 0x2f78c2, 10);
    });

    makeTile(this, 'tile_water_shallow', (g) => {
      g.fillStyle(0x2a6eb5).fillRect(0, 0, 16, 16);
      dither(g, 0x57a1e5, 24);
      dither(g, 0xa2d6ff, 8);
    });

    makeTile(this, 'tile_sand', (g) => {
      g.fillStyle(0xe3cf94).fillRect(0, 0, 16, 16);
      dither(g, 0xf4e6bc, 24);
      dither(g, 0xc7b074, 16);
    });

    makeTile(this, 'tile_path', (g) => {
      g.fillStyle(0x8b6640).fillRect(0, 0, 16, 16);
      dither(g, 0x6b4a2e, 18);
      dither(g, 0xa27b51, 10);
    });

    makeTile(this, 'tile_grass_lush', (g) => {
      g.fillStyle(0x3a8e3d).fillRect(0, 0, 16, 16);
      dither(g, 0x67be57, 30);
      dither(g, 0x2c6c2b, 16);
    });

    makeTile(this, 'tile_grass_dark', (g) => {
      g.fillStyle(0x2d6f35).fillRect(0, 0, 16, 16);
      dither(g, 0x4f9d47, 24);
      dither(g, 0x1f5124, 16);
    });

    makeTile(this, 'tile_field_soil', (g) => {
      g.fillStyle(0x725134).fillRect(0, 0, 16, 16);
      g.fillStyle(0x5a3c25);
      for (let y = 1; y < 16; y += 3) g.fillRect(0, y, 16, 1);
      dither(g, 0x8a6947, 10);
    });

    makeTile(this, 'tile_field_crop', (g) => {
      g.fillStyle(0x725134).fillRect(0, 0, 16, 16);
      g.fillStyle(0x56a147);
      for (let x = 1; x < 16; x += 4) g.fillRect(x, 0, 2, 16);
      dither(g, 0x7ac85f, 16);
    });

    makeTile(this, 'tile_rock_ground', (g) => {
      g.fillStyle(0x6d757e).fillRect(0, 0, 16, 16);
      dither(g, 0x8f98a1, 18);
      dither(g, 0x4e575f, 16);
    });

    makeTile(this, 'tile_flower_red', (g) => {
      g.fillStyle(0x3a8e3d).fillRect(0, 0, 16, 16);
      dither(g, 0x67be57, 24);
      g.fillStyle(0xc7322f).fillRect(5, 8, 2, 2).fillRect(8, 8, 2, 2);
      g.fillStyle(0xf1d76c).fillRect(7, 9, 1, 1);
    });

    makeTile(this, 'tile_flower_blue', (g) => {
      g.fillStyle(0x3a8e3d).fillRect(0, 0, 16, 16);
      dither(g, 0x67be57, 24);
      g.fillStyle(0x4a7de2).fillRect(6, 8, 1, 2).fillRect(8, 8, 1, 2).fillRect(7, 7, 1, 1).fillRect(7, 10, 1, 1);
      g.fillStyle(0xf1d76c).fillRect(7, 9, 1, 1);
    });

    makeTile(this, 'tile_bush', (g) => {
      g.fillStyle(0x3a8e3d).fillRect(0, 0, 16, 16);
      g.fillStyle(0x2f7d35).fillRect(3, 7, 10, 6);
      g.fillStyle(0x56a147).fillRect(5, 6, 6, 3);
      dither(g, 0x6fc85a, 8);
    });

    makeTile(this, 'tile_reed', (g) => {
      g.fillStyle(0x2a6eb5).fillRect(0, 0, 16, 16);
      dither(g, 0x57a1e5, 14);
      g.fillStyle(0x90b04e);
      for (let x = 4; x <= 11; x += 2) g.fillRect(x, 7, 1, 7);
    });

    makeTile(this, 'tile_tree_oak', (g) => {
      g.fillStyle(0x5d3a24).fillRect(7, 10, 2, 6);
      g.fillStyle(0x2d6f35).fillRect(3, 3, 10, 8);
      g.fillStyle(0x4f9d47).fillRect(4, 2, 8, 4);
      dither(g, 0x74c25a, 8);
    });

    makeTile(this, 'tile_tree_pine', (g) => {
      g.fillStyle(0x5d3a24).fillRect(7, 11, 2, 5);
      g.fillStyle(0x1f5f2d).fillRect(6, 9, 4, 3);
      g.fillStyle(0x2f7d35).fillRect(5, 6, 6, 4);
      g.fillStyle(0x3f8f45).fillRect(4, 3, 8, 4);
    });

    makeTile(this, 'tile_tree_palm', (g) => {
      g.fillStyle(0x7f5a31).fillRect(7, 8, 2, 8);
      g.fillStyle(0x5ca45f).fillRect(2, 6, 5, 2).fillRect(9, 6, 5, 2).fillRect(6, 2, 4, 2).fillRect(5, 4, 6, 2);
      dither(g, 0x84d27f, 8);
    });

    makeTile(this, 'tile_rock_small', (g) => {
      g.fillStyle(0x7f8790).fillRect(4, 8, 8, 5);
      g.fillStyle(0xa0a8b0).fillRect(6, 9, 3, 2);
    });

    makeTile(this, 'tile_rock_big', (g) => {
      g.fillStyle(0x707981).fillRect(2, 6, 12, 8);
      g.fillStyle(0x939da5).fillRect(5, 8, 4, 2);
      g.fillStyle(0x525a61).fillRect(3, 12, 10, 1);
    });

    makeTile(this, 'tile_house', (g) => {
      g.fillStyle(0x8f5430).fillRect(2, 8, 12, 8);
      g.fillStyle(0xc9483a).fillRect(1, 3, 14, 5);
      g.fillStyle(0xf6dfa9).fillRect(7, 11, 2, 5);
      g.fillStyle(0x4f7cbf).fillRect(3, 10, 3, 3).fillRect(10, 10, 3, 3);
    });

    makeTile(this, 'tile_house_large', (g) => {
      g.fillStyle(0x8a4f2b).fillRect(1, 7, 14, 9);
      g.fillStyle(0xa53732).fillRect(0, 2, 16, 5);
      g.fillStyle(0xf6dfa9).fillRect(7, 10, 2, 6);
      g.fillStyle(0x4f7cbf).fillRect(2, 10, 3, 3).fillRect(11, 10, 3, 3);
    });

    makeTile(this, 'tile_tower', (g) => {
      g.fillStyle(0x8f98a1).fillRect(4, 3, 8, 13);
      g.fillStyle(0x6a7278).fillRect(3, 2, 10, 2);
      g.fillStyle(0x4f7cbf).fillRect(7, 10, 2, 6);
      dither(g, 0xb4bdc5, 8);
    });

    makeTile(this, 'tile_portal', (g) => {
      g.fillStyle(0x40286e).fillRect(4, 4, 8, 10);
      g.fillStyle(0x9d74ff).fillRect(5, 5, 6, 8);
      g.fillStyle(0xd8c5ff).fillRect(7, 7, 2, 4);
    });

    makeTile(this, 'tile_foam', (g) => {
      g.fillStyle(0x2a6eb5).fillRect(0, 0, 16, 16);
      g.fillStyle(0xd8f4ff).fillRect(4, 7, 3, 1).fillRect(9, 10, 3, 1).fillRect(2, 12, 2, 1);
    });

    makeTile(this, 'player', (g) => {
      g.fillStyle(0x2d3f89).fillRect(4, 2, 8, 5);
      g.fillStyle(0xf4d7b8).fillRect(5, 7, 6, 4);
      g.fillStyle(0x3b54c1).fillRect(4, 11, 8, 3);
      g.fillStyle(0x2d3f89).fillRect(4, 14, 3, 2).fillRect(9, 14, 3, 2);
      g.fillStyle(0x86c1ff).fillRect(6, 4, 1, 1).fillRect(9, 4, 1, 1);
    });

    const npc = (key, cloth, hair) => makeTile(this, key, (g) => {
      g.fillStyle(hair).fillRect(5, 2, 6, 4);
      g.fillStyle(0xf0cda9).fillRect(5, 6, 6, 4);
      g.fillStyle(cloth).fillRect(5, 10, 6, 4);
      g.fillStyle(0x3e2a21).fillRect(5, 14, 2, 2).fillRect(9, 14, 2, 2);
    });

    npc('npc_pink', 0xbd5da9, 0x4b2c2c);
    npc('npc_blue', 0x4a83d9, 0x2b2220);
    npc('npc_green', 0x5ea758, 0x433123);
    npc('npc_gold', 0xd1a645, 0x3a281f);

    this.scene.start('OverworldScene');
  }
}
