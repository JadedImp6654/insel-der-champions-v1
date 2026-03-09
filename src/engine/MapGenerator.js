function noise(x, y, seed = 1) {
  const n = Math.sin((x * 157.31 + y * 311.7 + seed * 17.73) * 0.047) * 43758.5453;
  return n - Math.floor(n);
}

function makeLayer(w, h, fill) {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => fill));
}

function carveEllipse(layer, cx, cy, rx, ry, tile) {
  for (let y = 0; y < layer.length; y++) {
    for (let x = 0; x < layer[0].length; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) layer[y][x] = tile;
    }
  }
}

function path(layer, x0, y0, x1, y1, tile = 'path') {
  let x = x0;
  let y = y0;
  while (x !== x1 || y !== y1) {
    layer[y][x] = tile;
    if (x < x1) x++; else if (x > x1) x--;
    if (y < y1) y++; else if (y > y1) y--;
    if (layer[y]) layer[y][x] = tile;
  }
}

function decorateNature(map, seed = 8) {
  for (let y = 1; y < map.height - 1; y++) {
    for (let x = 1; x < map.width - 1; x++) {
      const tile = map.ground[y][x];
      const n = noise(x, y, seed);
      const n2 = noise(x, y, seed + 13);

      if (tile === 'grass_lush' || tile === 'grass_dark') {
        if (n > 0.92) {
          map.decor[y][x] = n2 > 0.5 ? 'tree_oak' : 'tree_pine';
          map.collision[y][x] = 1;
        } else if (n > 0.88) {
          map.decor[y][x] = 'tree_palm';
          map.collision[y][x] = 1;
        } else if (n > 0.84) {
          map.decor[y][x] = 'bush';
          map.collision[y][x] = 1;
        } else if (n > 0.81) {
          map.decor[y][x] = n2 > 0.4 ? 'flower_red' : 'flower_blue';
        } else if (n > 0.78) {
          map.decor[y][x] = n2 > 0.5 ? 'rock_small' : 'rock_big';
          map.collision[y][x] = 1;
        }
      }

      if ((tile === 'water_shallow' || tile === 'sand') && n > 0.93) map.decor[y][x] = 'reed';
      if ((tile === 'water_deep' || tile === 'water_shallow') && n > 0.95) map.decor[y][x] = 'foam';
    }
  }
}

function applyShore(map) {
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (!map.ground[y]?.[x]?.startsWith('grass') && map.ground[y][x] !== 'field_crop' && map.ground[y][x] !== 'field_soil') continue;
      const nearDeep = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => map.ground[y + dy]?.[x + dx] === 'water_deep');
      if (nearDeep) map.ground[y][x] = 'sand';
    }
  }

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (map.ground[y][x] === 'water_deep') {
        const nearLand = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => {
          const t = map.ground[y + dy]?.[x + dx];
          return t && t !== 'water_deep' && t !== 'water_shallow';
        });
        if (nearLand) map.ground[y][x] = 'water_shallow';
      }
    }
  }
}

function placeVillage(map, x, y) {
  const houses = [[x, y], [x + 4, y + 3], [x + 8, y], [x + 12, y + 3], [x + 16, y]];
  houses.forEach(([hx, hy], i) => {
    map.decor[hy][hx] = i === 2 ? 'house_large' : 'house';
    map.collision[hy][hx] = 1;
  });
}

