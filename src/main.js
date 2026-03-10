import { gameConfig, IS_MOBILE } from './config.js';

window.addEventListener('load', () => {
  const rotate = document.getElementById('rotate-overlay');
  if (rotate && !IS_MOBILE) rotate.classList.remove('mobile-only');

  const install = document.getElementById('install-overlay');
  const dismiss = document.getElementById('install-dismiss');
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (IS_MOBILE && install && !isStandalone && localStorage.getItem('install-hint-dismissed') !== '1') {
    install.style.display = 'flex';
  }
  dismiss?.addEventListener('click', () => {
    if (install) install.style.display = 'none';
    localStorage.setItem('install-hint-dismissed', '1');
  });

  new Phaser.Game(gameConfig);
});
