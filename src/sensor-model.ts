import { asNumber, attrText, formatQuantity, metricText, unitOf } from "./format";
import { domainOf, isActive, toggleEntity } from "./toggle";
import type {
  HassEntity,
  HomeAssistant,
  SensorChipConfig,
  SensorMetricConfig,
  VhaSensorCardConfig,
} from "./types";

export type SensorLayout = "insight" | "metrics";

export interface SensorChipView {
  name: string;
  entityId?: string;
  mode?: string;
  selected: boolean;
  disabled: boolean;
}

export interface SensorTile {
  entityId: string;
  label: string;
  value: string;
}

export interface SensorTarget {
  entityId: string;
  label: string;
  fraction: number;
  valueLabel: string;
  disabled: boolean;
  supported: boolean;
}

export interface SensorView {
  kind: "empty" | "invalid" | "insight" | "metrics";
  message?: string;
  layout: SensorLayout;
  entityId?: string;
  title: string;
  caption: string;
  value: string;
  tagline: string;
  showTimeline: boolean;
  chips: SensorChipView[];
  target?: SensorTarget;
  tiles: SensorTile[];
}

export function resolveSensorLayout(value?: string): SensorLayout {
  return value === "metrics" ? "metrics" : "insight";
}

export function qualityLabel(value: number, unit?: string): string {
  const norm = (unit ?? "").replace(/\s+/g, "");
  if (norm === "%" || norm === "％") {
    if (value >= 70) return "优";
    if (value >= 50) return "良";
    if (value >= 30) return "中";
    return "差";
  }
  if (value <= 50) return "优";
  if (value <= 100) return "良";
  if (value <= 150) return "中";
  return "差";
}

export interface HistorySample {
  at: number;
  value: number;
}

export interface TimelineBucket {
  label: string;
  text: string;
}

const AXIS = [8, 10, 12, 14, 16, 18, 20];

export function timelineAxisLabels(): string[] {
  return AXIS.map((hour) => `${String(hour).padStart(2, "0")}:00`);
}

/** Bucket samples onto the 08:00–20:00 axis. Empty input stays empty — nothing is invented. */
export function timelineBuckets(samples: HistorySample[], unit?: string, now = new Date()): TimelineBucket[] {
  if (!samples.length) return [];
  const day = new Date(now);
  day.setHours(0, 0, 0, 0);
  return AXIS.map((hour) => {
    const stamp = day.getTime() + hour * 3600 * 1000;
    let best: HistorySample | undefined;
    let distance = Infinity;
    for (const sample of samples) {
      const delta = Math.abs(sample.at - stamp);
      if (delta < distance) {
        distance = delta;
        best = sample;
      }
    }
    const near = best && distance <= 2 * 3600 * 1000 ? best : undefined;
    return {
      label: `${String(hour).padStart(2, "0")}:00`,
      text: near ? qualityLabel(near.value, unit) : "",
    };
  });
}

export function parseHistoryPayload(payload: unknown, entityId: string): HistorySample[] {
  const rows = historyRows(payload, entityId);
  const samples: HistorySample[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const record = row as Record<string, unknown>;
    const state = record.s ?? record.state;
    const value = asNumber(state);
    const when = record.lu ?? record.last_updated ?? record.last_changed ?? record.lc;
    const at = typeof when === "number" ? when : Date.parse(String(when ?? ""));
    if (value == null || Number.isNaN(at)) continue;
    samples.push({ at, value });
  }
  return samples;
}

function historyRows(payload: unknown, entityId: string): unknown[] {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    const nested = payload.find((item) => Array.isArray(item) || (item && typeof item === "object"));
    if (Array.isArray(nested)) return nested;
    return payload;
  }
  if (typeof payload === "object" && payload && entityId in payload) {
    const rows = (payload as Record<string, unknown>)[entityId];
    return Array.isArray(rows) ? rows : [];
  }
  return [];
}

function parseChips(value: unknown): SensorChipConfig[] {
  if (!Array.isArray(value)) return [];
  const chips: SensorChipConfig[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const raw = item as SensorChipConfig;
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    const entity = typeof raw.entity === "string" ? raw.entity.trim() : "";
    const mode = typeof raw.mode === "string" ? raw.mode.trim() : "";
    if (!name && !entity) continue;
    chips.push({ name: name || undefined, entity: entity || undefined, mode: mode || undefined });
  }
  return chips;
}

