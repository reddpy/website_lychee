import "./style.css";
import lockupRaw from "./assets/full_logo.svg?raw";
import appleRaw from "./assets/apple.svg?raw";
import windowsRaw from "./assets/windows.svg?raw";
import linuxRaw from "./assets/linux.svg?raw";
import shotSrcset from "./assets/base_app_color_padding.png?w=768;1280;1600;1920;2400&as=srcset";
import shotSrc from "./assets/base_app_color_padding.png?w=1600&as=src";

const themedLockup = lockupRaw.replace(
  /fill="#393737"/g,
  'fill="currentColor"',
);

document.querySelectorAll<HTMLElement>("[data-lockup]").forEach((el) => {
  el.innerHTML = themedLockup;
});

document.querySelectorAll<HTMLElement>("[data-year]").forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

document.querySelectorAll<HTMLImageElement>("[data-shot]").forEach((img) => {
  img.srcset = shotSrcset;
  img.src = shotSrc;
});

// --- Platform-aware download buttons ---
const DOWNLOAD_BASE =
  "https://github.com/reddpy/lychee/releases/download/v0.1.0-alpha.8/";

const brandIcon = (svg: string) =>
  svg.replace(
    "<svg ",
    '<svg width="16" height="16" fill="currentColor" aria-hidden="true" ',
  );

const ICONS: Record<string, string> = {
  mac: brandIcon(appleRaw),
  windows: brandIcon(windowsRaw),
  linux: brandIcon(linuxRaw),
};

// Fill the platform icons in the "all platforms" buttons.
document.querySelectorAll<HTMLElement>("[data-picon]").forEach((el) => {
  el.innerHTML = ICONS[el.dataset.picon ?? ""] ?? "";
});

type OS = "mac" | "windows" | "linux";

function detectOS(): OS | null {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return null;
  if (/mac|iphone|ipad|ipod/i.test(ua)) return "mac";
  if (/win/i.test(ua)) return "windows";
  if (/linux|x11/i.test(ua)) return "linux";
  return null;
}

const os = detectOS();

const FILES = {
  dmg: "Lychee-0.1.0-alpha.8-arm64.dmg",
  exe: "Lychee-0.1.0-alpha.8.Setup.exe",
  deb: "lychee_0.1.0.alpha.8_amd64.deb",
  rpm: "lychee-0.1.0.alpha.8-1.x86_64.rpm",
};

// Hero: direct download where there's a single obvious artifact, otherwise
// send Linux users to the download section; note the OS under the button.
const NOTES: Record<OS, string> = {
  mac: "for macOS (arm64)",
  windows: "for Windows (x64)",
  linux: "for Linux (.deb / .rpm)",
};

if (os) {
  document
    .querySelectorAll<HTMLElement>("[data-download-note]")
    .forEach((el) => {
      el.textContent = NOTES[os];
    });
}

if (os === "mac" || os === "windows") {
  const file = os === "mac" ? FILES.dmg : FILES.exe;
  document
    .querySelectorAll<HTMLAnchorElement>("[data-download]")
    .forEach((a) => {
      a.href = DOWNLOAD_BASE + file;
    });
}
// Linux and undetected keep the static "#download" anchor — the section
// lists every artifact.

const reveals = document.querySelectorAll<HTMLElement>("[data-reveal]");
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
if (reveals.length && !reduceMotion && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-revealed"));
}
