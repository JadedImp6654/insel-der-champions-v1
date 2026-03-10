export class QuestSystem {
  constructor(saveData) {
    this.saveData = saveData;
    if (!this.saveData.questState) this.saveData.questState = {};
    if (!this.saveData.minigameWins) this.saveData.minigameWins = { run: 0, dodge: 0, timing: 0 };

    const chain = [
      ['q1', 'Sprintprüfung I', 'run', 1],
      ['q2', 'Ausweichprüfung I', 'dodge', 1],
      ['q3', 'Timingprüfung I', 'timing', 1],
      ['q4', 'Sprintprüfung II', 'run', 2],
      ['q5', 'Ausweichprüfung II', 'dodge', 2],
      ['q6', 'Timingprüfung II', 'timing', 2],
      ['q7', 'Sprintprüfung III', 'run', 3],
      ['q8', 'Ausweichprüfung III', 'dodge', 3],
      ['q9', 'Timingprüfung III', 'timing', 3],
      ['q10', 'Champion-Finale', 'run', 4],
      ['q11', 'Blitzlauf', 'run', 5],
      ['q12', 'Dauerlauf', 'run', 6],
      ['q13', 'Reflextraining', 'dodge', 4],
      ['q14', 'Chaos-Ausweichen', 'dodge', 5],
      ['q15', 'Meister-Ausweichen', 'dodge', 6],
      ['q16', 'Rhythmus I', 'timing', 4],
      ['q17', 'Rhythmus II', 'timing', 5],
      ['q18', 'Rhythmus III', 'timing', 6],
      ['q19', 'Triathlon der Inseln', 'run', 7],
      ['q20', 'Legende der Champions', 'timing', 7],
    ];

    this.quests = chain.map(([id, title, minigame, requiredWins], idx) => ({
      id,
      title,
      type: idx < 10 ? 'main' : 'side',
      minigame,
      requiredWins,
      description: `Gewinne ${requiredWins}x im Minigame ${minigame.toUpperCase()}.`,
    }));

    this.quests.forEach((q, idx) => {
      if (!this.saveData.questState[q.id]) {
        this.saveData.questState[q.id] = { done: false, unlocked: idx === 0 };
      }
    });

    this.refreshProgress();
  }

  refreshProgress() {
    let previousDone = true;
    this.quests.forEach((q) => {
      const state = this.saveData.questState[q.id];
      state.unlocked = state.unlocked || previousDone;
      if (state.unlocked && (this.saveData.minigameWins[q.minigame] || 0) >= q.requiredWins) state.done = true;
      previousDone = state.done;
    });
  }

  registerMinigameWin(type) {
    if (!this.saveData.minigameWins[type] && this.saveData.minigameWins[type] !== 0) this.saveData.minigameWins[type] = 0;
    this.saveData.minigameWins[type] += 1;
    this.refreshProgress();
  }

  progressAfterMinigame() {
    this.refreshProgress();
  }

  tryCompleteAtMira() {
    this.refreshProgress();
    return this.quests.slice(0, 10).every((q) => this.saveData.questState[q.id].done);
  }

  completeQuest(id) {
    const q = this.saveData.questState[id];
    if (!q || !q.unlocked) return false;
    q.done = true;
    this.refreshProgress();
    return true;
  }

  markEasterEgg(id) {
    const idx = { easter_1: 'q11', easter_2: 'q14', easter_3: 'q17' }[id];
    if (idx) this.completeQuest(idx);
  }

  getActiveText() {
    const next = this.quests.find((q) => this.saveData.questState[q.id].unlocked && !this.saveData.questState[q.id].done);
    if (!next) return 'Alle Quests erledigt!';
    const wins = this.saveData.minigameWins[next.minigame] || 0;
    return `Aktive Quest: ${next.title} (${wins}/${next.requiredWins})`;
  }

  getQuestLogText() {
    return this.quests
      .filter((q) => this.saveData.questState[q.id].unlocked)
      .map((q) => {
        const wins = this.saveData.minigameWins[q.minigame] || 0;
        const done = this.saveData.questState[q.id].done;
        return `${done ? '✔' : '•'} ${q.title}: ${q.minigame.toUpperCase()} ${wins}/${q.requiredWins}`;
      })
      .join('\n');
  }
}
