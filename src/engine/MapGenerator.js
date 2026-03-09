const TREE_NAMES = ['oak','pine','palm','birch','willow','cedar','maple','spruce','cypress','ash','elm','poplar','juniper','baobab','cherry','acacia'];

function noise(x, y, seed = 1) {
  const n = Math.sin((x * 157.31 + y * 311.7 + seed * 17.73) * 0.047) * 43758.5453;
  return n - Math.floor(n);
}

function makeLayer(w, h, fill) { return Array.from({ length: h }, () => Array.from({ length: w }, () => fill)); }
function carveEllipse(layer, cx, cy, rx, ry, tile) {
  for (let y = 0; y < layer.length; y++) for (let x = 0; x < layer[0].length; x++) {
    const dx = (x - cx) / rx, dy = (y - cy) / ry;
    if (dx * dx + dy * dy <= 1) layer[y][x] = tile;
  }
}
function path(layer, x0, y0, x1, y1, tile = 'path') {
  let x = x0, y = y0;
  while (x !== x1 || y !== y1) {
    layer[y][x] = tile;
    if (x < x1) x++; else if (x > x1) x--;
    if (y < y1) y++; else if (y > y1) y--;
    if (layer[y]) layer[y][x] = tile;
  }
}

function applyShore(map) {
  for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) {
    if (!map.ground[y]?.[x]?.startsWith('grass') && map.ground[y][x] !== 'field_crop' && map.ground[y][x] !== 'field_soil') continue;
    if ([[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => map.ground[y + dy]?.[x + dx] === 'water_deep')) map.ground[y][x] = 'sand';
  }
  for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) {
    if (map.ground[y][x] !== 'water_deep') continue;
    const nearLand = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => {
      const t = map.ground[y + dy]?.[x + dx];
      return t && t !== 'water_deep' && t !== 'water_shallow';
    });
    if (nearLand) map.ground[y][x] = 'water_shallow';
  }
}

function decorateNature(map, seed = 8) {
  for (let y = 1; y < map.height - 1; y++) for (let x = 1; x < map.width - 1; x++) {
    const tile = map.ground[y][x];
    const n = noise(x, y, seed);
    const n2 = noise(x, y, seed + 13);
    if (tile === 'grass_lush' || tile === 'grass_dark') {
      if (n > 0.95) {
        map.decor[y][x] = `tree_${TREE_NAMES[Math.floor(n2 * TREE_NAMES.length)]}`;
        map.collision[y][x] = 1;
      } else if (n > 0.83) {
        map.decor[y][x] = `flower_${1 + Math.floor(n2 * 50)}`;
      } else if (n > 0.66) {
        const misc = 1 + Math.floor(n2 * 120);
        map.decor[y][x] = `misc_${misc}`;
        if (misc % 3 !== 0) map.collision[y][x] = 1;
      }
    }
    if ((tile === 'water_shallow' || tile === 'sand') && n > 0.95) map.decor[y][x] = 'foam';
  }
}

function addHouse(map, x, y, large = false, name = 'Haus') {
  map.decor[y][x] = large ? 'house_large' : 'house';
  map.collision[y][x] = 1;
  map.interactives.push({ id: `house_${x}_${y}`, kind: 'house', x: x + 1, y: y + 1, dialog: [`${name}`, 'Bewohner geben Tipps, Quests und Geschichten.'] });
}

