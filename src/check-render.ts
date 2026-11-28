import "./index";
import type { HassEntity, HomeAssistant } from "./types";

class PreviewHaCard extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `<style>
      :host {
        display: block;
        background: var(--ha-card-background, var(--card-background-color, white));
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow, none);
        border-width: var(--ha-card-border-width, 1px);
        border-style: solid;
        border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0));
        color: var(--primary-text-color, inherit);
        overflow: hidden;
      }
    </style><slot></slot>`;
  }
}
if (!customElements.get("ha-card")) customElements.define("ha-card", PreviewHaCard);

type CardHost = HTMLElement & {
  setConfig: (config: Record<string, unknown>) => void;
  hass: HomeAssistant;
  getGridOptions?: () => { columns: number; min_columns: number; rows: number; min_rows: number };
};

const calls: string[] = [];
const store: Record<string, HassEntity> = {
  "climate.room": {
    entity_id: "climate.room",
    state: "off",
    attributes: {
      friendly_name: "客厅空调 空调插座",
      current_temperature: 25,
      temperature: 26,
      hvac_modes: ["off", "cool", "heat", "auto", "fan_only", "dry"],
      fan_modes: ["0", "40", "60", "100"],
      fan_mode: "0",
    },
  },
  "climate.heat": {
    entity_id: "climate.heat",
    state: "heat",
    attributes: {
      friendly_name: "Living room",
      current_temperature: 22.5,
      temperature: 24,
      hvac_modes: ["off", "heat", "cool"],
      hvac_action: "heating",
      fan_modes: ["0", "40", "60", "100"],
      fan_mode: "60",
    },
  },
  "climate.gone": {
    entity_id: "climate.gone",
    state: "unavailable",
    attributes: {
      friendly_name: "Living room",
      hvac_modes: ["off", "cool", "heat"],
    },
  },
  "switch.lamp": {
    entity_id: "switch.lamp",
    state: "on",
    attributes: { friendly_name: "灯" },
  },
  "sensor.air": {
    entity_id: "sensor.air",
    state: "35",
    attributes: { unit_of_measurement: "%", friendly_name: "Bedroom" },
  },
  "switch.vent": {
    entity_id: "switch.vent",
    state: "off",
    attributes: { friendly_name: "通风" },
  },
  "media_player.speaker": {
    entity_id: "media_player.speaker",
    state: "paused",
    attributes: { friendly_name: "Speaker", media_title: "Afternoon", media_position: 12, media_duration: 90 },
  },
};

