export class QuestSystem {
  constructor(saveData) {
    this.saveData = saveData;
    if (!this.saveData.questState) this.saveData.questState = {};

    this.quests = Array.from({ length: 20 }, (_, i) => ({
      id: `q${i + 1}`,
      title: i < 10 ? `Hauptquest ${i + 1}` : `Nebenquest ${i - 9}`,
      description: i < 10
        ? `Schließe Etappe ${i + 1} deiner Championreise ab.`
        : `Erkunde die Insel und finde ein besonderes Geheimnis (${i - 9}).`,
      type: i < 10 ? 'main' : 'side',
    }));

    this.quests.forEach((q, idx) => {
      if (!this.saveData.questState[q.id]) {
        this.saveData.questState[q.id] = { step: 0, done: idx === 0 ? false : false, unlocked: idx === 0 || idx >= 10 };
      }
    });
  }

  unlockNextMain() {
    for (let i = 0; i < 10; i++) {
      const q = this.saveData.questState[`q${i + 1}`];
      if (q.done && i < 9) this.saveData.questState[`q${i + 2}`].unlocked = true;
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
      this.completeQuest('q1');
      this.completeQuest('q5');
      return true;
    }
    return false;
  }

  markEasterEgg(id) {
    const idx = { easter_1: 'q11', easter_2: 'q12', easter_3: 'q13' }[id];
    if (idx) this.completeQuest(idx);
  }

  getActiveText() {
    const next = this.quests.find((q) => this.saveData.questState[q.id].unlocked && !this.saveData.questState[q.id].done);
    if (!next) return 'Alle Quests erledigt!';
    return `Aktive Quest: ${next.title}`;
  }

  getQuestLogText() {
    return this.quests
      .filter((q) => this.saveData.questState[q.id].unlocked)
      .map((q) => `${this.saveData.questState[q.id].done ? '✔' : '•'} ${q.title}: ${q.description}`)
      .join('\n');
  }
}
