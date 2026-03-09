function makeTile(scene, key, draw) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  draw(g);
  g.generateTexture(key, 16, 16);
  g.destroy();
}

function px(g, x, y, c) {
  g.fillStyle(c, 1).fillRect(x, y, 1, 1);
}

function dither(g, c, count = 20) {
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
      dither(g, 0x1f508d, 24);
      dither(g, 0x2f78c2, 8);
    });
    makeTile(this, 'tile_water_shallow', (g) => {
      g.fillStyle(0x2a6eb5).fillRect(0, 0, 16, 16);
      dither(g, 0x57a1e5, 22);
      dither(g, 0xa2d6ff, 8);
    });
    makeTile(this, 'tile_sand', (g) => {
      g.fillStyle(0xe3cf94).fillRect(0, 0, 16, 16);
      dither(g, 0xf4e6bc, 24);
      dither(g, 0xc7b074, 14);
    });
    makeTile(this, 'tile_path', (g) => {
      g.fillStyle(0x8b6640).fillRect(0, 0, 16, 16);
      dither(g, 0x6b4a2e, 18);
      dither(g, 0xa27b51, 10);
    });
    makeTile(this, 'tile_grass_lush', (g) => {
      g.fillStyle(0x3a8e3d).fillRect(0, 0, 16, 16);
      dither(g, 0x67be57, 28);
      dither(g, 0x2c6c2b, 16);
    });
    makeTile(this, 'tile_grass_dark', (g) => {
      g.fillStyle(0x2d6f35).fillRect(0, 0, 16, 16);
      dither(g, 0x4f9d47, 20);
      dither(g, 0x1f5124, 16);
    });
    makeTile(this, 'tile_field_soil', (g) => {
      g.fillStyle(0x725134).fillRect(0, 0, 16, 16);
      g.fillStyle(0x5a3c25);
      for (let y = 1; y < 16; y += 3) g.fillRect(0, y, 16, 1);
      dither(g, 0x8a6947, 12);
    });
    makeTile(this, 'tile_field_crop', (g) => {
      g.fillStyle(0x725134).fillRect(0, 0, 16, 16);
      g.fillStyle(0x56a147);
      for (let x = 1; x < 16; x += 4) g.fillRect(x, 0, 2, 16);
      dither(g, 0x7ac85f, 12);
    });

    // 5 Baumarten
    const treeStyles = [
      ['oak', 0x2d6f35, 0x4f9d47],
      ['pine', 0x1f5f2d, 0x3f8f45],
      ['palm', 0x5ca45f, 0x84d27f],
      ['birch', 0x4d8b43, 0x78bf6d],
      ['willow', 0x387c3f, 0x62b56a],
    ];
    treeStyles.forEach(([name, c1, c2], i) => {
      makeTile(this, `tile_tree_${name}`, (g) => {
        g.fillStyle(0x6a4a2f).fillRect(7, 10, 2, 6);
        g.fillStyle(c1).fillRect(3, 3 + (i % 2), 10, 8);
        g.fillStyle(c2).fillRect(4, 2, 8, 4);
        dither(g, 0x9ce88d, 4);
      });
    });

    // 15 Blumensorten
    const flowerColors = [0xc7322f,0xf15b3d,0xf08b2d,0xf1d76c,0x9dd050,0x52c95f,0x3fcf9e,0x4fc9df,0x4a7de2,0x6f5ced,0x9d6eff,0xc46af1,0xdf5bc9,0xf34f8a,0xffffff];
    flowerColors.forEach((color, idx) => {
      makeTile(this, `tile_flower_${idx+1}`, (g) => {
        g.fillStyle(0x3a8e3d).fillRect(0, 0, 16, 16);
        dither(g, 0x67be57, 18);
        px(g, 7, 11, 0x4f8b3a);
        px(g, 7, 10, 0x5ca849);
        px(g, 7, 9, 0x6ec75d);
        g.fillStyle(color).fillRect(6, 8, 1, 1).fillRect(8, 8, 1, 1).fillRect(7, 7, 1, 1).fillRect(7, 9, 1, 1);
        px(g, 7, 8, 0xf5e8a6);
      });
    });

    // 45 sonstige Elemente
    const miscDefs = Array.from({ length: 45 }, (_, i) => i + 1);
    miscDefs.forEach((id) => {
      makeTile(this, `tile_misc_${id}`, (g) => {
        g.fillStyle(0x3a8e3d).fillRect(0, 0, 16, 16);
        dither(g, 0x67be57, 14);
        const t = id % 5;
        if (t === 0) {
          g.fillStyle(0x6c8f3f).fillRect(4, 8, 8, 5); // shrub
          g.fillStyle(0x7faf49).fillRect(6, 6, 4, 3);
        } else if (t === 1) {
          g.fillStyle(0x7f8790).fillRect(4, 8, 8, 5); // stone
          g.fillStyle(0xa0a8b0).fillRect(6, 9, 3, 2);
        } else if (t === 2) {
          g.fillStyle(0x7e6a52).fillRect(2, 6, 12, 7); // boulder
          g.fillStyle(0x9d8669).fillRect(4, 8, 4, 2);
        } else if (t === 3) {
          g.fillStyle(0x84b04e).fillRect(5, 6, 1, 8); // reeds/plant
          g.fillStyle(0x95c85b).fillRect(7, 5, 1, 9).fillRect(9, 7, 1, 7);
        } else {
          g.fillStyle(0x3f7c33).fillRect(5, 7, 6, 6); // bushy
          dither(g, 0x5ea748, 8);
        }
      });
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