function entityHass(fail = false): HomeAssistant {
  return {
    states: store,
    callService: async (domain, service, data) => {
      if (fail) throw new Error("not supported");
      calls.push(`${domain}.${service}`);
      const id = String(data?.entity_id ?? "");
      const current = store[id];
      if (!current) return;
      if (domain === "climate" && service === "set_hvac_mode" && typeof data?.hvac_mode === "string") {
        store[id] = { ...current, state: data.hvac_mode };
      }
      if (domain === "climate" && service === "turn_on") {
        store[id] = { ...current, state: current.state === "off" ? "heat" : current.state };
      }
      if (domain === "climate" && service === "turn_off") store[id] = { ...current, state: "off" };
      if (domain === "switch" && (service === "turn_on" || service === "turn_off")) {
        store[id] = { ...current, state: service === "turn_on" ? "on" : "off" };
      }
      if (domain === "media_player" && service === "media_play") store[id] = { ...current, state: "playing" };
      if (domain === "media_player" && service === "media_pause") store[id] = { ...current, state: "paused" };
    },
  };
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function storm(card: CardHost) {
  for (let i = 0; i < 25; i += 1) card.hass = entityHass();
}

function mount(tag: string, config: Record<string, unknown>, parent: HTMLElement = document.getElementById("out")!): CardHost {
  const card = document.createElement(tag) as CardHost;
  parent.append(card);
  card.setConfig(config);
  card.hass = entityHass();
  return card;
}

async function flush() {
  await new Promise((resolve) => setTimeout(resolve, 30));
}

async function main() {
  const climate = mount("vha-climate-card", { entity: "climate.room", show_fan: false });
  const grid = climate.getGridOptions?.();
  assert(Boolean(grid && grid.min_columns >= 4 && grid.rows >= 7), `grid ${JSON.stringify(grid)}`);
  const chip = climate.shadowRoot?.querySelector<HTMLButtonElement>("[data-mode='cool']");
  const title = climate.shadowRoot?.querySelector<HTMLButtonElement>(".ititle");
  const hero = climate.shadowRoot?.querySelector<HTMLButtonElement>(".hero");
  assert(Boolean(chip && title && hero), "off card keeps title, temperature, and chips");
  assert(chip!.disabled === false, "off chip is not disabled");
  assert(getComputedStyle(chip!).opacity === "1", "off chip does not fade");
  assert(getComputedStyle(chip!).backgroundColor === "rgb(255, 255, 255)", "off chip stays white");
  assert(getComputedStyle(title!.querySelector(".clamp")!).webkitLineClamp === "2", "title clamps to two lines");
  const shell = climate.shadowRoot?.querySelector("ha-card");
  assert(getComputedStyle(shell!).backgroundColor === "rgb(240, 239, 242)", "off card keeps the neutral ground");
  storm(climate);
  assert(chip!.isConnected && title!.isConnected, "hass storm kept the climate controls");
  const info: CustomEvent[] = [];
  climate.addEventListener("hass-more-info", (ev) => {
    info.push(ev as CustomEvent);
  });
  title!.click();
  hero!.click();
  assert(info.length === 2, "title and readout open more info");
  assert(info.every((ev) => ev.bubbles && ev.composed && ev.detail?.entityId === "climate.room"), "more-info detail");
  chip!.click();
  await flush();
  assert(calls.includes("climate.set_hvac_mode"), "cool chip from off calls set_hvac_mode");
  assert(store["climate.room"]?.state === "cool", "cool chip turns the climate on");

  const heat = mount("vha-climate-card", { entity: "climate.heat" });
  const heatChip = heat.shadowRoot?.querySelector<HTMLButtonElement>("[data-mode='heat']");
  const heatHero = heat.shadowRoot?.querySelector(".hero");
  const slider = heat.shadowRoot?.querySelector<HTMLElement>("[data-slider='fan']");
  assert(Boolean(heatChip && heatHero && slider), "heat card has a fan slider");
  const before = heatHero!.textContent;
  slider!.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, clientX: 30, clientY: 8, pointerId: 1 }));
  store["climate.heat"] = {
    ...store["climate.heat"],
    attributes: { ...store["climate.heat"].attributes, current_temperature: 30 },
  };
  heat.hass = entityHass();
  assert(heatHero!.isConnected && heatHero!.textContent === before, "dragging does not rebuild the card");
  slider!.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true, clientX: 30, clientY: 8, pointerId: 1 }));
  await flush();

  const device = mount("vha-device-card", { entity: "switch.lamp", name: "灯" });
  const power = device.shadowRoot?.querySelector<HTMLButtonElement>("[data-switch]");
  assert(Boolean(power), "device power");
  storm(device);
  assert(power!.isConnected, "hass storm kept the device power");
  power!.click();
  await flush();
  assert(calls.includes("switch.turn_off"), "device power still clicks");

  const sensor = mount("vha-sensor-card", {
    entity: "sensor.air",
    show_timeline: false,
    chips: [{ name: "通风", entity: "switch.vent" }],
  });
  const sensorChip = sensor.shadowRoot?.querySelector<HTMLButtonElement>("[data-chip]");
  const sensorTitle = sensor.shadowRoot?.querySelector<HTMLButtonElement>(".ititle");
  assert(Boolean(sensorChip && sensorTitle), "sensor chip");
  storm(sensor);
  assert(sensorChip!.isConnected, "hass storm kept the sensor chip");
  const sensorInfo: CustomEvent[] = [];
  sensor.addEventListener("hass-more-info", (ev) => sensorInfo.push(ev as CustomEvent));
  sensorTitle!.click();
  assert(sensorInfo[0]?.detail?.entityId === "sensor.air" && sensorInfo[0].bubbles && sensorInfo[0].composed, "sensor more info");
  sensorChip!.click();
  await flush();
  assert(calls.includes("switch.turn_on"), "sensor chip still clicks");

  const media = mount("vha-media-card", { entity: "media_player.speaker", name: "Speaker" });
  const play = media.shadowRoot?.querySelector<HTMLButtonElement>("[data-transport='play']");
  const mediaTitle = media.shadowRoot?.querySelector<HTMLButtonElement>(".ititle");
  assert(Boolean(play && mediaTitle), "media transport");
  storm(media);
  assert(play!.isConnected, "hass storm kept the media transport");
  const mediaInfo: CustomEvent[] = [];
  media.addEventListener("hass-more-info", (ev) => mediaInfo.push(ev as CustomEvent));
  mediaTitle!.click();
  assert(mediaInfo[0]?.detail?.entityId === "media_player.speaker" && mediaInfo[0].bubbles && mediaInfo[0].composed, "media more info");
  play!.click();
  await flush();
  assert(calls.includes("media_player.media_play"), "media play still clicks");

  const gone = mount("vha-climate-card", { entity: "climate.gone" });
  const goneChip = gone.shadowRoot?.querySelector<HTMLButtonElement>(".chip");
  assert(Boolean(goneChip?.disabled), "unavailable chip is disabled");
  assert(Number(getComputedStyle(goneChip!).opacity) < 0.6, "unavailable chip fades");
  assert(gone.shadowRoot?.textContent?.includes("不可用") === true, "unavailable copy");

  const failing = document.createElement("vha-climate-card") as CardHost;
  document.getElementById("out")!.append(failing);
  failing.setConfig({ entity: "climate.room", show_fan: false });
  failing.hass = entityHass(true);
  failing.shadowRoot?.querySelector<HTMLButtonElement>("[data-mode='heat']")?.click();
  await flush();
  assert(failing.shadowRoot?.querySelector(".error")?.textContent === "操作失败", "service failure stays on the card");
  assert(Boolean(failing.shadowRoot?.querySelector(".chip")), "failure does not blank the card");

  const dark = document.getElementById("dark")!;
  const cool = mount("vha-climate-card", { entity: "climate.heat" }, dark);
  store["climate.heat"] = { ...store["climate.heat"], state: "cool", attributes: { ...store["climate.heat"].attributes, hvac_action: "cooling" } };
  cool.hass = entityHass();
  const coolShell = cool.shadowRoot?.querySelector("ha-card");
  const coolTitle = cool.shadowRoot?.querySelector(".ititle");
  const coolBg = getComputedStyle(coolShell!).backgroundImage;
  assert(coolBg.includes("gradient"), `cool gradient on a dark page, got ${coolBg}`);
  assert(getComputedStyle(coolTitle!).color === "rgb(17, 17, 17)", "dark theme keeps dark type");
  assert(getComputedStyle(coolShell!).backgroundColor !== "rgb(17, 17, 17)", "dark theme does not paint the HA card ground");

  document.title = "PASS";
  document.getElementById("log")!.textContent = "PASS";
}

main().catch((err: unknown) => {
  document.title = "FAIL";
  document.getElementById("log")!.textContent = err instanceof Error ? err.stack || err.message : String(err);
});
