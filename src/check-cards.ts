import { buildClimateView, climateTagline, fanModeForFraction, readFan } from "./climate-model";
import { formatClock, buildMediaView, mediaTimeLabel } from "./media-model";
import { buildSensorView, parseHistoryPayload, qualityLabel, timelineBuckets } from "./sensor-model";
import type { HassEntity, HomeAssistant } from "./types";

function entity(id: string, state: string, attributes: Record<string, unknown> = {}): HassEntity {
  return { entity_id: id, state, attributes };
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const modes = ["off", "heat", "cool", "auto", "fan_only"];
const fanModes = ["0", "20", "40", "60", "80", "100"];
const heat = entity("climate.room", "heat", {
  friendly_name: "Living room",
  current_temperature: 22.5,
  temperature: 24,
  hvac_modes: modes,
  fan_modes: fanModes,
  fan_mode: "60",
  hvac_action: "heating",
});
const cool = entity("climate.room", "cool", {
  friendly_name: "Living room",
  current_temperature: 21,
  temperature: 20,
  hvac_modes: modes,
  fan_modes: fanModes,
  fan_mode: "40",
  hvac_action: "cooling",
});
const hass = { states: { "climate.room": heat } } as unknown as HomeAssistant;

const heatView = buildClimateView({ entity: "climate.room" }, hass);
assert(heatView.value === "22.5\u00A0°", `heat hero ${heatView.value}`);
assert(heatView.tagline === "制热至 24\u00A0°", `heat tagline ${heatView.tagline}`);
assert(heatView.tone === "heat", "heat tone");
assert(heatView.fanLabel === "60\u00A0%", `fan space ${heatView.fanLabel}`);
assert(heatView.chips.find((chip) => chip.mode === "heat")?.selected === true, "heat chip");
assert(!heatView.tagline.includes("Heating"), "do not copy the component default heating line");

const coolView = buildClimateView({ entity: "climate.room" }, { states: { "climate.room": cool } } as unknown as HomeAssistant);
assert(coolView.value === "21.0\u00A0°", `cool hero ${coolView.value}`);
assert(coolView.tagline === "制冷至 20\u00A0°", `cool tagline ${coolView.tagline}`);
assert(coolView.tone === "cool", "cool tone");
assert(coolView.fanLabel === "40\u00A0%", "cool fan");
assert(!coolView.tagline.includes("制热"), "cool tagline is not heating");
assert(climateTagline(cool) === "制冷至 20\u00A0°", "tagline helper");

const off = buildClimateView(
  { entity: "climate.room" },
  { states: { "climate.room": { ...heat, state: "off" } } } as unknown as HomeAssistant,
);
assert(off.tagline === "已关闭" && off.controlsDisabled && !off.powerDisabled && !off.powerOn, "off disables writes except power");

const gone = buildClimateView(
  { entity: "climate.room" },
  { states: { "climate.room": { ...heat, state: "unavailable" } } } as unknown as HomeAssistant,
);
assert(gone.value === "不可用" && gone.powerDisabled && gone.controlsDisabled, "unavailable");
const unknown = buildClimateView(
  { entity: "climate.room" },
  { states: { "climate.room": { ...heat, state: "unknown" } } } as unknown as HomeAssistant,
);
assert(unknown.value === "未知" && unknown.tagline === "未知", "unknown");
assert(buildClimateView({ entity: "light.lamp" }).kind === "invalid", "wrong climate domain");
assert(buildClimateView({ entity: "climate.missing" }, { states: {} } as unknown as HomeAssistant).tagline === "实体不存在", "deleted climate");
assert(readFan(heat).label.includes("\u00A0%"), "percent spacing");
assert(fanModeForFraction(heat, 0.4) === "40", `snap fan ${fanModeForFraction(heat, 0.4)}`);

const sensorHass = {
  states: {
    "sensor.air": entity("sensor.air", "35", { unit_of_measurement: "%", friendly_name: "Bedroom" }),
    "humidifier.room": entity("humidifier.room", "on", { humidity: 45, min_humidity: 30, max_humidity: 80, friendly_name: "加湿" }),
    "sensor.solar": entity("sensor.solar", "2.4", { unit_of_measurement: "kW", friendly_name: "Solar" }),
    "sensor.grid": entity("sensor.grid", "6.8", { unit_of_measurement: "kW", friendly_name: "Grid" }),
  },
} as unknown as HomeAssistant;

const insight = buildSensorView({ entity: "sensor.air", name: "Bedroom", status: "Fresh as a forest" }, sensorHass);
assert(insight.kind === "insight" && insight.value === "35\u00A0%" && !insight.target, "insight hides target by default");
const linked = buildSensorView(
  { entity: "sensor.air", target_entity: "humidifier.room", target_label: "加湿器目标" },
  sensorHass,
);
assert(linked.target?.label === "加湿器目标" && linked.target.valueLabel === "45\u00A0%", "optional target");
assert(linked.target?.disabled === false, "target can be adjusted");
const metrics = buildSensorView(
  {
    layout: "metrics",
    name: "Power Usage",
    metrics: [
      { entity: "sensor.solar", name: "Solar" },
      { entity: "sensor.grid", name: "Grid" },
    ],
  },
  sensorHass,
);
assert(metrics.tiles.length === 2 && metrics.tiles[0]?.value === "2.4\u00A0kW" && metrics.tiles[1]?.value === "6.8\u00A0kW", "metric spacing");
const airGone = buildSensorView(
  { entity: "sensor.air" },
  { states: { "sensor.air": entity("sensor.air", "unavailable", { unit_of_measurement: "%" }) } } as unknown as HomeAssistant,
);
assert(airGone.value === "不可用", "sensor unavailable");
assert(buildSensorView({ entity: "climate.room" }).message === "请选择传感器", "wrong sensor domain");
assert(timelineBuckets([]).length === 0, "no invented history");
const noon = new Date("2026-11-27T12:00:00");
const buckets = timelineBuckets(
  [{ at: new Date("2026-11-27T12:00:00").getTime(), value: 35 }],
  "%",
  noon,
);
assert(buckets.some((bucket) => bucket.text === qualityLabel(35, "%")), "history bucket uses the sample");

const player = entity("media_player.speaker", "playing", {
  friendly_name: "Speaker",
  media_title: "Afternoon",
  media_position: 147,
  media_duration: 245,
});
assert(mediaTimeLabel(player, Date.parse("2026-11-27T12:00:00Z")) .startsWith("2:27"), `clock ${mediaTimeLabel(player)}`);
assert(formatClock(147) === "2:27", "clock format");
assert(!mediaTimeLabel(player).includes("2.27"), "do not copy the unclear timestamp");
const mediaHass = {
  states: {
    "media_player.speaker": player,
    "switch.living": entity("switch.living", "on", { friendly_name: "Living room" }),
    "switch.bed": entity("switch.bed", "off", { friendly_name: "Bedroom" }),
    "switch.kitchen": entity("switch.kitchen", "off", { friendly_name: "Kitchen" }),
    "switch.hidden": entity("switch.hidden", "on", { friendly_name: "Hidden" }),
  },
} as unknown as HomeAssistant;
const media = buildMediaView(
  {
    entity: "media_player.speaker",
    rooms: [
      { entity: "switch.living", name: "Living room" },
      { entity: "switch.bed", name: "Bedroom" },
      { entity: "switch.kitchen", name: "Kitchen" },
      { entity: "switch.hidden", name: "Hidden", show: false },
    ],
  },
  mediaHass,
);
assert(media.rooms.length === 3 && media.rooms[0]?.on === true && media.playing, "rooms are configurable");
const idle = buildMediaView(
  { entity: "media_player.speaker" },
  { states: { "media_player.speaker": entity("media_player.speaker", "idle", { friendly_name: "Speaker" }) } } as unknown as HomeAssistant,
);
assert(idle.timeLabel === "空闲" && idle.dim && !idle.playing, "idle");
const missingMedia = buildMediaView(
  { entity: "media_player.speaker" },
  { states: { "media_player.speaker": entity("media_player.speaker", "unavailable") } } as unknown as HomeAssistant,
);
assert(missingMedia.timeLabel === "不可用" && missingMedia.transportDisabled, "media unavailable");
assert(buildMediaView({ entity: "light.lamp" }).message === "请选择媒体播放器", "wrong media domain");
const samples = parseHistoryPayload(
  { "sensor.air": [{ state: "35", last_updated: "2026-11-27T12:00:00" }] },
  "sensor.air",
);
assert(samples.length === 1 && samples[0]?.value === 35, "history payload");

console.log("vha climate / sensor / media checks passed");
