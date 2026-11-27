export const cardStyles = `
:host {
  display: block;
  font-family: Inter, "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #111;
}

ha-card, .card {
  background: #f6f8fa;
  border-radius: 16px;
  border: 0;
  box-shadow: none;
  overflow: hidden;
  height: 100%;
}

.inner {
  position: relative;
  min-height: 168px;
  height: 100%;
  padding: 14px 14px 12px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.titles { min-width: 0; flex: 1; }

.name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: #111;
}

.model {
  margin: 4px 0 0;
  font-size: 11px;
  color: #9aa0a8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more {
  appearance: none;
  border: 0;
  background: transparent;
  color: #c2c6cc;
  width: 22px;
  height: 22px;
  padding: 0;
  display: grid;
  place-items: center;
  cursor: pointer;
  border-radius: 8px;
  flex: 0 0 22px;
}
.more:hover { color: #6f747c; background: rgba(0,0,0,0.04); }
.more svg { width: 14px; height: 14px; }

.art {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 58%;
  height: 78%;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}
.art img, .art .placeholder {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: right bottom;
  display: block;
}
.placeholder {
  display: grid;
  place-items: center;
  color: #c5c9cf;
}
.placeholder svg { width: 56px; height: 56px; opacity: 0.85; }

.foot {
  margin-top: auto;
  position: relative;
  z-index: 1;
  padding-top: 28px;
}

.status {
  margin: 0 0 8px;
  font-size: 12px;
  color: #6f747c;
}

.toggle {
  appearance: none;
  width: 36px;
  height: 20px;
  border-radius: 999px;
  border: 0;
  background: #e4e6ea;
  position: relative;
  cursor: pointer;
  padding: 0;
  transition: background 0.18s ease;
}
.toggle::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.18);
  transition: transform 0.18s ease;
}
.toggle.on { background: #1a1a1a; }
.toggle.on::after { transform: translateX(16px); }
.toggle:disabled { opacity: 0.45; cursor: default; }

.warning {
  margin: 0;
  font-size: 13px;
  color: #8b9199;
  padding: 28px 8px;
  text-align: center;
}
`;
