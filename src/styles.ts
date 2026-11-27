import geist400 from "./assets/fonts/geist-400.woff2";
import geist500 from "./assets/fonts/geist-500.woff2";
import noto from "./assets/fonts/noto-sans-sc-400.woff2";

const fontFamily = `"Geist", "Noto Sans SC", "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif`;
const cjkFamily = `"Noto Sans SC", "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif`;

export const cardStyles = `
@font-face {
  font-family: "Geist";
  src: url("${geist400}") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Geist";
  src: url("${geist500}") format("woff2");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Noto Sans SC";
  src: url("${noto}") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

:host {
  display: block;
  min-width: 0;
  max-width: 100%;
  color: #111111;
  color-scheme: light;
  font-family: ${fontFamily};
  -webkit-font-smoothing: antialiased;
  --ha-card-background: #F0EFF2;
  --ha-card-border-width: 0;
  --primary-text-color: #111111;
  --secondary-text-color: #3A3A3C;
}

* { box-sizing: border-box; }

ha-card, .card {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  background: #F0EFF2;
  color: #111111;
  border: 0;
  border-radius: 40px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  container-type: inline-size;
  container-name: vha;
}

button, .info {
  font-family: inherit;
  color: inherit;
}

.info {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
  min-width: 0;
}

button:focus-visible, .vslider:focus-visible {
  outline: 2px solid #5C574E;
  outline-offset: 3px;
}

.layout-large {
  display: flex;
  flex-direction: column;
  min-height: 280px;
  padding: 24px 20px 24px 24px;
  gap: 12px;
}

.shell {
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 16px;
  min-width: 0;
  min-height: 240px;
  flex: 1 1 auto;
}

.main {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.l-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}

.reading { flex: 1 1 120px; min-width: 0; text-align: left; }

.value {
  display: block;
  margin: 0;
  font-weight: 500;
  font-size: 44px;
  line-height: 52px;
  letter-spacing: -0.5px;
  color: #111111;
  white-space: nowrap;
}
.value.is-text {
  font-weight: 400;
  font-size: 32px;
  line-height: 38px;
  letter-spacing: -0.4px;
  white-space: normal;
  overflow-wrap: anywhere;
}
.caption {
  display: block;
  margin: 2px 0 0;
  font-size: 20px;
  line-height: 26px;
  letter-spacing: -0.2px;
  color: #3A3A3C;
  overflow-wrap: anywhere;
}

.switch {
  appearance: none;
  width: 51px;
  height: 31px;
  flex: 0 0 51px;
  border: 0;
  border-radius: 999px;
  background: #C8C8C8;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
}
.switch::after {
  content: "";
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background: #FFFFFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.16);
}
.switch.on { background: #5C574E; justify-content: flex-end; }
.switch.on::after { background: #3A372F; }
.switch:disabled { opacity: 0.45; cursor: default; }

.photo, .v-photo, .well {
  background: #F7F8FA;
  border-radius: 28px;
  overflow: hidden;
  position: relative;
  min-width: 0;
}
.photo {
  flex: 1 1 auto;
  min-height: 220px;
  aspect-ratio: 6 / 5;
  width: 100%;
  border: 0;
  padding: 0;
  cursor: pointer;
}
.photo img, .v-photo img, .well img {
  width: 100%;
  height: 100%;
  display: block;
}
.fit-cover img { object-fit: cover; }
.fit-contain img { object-fit: contain; background: #F7F8FA; }
.is-off img { filter: grayscale(1); opacity: 0.48; }

.ph {
  width: 100%;
  height: 100%;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #8A8B8E;
  background: #F7F8FA;
}
.ph-label {
  font-size: 13px;
  line-height: 16px;
  color: #8A8B8E;
  text-align: center;
  padding: 0 12px;
}

.rail {
  flex: 0 0 64px;
  width: 64px;
  background: #FFFFFF;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  padding: 18px 8px;
}
.rail-btn {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #3A3A3C;
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;
}
.rail-btn[aria-pressed="true"] { background: #E4E4E8; color: #111111; }
.rail-btn:disabled { opacity: 0.4; cursor: default; }

/* Narrow columns: the 64px rail moves under the photo and becomes a horizontal capsule. */
@container vha (max-width: 320px) {
  .layout-large { padding: 20px; }
  .shell { flex-direction: column; min-height: 0; }
  .rail {
    flex: 1 1 auto;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    height: auto;
    min-height: 64px;
    border-radius: 999px;
    justify-content: space-evenly;
    gap: 8px 22px;
  }
}

.layout-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-height: 420px;
  padding: 0 0 20px;
}
.v-photo {
  width: 100%;
  aspect-ratio: 220 / 196;
  max-height: 280px;
  border-radius: 40px 40px 0 0;
  flex: 0 0 auto;
}
.v-photo img { object-fit: cover; }
.photo-hit {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  padding: 0;
  background: transparent;
}
.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border: 0;
  background: transparent;
  color: #3A3A3C;
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;
  z-index: 1;
}
.nav.prev { left: 8px; }
.nav.next { right: 8px; }
.v-title {
  width: 100%;
  padding: 0 16px;
  text-align: center;
  font-size: 28px;
  line-height: 34px;
  letter-spacing: -0.3px;
  font-weight: 400;
  color: #111111;
  overflow-wrap: anywhere;
}
.vslider {
  --p: 0;
  width: 80px;
  flex: 1 1 auto;
  min-height: 168px;
  margin: 0 auto;
  background: #FFFFFF;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  touch-action: none;
  color: #3A3A3C;
}
.vslider .thumb {
  position: absolute;
  left: 50%;
  top: calc(22px + (1 - var(--p)) * (100% - 100px));
  transform: translateX(-50%);
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1.2px solid rgba(58, 58, 60, 0.13);
  background: #FFFFFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.16);
  display: grid;
  place-items: center;
  padding: 0;
  color: #3A3A3C;
  pointer-events: none;
}
.vslider .pct {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 18px;
  text-align: center;
  font-size: 13px;
  line-height: 16px;
  color: #3A3A3C;
  pointer-events: none;
  white-space: nowrap;
}
.vslider.is-disabled { opacity: 0.45; }

.layout-electronics {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  min-width: 0;
}
.e-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}
.e-id { min-width: 0; flex: 1 1 auto; text-align: left; }
.e-title {
  display: block;
  margin: 0;
  font-size: 32px;
  line-height: 38px;
  letter-spacing: -0.4px;
  font-weight: 400;
  color: #111111;
  overflow-wrap: anywhere;
}
.uptime {
  display: block;
  margin: 2px 0 0;
  font-family: ${cjkFamily};
  font-size: 20px;
  line-height: 26px;
  letter-spacing: -0.2px;
  color: #3A3A3C;
  overflow-wrap: anywhere;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 12px;
  width: 100%;
  min-width: 0;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
  flex: 1 1 auto;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: #8A8B8E;
  font-family: ${cjkFamily};
  font-size: 13px;
  line-height: 16px;
  text-align: left;
}
.meta-item span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.meta-item.location { justify-content: flex-end; }
.well {
  width: 100%;
  aspect-ratio: 10 / 7;
  max-height: 320px;
  border: 0;
  padding: 0;
  cursor: pointer;
}
.well .ph { position: absolute; inset: 0; }
.battery {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  text-align: left;
  color: inherit;
}
.battery-value {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  font-weight: 500;
  font-size: 44px;
  line-height: 52px;
  letter-spacing: -0.5px;
  color: #111111;
}
.battery-label {
  display: block;
  margin: 2px 0 0;
  font-family: ${cjkFamily};
  font-size: 20px;
  line-height: 26px;
  letter-spacing: -0.2px;
}
.battery-label.full { color: #3E8F6A; }
.battery-label.charging { color: #3A3A3C; }
.battery-label.idle, .battery-label.muted { color: #8A8B8E; }
.metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  min-width: 0;
}
.tile {
  flex: 1 1 140px;
  min-width: min(140px, 100%);
  background: #FFFFFF;
  border: 0;
  border-radius: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 18px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  text-align: center;
}
.tile .k {
  font-family: ${cjkFamily};
  font-size: 16px;
  line-height: 21px;
  letter-spacing: -0.1px;
  color: #6B6C6F;
  overflow-wrap: anywhere;
}
.tile .v {
  font-size: 16px;
  line-height: 20px;
  letter-spacing: -0.1px;
  color: #111111;
  white-space: nowrap;
}

.error, .note, .warning {
  margin: 0;
  font-family: ${cjkFamily};
  font-size: 13px;
  line-height: 16px;
}
.error, .note { padding: 0 24px 16px; }
.error { color: #8C3A3A; }
.note { color: #6B6C6F; text-align: center; }
.warning {
  color: #6B6C6F;
  text-align: center;
  padding: 48px 24px;
}

.cjk { font-family: ${cjkFamily}; }
`;
