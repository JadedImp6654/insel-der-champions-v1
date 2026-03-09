const KEY = 'insel-der-champions-save-v1';

const defaultState = {
  map: 'mainland',
  player: { x: 20 * 16, y: 22 * 16 },
  questState: {},
  minigames: {
    run: false,
    dodge: false,
    timing: false,
  },
  minigameWins: {
    run: 0,
    dodge: 0,
    timing: 0,
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
      minigameWins: { ...defaultState.minigameWins, ...(data.minigameWins || {}) },
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