function parseMetrics(value: unknown): SensorMetricConfig[] {
  if (!Array.isArray(value)) return [];
  const metrics: SensorMetricConfig[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const raw = item as SensorMetricConfig;
    const entity = typeof raw.entity === "string" ? raw.entity.trim() : "";
    if (!entity) continue;
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    metrics.push({ entity, name: name || undefined });
  }
  return metrics;
}

function chipSelected(state: HassEntity | undefined, mode?: string): boolean {
  if (!state || state.state === "unavailable" || state.state === "unknown") return false;
  if (!mode) return isActive(state);
  const domain = domainOf(state.entity_id);
  if (domain === "climate") return state.state === mode;
  if (domain === "fan") return state.attributes.preset_mode === mode;
  return state.attributes.mode === mode;
}

function tileValue(state?: HassEntity): string {
  if (!state) return "不可用";
  if (state.state === "on") return "开";
  if (state.state === "off") return "关";
  return metricText(state);
}

export function readTarget(state?: HassEntity): { fraction: number; label: string; supported: boolean } {
  if (!state) return { fraction: 0, label: "不可用", supported: false };
  if (state.state === "unavailable") return { fraction: 0, label: "不可用", supported: false };
  if (state.state === "unknown") return { fraction: 0, label: "未知", supported: false };
  const domain = domainOf(state.entity_id);
  if (domain === "humidifier") {
    const min = asNumber(state.attributes.min_humidity) ?? 30;
    const max = asNumber(state.attributes.max_humidity) ?? 80;
    const current = asNumber(state.attributes.humidity) ?? min;
    const span = Math.max(1, max - min);
    return {
      fraction: Math.min(1, Math.max(0, (current - min) / span)),
      label: formatQuantity(current, "%"),
      supported: true,
    };
  }
  if (domain === "number" || domain === "input_number") {
    const min = asNumber(state.attributes.min) ?? 0;
    const max = asNumber(state.attributes.max) ?? 100;
    const current = asNumber(state.state) ?? min;
    const span = Math.max(1, max - min);
    return {
      fraction: Math.min(1, Math.max(0, (current - min) / span)),
      label: formatQuantity(current, unitOf(state)),
      supported: true,
    };
  }
  if (domain === "fan") {
    const current = asNumber(state.attributes.percentage) ?? 0;
    return { fraction: current / 100, label: formatQuantity(current, "%"), supported: true };
  }
  return { fraction: 0, label: "不能调节", supported: false };
}

export function targetValueForFraction(state: HassEntity, fraction: number): { service: string; data: Record<string, unknown> } | undefined {
  const domain = domainOf(state.entity_id);
  const clamped = Math.min(1, Math.max(0, fraction));
  if (domain === "humidifier") {
    const min = asNumber(state.attributes.min_humidity) ?? 30;
    const max = asNumber(state.attributes.max_humidity) ?? 80;
    const humidity = Math.round(min + clamped * (max - min));
    return { service: "set_humidity", data: { entity_id: state.entity_id, humidity } };
  }
  if (domain === "number" || domain === "input_number") {
    const min = asNumber(state.attributes.min) ?? 0;
    const max = asNumber(state.attributes.max) ?? 100;
    const step = asNumber(state.attributes.step) ?? 1;
    const raw = min + clamped * (max - min);
    const steps = Math.round((raw - min) / step);
    const value = Math.min(max, Math.max(min, min + steps * step));
    return { service: "set_value", data: { entity_id: state.entity_id, value } };
  }
  if (domain === "fan") {
    const percentage = Math.round(clamped * 100);
    return { service: "set_percentage", data: { entity_id: state.entity_id, percentage } };
  }
  return undefined;
}

function insightValue(state?: HassEntity): { value: string; tagline: string } {
  if (!state) return { value: "不可用", tagline: "实体不存在" };
  if (state.state === "unavailable") return { value: "不可用", tagline: "不可用" };
  if (state.state === "unknown") return { value: "未知", tagline: "未知" };
  const numeric = asNumber(state.state);
  if (numeric == null) {
    if (state.state === "on") return { value: "开", tagline: "" };
    if (state.state === "off") return { value: "关", tagline: "" };
    return { value: state.state, tagline: "" };
  }
  return { value: formatQuantity(numeric, unitOf(state)), tagline: "" };
}