function buildMainland() {
  const width = 170; const height = 110;
  const map = { id: 'mainland', width, height, ground: makeLayer(width, height, 'water_deep'), decor: makeLayer(width, height, null), collision: makeLayer(width, height, 0), npcs: [], portals: [], interactives: [] };

  carveEllipse(map.ground, 34, 58, 32, 24, 'grass_lush');
  carveEllipse(map.ground, 75, 47, 34, 28, 'grass_lush');
  carveEllipse(map.ground, 118, 43, 30, 24, 'grass_dark');
  carveEllipse(map.ground, 122, 80, 28, 20, 'grass_lush');
  carveEllipse(map.ground, 152, 63, 16, 13, 'grass_dark');

  path(map.ground, 20, 60, 50, 54); path(map.ground, 50, 54, 80, 47); path(map.ground, 80, 47, 118, 44); path(map.ground, 80, 47, 120, 80); path(map.ground, 118, 44, 150, 62);

  for (let y = 66; y < 84; y++) for (let x = 60; x < 88; x++) map.ground[y][x] = (x + y) % 2 ? 'field_crop' : 'field_soil';

  addHouse(map, 22, 53, false, 'Miras Haus'); addHouse(map, 28, 58, false, 'Fischerhütte'); addHouse(map, 35, 53, true, 'Dorfhalle'); addHouse(map, 92, 41, false, 'Werkstatt'); addHouse(map, 100, 46, false, 'Gartenhaus'); addHouse(map, 126, 79, true, 'Akademie');
  map.decor[28][96] = 'tower'; map.collision[28][96] = 1;

  map.npcs.push({ id: 'mira', name: 'Mira', x: 24, y: 57, palette: 'pink', dialog: ['Willkommen Champion!', 'Öffne Questlog (Q) oder Karte (M).'], questId: 'q1' });
  map.npcs.push({ id: 'finn', name: 'Finn', x: 70, y: 74, palette: 'green', dialog: ['Neue Pflanzenzonen sind erforschbar!'], questId: 'q4' });
  map.npcs.push({ id: 'leon', name: 'Leon', x: 104, y: 44, palette: 'blue', dialog: ['Teste Portale und Minigames für Belohnungen.'], questId: 'q7' });
  map.npcs.push({ id: 'sora', name: 'Sora', x: 128, y: 80, palette: 'gold', dialog: ['Viele Sidequests sind jetzt interaktiv.'], questId: 'q10' });

  map.interactives.push({ id: 'tower', kind: 'landmark', x: 96, y: 28, dialog: ['Wachturm-Relikt entdeckt.', 'Geheime Chronik freigeschaltet!'] });
  for (let i = 0; i < 16; i++) map.interactives.push({ id: `poi_${i}`, kind: 'poi', x: 30 + i * 8, y: 38 + (i % 5) * 8, dialog: [`Interaktiver Punkt ${i + 1}`, 'Du hast etwas Interessantes untersucht.'] });
  map.interactives.push({ id: 'easter_1', kind: 'easteregg', x: 52, y: 36, dialog: ['Easter Egg #1: Muschelstein gefunden!'] });
  map.interactives.push({ id: 'easter_2', kind: 'easteregg', x: 136, y: 66, dialog: ['Easter Egg #2: Geheimschrift im Sand.'] });
  map.interactives.push({ id: 'easter_3', kind: 'easteregg', x: 84, y: 30, dialog: ['Easter Egg #3: Emblem der Champions.'] });

  map.decor[44][118] = 'portal'; map.decor[80][120] = 'portal'; map.decor[62][150] = 'portal';
  map.portals.push({ x: 118, y: 44, targetMap: 'runIsland', tx: 32, ty: 48, label: 'Rennen' });
  map.portals.push({ x: 120, y: 80, targetMap: 'dodgeIsland', tx: 32, ty: 48, label: 'Ausweichen' });
  map.portals.push({ x: 150, y: 62, targetMap: 'timingIsland', tx: 32, ty: 48, label: 'Timing' });

  applyShore(map); decorateNature(map, 31); return map;
}

function buildTrialIsland(id) {
  const width = 70, height = 70;
  const map = { id, width, height, ground: makeLayer(width, height, 'water_deep'), decor: makeLayer(width, height, null), collision: makeLayer(width, height, 0), npcs: [], portals: [], interactives: [] };
  carveEllipse(map.ground, 35, 38, 26, 22, 'grass_lush'); carveEllipse(map.ground, 21, 27, 12, 9, 'grass_dark'); carveEllipse(map.ground, 47, 24, 10, 8, 'grass_lush');
  path(map.ground, 35, 52, 35, 34, 'path');
  map.decor[34][35] = 'portal'; map.decor[52][35] = 'portal';
  map.portals.push({ x: 35, y: 52, targetMap: 'mainland', tx: 118, ty: 44, label: 'Zurück' });
  map.portals.push({ x: 35, y: 34, targetMinigame: id.replace('Island', ''), label: 'Start' });
  for (let i = 0; i < 8; i++) map.interactives.push({ id: `${id}_poi_${i}`, kind: 'poi', x: 20 + i * 5, y: 40 - (i % 4) * 3, dialog: ['Trainingspunkt', 'Hier lernst du eine Technik fürs Minigame.'] });
  applyShore(map); decorateNature(map, id.length * 14); return map;
}

export class MapGenerator {
  static getMaps() {
    return { mainland: buildMainland(), runIsland: buildTrialIsland('runIsland'), dodgeIsland: buildTrialIsland('dodgeIsland'), timingIsland: buildTrialIsland('timingIsland') };
  }
}
