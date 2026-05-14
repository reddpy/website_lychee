import './style.css';
import lockupRaw from './assets/full_logo.svg?raw';
import appIconRaw from './assets/app_icon.svg?raw';
import shotSrcset from './assets/base_app_color_padding.png?w=768;1280;1600;1920;2400&as=srcset';
import shotSrc from './assets/base_app_color_padding.png?w=1600&as=src';

const themedLockup = lockupRaw.replace(/fill="#393737"/g, 'fill="currentColor"');

document.querySelectorAll<HTMLElement>('[data-lockup]').forEach((el) => {
  el.innerHTML = themedLockup;
});

document.querySelectorAll<HTMLElement>('[data-app-icon]').forEach((el) => {
  el.innerHTML = appIconRaw;
});

document.querySelectorAll<HTMLElement>('[data-year]').forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

document.querySelectorAll<HTMLImageElement>('[data-shot]').forEach((img) => {
  img.srcset = shotSrcset;
  img.src = shotSrc;
});

document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') ?? 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('lychee-theme', next);
    } catch {
      /* ignore */
    }
  });
});
