import { bindHorizontalSlider, bindInfo, openMoreInfo, percentLabel } from "./bind";
import { escapeAttr, escapeHtml, shortError, unitOf } from "./format";
import { markIcon } from "./icons";
import {
  buildSensorView,
  parseHistoryPayload,
  pressSensorChip,
  readTarget,
  timelineAxisLabels,
  timelineBuckets,
  writeSensorTarget,
  type SensorView,
} from "./sensor-model";
import { cardStyles } from "./styles";
import type { HomeAssistant, VhaSensorCardConfig } from "./types";

export class VhaSensorCard extends HTMLElement {
  private _config: VhaSensorCardConfig = {};
  private _hass?: HomeAssistant;
  private _sheet?: CSSStyleSheet;
  private _error = "";
  private _dragging = false;
  private _historyToken = 0;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static getConfigElement() {
    return document.createElement("vha-sensor-card-editor");
  }

  static getStubConfig(): VhaSensorCardConfig {
    return { type: "custom:vha-sensor-card", entity: "", layout: "insight" };
  }

  setConfig(config: VhaSensorCardConfig) {
    if (!config || typeof config !== "object") throw new Error("VHA 传感器卡需要一份配置");
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
    return this._config.layout === "metrics" ? 4 : 7;
  }

  getGridOptions() {
    if (this._config.layout === "metrics") return { columns: 3, min_columns: 2, rows: 4, min_rows: 3 };
    return { columns: 6, min_columns: 2, rows: 6, min_rows: 4 };
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
    const view = buildSensorView(this._config, this._hass);
    this.shadowRoot.innerHTML = renderSensor(view, this._error);
    this._bind(view);
    if (view.kind === "insight" && view.showTimeline && view.entityId) void this._loadHistory(view.entityId);
  }

  private async _loadHistory(entityId: string) {
    const token = ++this._historyToken;
    const hass = this._hass;
    if (!hass?.callWS) return;
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    try {
      const payload = await hass.callWS({
        type: "history/history_during_period",
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        entity_ids: [entityId],
        minimal_response: true,
        no_attributes: true,
      });
      if (token !== this._historyToken || this._dragging) return;
      const state = hass.states[entityId];
      const buckets = timelineBuckets(parseHistoryPayload(payload, entityId), unitOf(state), end);
      const node = this.shadowRoot?.querySelector("[data-timeline]");
      if (!node) return;
      const filled = buckets.some((bucket) => bucket.text);
      node.innerHTML = filled ? renderBuckets(buckets) : `<p class="timeline-empty">暂无历史</p>`;
    } catch {
      const node = this.shadowRoot?.querySelector("[data-timeline]");
      if (node && token === this._historyToken) node.innerHTML = `<p class="timeline-empty">暂无历史</p>`;
    }
  }

  private _bind(view: SensorView) {
    const root = this.shadowRoot;
    if (!root) return;
    bindInfo(root, (id) => openMoreInfo(this, id));
    root.querySelectorAll<HTMLButtonElement>("[data-chip]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        const chip = view.chips[Number(el.dataset.chip)];
        if (!this._hass || !chip || el.disabled) return;
        void this._run(() => pressSensorChip(this._hass!, chip));
      });
    });
    const slider = root.querySelector<HTMLElement>("[data-slider='target']");
    if (slider && view.target) {
      const target = view.target;
      bindHorizontalSlider(slider, {
        labelFor: (fraction) => {
          const state = this._hass?.states[target.entityId];
          if (!state) return percentLabel(fraction);
          return labelForTarget(state.entity_id, state, fraction);
        },
        setDragging: (value) => {
          this._dragging = value;
        },
        commit: (fraction) => {
          if (!this._hass) return;
          void this._run(() => writeSensorTarget(this._hass!, target.entityId, fraction));
        },
      });
    }
  }
}

