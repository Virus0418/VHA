import "./index";
import type { HassEntity, HomeAssistant } from "./types";
import purifierUrl from "./assets/dyson-purifier.png";
import lampUrl from "./assets/hue-bloom.png";
import cameraUrl from "./assets/xiaomi-camera.png";
import homepodUrl from "./assets/homepod-mini.png";

type Store = Record<string, HassEntity>;

function entity(
  id: string,
  state: string,
  attributes: Record<string, unknown>,
): HassEntity {
  return { entity_id: id, state, attributes };
}

function createHass(): { hass: HomeAssistant; store: Store } {
  const store: Store = {
    "fan.dyson_pure_cool": entity("fan.dyson_pure_cool", "on", {
      friendly_name: "Air Purifier",
      model: "Dyson Pure Cool TP07",
      preset_mode: "Auto",
      entity_picture: purifierUrl,
    }),
    "light.hue_bloom": entity("light.hue_bloom", "off", {
      friendly_name: "Smart Lamp",
      model: "Philips Hue Bloom",
      color_mode: "color_temp",
      entity_picture: lampUrl,
    }),
    "switch.xiaomi_camera": entity("switch.xiaomi_camera", "on", {
      friendly_name: "Indoor Camera",
      model: "Xiaomi Smart Camera C300",
      entity_picture: cameraUrl,
    }),
    "media_player.homepod_mini": entity("media_player.homepod_mini", "playing", {
      friendly_name: "Speaker",
      model: "Apple HomePod Mini",
      media_title: "Music Active",
      entity_picture: homepodUrl,
    }),
  };

  const hass: HomeAssistant = {
    states: store,
    language: "zh-CN",
    callService: async (domain, service, data) => {
      const id = String(data?.entity_id ?? "");
      const current = store[id];
      if (!current) return;
      let next = current.state;
      if (domain === "media_player") {
        next = service === "media_pause" ? "paused" : "playing";
      } else if (service === "turn_off" || service === "media_pause") {
        next = "off";
      } else {
        next = "on";
      }
      store[id] = { ...current, state: next };
      document.querySelectorAll("vha-device-card").forEach((el) => {
        (el as HTMLElement & { hass: HomeAssistant }).hass = hass;
      });
    },
    formatEntityState: (stateObj) => {
      if (stateObj.entity_id === "fan.dyson_pure_cool" && stateObj.state === "on") return "Auto";
      if (stateObj.entity_id === "light.hue_bloom") {
        return stateObj.state === "on" ? "Neutral Light" : "Neutral Light";
      }
      if (stateObj.entity_id === "switch.xiaomi_camera" && stateObj.state === "on") {
        return "Motion Active";
      }
      if (stateObj.entity_id === "media_player.homepod_mini") {
        return stateObj.state === "playing" ? "Music Active" : "Idle";
      }
      return stateObj.state;
    },
  };

  return { hass, store };
}

const CARDS = [
  { entity: "fan.dyson_pure_cool", status: "Auto" },
  { entity: "light.hue_bloom", status: "Neutral Light" },
  { entity: "switch.xiaomi_camera", status: "Motion Active" },
  { entity: "media_player.homepod_mini", status: "Music Active" },
];

const { hass } = createHass();
const root = document.getElementById("cards")!;
for (const cfg of CARDS) {
  const el = document.createElement("vha-device-card") as HTMLElement & {
    setConfig: (c: unknown) => void;
    hass: HomeAssistant;
  };
  el.setConfig({ type: "custom:vha-device-card", ...cfg });
  el.hass = hass;
  root.appendChild(el);
}
