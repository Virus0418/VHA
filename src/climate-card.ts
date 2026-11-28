import { bindHorizontalSlider, bindInfo, openMoreInfo, percentLabel } from "./bind";
import {
  buildClimateView,
  setClimateFan,
  setClimateMode,
  setClimatePower,
  type ClimateView,
} from "./climate-model";
import { escapeAttr, escapeHtml, shortError } from "./format";
import { markIcon } from "./icons";
import { cardStyles } from "./styles";
import type { HomeAssistant, VhaClimateCardConfig } from "./types";

export class VhaClimateCard extends HTMLElement {
  private _config: VhaClimateCardConfig = {};
  private _hass?: HomeAssistant;
  private _sheet?: CSSStyleSheet;
  private _error = "";
  private _dragging = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static getConfigElement() {
    return document.createElement("vha-climate-card-editor");
  }

  static getStubConfig(): VhaClimateCardConfig {
    return { type: "custom:vha-climate-card", entity: "" };
  }

  setConfig(config: VhaClimateCardConfig) {
    if (!config || typeof config !== "object") throw new Error("VHA 气候卡需要一份配置");
    this._config = { ...config };
    this._error = "";
    this._render();
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    if (this._dragging) return;
    this._render();
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  getCardSize() {
    return 6;
  }

  getGridOptions() {
    return { columns: 6, min_columns: 2, rows: 5, min_rows: 4 };
  }

  connectedCallback() {
    this._render();
  }

  private _ensureStyles() {
    if (!this.shadowRoot || this._sheet) return;
    this._sheet = new CSSStyleSheet();
    this._sheet.replaceSync(cardStyles);
    this.shadowRoot.adoptedStyleSheets = [this._sheet];
  }

  private async _run(task: () => Promise<void>) {
    try {
      await task();
      this._error = "";
    } catch (err) {
      this._error = shortError(err);
    }
    this._render();
  }

  private _render() {
    if (!this.shadowRoot || this._dragging) return;
    this._ensureStyles();
    const view = buildClimateView(this._config, this._hass);
    this.shadowRoot.innerHTML = renderClimate(view, this._error);
    this._bind(view);
  }

  private _bind(view: ClimateView) {
    const root = this.shadowRoot;
    if (!root) return;
    bindInfo(root, (id) => openMoreInfo(this, id));
    root.querySelector<HTMLButtonElement>("[data-power]")?.addEventListener("click", (ev) => {
      ev.stopPropagation();
      ev.preventDefault();
      const state = view.entityId ? this._hass?.states[view.entityId] : undefined;
      if (!this._hass || !state || view.powerDisabled) return;
      void this._run(() => setClimatePower(this._hass!, state, !view.powerOn));
    });
    root.querySelectorAll<HTMLButtonElement>("[data-mode]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        const state = view.entityId ? this._hass?.states[view.entityId] : undefined;
        if (!this._hass || !state || el.disabled) return;
        void this._run(() => setClimateMode(this._hass!, state, el.dataset.mode || ""));
      });
    });
    const slider = root.querySelector<HTMLElement>("[data-slider='fan']");
    if (slider) {
      bindHorizontalSlider(slider, {
        labelFor: percentLabel,
        setDragging: (value) => {
          this._dragging = value;
        },
        commit: (fraction) => {
          const state = view.entityId ? this._hass?.states[view.entityId] : undefined;
          if (!this._hass || !state) return;
          void this._run(() => setClimateFan(this._hass!, state, fraction));
        },
      });
    }
  }
}

function renderClimate(view: ClimateView, error: string): string {
  if (view.kind === "empty" || view.kind === "invalid") {
    return `<ha-card class="card"><p class="warning">${escapeHtml(view.message || "请选择一个实体")}</p></ha-card>`;
  }
  const id = view.entityId || "";
  const chips = view.chips
    .map(
      (chip) =>
        `<button class="chip" type="button" data-mode="${escapeAttr(chip.mode)}" aria-pressed="${chip.selected}" ${view.controlsDisabled ? "disabled" : ""}>${escapeHtml(chip.label)}</button>`,
    )
    .join("");
  const fan = view.showFan
    ? `<div class="fanblock">
        <p class="fan-label">风速</p>
        <div class="hslider" data-slider="fan" role="slider" tabindex="${view.controlsDisabled ? "-1" : "0"}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(view.fanFraction * 100)}" aria-label="风速" data-disabled="${view.controlsDisabled}" style="--p:${view.fanFraction}">
          <div class="htrack"><span class="hthumb"></span></div>
          <span class="hpct">${escapeHtml(view.fanLabel)}</span>
        </div>
      </div>`
    : "";
  return `<ha-card class="card tone-${view.tone}">
    <div class="layout-climate">
      <div class="ihead">
        <button class="ititle info" type="button" data-info="${escapeAttr(id)}">${escapeHtml(view.title)}</button>
        <div class="iactions">
          <button class="overflow" type="button" data-info="${escapeAttr(id)}" aria-label="更多信息">${markIcon("ellipsis", 22)}</button>
          <button class="power${view.powerOn ? " on" : ""}" type="button" data-power aria-pressed="${view.powerOn}" ${view.powerDisabled ? "disabled" : ""} aria-label="电源">${markIcon("power", 22)}</button>
        </div>
      </div>
      <button class="eyebrow info" type="button" data-info="${escapeAttr(id)}">${escapeHtml(view.caption)}</button>
      <button class="hero info" type="button" data-info="${escapeAttr(id)}">${escapeHtml(view.value)}</button>
      <button class="tagline info" type="button" data-info="${escapeAttr(id)}">${escapeHtml(view.tagline)}</button>
      ${chips ? `<div class="chips">${chips}</div>` : ""}
      ${fan}
    </div>
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
  </ha-card>`;
}
