import { asNumber } from "./format";
import type {
  HomeAssistant,
  VhaClimateCardConfig,
  VhaDeviceCardConfig,
  VhaMediaCardConfig,
  VhaSensorCardConfig,
} from "./types";

const DEAD = new Set(["unavailable", "unknown"]);

/** Card-picker previews are illustrative. Home Assistant also ignores pointer events there. */
export function isPickerPreview(host: HTMLElement): boolean {
  let node: Node | null = host;
  while (node) {
    if (node instanceof Element && node.tagName === "HUI-CARD-PICKER") return true;
    node = node instanceof ShadowRoot ? node.host : node.parentNode;
  }
  return false;
}

function idsOf(value: string[] | undefined): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string" && item.includes("."));
}

function domainOf(entityId: string): string {
  return entityId.split(".")[0] ?? "";
}

/** Unused entities, then entities already on the dashboard, then anything else in hass. */
export function stubEntityOrder(
  hass: HomeAssistant | undefined,
  entities: string[] | undefined,
  entitiesFallback: string[] | undefined,
): string[] {
  const primary = idsOf(entities);
  const seen = new Set(primary);
  const fallback = idsOf(entitiesFallback).filter((id) => !seen.has(id));
  for (const id of fallback) seen.add(id);
  const rest = Object.keys(hass?.states ?? {}).filter((id) => !seen.has(id));
  return [...primary, ...fallback, ...rest];
}

function entityState(hass: HomeAssistant | undefined, entityId: string) {
  return hass?.states[entityId];
}

function isAlive(hass: HomeAssistant | undefined, entityId: string): boolean {
  const state = entityState(hass, entityId);
  return Boolean(state && !DEAD.has(state.state));
}

function firstMatch(
  hass: HomeAssistant | undefined,
  order: string[],
  domains: string[],
  accept: (entityId: string) => boolean,
): string | undefined {
  for (const entityId of order) {
    if (!domains.includes(domainOf(entityId))) continue;
    if (!entityState(hass, entityId)) continue;
    if (accept(entityId)) return entityId;
  }
  return undefined;
}

function firstOf(
  hass: HomeAssistant | undefined,
  order: string[],
  domains: string[],
  refine?: (entityId: string) => boolean,
): string | undefined {
  const alive = firstMatch(
    hass,
    order,
    domains,
    (entityId) => isAlive(hass, entityId) && (refine ? refine(entityId) : true),
  );
  if (alive) return alive;
  return firstMatch(hass, order, domains, (entityId) => (refine ? refine(entityId) : true));
}

function hasModes(hass: HomeAssistant | undefined, entityId: string): boolean {
  const modes = entityState(hass, entityId)?.attributes.hvac_modes;
  return Array.isArray(modes) && modes.some((mode) => mode !== "off");
}

export function climateStub(
  hass?: HomeAssistant,
  entities?: string[],
  entitiesFallback?: string[],
): VhaClimateCardConfig {
  const order = stubEntityOrder(hass, entities, entitiesFallback);
  const entity = firstOf(hass, order, ["climate"], (id) => hasModes(hass, id)) ?? firstOf(hass, order, ["climate"]);
  return { type: "custom:vha-climate-card", entity: entity ?? "" };
}

const DEVICE_PREFERENCES: Array<{ domains: string[]; layout: "large" | "vertical" }> = [
  { domains: ["humidifier"], layout: "large" },
  { domains: ["light"], layout: "vertical" },
  { domains: ["fan"], layout: "large" },
  { domains: ["switch", "input_boolean"], layout: "large" },
  { domains: ["cover", "lock", "vacuum", "water_heater"], layout: "large" },
];

export function deviceStub(
  hass?: HomeAssistant,
  entities?: string[],
  entitiesFallback?: string[],
): VhaDeviceCardConfig {
  const order = stubEntityOrder(hass, entities, entitiesFallback);
  for (const preference of DEVICE_PREFERENCES) {
    const entity = firstOf(hass, order, preference.domains);
    if (entity) return { type: "custom:vha-device-card", entity, layout: preference.layout };
  }
  return { type: "custom:vha-device-card", entity: "", layout: "large" };
}

function numericSensor(hass: HomeAssistant | undefined, entityId: string): boolean {
  if (domainOf(entityId) !== "sensor") return false;
  const state = entityState(hass, entityId);
  return Boolean(state && asNumber(state.state) != null);
}

function featuredSensor(hass: HomeAssistant | undefined, entityId: string): boolean {
  if (!numericSensor(hass, entityId) || !isAlive(hass, entityId)) return false;
  const state = entityState(hass, entityId);
  const unit = state?.attributes.unit_of_measurement;
  const deviceClass = state?.attributes.device_class;
  return (typeof unit === "string" && unit.trim() !== "") || (typeof deviceClass === "string" && deviceClass.trim() !== "");
}

export function sensorStub(
  hass?: HomeAssistant,
  entities?: string[],
  entitiesFallback?: string[],
): VhaSensorCardConfig {
  const order = stubEntityOrder(hass, entities, entitiesFallback);
  const featured = order.find((entityId) => featuredSensor(hass, entityId));
  if (featured) return { type: "custom:vha-sensor-card", entity: featured, layout: "insight" };
  const numeric = order.filter((entityId) => isAlive(hass, entityId) && numericSensor(hass, entityId));
  if (numeric.length >= 2) {
    return {
      type: "custom:vha-sensor-card",
      layout: "metrics",
      metrics: numeric.slice(0, 2).map((entity) => ({ entity })),
    };
  }
  if (numeric[0]) return { type: "custom:vha-sensor-card", entity: numeric[0], layout: "insight" };
  const any = firstOf(hass, order, ["sensor", "binary_sensor"]);
  if (any) return { type: "custom:vha-sensor-card", entity: any, layout: "insight" };
  return { type: "custom:vha-sensor-card", entity: "", layout: "insight" };
}

export function mediaStub(
  hass?: HomeAssistant,
  entities?: string[],
  entitiesFallback?: string[],
): VhaMediaCardConfig {
  const order = stubEntityOrder(hass, entities, entitiesFallback);
  const entity = firstOf(hass, order, ["media_player"]);
  return { type: "custom:vha-media-card", entity: entity ?? "" };
}
