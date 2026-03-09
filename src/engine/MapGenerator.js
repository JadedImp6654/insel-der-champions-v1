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
      const nearDeep = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => map.ground[y + dy]?.[x + dx] === 'water_deep');
      if (nearDeep) map.ground[y][x] = 'sand';
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
          const id = 1 + Math.floor(n2 * 16);
          map.decor[y][x] = `tree_${id}`;
          map.collision[y][x] = 1;
        } else if (n > 0.89) {
          const id = 1 + Math.floor(n2 * 50);
          map.decor[y][x] = `flower_${id}`;
        } else if (n > 0.72) {
          const id = 1 + Math.floor(n2 * 120);
          map.decor[y][x] = `misc_${id}`;
          if (id % 4 === 0 || id % 7 === 0) map.collision[y][x] = 1;
        }
      }
      if ((tile === 'water_shallow' || tile === 'sand') && n > 0.96) map.decor[y][x] = 'foam';
    }
  }
}

function addHouse(map, x, y, large = false, name = 'Haus') {
  map.decor[y][x] = large ? 'house_large' : 'house';
  map.collision[y][x] = 1;
  map.interactives.push({ id: `house_${x}_${y}`, kind: 'house', x: x + 1, y: y + 1, dialog: [`${name}`, 'Bewohner erzählen dir Neuigkeiten und Nebenquests.'] });
}

