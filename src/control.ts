import {
  asNumber,
  formatQuantity,
  modeLabel,
  unitOf,
} from "./format";
import { domainOf, isActive, isToggleable, toggleEntity } from "./toggle";
import type { DeviceActionConfig, HassEntity, HomeAssistant } from "./types";

const ICONS = ["steam", "chevron", "droplet"] as const;

export interface ResolvedAction {
  name: string;
  icon: (typeof ICONS)[number];
  pressed: boolean;
  entity?: string;
  mode?: string;
}

export function parseActions(value: unknown): DeviceActionConfig[] {
  if (!Array.isArray(value)) return [];
  const out: DeviceActionConfig[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const raw = item as DeviceActionConfig;
    const icon = raw.icon === "steam" || raw.icon === "chevron" || raw.icon === "droplet" ? raw.icon : undefined;
    const entity = typeof raw.entity === "string" && raw.entity.trim() ? raw.entity.trim() : undefined;
    const name = typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : undefined;
    const mode = typeof raw.mode === "string" && raw.mode.trim() ? raw.mode.trim() : undefined;
    if (!entity && !name && !mode) continue;
    out.push({ entity, name, icon, mode });
  }
  return out.slice(0, 3);
}

export function resolveActions(
  configured: unknown,
  state: HassEntity | undefined,
  active: boolean,
): ResolvedAction[] {
  const written = parseActions(configured);
  if (written.length) {
    return written.map((action, index) => ({
      name: action.name || (action.mode ? modeLabel(action.mode) : "动作"),
      icon: action.icon || ICONS[index] || "droplet",
      entity: action.entity,
      mode: action.mode,
      pressed: Boolean(action.mode && state && active && currentMode(state) === action.mode),
    }));
  }
  if (!state) return [];
  const domain = domainOf(state.entity_id);
  const modes = domain === "humidifier"
    ? stringList(state.attributes.available_modes)
    : domain === "fan"
      ? stringList(state.attributes.preset_modes)
      : [];
  return modes.slice(0, 3).map((mode, index) => ({
    name: modeLabel(mode),
    icon: ICONS[index] || "droplet",
    mode,
    pressed: active && currentMode(state) === mode,
  }));
}

export function currentMode(state: HassEntity): string | undefined {
  const domain = domainOf(state.entity_id);
  if (domain === "fan") return typeof state.attributes.preset_mode === "string" ? state.attributes.preset_mode : undefined;
  return typeof state.attributes.mode === "string" ? state.attributes.mode : undefined;
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
}

export async function setActive(hass: HomeAssistant, state: HassEntity, on: boolean): Promise<void> {
  if (isActive(state) === on) return;
  await toggleEntity(hass, state);
}

export async function pressPower(
  hass: HomeAssistant,
  primary: HassEntity,
  actions: ResolvedAction[],
  turnOn: boolean,
): Promise<void> {
  if (primary.state === "unavailable" || primary.state === "unknown") {
    throw new Error("不可用");
  }
  if (turnOn) {
    await setActive(hass, primary, true);
    return;
  }
  for (const action of actions) {
    if (!action.entity || action.entity === primary.entity_id) continue;
    const linked = hass.states[action.entity];
    if (!linked || !isActive(linked)) continue;
    await setActive(hass, linked, false);
  }
  await setActive(hass, hass.states[primary.entity_id] ?? primary, false);
}

export async function pressRail(
  hass: HomeAssistant,
  primary: HassEntity,
  action: ResolvedAction,
): Promise<void> {
  if (primary.state === "unavailable" || primary.state === "unknown") throw new Error("不可用");
  if (action.mode) {
    if (!isActive(primary)) await setActive(hass, primary, true);
    await setDeviceMode(hass, primary, action.mode);
    return;
  }
  if (!action.entity) return;
  const target = hass.states[action.entity];
  if (!target) throw new Error("实体不存在");
  if (target.state === "unavailable" || target.state === "unknown") throw new Error("不可用");
  if (action.entity !== primary.entity_id && !isActive(primary)) {
    await setActive(hass, primary, true);
  }
  await toggleEntity(hass, target);
}

