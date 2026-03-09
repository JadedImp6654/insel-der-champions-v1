import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { OverworldScene } from './scenes/OverworldScene.js';
import { MinigameRunScene } from './scenes/MinigameRunScene.js';
import { MinigameDodgeScene } from './scenes/MinigameDodgeScene.js';
import { MinigameTimingScene } from './scenes/MinigameTimingScene.js';
import { UISystem } from './engine/UISystem.js';

export const GAME_WIDTH = 2560;
export const GAME_HEIGHT = 1440;
export const TILE_SIZE = 32;

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  zoom: 1,
  backgroundColor: '#091826',
  antialias: false,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    PreloadScene,
    OverworldScene,
    MinigameRunScene,
    MinigameDodgeScene,
    MinigameTimingScene,
    UISystem,
  ],
};
