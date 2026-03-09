import { TILE_SIZE } from '../config.js';

export class TileRenderer {
  constructor(scene) {
    this.scene = scene;
    this.colliders = scene.physics.add.staticGroup();
  }

  render(map) {
    const { scene } = this;
    const layer = scene.add.layer();
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const px = x * TILE_SIZE + TILE_SIZE / 2;
        const py = y * TILE_SIZE + TILE_SIZE / 2;
        layer.add(scene.add.image(px, py, `tile_${map.ground[y][x]}`));
        const d = map.decor[y][x];
        if (d) layer.add(scene.add.image(px, py, `tile_${d}`));

        if (map.collision[y][x]) {
          const b = scene.add.rectangle(px, py, TILE_SIZE, TILE_SIZE, 0x000000, 0);
          scene.physics.add.existing(b, true);
          this.colliders.add(b);
        }
      }
    }
    return layer;
  }
}
