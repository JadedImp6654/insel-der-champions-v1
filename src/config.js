import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { OverworldScene } from './scenes/OverworldScene.js';
import { MinigameRunScene } from './scenes/MinigameRunScene.js';
import { MinigameDodgeScene } from './scenes/MinigameDodgeScene.js';
import { MinigameTimingScene } from './scenes/MinigameTimingScene.js';
import { UISystem } from './engine/UISystem.js';

export const IS_MOBILE = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 900;

// Landscape-first mobile base resolution (close to iPhone landscape ratio)
export const GAME_WIDTH = IS_MOBILE ? 1136 : 2560;
export const GAME_HEIGHT = IS_MOBILE ? 640 : 1440;
export const TILE_SIZE = IS_MOBILE ? 36 : 32;

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
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
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
