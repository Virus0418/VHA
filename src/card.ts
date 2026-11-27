import { cardStyles } from "./styles";
import type { HomeAssistant, VhaDeviceCardConfig } from "./types";
import {
  defaultStatus,
  domainOf,
  isActive,
  isToggleable,
  toggleEntity,
} from "./toggle";

const MORE_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/>
</svg>`;

const PLACEHOLDER_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
  <rect x="4" y="5" width="16" height="14" rx="2.5"/>
  <path d="m4 15 4.2-4.2a1.5 1.5 0 0 1 2.1 0L16 16"/>
  <circle cx="16.2" cy="9" r="1.2"/>
</svg>`;

function attrText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export class VhaDeviceCard extends HTMLElement {
  private _config: VhaDeviceCardConfig = {};
  private _hass?: HomeAssistant;
  private _sheet?: CSSStyleSheet;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static getConfigElement() {
    return document.createElement("vha-device-card-editor");
  }

  static getStubConfig(): VhaDeviceCardConfig {
    return { type: "custom:vha-device-card", entity: "" };
  }

  setConfig(config: VhaDeviceCardConfig) {
    if (!config) throw new Error("VHA 设备卡需要一份配置");
    this._config = { ...config };
    this._render();
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this._render();
  }

  get hass(): HomeAssistant | undefined {
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

  private _ensureStyles() {
    if (!this.shadowRoot) return;
    if (!this._sheet) {
      this._sheet = new CSSStyleSheet();
      this._sheet.replaceSync(cardStyles);
    }
    this.shadowRoot.adoptedStyleSheets = [this._sheet];
  }

  private _openMoreInfo(entityId: string) {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId },
      }),
    );
  }

  private async _onToggle(ev: Event) {
    ev.stopPropagation();
    ev.preventDefault();
    const entityId = this._config.entity;
    if (!this._hass || !entityId) return;
    const state = this._hass.states[entityId];
    if (!state) return;
    await toggleEntity(this._hass, state);
  }

  private _render() {
    if (!this.shadowRoot) return;
    this._ensureStyles();
    const cfg = this._config;
    const entityId = cfg.entity;
    const state = entityId && this._hass ? this._hass.states[entityId] : undefined;

    if (!entityId) {
      this.shadowRoot.innerHTML = `<ha-card class="card"><div class="inner"><p class="warning">请选择一个实体</p></div></ha-card>`;
      return;
    }

    const name =
      cfg.name ||
      attrText(state?.attributes.friendly_name) ||
      entityId;
    const model =
      cfg.model ||
      attrText(state?.attributes.model) ||
      attrText(state?.attributes.model_id) ||
      attrText(state?.attributes.device_class) ||
      domainOf(entityId);
    const status = cfg.status || defaultStatus(this._hass, state);
    const image =
      cfg.image ||
      attrText(state?.attributes.entity_picture) ||
      attrText(state?.attributes.image);
    const toggleable = isToggleable(entityId);
    const showToggle = cfg.show_toggle !== false && toggleable;
    const on = isActive(state);
    const unavailable = !state || state.state === "unavailable";

    this.shadowRoot.innerHTML = `
      <ha-card class="card">
        <div class="inner" role="button" tabindex="0">
          <div class="top">
            <div class="titles">
              <p class="name">${escapeHtml(name)}</p>
              <p class="model">${escapeHtml(model)}</p>
            </div>
            <button class="more" type="button" aria-label="更多信息">${MORE_ICON}</button>
          </div>
          <div class="art">
            ${image ? `<img src="${escapeAttr(image)}" alt="">` : `<div class="placeholder">${PLACEHOLDER_ICON}</div>`}
          </div>
          <div class="foot">
            <p class="status">${escapeHtml(status)}</p>
            ${
              showToggle
                ? `<button class="toggle ${on ? "on" : ""}" type="button" role="switch" aria-checked="${on}" ${unavailable ? "disabled" : ""} aria-label="开关"></button>`
                : ""
            }
          </div>
        </div>
      </ha-card>
    `;

    const inner = this.shadowRoot.querySelector(".inner") as HTMLElement | null;
    inner?.addEventListener("click", () => this._openMoreInfo(entityId));
    inner?.addEventListener("keydown", (ev: KeyboardEvent) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        this._openMoreInfo(entityId);
      }
    });
    this.shadowRoot.querySelector(".more")?.addEventListener("click", (ev) => {
      ev.stopPropagation();
      this._openMoreInfo(entityId);
    });
    this.shadowRoot.querySelector(".toggle")?.addEventListener("click", (ev) => this._onToggle(ev));
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
