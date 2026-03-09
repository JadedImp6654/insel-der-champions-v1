export class QuestSystem {
  constructor(saveData) {
    this.saveData = saveData;
    this.quests = {
      intro: {
        id: 'intro',
        title: 'Die Inselprüfung',
        steps: [
          'Sprich mit Mira im Dorf.',
          'Absolviere 3 Prüfungen auf den Inseln.',
          'Kehre zu Mira zurück.',
        ],
      },
    };
    if (!this.saveData.questState.intro) {
      this.saveData.questState.intro = { started: true, step: 0, done: false };
    }
  }

  progressAfterMinigame() {
    const q = this.saveData.questState.intro;
    const completed = Object.values(this.saveData.minigames).filter(Boolean).length;
    if (completed >= 3) q.step = 2;
    else if (completed > 0) q.step = 1;
  }

  tryCompleteAtMira() {
    const q = this.saveData.questState.intro;
    if (q.step >= 2) {
      q.done = true;
      q.step = 2;
      return true;
    }
    return false;
  }

  getActiveText() {
    const q = this.saveData.questState.intro;
    if (q.done) return 'Quest abgeschlossen: Die Inselprüfung';
    return `Quest: ${this.quests.intro.steps[q.step]}`;
  }
}
