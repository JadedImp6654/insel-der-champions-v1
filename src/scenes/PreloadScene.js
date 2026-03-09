import { TILE_SIZE } from '../config.js';

function makeTile(scene, key, draw) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  draw(g, TILE_SIZE);
  g.generateTexture(key, TILE_SIZE, TILE_SIZE);
  g.destroy();
}

function dither(g, c, size, count = 70) {
  g.fillStyle(c, 1);
  for (let i = 0; i < count; i++) g.fillRect(Phaser.Math.Between(0, size - 1), Phaser.Math.Between(0, size - 1), 1, 1);
}

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  create() {
    makeTile(this, 'tile_water_deep', (g, s) => {
      g.fillStyle(0x0b2f55).fillRect(0, 0, s, s);
      dither(g, 0x17487f, s, 160);
      dither(g, 0x2a6db2, s, 55);
    });
    makeTile(this, 'tile_water_shallow', (g, s) => {
      g.fillStyle(0x2d72b8).fillRect(0, 0, s, s);
      dither(g, 0x56a3e7, s, 140);
      dither(g, 0xaad9ff, s, 40);
    });
    makeTile(this, 'tile_sand', (g, s) => {
      g.fillStyle(0xe4ce95).fillRect(0, 0, s, s);
      dither(g, 0xf4e7be, s, 130);
      dither(g, 0xc9ae6b, s, 90);
    });
    makeTile(this, 'tile_path', (g, s) => {
      g.fillStyle(0x8f6640).fillRect(0, 0, s, s);
      dither(g, 0x6a492c, s, 110);
      dither(g, 0xac7f4f, s, 50);
    });
    makeTile(this, 'tile_grass_lush', (g, s) => {
      g.fillStyle(0x3f9442).fillRect(0, 0, s, s);
      dither(g, 0x67be57, s, 170);
      dither(g, 0x2d6d2f, s, 110);
    });
    makeTile(this, 'tile_grass_dark', (g, s) => {
      g.fillStyle(0x2f7438).fillRect(0, 0, s, s);
      dither(g, 0x4fa44d, s, 130);
      dither(g, 0x1d4c25, s, 100);
    });
    makeTile(this, 'tile_field_soil', (g, s) => {
      g.fillStyle(0x715136).fillRect(0, 0, s, s);
      g.fillStyle(0x5c4028);
      for (let y = 3; y < s; y += 6) g.fillRect(0, y, s, 2);
      dither(g, 0x8e6d49, s, 70);
    });
    makeTile(this, 'tile_field_crop', (g, s) => {
      g.fillStyle(0x6e4f31).fillRect(0, 0, s, s);
      g.fillStyle(0x66b94f);
      for (let x = 2; x < s; x += 6) g.fillRect(x, 0, 3, s);
      dither(g, 0x88d068, s, 100);
    });

    for (let i = 1; i <= 16; i++) {
      makeTile(this, `tile_tree_${i}`, (g, s) => {
        const a = Phaser.Display.Color.HSLToColor((0.22 + i * 0.013) % 1, 0.45, 0.26).color;
        const b = Phaser.Display.Color.HSLToColor((0.28 + i * 0.012) % 1, 0.5, 0.41).color;
        g.fillStyle(0x6b4a2e).fillRect(s / 2 - 2, s - 12, 4, 12);
        g.fillStyle(a).fillRect(4 + (i % 3), 7 + (i % 2), s - 10, s - 19);
        g.fillStyle(b).fillRect(7, 3, s - 14, 10);
        dither(g, 0xa8ef9d, s, 24);
      });
    }

    for (let i = 1; i <= 50; i++) {
      makeTile(this, `tile_flower_${i}`, (g, s) => {
        const hue = (i * 0.052) % 1;
        const petal = Phaser.Display.Color.HSLToColor(hue, 0.75, 0.58).color;
        g.fillStyle(0x3f9442).fillRect(0, 0, s, s);
        dither(g, 0x67be57, s, 84);
        g.fillStyle(0x5aa84e).fillRect(s / 2 - 1, s - 12, 2, 10);
        g.fillStyle(petal)
          .fillRect(s / 2 - 4, s - 18, 3, 3)
          .fillRect(s / 2 + 1, s - 18, 3, 3)
          .fillRect(s / 2 - 1, s - 21, 3, 3)
          .fillRect(s / 2 - 1, s - 15, 3, 3);
        g.fillStyle(0xf5e8a6).fillRect(s / 2, s - 18, 1, 1);
      });
    }

    for (let i = 1; i <= 120; i++) {
      makeTile(this, `tile_misc_${i}`, (g, s) => {
        g.fillStyle(0x3f9442).fillRect(0, 0, s, s);
        dither(g, 0x67be57, s, 65);
        const t = i % 8;
        if (t <= 1) {
          g.fillStyle(0x7f8890).fillRect(8, s - 14, s - 16, 10);
          g.fillStyle(0xa7afb5).fillRect(12, s - 12, 8, 4);
        } else if (t <= 3) {
          g.fillStyle(0x7f6c56).fillRect(5, s - 18, s - 10, 13);
          g.fillStyle(0xa08b73).fillRect(12, s - 14, 8, 4);
        } else if (t <= 5) {
          g.fillStyle(0x8eb34f);
          for (let x = 9; x < s - 7; x += 5) g.fillRect(x, s - 18, 2, 14);
        } else {
          g.fillStyle(0x3f7c33).fillRect(10, s - 16, s - 20, 10);
          dither(g, 0x67ae56, s, 25);
        }
      });
    }

    makeTile(this, 'tile_house', (g, s) => {
      g.fillStyle(0x925632).fillRect(4, s - 15, s - 8, 15);
      g.fillStyle(0xca483b).fillRect(2, s - 25, s - 4, 11);
      g.fillStyle(0xf6dfa9).fillRect(s / 2 - 2, s - 11, 4, 11);
      g.fillStyle(0x4f7cbf).fillRect(6, s - 11, 6, 6).fillRect(s - 12, s - 11, 6, 6);
    });
    makeTile(this, 'tile_house_large', (g, s) => {
      g.fillStyle(0x8a4f2b).fillRect(2, s - 17, s - 4, 17);
      g.fillStyle(0xa53732).fillRect(0, s - 28, s, 12);
      g.fillStyle(0xf6dfa9).fillRect(s / 2 - 2, s - 12, 4, 12);
      g.fillStyle(0x4f7cbf).fillRect(6, s - 12, 6, 6).fillRect(s - 12, s - 12, 6, 6);
    });
    makeTile(this, 'tile_tower', (g, s) => {
      g.fillStyle(0x8f98a1).fillRect(s / 2 - 7, 5, 14, s - 5);
      g.fillStyle(0x6a7278).fillRect(s / 2 - 9, 2, 18, 4);
      g.fillStyle(0x4f7cbf).fillRect(s / 2 - 2, s - 14, 4, 14);
      dither(g, 0xb4bdc5, s, 20);
    });
    makeTile(this, 'tile_portal', (g, s) => {
      g.fillStyle(0x40286e).fillRect(s / 2 - 8, s - 23, 16, 20);
      g.fillStyle(0x9d74ff).fillRect(s / 2 - 6, s - 21, 12, 16);
      g.fillStyle(0xd8c5ff).fillRect(s / 2 - 2, s - 16, 4, 8);
    });
    makeTile(this, 'tile_foam', (g, s) => {
      g.fillStyle(0x2a6eb5).fillRect(0, 0, s, s);
      g.fillStyle(0xd8f4ff).fillRect(8, 14, 6, 2).fillRect(18, 20, 6, 2).fillRect(4, 24, 5, 2);
    });

    makeTile(this, 'player', (g, s) => {
      g.fillStyle(0x2d3f89).fillRect(s / 2 - 8, 4, 16, 10);
      g.fillStyle(0xf4d7b8).fillRect(s / 2 - 6, 14, 12, 8);
      g.fillStyle(0x3b54c1).fillRect(s / 2 - 8, 22, 16, 6);
      g.fillStyle(0x2d3f89).fillRect(s / 2 - 8, 28, 6, 4).fillRect(s / 2 + 2, 28, 6, 4);
      g.fillStyle(0x86c1ff).fillRect(s / 2 - 4, 8, 2, 2).fillRect(s / 2 + 2, 8, 2, 2);
    });

    const npc = (key, cloth, hair) => makeTile(this, key, (g, s) => {
      g.fillStyle(hair).fillRect(s / 2 - 6, 4, 12, 8);
      g.fillStyle(0xf0cda9).fillRect(s / 2 - 6, 12, 12, 8);
      g.fillStyle(cloth).fillRect(s / 2 - 6, 20, 12, 8);
      g.fillStyle(0x3e2a21).fillRect(s / 2 - 6, 28, 4, 4).fillRect(s / 2 + 2, 28, 4, 4);
    });
    npc('npc_pink', 0xbd5da9, 0x4b2c2c);
    npc('npc_blue', 0x4a83d9, 0x2b2220);
    npc('npc_green', 0x5ea758, 0x433123);
    npc('npc_gold', 0xd1a645, 0x3a281f);

    this.scene.start('OverworldScene');
  }
}
