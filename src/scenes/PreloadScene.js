function makeTile(scene, key, draw) {
  const size = 32;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  draw(g, size);
  g.generateTexture(key, size, size);
  g.destroy();
}

function dither(g, c, size, count = 60) {
  g.fillStyle(c, 1);
  for (let i = 0; i < count; i++) g.fillRect(Phaser.Math.Between(0, size - 1), Phaser.Math.Between(0, size - 1), 1, 1);
}

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  create() {
    const mkGround = (key, base, a, b) => makeTile(this, key, (g, s) => {
      g.fillStyle(base).fillRect(0, 0, s, s);
      dither(g, a, s, 100);
      dither(g, b, s, 45);
    });

    mkGround('tile_water_deep', 0x123763, 0x1f4f8f, 0x3b7ac6);
    mkGround('tile_water_shallow', 0x2f79c2, 0x56a4e8, 0xa6d9ff);
    mkGround('tile_sand', 0xe2cf97, 0xf0e2ba, 0xc1ab71);
    mkGround('tile_path', 0x8c6841, 0xa98458, 0x6f4f2f);
    mkGround('tile_grass_lush', 0x378f42, 0x5fbf5e, 0x2b6c30);
    mkGround('tile_grass_dark', 0x2a6d36, 0x469d4b, 0x1e5125);
    mkGround('tile_field_soil', 0x724f34, 0x8f6a47, 0x563a25);
    mkGround('tile_field_crop', 0x64482f, 0x71b255, 0x91d46d);

    const treeDefs = [
      ['oak', 0x2f7037, 0x5bad5f],
      ['pine', 0x205f2e, 0x3f8f49],
      ['palm', 0x5aa65f, 0x86d588],
      ['birch', 0x4f8d45, 0x7ac26c],
      ['willow', 0x3f7f43, 0x66b66f],
    ];

    treeDefs.forEach(([name, c1, c2], i) => {
      makeTile(this, `tile_tree_${name}`, (g, s) => {
        g.fillStyle(0x6d4c31).fillRect(14, 18, 4, 14);
        g.fillStyle(c1).fillRect(6, 5 + (i % 2), 20, 15);
        g.fillStyle(c2).fillRect(8, 3, 16, 8);
        dither(g, 0xa6ee9d, s, 20);
      });
    });

    const flowerColors = [0xd93a37,0xf15f3f,0xf3983a,0xf3d56e,0xaad45a,0x5fd064,0x49d39f,0x53cae3,0x4f86ea,0x6d62ee,0x9d73ff,0xc36ef3,0xe160ce,0xf65a90,0xffffff];
    flowerColors.forEach((color, idx) => {
      makeTile(this, `tile_flower_${idx + 1}`, (g, s) => {
        g.fillStyle(0x378f42).fillRect(0, 0, s, s);
        dither(g, 0x61be5f, s, 40);
        g.fillStyle(0x68af54).fillRect(15, 18, 2, 10);
        g.fillStyle(color).fillRect(13, 14, 2, 2).fillRect(17, 14, 2, 2).fillRect(15, 12, 2, 2).fillRect(15, 16, 2, 2);
        g.fillStyle(0xf5e8a8).fillRect(15, 14, 2, 2);
      });
    });

    for (let id = 1; id <= 45; id++) {
      makeTile(this, `tile_misc_${id}`, (g, s) => {
        g.fillStyle(0x378f42).fillRect(0, 0, s, s);
        dither(g, 0x5cb95c, s, 32);
        const t = id % 9;
        if (t <= 2) {
          g.fillStyle(0x6b8f40).fillRect(8, 16, 16, 10);
          g.fillStyle(0x8ab955).fillRect(12, 14, 8, 5);
        } else if (t <= 4) {
          g.fillStyle(0x788089).fillRect(9, 17, 14, 9);
          g.fillStyle(0x9ca3aa).fillRect(12, 19, 6, 3);
        } else if (t <= 6) {
          g.fillStyle(0x7a6750).fillRect(6, 14, 20, 11);
          g.fillStyle(0x9e8869).fillRect(10, 17, 8, 3);
        } else {
          g.fillStyle(0x89b451).fillRect(12, 12, 2, 14);
          g.fillStyle(0x98ca5a).fillRect(16, 10, 2, 16).fillRect(20, 14, 2, 12);
        }
      });
    }

    makeTile(this, 'tile_house', (g) => {
      g.fillStyle(0x8f5430).fillRect(4, 14, 24, 18);
      g.fillStyle(0xc9483a).fillRect(2, 6, 28, 8);
      g.fillStyle(0xf6dfa9).fillRect(14, 20, 4, 12);
      g.fillStyle(0x4f7cbf).fillRect(6, 18, 6, 6).fillRect(20, 18, 6, 6);
    });
    makeTile(this, 'tile_house_large', (g) => {
      g.fillStyle(0x87502d).fillRect(2, 12, 28, 20);
      g.fillStyle(0xa73a34).fillRect(0, 4, 32, 8);
      g.fillStyle(0xf6dfa9).fillRect(14, 18, 4, 14);
      g.fillStyle(0x4f7cbf).fillRect(4, 18, 7, 7).fillRect(21, 18, 7, 7);
    });
    makeTile(this, 'tile_tower', (g) => {
      g.fillStyle(0x8f98a1).fillRect(10, 5, 12, 27);
      g.fillStyle(0x6a7278).fillRect(8, 3, 16, 4);
      g.fillStyle(0x4f7cbf).fillRect(14, 18, 4, 14);
      dither(g, 0xb9c2ca, 32, 20);
    });
    makeTile(this, 'tile_portal', (g) => {
      g.fillStyle(0x3a2467).fillRect(8, 8, 16, 20);
      g.fillStyle(0x9569ff).fillRect(10, 10, 12, 16);
      g.fillStyle(0xdcc9ff).fillRect(14, 14, 4, 8);
    });
    makeTile(this, 'tile_foam', (g) => {
      g.fillStyle(0x2f79c2).fillRect(0, 0, 32, 32);
      g.fillStyle(0xdcf4ff).fillRect(8, 14, 6, 2).fillRect(18, 20, 6, 2).fillRect(4, 24, 4, 2);
    });

    makeTile(this, 'player', (g) => {
      g.fillStyle(0x2d3f89).fillRect(9, 4, 14, 10);
      g.fillStyle(0xf4d7b8).fillRect(10, 14, 12, 8);
      g.fillStyle(0x3b54c1).fillRect(8, 22, 16, 6);
      g.fillStyle(0x2d3f89).fillRect(8, 28, 6, 4).fillRect(18, 28, 6, 4);
      g.fillStyle(0x86c1ff).fillRect(12, 8, 2, 2).fillRect(18, 8, 2, 2);
    });

    const npc = (key, cloth, hair) => makeTile(this, key, (g) => {
      g.fillStyle(hair).fillRect(10, 4, 12, 8);
      g.fillStyle(0xf0cda9).fillRect(10, 12, 12, 8);
      g.fillStyle(cloth).fillRect(10, 20, 12, 8);
      g.fillStyle(0x3e2a21).fillRect(10, 28, 4, 4).fillRect(18, 28, 4, 4);
    });

    npc('npc_pink', 0xbd5da9, 0x4b2c2c);
    npc('npc_blue', 0x4a83d9, 0x2b2220);
    npc('npc_green', 0x5ea758, 0x433123);
    npc('npc_gold', 0xd1a645, 0x3a281f);

    this.scene.start('OverworldScene');
  }
}
