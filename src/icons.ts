import type { ActionIcon } from "./types";

const STEAM = `<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4" fill="none"/>
<path d="M7.5 9.2c.9-1.1 1.8-1.1 2.7 0s1.8 1.1 2.7 0 1.8-1.1 2.7 0M7.5 12c.9-1.1 1.8-1.1 2.7 0s1.8 1.1 2.7 0 1.8-1.1 2.7 0M7.5 14.8c.9-1.1 1.8-1.1 2.7 0s1.8 1.1 2.7 0 1.8-1.1 2.7 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/>`;

const CHEVRON_DOWN = `<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
const CHEVRON_LEFT = `<path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
const CHEVRON_RIGHT = `<path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;

const DROPLET = `<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4" fill="none"/>
<path d="M12 7.4s3.3 3.5 3.3 5.5a3.3 3.3 0 1 1-6.6 0c0-2 3.3-5.5 3.3-5.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" fill="none"/>`;

const SUN = `<circle cx="12" cy="12" r="3.1" stroke="currentColor" stroke-width="1.5" fill="none"/>
<path d="M12 5v1.6M12 17.4V19M5 12h1.6M17.4 12H19M7.05 7.05l1.13 1.13M15.82 15.82l1.13 1.13M7.05 16.95l1.13-1.13M15.82 8.18l1.13-1.13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>`;

const WIFI = `<path d="M5 12.4a10 10 0 0 1 14 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
<path d="M8.2 15.5a5.4 5.4 0 0 1 7.6 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
<circle cx="12" cy="18.6" r="1.15" fill="currentColor"/>`;

const HOME = `<path d="M4 11.2 12 4.5l8 6.7V19a1.8 1.8 0 0 1-1.8 1.8H5.8A1.8 1.8 0 0 1 4 19V11.2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
<path d="M9.5 20.6V14.4h5v6.2" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>`;

const BATTERY = `<rect x="3" y="8" width="15.5" height="9" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
<rect x="19.2" y="11" width="1.6" height="3" rx="0.4" fill="currentColor"/>
<rect x="5" y="10" width="4.4" height="5" rx="0.6" fill="currentColor"/>`;

const BATTERY_FULL = `<rect x="2.75" y="7.33" width="14.2" height="8.25" rx="1.8" stroke="currentColor" stroke-width="1.5" fill="none"/>
<rect x="17.6" y="10.08" width="1.47" height="2.75" rx="0.4" fill="currentColor"/>
<rect x="4.58" y="9.17" width="10.54" height="4.58" rx="0.55" fill="currentColor"/>`;

const TOWER = `<path fill="#C5C6CB" d="M50 8H30c-2.2 0-4 1.8-4 4v50c0 2.2 1.8 4 4 4h20c2.2 0 4-1.8 4-4V12c0-2.2-1.8-4-4-4z"/>
<path fill="#E8E8EA" d="M31 14h18a1 1 0 0 1 0 2H31a1 1 0 0 1 0-2zm0 5h18a1 1 0 0 1 0 2H31a1 1 0 0 1 0-2zm0 5h18a1 1 0 0 1 0 2H31a1 1 0 0 1 0-2zm0 5h18a1 1 0 0 1 0 2H31a1 1 0 0 1 0-2z"/>
<circle cx="40" cy="56" r="2.4" fill="#E8E8EA"/>
<path fill="#B4B5BA" d="M25.5 66h29a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-29a1.5 1.5 0 0 1-1.5-1.5v-1A1.5 1.5 0 0 1 25.5 66z"/>`;

const LAPTOP = `<path fill="#C5C6CB" d="M62.5 16h-45A3.5 3.5 0 0 0 14 19.5v29A3.5 3.5 0 0 0 17.5 52h45a3.5 3.5 0 0 0 3.5-3.5v-29A3.5 3.5 0 0 0 62.5 16z"/>
<path fill="#E8E8EA" d="M33 19h14a1 1 0 0 1 0 2H33a1 1 0 0 1 0-2z"/>
<path fill="#B4B5BA" d="M8 54h64s-2.5 8-8 8H16c-5.5 0-8-8-8-8z"/>`;

const GENERIC = `<rect x="22" y="10" width="36" height="56" rx="8" fill="#C5C6CB"/>
<rect x="28" y="16" width="24" height="36" rx="3" fill="#E8E8EA"/>
<circle cx="40" cy="58" r="2.2" fill="#E8E8EA"/>`;

function svg(viewBox: string, inner: string, size: number): string {
  return `<svg viewBox="${viewBox}" width="${size}" height="${size}" fill="none" aria-hidden="true">${inner}</svg>`;
}

export function actionIcon(name: ActionIcon, size = 24): string {
  const path = name === "steam" ? STEAM : name === "chevron" ? CHEVRON_DOWN : DROPLET;
  return svg("0 0 24 24", path, size);
}

export function uiIcon(
  name: "sun" | "wifi" | "home" | "battery" | "battery-full" | "chevron-left" | "chevron-right" | "droplet" | "steam",
  size = 24,
): string {
  const map = {
    sun: SUN,
    wifi: WIFI,
    home: HOME,
    battery: BATTERY,
    "battery-full": BATTERY_FULL,
    "chevron-left": CHEVRON_LEFT,
    "chevron-right": CHEVRON_RIGHT,
    droplet: DROPLET,
    steam: STEAM,
  };
  return svg("0 0 24 24", map[name], size);
}

const ELLIPSIS = `<circle cx="5" cy="12" r="1.35" fill="currentColor"/><circle cx="12" cy="12" r="1.35" fill="currentColor"/><circle cx="19" cy="12" r="1.35" fill="currentColor"/>`;
const POWER = `<path d="M12 3.6v6.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
<path d="M7.05 6.7a6.15 6.15 0 1 0 9.9 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none"/>`;
const PLAY = `<path d="M8.2 6.4v11.2l9.2-5.6-9.2-5.6z" fill="currentColor"/>`;
const PAUSE = `<path d="M7.4 5.8h2.6v12.4H7.4zM14 5.8h2.6v12.4H14z" fill="currentColor"/>`;
const SKIP_BACK = `<path d="M16.2 6.2 9.2 12l7 5.8V6.2z" fill="currentColor"/><path d="M7.2 6.2v11.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`;
const SKIP_FORWARD = `<path d="M7.8 6.2 14.8 12l-7 5.8V6.2z" fill="currentColor"/><path d="M16.8 6.2v11.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`;

export function markIcon(
  name: "ellipsis" | "power" | "play" | "pause" | "prev" | "next",
  size = 22,
): string {
  const map = {
    ellipsis: ELLIPSIS,
    power: POWER,
    play: PLAY,
    pause: PAUSE,
    prev: SKIP_BACK,
    next: SKIP_FORWARD,
  };
  return svg("0 0 24 24", map[name], size);
}

export function silhouetteIcon(kind: "tower" | "laptop" | "generic"): string {
  const inner = kind === "tower" ? TOWER : kind === "laptop" ? LAPTOP : GENERIC;
  return svg("0 0 80 80", inner, 96);
}
