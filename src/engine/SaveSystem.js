const KEY = 'insel-der-champions-save-v1';

const defaultState = {
  map: 'mainland',
  player: { x: 20 * 32, y: 22 * 32 },
  questState: {},
  minigames: {
    run: false,
    dodge: false,
    timing: false,
  },
};

export class SaveSystem {
  static load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(defaultState);
      const parsed = JSON.parse(raw);
      return SaveSystem.mergeDefaults(parsed);
    } catch {
      return structuredClone(defaultState);
    }
  }

  static mergeDefaults(data) {
    return {
      ...structuredClone(defaultState),
      ...data,
      player: { ...defaultState.player, ...(data.player || {}) },
      minigames: { ...defaultState.minigames, ...(data.minigames || {}) },
      questState: { ...defaultState.questState, ...(data.questState || {}) },
    };
  }

  static save(state) {
    localStorage.setItem(KEY, JSON.stringify(SaveSystem.mergeDefaults(state)));
  }

  static clear() {
    localStorage.removeItem(KEY);
  }
}
