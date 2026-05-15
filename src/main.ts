import './style.css';
import lockupRaw from './assets/full_logo.svg?raw';
import shotSrcset from './assets/base_app_color_padding.png?w=768;1280;1600;1920;2400&as=srcset';
import shotSrc from './assets/base_app_color_padding.png?w=1600&as=src';

const themedLockup = lockupRaw.replace(/fill="#393737"/g, 'fill="currentColor"');

document.querySelectorAll<HTMLElement>('[data-lockup]').forEach((el) => {
  el.innerHTML = themedLockup;
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

const reveals = document.querySelectorAll<HTMLElement>('[data-reveal]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reveals.length && !reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-revealed'));
}
