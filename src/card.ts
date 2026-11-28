import { labelForFraction, pressPower, pressRail, writeSlider, type ResolvedAction } from "./control";
import { escapeAttr, escapeHtml, shortError } from "./format";
import { actionIcon, silhouetteIcon, uiIcon } from "./icons";
import { buildView, type CardView, type RailButton } from "./model";
import { paintChanged } from "./paint";
import { deviceStub, isPickerPreview } from "./stub";
import { cardStyles } from "./styles";
import type { HomeAssistant, VhaDeviceCardConfig } from "./types";

export class VhaDeviceCard extends HTMLElement {
  private _config: VhaDeviceCardConfig = {};
  private _hass?: HomeAssistant;
  private _sheet?: CSSStyleSheet;
  private _error = "";
  private _imageIndex = 0;
  private _broken = new Set<string>();
  private _dragging = false;
  private _paintKey = "";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static getConfigElement() {
    return document.createElement("vha-device-card-editor");
  }

  static getStubConfig(
    hass?: HomeAssistant,
    entities: string[] = [],
    entitiesFallback: string[] = [],
  ): VhaDeviceCardConfig {
    return deviceStub(hass, entities, entitiesFallback);
  }

  setConfig(config: VhaDeviceCardConfig) {
    if (!config || typeof config !== "object") throw new Error("VHA 设备卡需要一份配置");
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
    const layout = this._config.layout;
    if (layout === "vertical") return 6;
    if (layout === "electronics") return 5;
    return 5;
  }

  getGridOptions() {
    const layout = this._config.layout;
    if (layout === "vertical") return { columns: 3, min_columns: 2, rows: 6, min_rows: 4 };
    if (layout === "electronics") return { columns: 6, min_columns: 2, rows: 4, min_rows: 2 };
    return { columns: 6, min_columns: 2, rows: 4, min_rows: 3 };
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

  private _openMoreInfo(entityId: string) {
    if (!entityId) return;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId },
      }),
    );
  }

  private _view(): CardView {
    return buildView(this._config, this._hass, this._imageIndex);
  }

  private async _run(task: () => Promise<void>) {
    if (isPickerPreview(this)) return;
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
    const view = this._view();
    if (view.empty) {
      const decision = paintChanged(this._paintKey, { empty: true, error: this._error });
      if (!decision.changed) return;
      this.shadowRoot.innerHTML = `<ha-card class="card"><p class="warning">请选择一个实体</p></ha-card>`;
      this._paintKey = decision.key;
      return;
    }
    const picture = view.image && !this._broken.has(view.image) ? view.image : undefined;
    const decision = paintChanged(this._paintKey, { view, picture: picture ?? "", error: this._error });
    if (!decision.changed) return;
    this.shadowRoot.innerHTML = renderCard(view, picture, this._error);
    this._bind(view);
    this._paintKey = decision.key;
  }

  private _bind(view: CardView) {
    const root = this.shadowRoot;
    if (!root) return;
    root.querySelectorAll<HTMLElement>("[data-info]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        this._openMoreInfo(el.dataset.info || "");
      });
    });
    root.querySelectorAll<HTMLButtonElement>("[data-switch]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        const entityId = el.dataset.switch || "";
        const state = entityId ? this._hass?.states[entityId] : undefined;
        if (!this._hass || !state || el.disabled) return;
        const turningOn = el.getAttribute("aria-checked") !== "true";
        const actions: ResolvedAction[] = (view.large?.actions ?? []).map((action) => ({
          name: action.name,
          icon: action.icon,
          pressed: action.pressed,
          entity: action.entity,
          mode: action.mode,
        }));
        void this._run(() => pressPower(this._hass!, state, actions, turningOn));
      });
    });
    root.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        const action = view.large?.actions[Number(el.dataset.action)];
        const state = view.entityId ? this._hass?.states[view.entityId] : undefined;
        if (!this._hass || !state || !action || el.disabled) return;
        void this._run(() => pressRail(this._hass!, state, action as ResolvedAction));
      });
    });
    root.querySelectorAll<HTMLButtonElement>("[data-nav]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        this._imageIndex += Number(el.dataset.nav) || 0;
        this._render();
      });
    });
    root.querySelectorAll<HTMLImageElement>("img[data-src]").forEach((img) => {
      img.addEventListener("error", () => {
        const src = img.dataset.src;
        if (!src || this._broken.has(src)) return;
        this._broken.add(src);
        this._render();
      });
    });
    const slider = root.querySelector<HTMLElement>(".vslider");
    if (slider) this._bindSlider(slider, view);
  }

  private _bindSlider(slider: HTMLElement, view: CardView) {
    if (slider.dataset.disabled === "true") return;
    const move = (clientY: number) => {
      const rect = slider.getBoundingClientRect();
      const travel = Math.max(1, rect.height - 100);
      const topEdge = clientY - rect.top - 22;
      const fraction = Math.min(1, Math.max(0, 1 - (topEdge - 22) / travel));
      slider.style.setProperty("--p", String(fraction));
      const label = slider.querySelector(".pct");
      const state = view.entityId ? this._hass?.states[view.entityId] : undefined;
      if (label && state) label.textContent = labelForFraction(state, fraction);
      slider.setAttribute("aria-valuenow", String(Math.round(fraction * 100)));
      return fraction;
    };
    const commit = (fraction: number) => {
      const state = view.entityId ? this._hass?.states[view.entityId] : undefined;
      if (!this._hass || !state) return;
      void this._run(() => writeSlider(this._hass!, state, fraction));
    };
    slider.addEventListener("pointerdown", (ev) => {
      ev.stopPropagation();
      ev.preventDefault();
      this._dragging = true;
      slider.setPointerCapture(ev.pointerId);
      move(ev.clientY);
    });
    slider.addEventListener("pointermove", (ev) => {
      if (!this._dragging) return;
      ev.stopPropagation();
      move(ev.clientY);
    });
    const finish = (ev: PointerEvent) => {
      if (!this._dragging) return;
      ev.stopPropagation();
      const fraction = move(ev.clientY);
      this._dragging = false;
      commit(fraction);
    };
    slider.addEventListener("pointerup", finish);
    slider.addEventListener("pointercancel", () => {
      this._dragging = false;
      this._render();
    });
    slider.addEventListener("keydown", (ev) => {
      const stepKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"];
      if (!stepKeys.includes(ev.key)) return;
      ev.preventDefault();
      ev.stopPropagation();
      const current = Number(slider.style.getPropertyValue("--p") || slider.dataset.fraction || "0");
      let next = current;
      if (ev.key === "ArrowUp" || ev.key === "ArrowRight") next = Math.min(1, current + 0.05);
      if (ev.key === "ArrowDown" || ev.key === "ArrowLeft") next = Math.max(0, current - 0.05);
      if (ev.key === "Home") next = 0;
      if (ev.key === "End") next = 1;
      commit(next);
    });
  }
}