function buildMainland() {
  const width = 160;
  const height = 100;
  const map = {
    id: 'mainland', width, height,
    ground: makeLayer(width, height, 'water_deep'),
    decor: makeLayer(width, height, null),
    collision: makeLayer(width, height, 0),
    npcs: [], portals: [], interactives: [], minigameSpots: [],
  };

  carveEllipse(map.ground, 34, 52, 30, 22, 'grass_lush');
  carveEllipse(map.ground, 70, 44, 30, 24, 'grass_lush');
  carveEllipse(map.ground, 108, 40, 28, 22, 'grass_dark');
  carveEllipse(map.ground, 114, 72, 26, 18, 'grass_lush');
  carveEllipse(map.ground, 145, 56, 15, 12, 'grass_dark');

  path(map.ground, 20, 55, 44, 49, 'path');
  path(map.ground, 44, 49, 72, 43, 'path');
  path(map.ground, 72, 43, 108, 41, 'path');
  path(map.ground, 72, 43, 110, 72, 'path');
  path(map.ground, 108, 41, 140, 56, 'path');

  for (let y = 62; y < 76; y++) for (let x = 56; x < 78; x++) map.ground[y][x] = (x + y) % 2 ? 'field_crop' : 'field_soil';

  addHouse(map, 22, 50, false, 'Miras Haus');
  addHouse(map, 28, 54, false, 'Fischers Hütte');
  addHouse(map, 34, 50, true, 'Dorfhalle');
  addHouse(map, 88, 39, false, 'Werkstatt');
  addHouse(map, 95, 45, false, 'Gartenhaus');
  addHouse(map, 118, 71, true, 'Akademie');

  map.decor[26][91] = 'tower';
  map.collision[26][91] = 1;
  map.interactives.push({ id: 'tower', kind: 'landmark', x: 91, y: 26, dialog: ['Alte Wachturm-Ruine.', 'Easter Egg: Unter dem Turm liegt ein verborgenes Emblem.'] });

  map.npcs.push({ id: 'mira', name: 'Mira', x: 24, y: 54, palette: 'pink', dialog: ['Willkommen Champion!', 'Nutze Q für Questlog und M für Kartenansicht.'], questId: 'q1' });
  map.npcs.push({ id: 'finn', name: 'Finn', x: 63, y: 68, palette: 'green', dialog: ['Die Insel wurde erweitert.', 'Es gibt viele neue Sammelorte.'], questId: 'q4' });
  map.npcs.push({ id: 'leon', name: 'Leon', x: 98, y: 42, palette: 'blue', dialog: ['Suche 3 Portale und alle Geheimzeichen.'], questId: 'q7' });
  map.npcs.push({ id: 'sora', name: 'Sora', x: 120, y: 72, palette: 'gold', dialog: ['Profi-Tipp: ESC schließt jede Ansicht.'], questId: 'q10' });

  map.decor[41][108] = 'portal';
  map.decor[72][110] = 'portal';
  map.decor[56][140] = 'portal';

  map.portals.push({ x: 108, y: 41, targetMap: 'runIsland', tx: 32, ty: 48, label: 'Rennen' });
  map.portals.push({ x: 110, y: 72, targetMap: 'dodgeIsland', tx: 32, ty: 48, label: 'Ausweichen' });
  map.portals.push({ x: 140, y: 56, targetMap: 'timingIsland', tx: 32, ty: 48, label: 'Timing' });

  map.interactives.push({ id: 'easter_1', kind: 'easteregg', x: 50, y: 35, dialog: ['Easter Egg #1: Glitzernder Muschelstein entdeckt!'] });
  map.interactives.push({ id: 'easter_2', kind: 'easteregg', x: 132, y: 61, dialog: ['Easter Egg #2: Geheimschrift im Sand.'] });
  map.interactives.push({ id: 'easter_3', kind: 'easteregg', x: 76, y: 28, dialog: ['Easter Egg #3: Altes Champion-Emblem.'] });

  map.minigameSpots.push({ x: 60, y: 68, minigame: 'dodge', label: 'Trainingsfeld' });
  map.minigameSpots.push({ x: 102, y: 42, minigame: 'timing', label: 'Tempelplatz' });
  map.minigameSpots.push({ x: 32, y: 52, minigame: 'run', label: 'Sprintstrecke' });
  map.minigameSpots.push({ x: 74, y: 44, minigame: 'run', label: 'Küstenlauf' });
  map.minigameSpots.push({ x: 88, y: 60, minigame: 'dodge', label: 'Steinparcours' });
  map.minigameSpots.push({ x: 118, y: 48, minigame: 'timing', label: 'Klangaltar' });
  map.minigameSpots.push({ x: 45, y: 56, minigame: 'run', label: 'Waldsprint' });
  map.minigameSpots.push({ x: 130, y: 66, minigame: 'dodge', label: 'Kometenfeld' });
  map.minigameSpots.push({ x: 96, y: 30, minigame: 'timing', label: 'Sonnenuhr' });

  applyShore(map);
  decorateNature(map, 27);
  return map;
}

function buildTrialIsland(id) {
  const width = 64;
  const height = 64;
  const map = { id, width, height, ground: makeLayer(width, height, 'water_deep'), decor: makeLayer(width, height, null), collision: makeLayer(width, height, 0), npcs: [], portals: [], interactives: [], minigameSpots: [] };
  carveEllipse(map.ground, 32, 34, 24, 20, 'grass_lush');
  carveEllipse(map.ground, 20, 24, 10, 8, 'grass_dark');
  carveEllipse(map.ground, 43, 22, 9, 8, 'grass_lush');
  path(map.ground, 32, 48, 32, 30, 'path');

  map.decor[30][32] = 'portal';
  map.decor[48][32] = 'portal';
  map.portals.push({ x: 32, y: 48, targetMap: 'mainland', tx: 108, ty: 41, label: 'Zurück' });
  map.portals.push({ x: 32, y: 30, targetMinigame: id.replace('Island', ''), label: 'Start' });
  map.interactives.push({ id: `${id}_hint`, kind: 'hint', x: 26, y: 28, dialog: ['Tipp: Beobachte das Muster und bleibe fokussiert.'] });
  map.minigameSpots.push({ x: 32, y: 30, minigame: id.replace('Island', ''), label: 'Prüfungsstart' });

  applyShore(map);
  decorateNature(map, id.length * 10);
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