function numberAttr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function labelForTarget(entityId: string, state: NonNullable<HomeAssistant["states"][string]>, fraction: number): string {
  if (entityId.startsWith("humidifier.")) {
    const min = numberAttr(state.attributes.min_humidity, 30);
    const max = numberAttr(state.attributes.max_humidity, 80);
    return readTarget({
      ...state,
      attributes: { ...state.attributes, humidity: Math.round(min + fraction * (max - min)) },
    }).label;
  }
  if (entityId.startsWith("fan.")) return percentLabel(fraction);
  const min = numberAttr(state.attributes.min, 0);
  const max = numberAttr(state.attributes.max, 100);
  return readTarget({
    ...state,
    state: String(min + fraction * (max - min)),
  }).label;
}

function renderBuckets(buckets: Array<{ label: string; text: string }>): string {
  const labels = timelineAxisLabels()
    .map((label) => `<span>${escapeHtml(label)}</span>`)
    .join("");
  const bands = buckets.map((bucket) => `<span>${escapeHtml(bucket.text)}</span>`).join("");
  return `<div class="thours">${labels}</div><div class="tticks"></div><div class="tbands">${bands}</div>`;
}

function renderSensor(view: SensorView, error: string): string {
  if (view.kind === "empty" || view.kind === "invalid") {
    return `<ha-card class="card"><p class="warning">${escapeHtml(view.message || "请选择一个实体")}</p></ha-card>`;
  }
  const foot = error ? `<p class="error">${escapeHtml(error)}</p>` : "";
  if (view.kind === "metrics") {
    const tiles = view.tiles
      .map(
        (tile) =>
          `<button class="tile" type="button" data-info="${escapeAttr(tile.entityId)}"><span class="k">${escapeHtml(tile.label)}</span><span class="v">${escapeHtml(tile.value)}</span></button>`,
      )
      .join("");
    return `<ha-card class="card metrics">
      <div class="layout-metrics">
        <button class="metrics-title info" type="button" data-info="${escapeAttr(view.tiles[0]?.entityId || view.entityId || "")}">${escapeHtml(view.title)}</button>
        <div class="stack-tiles">${tiles}</div>
      </div>
      ${foot}
    </ha-card>`;
  }
  const id = view.entityId || "";
  const chips = view.chips
    .map(
      (chip, index) =>
        `<button class="chip" type="button" data-chip="${index}" aria-pressed="${chip.selected}" ${chip.disabled ? "disabled" : ""}>${escapeHtml(chip.name)}</button>`,
    )
    .join("");
  const timeline = view.showTimeline
    ? `<div class="timeline" data-timeline><div class="thours">${timelineAxisLabels().map((label) => `<span>${label}</span>`).join("")}</div><div class="tticks"></div><p class="timeline-empty">暂无历史</p></div>`
    : "";
  const target = view.target
    ? `<div class="fanblock">
        <p class="fan-label">${escapeHtml(view.target.label)}</p>
        <div class="hslider" data-slider="target" role="slider" tabindex="${view.target.disabled ? "-1" : "0"}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(view.target.fraction * 100)}" aria-label="${escapeAttr(view.target.label)}" data-disabled="${view.target.disabled}" style="--p:${view.target.fraction}">
          <div class="htrack"><span class="hthumb"></span></div>
          <span class="hpct">${escapeHtml(view.target.valueLabel)}</span>
        </div>
      </div>`
    : "";
  const tagline = view.tagline
    ? `<button class="tagline info" type="button" data-info="${escapeAttr(id)}">${escapeHtml(view.tagline)}</button>`
    : "";
  return `<ha-card class="card card-lg insight">
    <div class="layout-insight">
      <div class="ihead">
        <button class="ititle info" type="button" data-info="${escapeAttr(id)}">${escapeHtml(view.title)}</button>
        <button class="overflow" type="button" data-info="${escapeAttr(id)}" aria-label="更多信息">${markIcon("ellipsis", 22)}</button>
      </div>
      <button class="eyebrow info" type="button" data-info="${escapeAttr(id)}">${escapeHtml(view.caption)}</button>
      <button class="hero info" type="button" data-info="${escapeAttr(id)}">${escapeHtml(view.value)}</button>
      ${tagline}
      ${timeline}
      ${chips ? `<div class="chips">${chips}</div>` : ""}
      ${target}
    </div>
    ${foot}
  </ha-card>`;
}
