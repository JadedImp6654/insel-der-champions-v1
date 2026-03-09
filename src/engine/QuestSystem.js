export class QuestSystem {
  constructor(saveData) {
    this.saveData = saveData;
    if (!this.saveData.questState) this.saveData.questState = {};

    this.quests = Array.from({ length: 30 }, (_, i) => ({
      id: `q${i + 1}`,
      title: i < 15 ? `Hauptquest ${i + 1}` : `Nebenquest ${i - 14}`,
      description: i < 15
        ? `Bringe die Championreise in Abschnitt ${i + 1} voran.`
        : `Erforsche besondere Orte und Geheimnisse (${i - 14}).`,
      type: i < 15 ? 'main' : 'side',
    }));

    this.quests.forEach((q, idx) => {
      if (!this.saveData.questState[q.id]) this.saveData.questState[q.id] = { done: false, unlocked: idx === 0 || idx >= 15 };
    });
  }

  unlockNextMain() {
    for (let i = 0; i < 15; i++) {
      if (this.saveData.questState[`q${i + 1}`].done && i < 14) this.saveData.questState[`q${i + 2}`].unlocked = true;
    }
  }

  completeQuest(id) {
    const q = this.saveData.questState[id];
    if (!q || !q.unlocked) return false;
    q.done = true;
    this.unlockNextMain();
    return true;
  }

  progressAfterMinigame() {
    const completed = Object.values(this.saveData.minigames || {}).filter(Boolean).length;
    if (completed >= 1) this.completeQuest('q2');
    if (completed >= 2) this.completeQuest('q3');
    if (completed >= 3) this.completeQuest('q4');
  }

  tryCompleteAtMira() {
    const allTrials = ['run', 'dodge', 'timing'].every((m) => this.saveData.minigames?.[m]);
    if (allTrials) {
      ['q1', 'q5', 'q6', 'q7'].forEach((id) => this.completeQuest(id));
      return true;
    }
    return false;
  }

  markEasterEgg(id) {
    const idx = { easter_1: 'q16', easter_2: 'q17', easter_3: 'q18', easter_4: 'q19', easter_5: 'q20' }[id];
    if (idx) this.completeQuest(idx);
  }

  getActiveText() {
    const next = this.quests.find((q) => this.saveData.questState[q.id].unlocked && !this.saveData.questState[q.id].done);
    return next ? `Aktive Quest: ${next.title}` : 'Alle Quests erledigt!';
  }

  getQuestLogText() {
    return this.quests
      .filter((q) => this.saveData.questState[q.id].unlocked)
      .map((q) => `${this.saveData.questState[q.id].done ? '✔' : '•'} ${q.title}`)
      .join('\n');
  }
}
