export class DialogSystem {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    this.onFinish = null;
  }

  start(lines, onFinish) {
    this.active = true;
    this.onFinish = onFinish;
    this.scene.events.emit('dialog:start', lines, () => this.finish());
  }

  finish() {
    this.active = false;
    if (this.onFinish) this.onFinish();
    this.onFinish = null;
    this.scene.events.emit('dialog:end');
  }
}
