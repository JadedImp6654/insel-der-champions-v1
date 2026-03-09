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

function applyShore(map) {
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (!map.ground[y]?.[x]?.startsWith('grass') && map.ground[y][x] !== 'field_crop' && map.ground[y][x] !== 'field_soil') continue;
      if ([[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => map.ground[y + dy]?.[x + dx] === 'water_deep')) map.ground[y][x] = 'sand';
    }
  }
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (map.ground[y][x] !== 'water_deep') continue;
      const nearLand = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => {
        const t = map.ground[y + dy]?.[x + dx];
        return t && t !== 'water_deep' && t !== 'water_shallow';
      });
      if (nearLand) map.ground[y][x] = 'water_shallow';
    }
  }
}

function decorateNature(map, seed = 8) {
  for (let y = 1; y < map.height - 1; y++) {
    for (let x = 1; x < map.width - 1; x++) {
      const tile = map.ground[y][x];
      const n = noise(x, y, seed);
      const n2 = noise(x, y, seed + 13);
      if (tile === 'grass_lush' || tile === 'grass_dark') {
        if (n > 0.95) {
          const trees = ['tree_oak', 'tree_pine', 'tree_palm', 'tree_birch', 'tree_willow'];
          map.decor[y][x] = trees[Math.floor(n2 * trees.length)];
          map.collision[y][x] = 1;
        } else if (n > 0.84) {
          map.decor[y][x] = `flower_${1 + Math.floor(n2 * 15)}`;
        } else if (n > 0.64) {
          const miscId = 1 + Math.floor(n2 * 45);
          map.decor[y][x] = `misc_${miscId}`;
          if (miscId % 3 === 0 || miscId % 5 === 0) map.collision[y][x] = 1;
        }
      }
      if ((tile === 'water_shallow' || tile === 'sand') && n > 0.96) map.decor[y][x] = 'foam';
    }
  }
}

function addHouse(map, x, y, large, name) {
  map.decor[y][x] = large ? 'house_large' : 'house';
  map.collision[y][x] = 1;
  map.interactives.push({ id: `house_${x}_${y}`, kind: 'house', x: x + 1, y: y + 1, dialog: [name, 'Hier bekommst du Hinweise, kleine Quests und Geschichten.'] });
}