function buildMainland() {
  const width = 120;
  const height = 84;
  const map = {
    id: 'mainland', width, height,
    ground: makeLayer(width, height, 'water_deep'),
    decor: makeLayer(width, height, null),
    collision: makeLayer(width, height, 0),
    npcs: [], portals: [],
  };

  carveEllipse(map.ground, 26, 43, 22, 18, 'grass_lush');
  carveEllipse(map.ground, 52, 35, 24, 20, 'grass_lush');
  carveEllipse(map.ground, 83, 28, 22, 17, 'grass_dark');
  carveEllipse(map.ground, 86, 58, 19, 14, 'grass_lush');
  carveEllipse(map.ground, 104, 43, 13, 11, 'grass_dark');

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (map.ground[y][x].startsWith('grass') && noise(x, y, 77) > 0.65) map.ground[y][x] = 'grass_dark';
    }
  }

  path(map.ground, 18, 45, 40, 41, 'path');
  path(map.ground, 40, 41, 64, 34, 'path');
  path(map.ground, 64, 34, 86, 35, 'path');
  path(map.ground, 64, 34, 86, 56, 'path');
  path(map.ground, 86, 35, 103, 44, 'path');

  for (let y = 52; y < 62; y++) {
    for (let x = 49; x < 63; x++) {
      map.ground[y][x] = (x + y) % 2 === 0 ? 'field_crop' : 'field_soil';
    }
  }

  for (let y = 22; y < 29; y++) {
    for (let x = 74; x < 88; x++) {
      map.ground[y][x] = 'rock_ground';
    }
  }

  placeVillage(map, 20, 40);
  placeVillage(map, 72, 31);
  map.decor[95 % height][105] = 'tower';
  map.collision[95 % height][105] = 1;

  map.npcs.push({ id: 'mira', name: 'Mira', x: 24, y: 45, palette: 'pink', dialog: ['Willkommen auf der großen Insel!', 'Erkunde alle Prüfungsinseln und komm zurück.'] });
  map.npcs.push({ id: 'finn', name: 'Finn', x: 56, y: 53, palette: 'green', dialog: ['Diese Felder versorgen das ganze Dorf.'] });
  map.npcs.push({ id: 'leon', name: 'Leon', x: 82, y: 35, palette: 'blue', dialog: ['Im Nordosten liegen uralte Steinpfade.'] });
  map.npcs.push({ id: 'sora', name: 'Sora', x: 102, y: 45, palette: 'gold', dialog: ['Die Portale wurden erneuert und glänzen stärker denn je.'] });

  map.decor[34][86] = 'portal';
  map.decor[58][87] = 'portal';
  map.decor[46][34] = 'portal';

  map.portals.push({ x: 86, y: 34, targetMap: 'runIsland', tx: 16, ty: 46, label: 'Rennen' });
  map.portals.push({ x: 87, y: 58, targetMap: 'dodgeIsland', tx: 16, ty: 46, label: 'Ausweichen' });
  map.portals.push({ x: 34, y: 46, targetMap: 'timingIsland', tx: 16, ty: 46, label: 'Timing' });

  applyShore(map);
  decorateNature(map, 21);
  return map;
}

function buildTrialIsland(id) {
  const width = 56;
  const height = 56;
  const map = { id, width, height, ground: makeLayer(width, height, 'water_deep'), decor: makeLayer(width, height, null), collision: makeLayer(width, height, 0), npcs: [], portals: [] };

  carveEllipse(map.ground, 28, 30, 22, 18, 'grass_lush');
  carveEllipse(map.ground, 18, 21, 10, 8, 'grass_dark');
  carveEllipse(map.ground, 38, 18, 8, 7, 'grass_lush');

  path(map.ground, 28, 46, 28, 28, 'path');
  path(map.ground, 28, 28, 36, 22, 'path');

  for (let y = 24; y < 30; y++) {
    for (let x = 10; x < 18; x++) map.ground[y][x] = 'field_crop';
  }

  map.decor[28][28] = 'portal';
  map.decor[46][28] = 'portal';
  map.portals.push({ x: 28, y: 46, targetMap: 'mainland', tx: 84, ty: 34, label: 'Zurück' });
  map.portals.push({ x: 28, y: 28, targetMinigame: id.replace('Island', ''), label: 'Start' });

  applyShore(map);
  decorateNature(map, id.length * 9);
  return map;
}

export class MapGenerator {
  static getMaps() {
    return {
      mainland: buildMainland(),
      runIsland: buildTrialIsland('runIsland'),
      dodgeIsland: buildTrialIsland('dodgeIsland'),
      timingIsland: buildTrialIsland('timingIsland'),
    };
  }
}
