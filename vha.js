const y = `
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
`, b = /* @__PURE__ */ new Set([
  "light",
  "switch",
  "fan",
  "input_boolean",
  "cover",
  "lock",
  "climate",
  "media_player",
  "humidifier",
  "siren",
  "remote",
  "vacuum",
  "water_heater",
  "valve",
  "automation",
  "script",
  "input_button",
  "scene",
  "button"
]), _ = /* @__PURE__ */ new Set([
  "on",
  "open",
  "opening",
  "unlocked",
  "unlocking",
  "playing",
  "paused",
  "home",
  "heat",
  "cool",
  "heat_cool",
  "auto",
  "dry",
  "fan_only",
  "cleaning",
  "returning"
]);
function c(t) {
  return t.split(".")[0] ?? "";
}
function x(t) {
  return b.has(c(t));
}
function d(t) {
  if (!t || t.state === "unavailable" || t.state === "unknown") return !1;
  const e = c(t.entity_id);
  return e === "cover" ? !["closed", "closing"].includes(t.state) : e === "lock" ? !["locked", "locking"].includes(t.state) : e === "media_player" ? t.state === "playing" || t.state === "buffering" : e === "vacuum" ? !["docked", "idle", "off", "paused"].includes(t.state) : _.has(t.state);
}
function w(t, e) {
  if (!e || e.state === "unavailable") return "不可用";
  if (e.state === "unknown") return "未知";
  if (t?.formatEntityState) return t.formatEntityState(e);
  if (c(e.entity_id) === "light" && d(e)) {
    const a = e.attributes.color_mode;
    return typeof e.attributes.brightness == "number" ? `${Math.round(Number(e.attributes.brightness) / 255 * 100)}%` : a === "color_temp" ? "Neutral Light" : "On";
  }
  return d(e) ? "On" : "Off";
}
async function k(t, e) {
  const i = e.entity_id, a = c(i), o = { entity_id: i }, r = d(e);
  switch (a) {
    case "lock":
      await t.callService("lock", r ? "lock" : "unlock", o);
      return;
    case "cover":
      await t.callService("cover", r ? "close_cover" : "open_cover", o);
      return;
    case "climate":
      await t.callService("climate", r ? "turn_off" : "turn_on", o);
      return;
    case "media_player":
      await t.callService(
        "media_player",
        r ? "media_pause" : "media_play",
        o
      );
      return;
    case "vacuum":
      await t.callService("vacuum", r ? "return_to_base" : "start", o);
      return;
    case "scene":
    case "script":
    case "button":
    case "input_button":
      await t.callService(a, a === "input_button" || a === "button" ? "press" : "turn_on", o);
      return;
    default:
      await t.callService(a, r ? "turn_off" : "turn_on", o);
  }
}
const S = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/>
</svg>`, E = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
  <rect x="4" y="5" width="16" height="14" rx="2.5"/>
  <path d="m4 15 4.2-4.2a1.5 1.5 0 0 1 2.1 0L16 16"/>
  <circle cx="16.2" cy="9" r="1.2"/>
</svg>`;
function s(t) {
  return typeof t == "string" && t.trim() ? t : void 0;
}
class C extends HTMLElement {
  constructor() {
    super(), this._config = {}, this.attachShadow({ mode: "open" });
  }
  static getConfigElement() {
    return document.createElement("vha-device-card-editor");
  }
  static getStubConfig() {
    return { type: "custom:vha-device-card", entity: "" };
  }
  setConfig(e) {
    if (!e) throw new Error("VHA 设备卡需要一份配置");
    this._config = { ...e }, this._render();
  }
  set hass(e) {
    this._hass = e, this._render();
  }
  get hass() {
    return this._hass;
  }
  getCardSize() {
    return 3;
  }
  getGridOptions() {
    return { columns: 6, min_columns: 3, rows: 3, min_rows: 2 };
  }
  connectedCallback() {
    this._render();
  }
  _ensureStyles() {
    this.shadowRoot && (this._sheet || (this._sheet = new CSSStyleSheet(), this._sheet.replaceSync(y)), this.shadowRoot.adoptedStyleSheets = [this._sheet]);
  }
  _openMoreInfo(e) {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: !0,
        composed: !0,
        detail: { entityId: e }
      })
    );
  }
  async _onToggle(e) {
    e.stopPropagation(), e.preventDefault();
    const i = this._config.entity;
    if (!this._hass || !i) return;
    const a = this._hass.states[i];
    a && await k(this._hass, a);
  }
  _render() {
    if (!this.shadowRoot) return;
    this._ensureStyles();
    const e = this._config, i = e.entity, a = i && this._hass ? this._hass.states[i] : void 0;
    if (!i) {
      this.shadowRoot.innerHTML = '<ha-card class="card"><div class="inner"><p class="warning">请选择一个实体</p></div></ha-card>';
      return;
    }
    const o = e.name || s(a?.attributes.friendly_name) || i, r = e.model || s(a?.attributes.model) || s(a?.attributes.model_id) || s(a?.attributes.device_class) || c(i), g = e.status || w(this._hass, a), u = e.image || s(a?.attributes.entity_picture) || s(a?.attributes.image), m = x(i), f = e.show_toggle !== !1 && m, h = d(a), v = !a || a.state === "unavailable";
    this.shadowRoot.innerHTML = `
      <ha-card class="card">
        <div class="inner" role="button" tabindex="0">
          <div class="top">
            <div class="titles">
              <p class="name">${l(o)}</p>
              <p class="model">${l(r)}</p>
            </div>
            <button class="more" type="button" aria-label="更多信息">${S}</button>
          </div>
          <div class="art">
            ${u ? `<img src="${L(u)}" alt="">` : `<div class="placeholder">${E}</div>`}
          </div>
          <div class="foot">
            <p class="status">${l(g)}</p>
            ${f ? `<button class="toggle ${h ? "on" : ""}" type="button" role="switch" aria-checked="${h}" ${v ? "disabled" : ""} aria-label="开关"></button>` : ""}
          </div>
        </div>
      </ha-card>
    `;
    const p = this.shadowRoot.querySelector(".inner");
    p?.addEventListener("click", () => this._openMoreInfo(i)), p?.addEventListener("keydown", (n) => {
      (n.key === "Enter" || n.key === " ") && (n.preventDefault(), this._openMoreInfo(i));
    }), this.shadowRoot.querySelector(".more")?.addEventListener("click", (n) => {
      n.stopPropagation(), this._openMoreInfo(i);
    }), this.shadowRoot.querySelector(".toggle")?.addEventListener("click", (n) => this._onToggle(n));
  }
}
function l(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function L(t) {
  return l(t).replace(/'/g, "&#39;");
}
const q = [
  {
    name: "entity",
    required: !0,
    selector: { entity: {} }
  },
  {
    name: "name",
    selector: { text: {} }
  },
  {
    name: "model",
    selector: { text: {} }
  },
  {
    name: "status",
    selector: { text: {} }
  },
  {
    name: "image",
    selector: { text: {} }
  },
  {
    name: "show_toggle",
    selector: { boolean: {} }
  }
], M = {
  entity: "实体",
  name: "名称（留空则使用友好名称）",
  model: "型号 / 副标题",
  status: "状态文案（留空则根据实体状态自动显示）",
  image: "图片地址（留空则使用实体图片）",
  show_toggle: "显示底部开关"
};
class H extends HTMLElement {
  constructor() {
    super(...arguments), this._config = { type: "custom:vha-device-card" }, this._built = !1;
  }
  set hass(e) {
    this._hass = e, this._render();
  }
  setConfig(e) {
    this._config = { type: "custom:vha-device-card", show_toggle: !0, ...e }, this._render();
  }
  _emit(e) {
    this._config = e, this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: e }, bubbles: !0, composed: !0 })
    );
  }
  _render() {
    if (customElements.get("ha-form") && this._hass) {
      this._renderHaForm();
      return;
    }
    this._renderFallback();
  }
  _renderHaForm() {
    let e = this.querySelector("ha-form");
    e || (this.innerHTML = "", e = document.createElement("ha-form"), this.appendChild(e), e.addEventListener("value-changed", (i) => {
      const a = i.detail.value;
      this._emit({ ...this._config, ...a, type: "custom:vha-device-card" });
    })), e.hass = this._hass, e.data = this._config, e.schema = q, e.computeLabel = (i) => M[i.name] || i.name;
  }
  _renderFallback() {
    this._built || (this.innerHTML = `
        <style>
          .vha-editor { display: grid; gap: 10px; font-family: Inter, sans-serif; }
          .vha-editor label { display: grid; gap: 4px; font-size: 12px; color: #444; }
          .vha-editor input[type="text"] {
            height: 36px; border: 1px solid #e4e6ea; border-radius: 8px; padding: 0 10px; font: inherit;
          }
          .vha-editor .row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
        </style>
        <div class="vha-editor">
          <label>实体 <input data-key="entity" type="text" placeholder="light.living_room" /></label>
          <label>名称 <input data-key="name" type="text" placeholder="可选" /></label>
          <label>型号 / 副标题 <input data-key="model" type="text" placeholder="可选" /></label>
          <label>状态文案 <input data-key="status" type="text" placeholder="留空则自动" /></label>
          <label>图片地址 <input data-key="image" type="text" placeholder="留空则使用实体图片" /></label>
          <label class="row"><input data-key="show_toggle" type="checkbox" /> 显示底部开关</label>
        </div>
      `, this.querySelectorAll("input").forEach((i) => {
      i.addEventListener("change", () => this._fromFallback()), i.addEventListener("input", () => this._fromFallback());
    }), this._built = !0);
    const e = this._config;
    this.querySelector('[data-key="entity"]').value = e.entity ?? "", this.querySelector('[data-key="name"]').value = e.name ?? "", this.querySelector('[data-key="model"]').value = e.model ?? "", this.querySelector('[data-key="status"]').value = e.status ?? "", this.querySelector('[data-key="image"]').value = e.image ?? "", this.querySelector('[data-key="show_toggle"]').checked = e.show_toggle !== !1;
  }
  _fromFallback() {
    const e = (i) => this.querySelector(`[data-key="${i}"]`).value.trim();
    this._emit({
      type: "custom:vha-device-card",
      entity: e("entity") || void 0,
      name: e("name") || void 0,
      model: e("model") || void 0,
      status: e("status") || void 0,
      image: e("image") || void 0,
      show_toggle: this.querySelector('[data-key="show_toggle"]').checked
    });
  }
}
customElements.get("vha-device-card") || customElements.define("vha-device-card", C);
customElements.get("vha-device-card-editor") || customElements.define("vha-device-card-editor", H);
window.customCards = window.customCards || [];
window.customCards.some((t) => t.type === "vha-device-card") || window.customCards.push({
  type: "vha-device-card",
  name: "VHA 设备卡",
  description: "浅色产品化设备卡片：名称、型号、图片、状态和底部开关。",
  preview: !0
});
console.info(
  "%c VHA %c 1.0.0  device card ",
  "background:#3d82f2;color:#fff;border-radius:4px 0 0 4px;padding:2px 6px",
  "background:#111;color:#fff;border-radius:0 4px 4px 0;padding:2px 6px"
);
