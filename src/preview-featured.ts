import type { HomeAssistant } from "./types";

type CardElement = HTMLElement & {
  setConfig: (config: Record<string, unknown>) => void;
  hass: HomeAssistant;
};

function place(
  grid: HTMLElement,
  title: string,
  width: string,
  tag: string,
  config: Record<string, unknown>,
  hass: HomeAssistant,
) {
  const slot = document.createElement("div");
  slot.className = `slot ${width}`;
  slot.dataset.shot = `${tag}-${title}`;
  const label = document.createElement("h2");
  label.textContent = title;
  const card = document.createElement(tag) as CardElement;
  card.setConfig(config);
  card.hass = hass;
  slot.append(label, card);
  grid.append(slot);
}

function section(app: HTMLElement, heading: string): HTMLElement {
  const block = document.createElement("section");
  const title = document.createElement("h2");
  title.textContent = heading;
  const grid = document.createElement("div");
  grid.className = "grid hug";
  block.append(title, grid);
  app.append(block);
  return grid;
}

const rooms = [
  { entity: "switch.living", name: "Living room" },
  { entity: "switch.bedroom_lamp", name: "Bedroom" },
  { entity: "switch.kitchen", name: "Kitchen" },
  { entity: "switch.vent", name: "隐藏", show: false },
];

export function mountFeatured(app: HTMLElement, hass: HomeAssistant) {
  const climate = section(app, "气候卡");
  place(climate, "制热", "large", "vha-climate-card", { type: "custom:vha-climate-card", entity: "climate.living_heat" }, hass);
  place(climate, "制冷", "large", "vha-climate-card", { type: "custom:vha-climate-card", entity: "climate.living_cool" }, hass);
  place(climate, "关", "large", "vha-climate-card", { type: "custom:vha-climate-card", entity: "climate.living_off" }, hass);
  place(climate, "不可用", "large", "vha-climate-card", { type: "custom:vha-climate-card", entity: "climate.gone" }, hass);
  place(climate, "未知", "narrow", "vha-climate-card", { type: "custom:vha-climate-card", entity: "climate.unknown" }, hass);
  place(climate, "窄栏", "narrow", "vha-climate-card", { type: "custom:vha-climate-card", entity: "climate.living_heat" }, hass);
  place(climate, "配错域", "narrow", "vha-climate-card", { type: "custom:vha-climate-card", entity: "light.bedroom" }, hass);
  place(climate, "深色页面", "dark", "vha-climate-card", { type: "custom:vha-climate-card", entity: "climate.living_cool" }, hass);

  const sensor = section(app, "传感器卡");
  place(
    sensor,
    "空气质量",
    "wide",
    "vha-sensor-card",
    {
      type: "custom:vha-sensor-card",
      layout: "insight",
      entity: "sensor.air",
      name: "Bedroom",
      caption: "Air Quality",
      status: "Fresh as a forest",
      chips: [
        { name: "Purify", entity: "fan.purify", mode: "auto" },
        { name: "Ventilation", entity: "switch.vent" },
        { name: "Humidify", entity: "humidifier.bedroom", mode: "boost" },
      ],
      target_entity: "humidifier.bedroom",
      target_label: "Humidifier — Target",
    },
    hass,
  );
  place(
    sensor,
    "无目标滑杆",
    "wide",
    "vha-sensor-card",
    {
      type: "custom:vha-sensor-card",
      layout: "insight",
      entity: "sensor.air",
      name: "Bedroom",
      caption: "Air Quality",
      show_timeline: true,
    },
    hass,
  );
  place(
    sensor,
    "用电",
    "vertical",
    "vha-sensor-card",
    {
      type: "custom:vha-sensor-card",
      layout: "metrics",
      name: "Power Usage",
      metrics: [
        { entity: "sensor.solar", name: "Solar" },
        { entity: "sensor.grid", name: "Grid" },
      ],
    },
    hass,
  );
  place(
    sensor,
    "不可用",
    "wide",
    "vha-sensor-card",
    { type: "custom:vha-sensor-card", layout: "insight", entity: "sensor.air_gone", name: "Bedroom" },
    hass,
  );
  place(
    sensor,
    "窄栏指标",
    "squeeze",
    "vha-sensor-card",
    {
      type: "custom:vha-sensor-card",
      layout: "metrics",
      name: "Power Usage",
      metrics: [
        { entity: "sensor.solar", name: "Solar" },
        { entity: "sensor.grid", name: "Grid" },
      ],
    },
    hass,
  );

  const media = section(app, "媒体卡");
  place(
    media,
    "播放",
    "media",
    "vha-media-card",
    { type: "custom:vha-media-card", entity: "media_player.speaker", name: "Speaker", rooms },
    hass,
  );
  place(
    media,
    "空闲",
    "media",
    "vha-media-card",
    { type: "custom:vha-media-card", entity: "media_player.idle", name: "Speaker", rooms: rooms.slice(0, 2) },
    hass,
  );
  place(
    media,
    "不可用",
    "media",
    "vha-media-card",
    { type: "custom:vha-media-card", entity: "media_player.gone", name: "Speaker", rooms },
    hass,
  );
  place(
    media,
    "缺图",
    "media",
    "vha-media-card",
    { type: "custom:vha-media-card", entity: "media_player.plain", rooms: [{ entity: "switch.living", name: "Living room" }] },
    hass,
  );
  place(
    media,
    "窄栏",
    "squeeze",
    "vha-media-card",
    { type: "custom:vha-media-card", entity: "media_player.speaker", name: "Speaker", rooms },
    hass,
  );
}
