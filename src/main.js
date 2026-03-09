import { gameConfig, IS_MOBILE } from './config.js';

window.addEventListener('load', () => {
  const overlay = document.getElementById('rotate-overlay');
  if (overlay && !IS_MOBILE) overlay.classList.remove('mobile-only');
  new Phaser.Game(gameConfig);
});