function renderCard(view: CardView, picture: string | undefined, error: string): string {
  const body =
    view.layout === "vertical"
      ? renderVertical(view, picture)
      : view.layout === "electronics"
        ? renderElectronics(view, picture)
        : renderLarge(view, picture);
  const foot = [
    view.vertical?.note ? `<p class="note">${escapeHtml(view.vertical.note)}</p>` : "",
    error ? `<p class="error">${escapeHtml(error)}</p>` : "",
  ].join("");
  return `<ha-card class="card">${body}${foot}</ha-card>`;
}

function renderLarge(view: CardView, picture: string | undefined): string {
  const large = view.large;
  if (!large || !view.entityId) return "";
  const valueClass = large.valueKind === "number" ? "value" : "value is-text";
  const off = view.dim ? " is-off" : "";
  const fit = view.imageFit === "contain" ? "fit-contain" : "fit-cover";
  const switchHtml = large.showSwitch
    ? `<button class="switch${large.switchOn ? " on" : ""}" type="button" role="switch" aria-checked="${large.switchOn}" data-switch="${escapeAttr(view.entityId)}" ${view.blocked ? "disabled" : ""} aria-label="电源开关"></button>`
    : "";
  const rail = large.actions.length
    ? `<div class="rail" role="toolbar" aria-label="动作">${large.actions.map((action, index) => railButton(action, index)).join("")}</div>`
    : "";
  return `<div class="layout-large">
    <div class="shell">
      <div class="main">
        <div class="l-head">
          <button class="reading info" type="button" data-info="${escapeAttr(view.entityId)}">
            <span class="${valueClass}">${escapeHtml(large.value)}</span>
            ${large.caption ? `<span class="caption">${escapeHtml(large.caption)}</span>` : ""}
          </button>
          ${switchHtml}
        </div>
        <button class="photo info ${fit}${off}" type="button" data-info="${escapeAttr(view.entityId)}" aria-label="${escapeAttr(view.name)}">
          ${framePicture(picture, view.name, "generic")}
        </button>
      </div>
      ${rail}
    </div>
  </div>`;
}

function railButton(action: RailButton, index: number): string {
  return `<button class="rail-btn" type="button" data-action="${index}" aria-label="${escapeAttr(action.name)}" aria-pressed="${action.pressed}" ${action.disabled ? "disabled" : ""}>${actionIcon(action.icon, action.icon === "chevron" ? 22 : 24)}</button>`;
}

