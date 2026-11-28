import { bindInfo, openMoreInfo } from "./bind";
import { escapeAttr, escapeHtml, shortError } from "./format";
import { markIcon } from "./icons";
import { buildMediaView, pressRoom, pressTransport, type MediaView } from "./media-model";
import { paintChanged } from "./paint";
import { isPickerPreview, mediaStub } from "./stub";
import { cardStyles } from "./styles";
import type { HomeAssistant, VhaMediaCardConfig } from "./types";

export class VhaMediaCard extends HTMLElement {
  private _config: VhaMediaCardConfig = {};
  private _hass?: HomeAssistant;
  private _sheet?: CSSStyleSheet;
  private _error = "";
  private _broken = new Set<string>();
  private _paintKey = "";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static getConfigElement() {
    return document.createElement("vha-media-card-editor");
  }

  static getStubConfig(
    hass?: HomeAssistant,
    entities: string[] = [],
    entitiesFallback: string[] = [],
  ): VhaMediaCardConfig {
    return mediaStub(hass, entities, entitiesFallback);
  }

  setConfig(config: VhaMediaCardConfig) {
    if (!config || typeof config !== "object") throw new Error("VHA 媒体卡需要一份配置");
    this._config = { ...config };
    this._error = "";
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
    return 4;
  }

  getGridOptions() {
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
    if (!this.shadowRoot) return;
    this._ensureStyles();
    const view = buildMediaView(this._config, this._hass);
    const image = view.image && !this._broken.has(view.image) ? view.image : undefined;
    const decision = paintChanged(this._paintKey, { view, image: image ?? "", error: this._error });
    if (!decision.changed) return;
    this.shadowRoot.innerHTML = renderMedia(view, image, this._error);
    this._bind(view);
    this._paintKey = decision.key;
  }

  private _bind(view: MediaView) {
    const root = this.shadowRoot;
    if (!root) return;
    bindInfo(root, (id) => openMoreInfo(this, id));
    root.querySelectorAll<HTMLButtonElement>("[data-transport]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        const state = view.entityId ? this._hass?.states[view.entityId] : undefined;
        const action = el.dataset.transport;
        if (!this._hass || !state || el.disabled || (action !== "prev" && action !== "play" && action !== "next")) return;
        void this._run(() => pressTransport(this._hass!, state, action));
      });
    });
    root.querySelectorAll<HTMLButtonElement>("[data-room]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        const entityId = el.dataset.room || "";
        if (!this._hass || !entityId || el.disabled) return;
        void this._run(() => pressRoom(this._hass!, entityId));
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
  }
}

function renderMedia(view: MediaView, image: string | undefined, error: string): string {
  if (view.kind === "empty" || view.kind === "invalid") {
    return `<ha-card class="card"><p class="warning">${escapeHtml(view.message || "请选择一个实体")}</p></ha-card>`;
  }
  const id = view.entityId || "";
  const art = image
    ? `<img data-src="${escapeAttr(image)}" src="${escapeAttr(image)}" alt="">`
    : `<span class="disc-ph" aria-hidden="true"></span>`;
  const rooms = view.rooms
    .map(
      (room) => `<div class="room">
        <button class="room-name info" type="button" data-info="${escapeAttr(room.entityId)}">${escapeHtml(room.name)}</button>
        <button class="switch${room.on ? " on" : ""}" type="button" role="switch" aria-checked="${room.on}" data-room="${escapeAttr(room.entityId)}" ${room.disabled ? "disabled" : ""} aria-label="${escapeAttr(room.name)}"></button>
      </div>`,
    )
    .join("");
  const disabled = view.transportDisabled ? "disabled" : "";
  return `<ha-card class="card media">
    <div class="layout-media">
      <div class="ihead">
        <button class="ititle info" type="button" data-info="${escapeAttr(id)}">${escapeHtml(view.title)}</button>
        <button class="overflow" type="button" data-info="${escapeAttr(id)}" aria-label="更多信息">${markIcon("ellipsis", 22)}</button>
      </div>
      <div class="media-body">
        <div class="player">
          <button class="media-time info" type="button" data-info="${escapeAttr(id)}">${escapeHtml(view.timeLabel)}</button>
          <button class="ring info${view.dim ? " is-off" : ""}" type="button" data-info="${escapeAttr(id)}" aria-label="封面">${art}</button>
          <div class="transport">
            <button type="button" data-transport="prev" ${disabled} aria-label="上一首">${markIcon("prev", 22)}</button>
            <button type="button" data-transport="play" ${disabled} aria-label="${view.playing ? "暂停" : "播放"}">${markIcon(view.playing ? "pause" : "play", 22)}</button>
            <button type="button" data-transport="next" ${disabled} aria-label="下一首">${markIcon("next", 22)}</button>
          </div>
        </div>
        ${rooms ? `<div class="rooms">${rooms}</div>` : ""}
      </div>
    </div>
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
  </ha-card>`;
}
