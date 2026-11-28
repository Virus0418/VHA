import { boolField, editorStyle, entityField, mountHaForm, mountList, selectField, textField } from "./form";
import { resolveSensorLayout } from "./sensor-model";
import type { HomeAssistant, SensorChipConfig, SensorMetricConfig, VhaSensorCardConfig } from "./types";

const LABELS: Record<string, string> = {
  entity: "实体",
  name: "名称（留空则使用友好名称）",
  layout: "排版形式",
  caption: "眉题（如空气质量）",
  status: "短说明（留空则自动）",
  show_timeline: "显示时间轴",
  target_entity: "加湿器目标（留空则不显示、不调节）",
  target_label: "目标滑杆名称",
};

export class VhaSensorCardEditor extends HTMLElement {
  private _config: VhaSensorCardConfig = { type: "custom:vha-sensor-card", layout: "insight" };
  private _hass?: HomeAssistant;
  private _painting = false;

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this._render();
  }

  setConfig(config: VhaSensorCardConfig) {
    this._config = { type: "custom:vha-sensor-card", layout: "insight", show_timeline: true, ...config };
    if (!this._painting) this._render();
  }

  private _emit(config: VhaSensorCardConfig) {
    this._config = cleanSensor(config);
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }),
    );
    if (this._painting) return;
    this._painting = true;
    this._render();
    this._painting = false;
  }

  private _render() {
    const layout = resolveSensorLayout(this._config.layout);
    const formHost = (this.querySelector("[data-form]") as HTMLElement | null) ?? document.createElement("div");
    const extraHost = (this.querySelector("[data-extra]") as HTMLElement | null) ?? document.createElement("div");
    if (!this.querySelector("[data-form]")) {
      formHost.setAttribute("data-form", "");
      extraHost.setAttribute("data-extra", "");
      this.replaceChildren(formHost, extraHost);
    }
    const schema = [
      { ...entityField("entity"), required: layout === "insight" },
      textField("name"),
      selectField("layout", [
        { value: "insight", label: "洞察（空气质量）" },
        { value: "metrics", label: "指标（用电）" },
      ]),
    ];
    if (layout === "insight") {
      schema.push(
        textField("caption"),
        textField("status"),
        boolField("show_timeline"),
        entityField("target_entity"),
        textField("target_label"),
      );
    }
    const data = {
      entity: this._config.entity ?? "",
      name: this._config.name ?? "",
      layout,
      caption: this._config.caption ?? "",
      status: this._config.status ?? "",
      show_timeline: this._config.show_timeline !== false,
      target_entity: this._config.target_entity ?? "",
      target_label: this._config.target_label ?? "",
    };
    const usedForm = mountHaForm(formHost, {
      hass: this._hass,
      data,
      schema,
      labels: LABELS,
      onChange: (value) => {
        this._emit({
          ...this._config,
          entity: text(value.entity),
          name: text(value.name),
          layout: value.layout === "metrics" ? "metrics" : "insight",
          caption: text(value.caption),
          status: text(value.status),
          show_timeline: value.show_timeline !== false,
          target_entity: text(value.target_entity),
          target_label: text(value.target_label),
        });
      },
    });
    if (!usedForm) this._fallback(formHost);
    if (layout === "metrics") {
      mountList(extraHost, {
        title: "指标磁贴",
        addLabel: "添加指标",
        columns: [
          { key: "entity", label: "实体", kind: "text" },
          { key: "name", label: "名称", kind: "text" },
        ],
        rows: (this._config.metrics ?? []).map((item) => ({ entity: item.entity ?? "", name: item.name ?? "" })),
        onChange: (rows) => {
          const metrics: SensorMetricConfig[] = rows
            .map((row) => ({ entity: String(row.entity ?? "").trim(), name: String(row.name ?? "").trim() || undefined }))
            .filter((row) => row.entity);
          this._emit({ ...this._config, metrics });
        },
      });
      return;
    }
    mountList(extraHost, {
      title: "模式芯片（不填则不显示）",
      addLabel: "添加芯片",
      columns: [
        { key: "name", label: "名称", kind: "text" },
        { key: "entity", label: "实体", kind: "text" },
        { key: "mode", label: "模式值（可空）", kind: "text" },
      ],
      rows: (this._config.chips ?? []).map((item) => ({
        name: item.name ?? "",
        entity: item.entity ?? "",
        mode: item.mode ?? "",
      })),
      onChange: (rows) => {
        const chips: SensorChipConfig[] = rows
          .map((row) => ({
            name: String(row.name ?? "").trim() || undefined,
            entity: String(row.entity ?? "").trim() || undefined,
            mode: String(row.mode ?? "").trim() || undefined,
          }))
          .filter((row) => row.name || row.entity);
        this._emit({ ...this._config, chips });
      },
    });
  }

  private _fallback(host: HTMLElement) {
    const layout = resolveSensorLayout(this._config.layout);
    if (host.querySelector("[data-key='entity']") && host.dataset.layout === layout) {
      (host.querySelector("[data-key='entity']") as HTMLInputElement).value = this._config.entity ?? "";
      (host.querySelector("[data-key='name']") as HTMLInputElement).value = this._config.name ?? "";
      (host.querySelector("[data-key='layout']") as HTMLSelectElement).value = resolveSensorLayout(this._config.layout);
      const caption = host.querySelector("[data-key='caption']") as HTMLInputElement | null;
      if (caption) caption.value = this._config.caption ?? "";
      const status = host.querySelector("[data-key='status']") as HTMLInputElement | null;
      if (status) status.value = this._config.status ?? "";
      const timeline = host.querySelector("[data-key='show_timeline']") as HTMLInputElement | null;
      if (timeline) timeline.checked = this._config.show_timeline !== false;
      const target = host.querySelector("[data-key='target_entity']") as HTMLInputElement | null;
      if (target) target.value = this._config.target_entity ?? "";
      const targetLabel = host.querySelector("[data-key='target_label']") as HTMLInputElement | null;
      if (targetLabel) targetLabel.value = this._config.target_label ?? "";
      return;
    }
    const insight = layout === "insight";
    host.dataset.layout = layout;
    host.innerHTML = `
      <style>${editorStyle}</style>
      <div class="vha-editor">
        <label>实体 <input data-key="entity" type="text" placeholder="sensor.air_quality" /></label>
        <label>名称 <input data-key="name" type="text" /></label>
        <label>排版形式
          <select data-key="layout">
            <option value="insight">洞察（空气质量）</option>
            <option value="metrics">指标（用电）</option>
          </select>
        </label>
        ${insight ? `<label>眉题 <input data-key="caption" type="text" /></label>
        <label>短说明 <input data-key="status" type="text" /></label>
        <label class="row"><input data-key="show_timeline" type="checkbox" /> 显示时间轴</label>
        <label>加湿器目标（留空不显示） <input data-key="target_entity" type="text" /></label>
        <label>目标滑杆名称 <input data-key="target_label" type="text" /></label>` : ""}
      </div>`;
    host.querySelectorAll("input, select").forEach((input) => {
      input.addEventListener("change", () => this._fromFallback(host));
    });
    this._fallback(host);
  }

  private _fromFallback(host: HTMLElement) {
    const read = (key: string) => (host.querySelector(`[data-key="${key}"]`) as HTMLInputElement | null)?.value.trim();
    this._emit({
      ...this._config,
      entity: read("entity") || undefined,
      name: read("name") || undefined,
      layout: read("layout") === "metrics" ? "metrics" : "insight",
      caption: read("caption") || undefined,
      status: read("status") || undefined,
      show_timeline: (host.querySelector("[data-key='show_timeline']") as HTMLInputElement | null)?.checked !== false,
      target_entity: read("target_entity") || undefined,
      target_label: read("target_label") || undefined,
    });
  }
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function cleanSensor(config: VhaSensorCardConfig): VhaSensorCardConfig {
  const next: VhaSensorCardConfig = { type: "custom:vha-sensor-card", layout: resolveSensorLayout(config.layout) };
  if (config.entity) next.entity = config.entity;
  if (config.name) next.name = config.name;
  if (config.caption) next.caption = config.caption;
  if (config.status) next.status = config.status;
  if (config.show_timeline === false) next.show_timeline = false;
  if (config.target_entity) next.target_entity = config.target_entity;
  if (config.target_label) next.target_label = config.target_label;
  if (config.chips?.length) next.chips = config.chips;
  if (config.metrics?.length) next.metrics = config.metrics;
  return next;
}