export function buildSensorView(config: VhaSensorCardConfig, hass?: HomeAssistant): SensorView {
  const layout = resolveSensorLayout(config.layout);
  const metrics = parseMetrics(config.metrics);
  const entityId = config.entity?.trim();
  if (layout === "metrics") {
    const source = metrics.length ? metrics : entityId ? [{ entity: entityId, name: config.name }] : [];
    if (!source.length) {
      return { kind: "empty", layout, title: "", caption: "", value: "", tagline: "", showTimeline: false, chips: [], tiles: [], message: "请选择一个实体" };
    }
    const tiles = source.map((item) => {
      const state = item.entity && hass ? hass.states[item.entity] : undefined;
      return {
        entityId: item.entity || "",
        label: item.name || attrText(state?.attributes.friendly_name) || item.entity || "指标",
        value: tileValue(state),
      };
    });
    const title = config.name || tiles[0]?.label || "用电";
    return {
      kind: "metrics",
      layout,
      entityId,
      title,
      caption: "",
      value: "",
      tagline: "",
      showTimeline: false,
      chips: [],
      tiles,
    };
  }

  if (!entityId) {
    return { kind: "empty", layout, title: "", caption: "", value: "", tagline: "", showTimeline: false, chips: [], tiles: [], message: "请选择一个实体" };
  }
  const domain = domainOf(entityId);
  const state = hass?.states[entityId];
  const readable = ["sensor", "binary_sensor", "number", "input_number"].includes(domain);
  const title = config.name || attrText(state?.attributes.friendly_name) || entityId;
  if (!readable) {
    return {
      kind: "invalid",
      layout,
      entityId,
      title,
      caption: "",
      value: "",
      tagline: "",
      showTimeline: false,
      chips: [],
      tiles: [],
      message: "请选择传感器",
    };
  }
  const reading = insightValue(state);
  const chips = parseChips(config.chips).map((chip) => {
    const chipState = chip.entity && hass ? hass.states[chip.entity] : undefined;
    const missing = Boolean(chip.entity && hass && !chipState);
    const dead = !chip.entity || !chipState || chipState.state === "unavailable" || chipState.state === "unknown";
    return {
      name: chip.name || attrText(chipState?.attributes.friendly_name) || "模式",
      entityId: chip.entity,
      mode: chip.mode,
      selected: chipSelected(chipState, chip.mode),
      disabled: dead || missing,
    };
  });
  const targetId = config.target_entity?.trim();
  let target: SensorTarget | undefined;
  if (targetId) {
    const targetState = hass?.states[targetId];
    const readingTarget = readTarget(targetState);
    target = {
      entityId: targetId,
      label: config.target_label || attrText(targetState?.attributes.friendly_name) || "目标",
      fraction: readingTarget.fraction,
      valueLabel: targetState ? readingTarget.label : "实体不存在",
      disabled: !targetState || !readingTarget.supported || targetState.state === "unavailable" || targetState.state === "unknown",
      supported: Boolean(targetState && readingTarget.supported),
    };
  }
  const autoTag = reading.tagline;
  return {
    kind: "insight",
    layout,
    entityId,
    title,
    caption: config.caption || "空气质量",
    value: reading.value,
    tagline: config.status || autoTag,
    showTimeline: config.show_timeline !== false,
    chips,
    target,
    tiles: [],
  };
}

export async function pressSensorChip(hass: HomeAssistant, chip: SensorChipView): Promise<void> {
  if (!chip.entityId) return;
  const state = hass.states[chip.entityId];
  if (!state || state.state === "unavailable" || state.state === "unknown") throw new Error(state?.state === "unknown" ? "未知" : "不可用");
  const domain = domainOf(state.entity_id);
  if (chip.mode && domain === "climate") {
    if (state.state === "off") await hass.callService("climate", "turn_on", { entity_id: state.entity_id });
    await hass.callService("climate", "set_hvac_mode", { entity_id: state.entity_id, hvac_mode: chip.mode });
    return;
  }
  if (chip.mode && domain === "humidifier") {
    await hass.callService("humidifier", "set_mode", { entity_id: state.entity_id, mode: chip.mode });
    return;
  }
  if (chip.mode && domain === "fan") {
    await hass.callService("fan", "set_preset_mode", { entity_id: state.entity_id, preset_mode: chip.mode });
    return;
  }
  await toggleEntity(hass, state);
}

export async function writeSensorTarget(hass: HomeAssistant, entityId: string, fraction: number): Promise<void> {
  const state = hass.states[entityId];
  if (!state || state.state === "unavailable" || state.state === "unknown") {
    throw new Error(state?.state === "unknown" ? "未知" : "不可用");
  }
  const command = targetValueForFraction(state, fraction);
  if (!command) throw new Error("不能调节");
  await hass.callService(domainOf(entityId), command.service, command.data);
}