function renderVertical(view: CardView, picture: string | undefined): string {
  const vertical = view.vertical;
  if (!vertical || !view.entityId) return "";
  const off = view.dim ? " is-off" : "";
  const nav = vertical.showNav
    ? `<button class="nav prev" type="button" data-nav="-1" aria-label="上一张">${uiIcon("chevron-left", 20)}</button>
       <button class="nav next" type="button" data-nav="1" aria-label="下一张">${uiIcon("chevron-right", 20)}</button>`
    : "";
  const icon = vertical.icon === "droplet" ? "droplet" : vertical.icon === "steam" ? "steam" : "sun";
  return `<div class="layout-vertical">
    <div class="v-photo${off}">
      <button class="photo-hit info" type="button" data-info="${escapeAttr(view.entityId)}" aria-label="${escapeAttr(view.name)}">${framePicture(picture, view.name, "generic")}</button>
      ${nav}
    </div>
    <button class="v-title info" type="button" data-info="${escapeAttr(view.entityId)}">${escapeHtml(view.name)}</button>
    <div class="vslider${vertical.disabled ? " is-disabled" : ""}" role="slider" tabindex="${vertical.disabled ? "-1" : "0"}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(vertical.fraction * 100)}" aria-label="调节" data-fraction="${vertical.fraction}" data-disabled="${vertical.disabled}" style="--p:${vertical.fraction}">
      <span class="thumb">${uiIcon(icon, 22)}</span>
      <span class="pct">${escapeHtml(vertical.label)}</span>
    </div>
  </div>`;
}

function renderElectronics(view: CardView, picture: string | undefined): string {
  const card = view.electronics;
  if (!card || !view.entityId) return "";
  const off = view.dim ? " is-off" : "";
  const fit = view.imageFit === "cover" ? "fit-cover" : "fit-contain";
  const power = card.showPower && card.powerEntityId
    ? `<button class="switch${card.powerOn ? " on" : ""}" type="button" role="switch" aria-checked="${card.powerOn}" data-switch="${escapeAttr(card.powerEntityId)}" ${card.powerDisabled ? "disabled" : ""} aria-label="电源开关"></button>`
    : "";
  const uptime = card.uptime ? `<span class="uptime">${escapeHtml(card.uptime)}</span>` : "";
  const meta = renderMeta(card.network, card.location);
  const well = card.showWell
    ? `<button class="well info ${fit}${off}" type="button" data-info="${escapeAttr(view.entityId)}" aria-label="${escapeAttr(view.name)}">${picture && card.showPhoto ? framePicture(picture, card.placeholderLabel, card.silhouette) : placeholder(card.placeholderLabel, card.silhouette)}</button>`
    : "";
  const battery = card.battery
    ? `<button class="battery" type="button" data-info="${escapeAttr(card.battery.entityId)}">
        <span class="battery-value">${escapeHtml(card.battery.value)}${uiIcon(card.battery.tone === "full" ? "battery-full" : "battery", 22)}</span>
        <span class="battery-label ${card.battery.tone}">${escapeHtml(card.battery.label)}</span>
      </button>`
    : "";
  const tiles = card.tiles.length
    ? `<div class="metrics">${card.tiles
        .map(
          (tile) => `<button class="tile" type="button" data-info="${escapeAttr(tile.entityId)}">
            <span class="k">${escapeHtml(tile.label)}</span>
            <span class="v">${escapeHtml(tile.value)}</span>
          </button>`,
        )
        .join("")}</div>`
    : "";
  return `<div class="layout-electronics">
    <div class="e-head">
      <button class="e-id info" type="button" data-info="${escapeAttr(view.entityId)}">
        <span class="e-title">${escapeHtml(view.name)}</span>
        ${uptime}
      </button>
      ${power}
    </div>
    ${meta}
    ${well}
    ${battery}
    ${tiles}
  </div>`;
}

function renderMeta(
  network?: { text: string; entityId: string },
  location?: { text: string; entityId: string },
): string {
  if (!network && !location) return "";
  const left = network
    ? `<button class="meta-item" type="button" data-info="${escapeAttr(network.entityId)}">${uiIcon("wifi", 16)}<span>${escapeHtml(network.text)}</span></button>`
    : "<span></span>";
  const right = location
    ? `<button class="meta-item location" type="button" data-info="${escapeAttr(location.entityId)}">${uiIcon("home", 16)}<span>${escapeHtml(location.text)}</span></button>`
    : "";
  return `<div class="meta">${left}${right}</div>`;
}

function framePicture(src: string | undefined, label: string, kind: "tower" | "laptop" | "generic"): string {
  if (!src) return placeholder(label, kind);
  return `<img alt="" src="${escapeAttr(src)}" data-src="${escapeAttr(src)}">`;
}

function placeholder(label: string, kind: "tower" | "laptop" | "generic"): string {
  const caption = kind === "generic" && !label ? "" : `<span class="ph-label">${escapeHtml(label)}</span>`;
  return `<span class="ph">${silhouetteIcon(kind)}${caption}</span>`;
}