function buildMainland() {
  const width = 170;
  const height = 110;
  const map = { id: 'mainland', width, height, ground: makeLayer(width, height, 'water_deep'), decor: makeLayer(width, height, null), collision: makeLayer(width, height, 0), npcs: [], portals: [], interactives: [] };

  carveEllipse(map.ground, 30, 58, 28, 22, 'grass_lush');
  carveEllipse(map.ground, 68, 50, 34, 25, 'grass_lush');
  carveEllipse(map.ground, 110, 47, 31, 24, 'grass_dark');
  carveEllipse(map.ground, 116, 80, 28, 20, 'grass_lush');
  carveEllipse(map.ground, 148, 62, 16, 13, 'grass_dark');

  path(map.ground, 18, 60, 46, 53);
  path(map.ground, 46, 53, 76, 49);
  path(map.ground, 76, 49, 110, 49);
  path(map.ground, 76, 49, 117, 79);
  path(map.ground, 110, 49, 145, 62);

  for (let y = 66; y < 84; y++) for (let x = 56; x < 84; x++) map.ground[y][x] = (x + y) % 2 ? 'field_crop' : 'field_soil';

  const houses = [
    [20, 56, false, 'Miras Haus'], [26, 60, false, 'Bäckerei'], [33, 56, true, 'Große Halle'],
    [42, 61, false, 'Werkhaus'], [87, 46, false, 'Schmiede'], [95, 52, false, 'Gärtnerhaus'],
    [102, 46, true, 'Lehrhaus'], [118, 79, true, 'Akademie'], [126, 84, false, 'Hafenhütte'],
    [137, 63, false, 'Leuchthaus'], [144, 66, false, 'Archiv'], [149, 60, true, 'Ratshaus'],
  ];
  houses.forEach((h) => addHouse(map, ...h));

  [[92, 30], [132, 57], [61, 41]].forEach(([x, y], i) => {
    map.decor[y][x] = 'tower';
    map.collision[y][x] = 1;
    map.interactives.push({ id: `tower_${i}`, kind: 'landmark', x: x + 1, y: y + 1, dialog: ['Wachturm', 'Ein uralter Turm mit Gravuren über Champions.'] });
  });

  map.npcs.push({ id: 'mira', name: 'Mira', x: 23, y: 60, palette: 'pink', dialog: ['Willkommen!', 'Sprich mit Häusern und Leuten für Quests.'], questId: 'q1' });
  map.npcs.push({ id: 'finn', name: 'Finn', x: 62, y: 76, palette: 'green', dialog: ['Die Felder sind dieses Jahr besonders fruchtbar.'], questId: 'q4' });
  map.npcs.push({ id: 'leon', name: 'Leon', x: 99, y: 48, palette: 'blue', dialog: ['Such nach den versteckten Symbolen.'], questId: 'q7' });
  map.npcs.push({ id: 'sora', name: 'Sora', x: 121, y: 82, palette: 'gold', dialog: ['Nebenquests bringen seltene Hinweise.'], questId: 'q10' });
  map.npcs.push({ id: 'nala', name: 'Nala', x: 141, y: 64, palette: 'pink', dialog: ['Im Norden gibt es ein geheimes Blumenfeld.'], questId: 'q12' });
  map.npcs.push({ id: 'taro', name: 'Taro', x: 89, y: 33, palette: 'blue', dialog: ['Teste alle drei Prüfungen für den Championtitel.'], questId: 'q14' });

  map.decor[49][110] = 'portal';
  map.decor[79][117] = 'portal';
  map.decor[62][145] = 'portal';
  map.portals.push({ x: 110, y: 49, targetMap: 'runIsland', tx: 32, ty: 52, label: 'Rennen' });
  map.portals.push({ x: 117, y: 79, targetMap: 'dodgeIsland', tx: 32, ty: 52, label: 'Ausweichen' });
  map.portals.push({ x: 145, y: 62, targetMap: 'timingIsland', tx: 32, ty: 52, label: 'Timing' });

  ['easter_1','easter_2','easter_3','easter_4','easter_5'].forEach((id, i) => {
    const pos = [[54,40],[132,68],[80,30],[151,55],[106,88]][i];
    map.interactives.push({ id, kind: 'easteregg', x: pos[0], y: pos[1], dialog: [`Easter Egg ${i + 1}`, 'Du hast ein verborgenes Geheimnis entdeckt!'] });
  });

  applyShore(map);
  decorateNature(map, 27);
  return map;
}

function buildTrialIsland(id) {
  const width = 70;
  const height = 70;
  const map = { id, width, height, ground: makeLayer(width, height, 'water_deep'), decor: makeLayer(width, height, null), collision: makeLayer(width, height, 0), npcs: [], portals: [], interactives: [] };
  carveEllipse(map.ground, 35, 38, 26, 22, 'grass_lush');
  carveEllipse(map.ground, 21, 26, 11, 9, 'grass_dark');
  carveEllipse(map.ground, 47, 25, 10, 9, 'grass_lush');
  path(map.ground, 35, 54, 35, 34);
  map.decor[34][35] = 'portal';
  map.decor[54][35] = 'portal';
  map.portals.push({ x: 35, y: 54, targetMap: 'mainland', tx: 110, ty: 49, label: 'Zurück' });
  map.portals.push({ x: 35, y: 34, targetMinigame: id.replace('Island', ''), label: 'Start' });
  map.interactives.push({ id: `${id}_hint`, kind: 'hint', x: 28, y: 32, dialog: ['Tipp', 'Bleib ruhig, lies den Ablauf und reagiere präzise.'] });
  applyShore(map);
  decorateNature(map, id.length * 11);
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