async function setDeviceMode(hass: HomeAssistant, state: HassEntity, mode: string): Promise<void> {
  const domain = domainOf(state.entity_id);
  const entityId = state.entity_id;
  if (domain === "humidifier") {
    await hass.callService("humidifier", "set_mode", { entity_id: entityId, mode });
    return;
  }
  if (domain === "fan") {
    await hass.callService("fan", "set_preset_mode", { entity_id: entityId, preset_mode: mode });
    return;
  }
  throw new Error("当前实体不支持该动作");
}

export interface SliderReading {
  supported: boolean;
  fraction: number;
  label: string;
  icon: "sun" | "droplet" | "steam";
}

export function readSlider(state: HassEntity | undefined): SliderReading {
  if (!state) return { supported: false, fraction: 0, label: "不能调节", icon: "sun" };
  const domain = domainOf(state.entity_id);
  if (domain === "light") return lightSlider(state);
  if (domain === "fan") return fanSlider(state);
  if (domain === "humidifier") return humidifierSlider(state);
  if (domain === "cover") return coverSlider(state);
  if (domain === "media_player") return mediaSlider(state);
  if (domain === "input_number" || domain === "number") return numberSlider(state);
  return { supported: false, fraction: 0, label: "不能调节", icon: "sun" };
}

export function labelForFraction(state: HassEntity, fraction: number): string {
  const domain = domainOf(state.entity_id);
  const clamped = clamp01(fraction);
  if (domain === "light" || domain === "fan" || domain === "media_player" || domain === "cover") {
    return formatQuantity(Math.round(clamped * 100), "%");
  }
  if (domain === "humidifier") {
    if (clamped <= 0.04) return "关";
    const { min, max } = humidityRange(state);
    return formatQuantity(valueFromDetent(clamped, min, max), "%");
  }
  if (domain === "input_number" || domain === "number") {
    const { min, max } = numberRange(state);
    const value = min + clamped * (max - min);
    return formatQuantity(value, unitOf(state));
  }
  return formatQuantity(Math.round(clamped * 100), "%");
}

export async function writeSlider(hass: HomeAssistant, state: HassEntity, fraction: number): Promise<void> {
  if (state.state === "unavailable" || state.state === "unknown") throw new Error("不可用");
  const domain = domainOf(state.entity_id);
  const entityId = state.entity_id;
  const clamped = clamp01(fraction);
  if (domain === "light") {
    if (clamped <= 0) {
      await hass.callService("light", "turn_off", { entity_id: entityId });
      return;
    }
    await hass.callService("light", "turn_on", {
      entity_id: entityId,
      brightness: Math.max(1, Math.round(clamped * 255)),
    });
    return;
  }
  if (domain === "fan") {
    const percentage = Math.round(clamped * 100);
    if (percentage <= 0) {
      await hass.callService("fan", "turn_off", { entity_id: entityId });
      return;
    }
    if (!isActive(state)) await hass.callService("fan", "turn_on", { entity_id: entityId });
    await hass.callService("fan", "set_percentage", { entity_id: entityId, percentage });
    return;
  }
  if (domain === "humidifier") {
    if (clamped <= 0.04) {
      await hass.callService("humidifier", "turn_off", { entity_id: entityId });
      return;
    }
    const { min, max } = humidityRange(state);
    if (!isActive(state)) await hass.callService("humidifier", "turn_on", { entity_id: entityId });
    await hass.callService("humidifier", "set_humidity", {
      entity_id: entityId,
      humidity: valueFromDetent(clamped, min, max),
    });
    return;
  }
  if (domain === "cover") {
    const position = Math.round(clamped * 100);
    if (position <= 0) {
      await hass.callService("cover", "close_cover", { entity_id: entityId });
      return;
    }
    await hass.callService("cover", "set_cover_position", { entity_id: entityId, position });
    return;
  }
  if (domain === "media_player") {
    if (!isActive(state) && state.state === "off") {
      await hass.callService("media_player", "turn_on", { entity_id: entityId });
    }
    await hass.callService("media_player", "volume_set", {
      entity_id: entityId,
      volume_level: Math.round(clamped * 100) / 100,
    });
    return;
  }
  if (domain === "input_number" || domain === "number") {
    const { min, max } = numberRange(state);
    const step = asNumber(state.attributes.step) ?? 1;
    const raw = min + clamped * (max - min);
    const value = Math.round(raw / step) * step;
    await hass.callService(domain, "set_value", { entity_id: entityId, value });
    return;
  }
  throw new Error("当前实体不能用滑杆调节");
}

