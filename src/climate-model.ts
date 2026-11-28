import { asNumber, attrText, formatQuantity } from "./format";
import type { HassEntity, HomeAssistant, VhaClimateCardConfig } from "./types";

const HVAC_LABELS: Record<string, string> = {
  off: "关闭",
  heat: "制热",
  cool: "制冷",
  heat_cool: "冷热",
  auto: "自动",
  dry: "除湿",
  fan_only: "送风",
  fan: "送风",
};

export type ClimateTone = "heat" | "cool" | "off" | "neutral";

export interface ClimateChip {
  mode: string;
  label: string;
  selected: boolean;
}

export interface ClimateView {
  kind: "empty" | "invalid" | "card";
  message?: string;
  entityId?: string;
  title: string;
  caption: string;
  value: string;
  tagline: string;
  tone: ClimateTone;
  chips: ClimateChip[];
  showFan: boolean;
  fanFraction: number;
  fanLabel: string;
  controlsDisabled: boolean;
  powerOn: boolean;
  powerDisabled: boolean;
}

export function hvacLabel(mode: string): string {
  return HVAC_LABELS[mode] ?? mode;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Hero temperature keeps one decimal (`21.0 °`, `22.5 °`). */
export function heroTemperature(value: number): string {
  const text = value.toFixed(1);
  return `${text}\u00A0°`;
}

export function targetTemperature(value: number): string {
  return formatQuantity(round1(value), "°");
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
}

export function parseFanPercent(mode: string): number | undefined {
  const match = mode.trim().match(/^(\d+(?:\.\d+)?)\s*%?$/);
  if (!match) return undefined;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return undefined;
  return Math.min(100, Math.max(0, value));
}

export function readFan(state?: HassEntity): { show: boolean; fraction: number; label: string } {
  const modes = stringList(state?.attributes.fan_modes);
  if (!state || modes.length === 0) {
    return { show: false, fraction: 0, label: formatQuantity(0, "%") };
  }
  const current = attrText(state.attributes.fan_mode) ?? "";
  const numeric = modes.map(parseFanPercent);
  let fraction = 0;
  if (numeric.every((item) => item != null)) {
    fraction = (parseFanPercent(current) ?? 0) / 100;
  } else if (modes.length === 1) {
    fraction = current === modes[0] ? 1 : 0;
  } else {
    const index = Math.max(0, modes.indexOf(current));
    fraction = index / (modes.length - 1);
  }
  const percent = Math.round(Math.min(1, Math.max(0, fraction)) * 100);
  return { show: true, fraction, label: formatQuantity(percent, "%") };
}

export function fanModeForFraction(state: HassEntity, fraction: number): string | undefined {
  const modes = stringList(state.attributes.fan_modes);
  if (!modes.length) return undefined;
  const numeric = modes.map(parseFanPercent);
  const clamped = Math.min(1, Math.max(0, fraction));
  if (numeric.every((item) => item != null)) {
    const target = Math.round(clamped * 100);
    let best = modes[0];
    let distance = Infinity;
    modes.forEach((mode, index) => {
      const delta = Math.abs((numeric[index] as number) - target);
      if (delta < distance) {
        distance = delta;
        best = mode;
      }
    });
    return best;
  }
  const index = Math.round(clamped * (modes.length - 1));
  return modes[Math.max(0, Math.min(modes.length - 1, index))];
}

function targetOf(state: HassEntity): number | undefined {
  return (
    asNumber(state.attributes.temperature) ??
    asNumber(state.attributes.target_temp_high) ??
    asNumber(state.attributes.target_temp_low)
  );
}

export function climateTagline(state?: HassEntity): string {
  if (!state) return "不可用";
  if (state.state === "unavailable") return "不可用";
  if (state.state === "unknown") return "未知";
  if (state.state === "off") return "已关闭";
  if (state.state === "fan_only" || state.state === "fan") return "送风";
  if (state.state === "heat_cool") {
    const low = asNumber(state.attributes.target_temp_low);
    const high = asNumber(state.attributes.target_temp_high);
    if (low != null && high != null) return `维持 ${targetTemperature(low)} – ${targetTemperature(high)}`;
  }
  const target = targetOf(state);
  const verb: Record<string, string> = {
    heat: "制热至",
    cool: "制冷至",
    auto: "自动至",
    dry: "除湿至",
  };
  const prefix = verb[state.state];
  if (prefix && target != null) return `${prefix} ${targetTemperature(target)}`;
  return hvacLabel(state.state);
}

export function climateTone(state?: HassEntity): ClimateTone {
  if (!state || state.state === "off" || state.state === "unavailable" || state.state === "unknown") return "off";
  const action = attrText(state.attributes.hvac_action) ?? "";
  if (state.state === "heat" || action === "heating") return "heat";
  if (state.state === "cool" || action === "cooling") return "cool";
  if (state.state === "heat_cool" || state.state === "auto") {
    if (action === "cooling") return "cool";
    if (action === "heating") return "heat";
    return state.state === "auto" ? "neutral" : "heat";
  }
  return "neutral";
}

function blocked(state?: HassEntity): boolean {
  return !state || state.state === "unavailable" || state.state === "unknown" || state.state === "off";
}

export function buildClimateView(config: VhaClimateCardConfig, hass?: HomeAssistant): ClimateView {
  const entityId = config.entity?.trim();
  if (!entityId) {
    return blank("empty", "请选择一个实体");
  }
  const domain = entityId.split(".")[0] ?? "";
  const state = hass?.states[entityId];
  const title = config.name || attrText(state?.attributes.friendly_name) || entityId;
  if (domain !== "climate") {
    return { ...blank("invalid", "请选择气候实体"), entityId, title };
  }
  if (!state) {
    return {
      ...blank("card", "实体不存在"),
      entityId,
      title,
      value: "不可用",
      tagline: "实体不存在",
      controlsDisabled: true,
      powerDisabled: true,
    };
  }
  const current = asNumber(state.attributes.current_temperature);
  const fallback = targetOf(state);
  let value = "—";
  if (state.state === "unavailable") value = "不可用";
  else if (state.state === "unknown") value = "未知";
  else if (current != null) value = heroTemperature(current);
  else if (fallback != null) value = heroTemperature(fallback);
  const modes = stringList(state.attributes.hvac_modes).filter((mode) => mode !== "off");
  const fan = readFan(state);
  const dead = state.state === "unavailable" || state.state === "unknown";
  const off = state.state === "off";
  return {
    kind: "card",
    entityId,
    title,
    caption: "气候",
    value,
    tagline: climateTagline(state),
    tone: climateTone(state),
    chips: modes.map((mode) => ({
      mode,
      label: hvacLabel(mode),
      selected: !dead && !off && state.state === mode,
    })),
    showFan: config.show_fan !== false && fan.show,
    fanFraction: fan.fraction,
    fanLabel: fan.label,
    controlsDisabled: blocked(state),
    powerOn: !dead && !off,
    powerDisabled: dead,
  };
}

function blank(kind: ClimateView["kind"], message: string): ClimateView {
  return {
    kind,
    message,
    title: "",
    caption: "气候",
    value: "",
    tagline: "",
    tone: "off",
    chips: [],
    showFan: false,
    fanFraction: 0,
    fanLabel: formatQuantity(0, "%"),
    controlsDisabled: true,
    powerOn: false,
    powerDisabled: true,
  };
}

function requireClimate(state?: HassEntity): HassEntity {
  if (!state || state.state === "unavailable" || state.state === "unknown") {
    throw new Error(state?.state === "unknown" ? "未知" : "不可用");
  }
  return state;
}

export async function setClimatePower(hass: HomeAssistant, state: HassEntity, on: boolean): Promise<void> {
  const current = requireClimate(state);
  const active = current.state !== "off";
  if (active === on) return;
  await hass.callService("climate", on ? "turn_on" : "turn_off", { entity_id: current.entity_id });
}

export async function setClimateMode(hass: HomeAssistant, state: HassEntity, mode: string): Promise<void> {
  const current = requireClimate(state);
  if (current.state === "off") throw new Error("已关闭");
  await hass.callService("climate", "set_hvac_mode", { entity_id: current.entity_id, hvac_mode: mode });
}

export async function setClimateFan(hass: HomeAssistant, state: HassEntity, fraction: number): Promise<void> {
  const current = requireClimate(state);
  if (current.state === "off") throw new Error("已关闭");
  const mode = fanModeForFraction(current, fraction);
  if (!mode) return;
  await hass.callService("climate", "set_fan_mode", { entity_id: current.entity_id, fan_mode: mode });
}
