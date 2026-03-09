function noise(x, y, seed = 17) {
  const n = Math.sin((x * 127.1 + y * 311.7 + seed) * 0.13) * 43758.5453;
  return n - Math.floor(n);
}

function makeLayer(w, h, fill) {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => fill));
}

function carveEllipse(layer, cx, cy, rx, ry, tile) {
  const h = layer.length;
  const w = layer[0].length;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
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
    if (x < x1) x++;
    else if (x > x1) x--;
    if (y < y1) y++;
    else if (y > y1) y--;
  }
}

function decorate(map, seed) {
  const { ground, decor, collision, width, height } = map;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (ground[y][x] === 'grass') {
        const n = noise(x, y, seed);
        if (n > 0.84) {
          decor[y][x] = 'tree';
          collision[y][x] = 1;
        } else if (n > 0.79) {
          decor[y][x] = 'rock';
          collision[y][x] = 1;
        }
      }
      if (ground[y][x] === 'water' && noise(x, y, seed + 33) > 0.7) decor[y][x] = 'foam';
    }
  }
}

function buildMainland() {
  const width = 64;
  const height = 40;
  const map = { id: 'mainland', width, height, ground: makeLayer(width, height, 'water'), decor: makeLayer(width, height, null), collision: makeLayer(width, height, 0), npcs: [], portals: [] };

  carveEllipse(map.ground, 18, 20, 15, 11, 'grass');
  carveEllipse(map.ground, 38, 14, 12, 9, 'grass');
  carveEllipse(map.ground, 48, 28, 11, 8, 'grass');

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (map.ground[y][x] === 'grass') {
        const edge = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => map.ground[y + dy]?.[x + dx] === 'water');
        if (edge) map.ground[y][x] = 'sand';
      }
    }
  }

  path(map.ground, 14, 20, 39, 15);
  path(map.ground, 39, 15, 47, 28);

  [[16, 18], [20, 21], [41, 13], [44, 30]].forEach(([x, y], i) => {
    map.decor[y][x] = 'house';
    map.collision[y][x] = 1;
    if (map.collision[y + 1]) map.collision[y + 1][x] = 1;
    if (i === 0) map.npcs.push({ id: 'mira', name: 'Mira', x: x + 1, y: y + 2, palette: 'pink', dialog: ['Willkommen, Champion!', 'Bestehe Rennen, Ausweichen und Timing.'] });
  });

  map.npcs.push({ id: 'finn', name: 'Finn', x: 25, y: 20, palette: 'blue', dialog: ['Die Portale führen zu Prüfungsinseln.'] });

  map.portals.push({ x: 39, y: 15, targetMap: 'runIsland', tx: 10, ty: 30, label: 'Rennen' });
  map.portals.push({ x: 47, y: 28, targetMap: 'dodgeIsland', tx: 12, ty: 30, label: 'Ausweichen' });
  map.portals.push({ x: 18, y: 11, targetMap: 'timingIsland', tx: 8, ty: 30, label: 'Timing' });

  decorate(map, 11);
  return map;
}

function buildTrialIsland(id) {
  const width = 32;
  const height = 32;
  const map = { id, width, height, ground: makeLayer(width, height, 'water'), decor: makeLayer(width, height, null), collision: makeLayer(width, height, 0), npcs: [], portals: [] };
  carveEllipse(map.ground, 16, 16, 12, 11, 'grass');

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (map.ground[y][x] === 'grass') {
        const nearWater = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => map.ground[y + dy]?.[x + dx] === 'water');
        if (nearWater) map.ground[y][x] = 'sand';
      }
    }
  }

  map.portals.push({ x: 16, y: 26, targetMap: 'mainland', tx: 40, ty: 16, label: 'Zurück' });
  map.portals.push({ x: 16, y: 16, targetMinigame: id.replace('Island', ''), label: 'Start' });
  decorate(map, id.length * 7);
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