export function linkedActionOn(hass: HomeAssistant | undefined, actions: ResolvedAction[]): boolean {
  if (!hass) return false;
  return actions.some((action) => {
    if (!action.entity) return false;
    const linked = hass.states[action.entity];
    return Boolean(linked && isActive(linked));
  });
}

function lightSlider(state: HassEntity): SliderReading {
  const on = isActive(state);
  const brightness = asNumber(state.attributes.brightness);
  const pct = !on
    ? 0
    : brightness != null
      ? Math.round((brightness / 255) * 100)
      : Math.round(asNumber(state.attributes.brightness_pct) ?? 0);
  return { supported: true, fraction: clamp01(pct / 100), label: formatQuantity(pct, "%"), icon: "sun" };
}

function fanSlider(state: HassEntity): SliderReading {
  const on = isActive(state);
  const pct = on ? Math.round(asNumber(state.attributes.percentage) ?? 0) : 0;
  return { supported: true, fraction: clamp01(pct / 100), label: formatQuantity(pct, "%"), icon: "steam" };
}

function humidifierSlider(state: HassEntity): SliderReading {
  const { min, max } = humidityRange(state);
  if (!isActive(state)) return { supported: true, fraction: 0, label: "关", icon: "droplet" };
  const humidity = asNumber(state.attributes.humidity) ?? asNumber(state.attributes.current_humidity) ?? min;
  return {
    supported: true,
    fraction: detentFromValue(humidity, min, max),
    label: formatQuantity(humidity, "%"),
    icon: "droplet",
  };
}

function coverSlider(state: HassEntity): SliderReading {
  const position = isActive(state) ? Math.round(asNumber(state.attributes.current_position) ?? 0) : 0;
  return { supported: true, fraction: clamp01(position / 100), label: formatQuantity(position, "%"), icon: "sun" };
}

function mediaSlider(state: HassEntity): SliderReading {
  const volume = asNumber(state.attributes.volume_level) ?? 0;
  const pct = Math.round(clamp01(volume) * 100);
  return { supported: true, fraction: clamp01(volume), label: formatQuantity(pct, "%"), icon: "sun" };
}

function numberSlider(state: HassEntity): SliderReading {
  const { min, max } = numberRange(state);
  const value = asNumber(state.state) ?? min;
  const span = max - min || 1;
  return {
    supported: true,
    fraction: clamp01((value - min) / span),
    label: formatQuantity(value, unitOf(state)),
    icon: "sun",
  };
}

function humidityRange(state: HassEntity): { min: number; max: number } {
  const min = asNumber(state.attributes.min_humidity) ?? 30;
  const max = asNumber(state.attributes.max_humidity) ?? 80;
  return { min, max: max > min ? max : min + 1 };
}

function numberRange(state: HassEntity): { min: number; max: number } {
  const min = asNumber(state.attributes.min) ?? 0;
  const max = asNumber(state.attributes.max) ?? 100;
  return { min, max: max > min ? max : min + 1 };
}

function detentFromValue(value: number, min: number, max: number): number {
  const span = max - min || 1;
  const t = clamp01((value - min) / span);
  return 0.08 + t * 0.92;
}

function valueFromDetent(fraction: number, min: number, max: number): number {
  const t = clamp01((fraction - 0.08) / 0.92);
  return Math.round(min + t * (max - min));
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function entityIsToggleable(entityId?: string): boolean {
  return Boolean(entityId && isToggleable(entityId));
}
