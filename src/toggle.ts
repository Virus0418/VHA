import type { HassEntity, HomeAssistant } from "./types";

/** Domains that can be flipped with a bottom switch on the card. */
export const TOGGLE_DOMAINS = new Set([
  "light",
  "switch",
  "fan",
  "input_boolean",
  "cover",
  "lock",
  "climate",
  "media_player",
  "humidifier",
  "siren",
  "remote",
  "vacuum",
  "water_heater",
  "valve",
  "automation",
  "script",
  "input_button",
  "scene",
  "button",
]);

const ON_STATES = new Set([
  "on",
  "open",
  "opening",
  "unlocked",
  "unlocking",
  "playing",
  "paused",
  "home",
  "heat",
  "cool",
  "heat_cool",
  "auto",
  "dry",
  "fan_only",
  "cleaning",
  "returning",
]);

export function domainOf(entityId: string): string {
  return entityId.split(".")[0] ?? "";
}

export function isToggleable(entityId: string): boolean {
  return TOGGLE_DOMAINS.has(domainOf(entityId));
}

export function isActive(state?: HassEntity): boolean {
  if (!state) return false;
  if (state.state === "unavailable" || state.state === "unknown") return false;
  const domain = domainOf(state.entity_id);
  if (domain === "cover") return !["closed", "closing"].includes(state.state);
  if (domain === "lock") return !["locked", "locking"].includes(state.state);
  // Play/pause pair: only an actively playing player is "on", so a second
  // click can call media_play after media_pause.
  if (domain === "media_player") return state.state === "playing" || state.state === "buffering";
  if (domain === "vacuum") return !["docked", "idle", "off", "paused"].includes(state.state);
  return ON_STATES.has(state.state);
}

export function defaultStatus(hass: HomeAssistant | undefined, state?: HassEntity): string {
  if (!state) return "不可用";
  if (state.state === "unavailable") return "不可用";
  if (state.state === "unknown") return "未知";
  if (hass?.formatEntityState) return hass.formatEntityState(state);
  const domain = domainOf(state.entity_id);
  if (domain === "light" && isActive(state)) {
    const mode = state.attributes.color_mode;
    if (typeof state.attributes.brightness === "number") {
      const pct = Math.round((Number(state.attributes.brightness) / 255) * 100);
      return `${pct}%`;
    }
    if (mode === "color_temp") return "Neutral Light";
    return "On";
  }
  if (isActive(state)) return "On";
  return "Off";
}

export async function toggleEntity(hass: HomeAssistant, state: HassEntity): Promise<void> {
  const entityId = state.entity_id;
  const domain = domainOf(entityId);
  const data = { entity_id: entityId };
  const currentlyOn = isActive(state);

  switch (domain) {
    case "lock":
      await hass.callService("lock", currentlyOn ? "lock" : "unlock", data);
      return;
    case "cover":
      await hass.callService("cover", currentlyOn ? "close_cover" : "open_cover", data);
      return;
    case "climate":
      await hass.callService("climate", currentlyOn ? "turn_off" : "turn_on", data);
      return;
    case "media_player":
      await hass.callService(
        "media_player",
        currentlyOn ? "media_pause" : "media_play",
        data,
      );
      return;
    case "vacuum":
      await hass.callService("vacuum", currentlyOn ? "return_to_base" : "start", data);
      return;
    case "scene":
    case "script":
    case "button":
    case "input_button":
      await hass.callService(domain, domain === "input_button" || domain === "button" ? "press" : "turn_on", data);
      return;
    default:
      await hass.callService(domain, currentlyOn ? "turn_off" : "turn_on", data);
  }
}
