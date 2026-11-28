import {
  buildClimateView,
  climateGridOptions,
  climateTagline,
  fanModeForFraction,
  readFan,
  resumeHvacMode,
  setClimateFan,
  setClimateMode,
  setClimatePower,
} from "./climate-model";
import { formatClock, buildMediaView, mediaTimeLabel } from "./media-model";
import { buildView } from "./model";
import { paintChanged } from "./paint";
import { climateStub, deviceStub, mediaStub, sensorStub } from "./stub";
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
assert(
  off.tagline === "已关闭" && !off.controlsDisabled && !off.powerDisabled && !off.powerOn,
  "off stays operable",
);
assert(off.chips.every((chip) => !chip.selected), "off selects no chip");
assert(off.chips.some((chip) => chip.mode === "cool" && chip.label === "制冷"), "off still lists modes");

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

const socket = entity("climate.room", "off", {
  friendly_name: "客厅空调 空调插座",
  current_temperature: 25,
  temperature: 26,
  hvac_modes: ["off", "cool", "heat", "auto", "fan_only", "dry"],
  fan_modes: ["0", "60", "100"],
  fan_mode: "0",
});
const socketView = buildClimateView(
  { entity: "climate.room", show_fan: false },
  { states: { "climate.room": socket } } as unknown as HomeAssistant,
);
assert(socketView.title === "客厅空调 空调插座", "friendly name");
assert(socketView.value === "25.0\u00A0°", `off hero ${socketView.value}`);
assert(socketView.tagline === "已关闭" && socketView.tone === "off" && !socketView.showFan, "off layout");
assert(
  socketView.chips.map((chip) => chip.label).join("/") === "制冷/制热/自动/送风/除湿",
  `chip labels ${socketView.chips.map((chip) => chip.label).join("/")}`,
);
assert(socketView.chips.every((chip) => !chip.selected) && !socketView.controlsDisabled, "off chips stay enabled");

const withFan = climateGridOptions(true);
const withoutFan = climateGridOptions(false);
assert(withFan.min_columns >= 4 && withFan.columns === 6 && withFan.rows >= 8, "climate grid follows the tall frame");
assert(withoutFan.rows >= 7 && withoutFan.min_columns >= 4, "climate grid without fan");
assert(withFan.rows / withFan.columns > 5 / 6, "grid is not the short 6×5 frame");

function recordingHass(state: HassEntity, fail: string[] = []) {
  const calls: Array<{ service: string; data: Record<string, unknown> }> = [];
  const hass = {
    states: { [state.entity_id]: state },
    callService: async (_domain: string, service: string, data?: Record<string, unknown>) => {
      if (fail.includes(service)) throw new Error("not supported");
      calls.push({ service, data: data ?? {} });
    },
  } as unknown as HomeAssistant;
  return { hass, calls };
}

const offState = { ...heat, state: "off" };
assert(resumeHvacMode(offState, "cool") === "cool", "resume last mode");
assert(resumeHvacMode(offState) === "heat", "resume first mode other than off");
assert(resumeHvacMode(socket, "missing") === "cool", "unknown last mode falls through");

const modeOn = recordingHass(offState);
await setClimateMode(modeOn.hass, offState, "cool");
assert(
  modeOn.calls.length === 1 && modeOn.calls[0]?.service === "set_hvac_mode" && modeOn.calls[0]?.data.hvac_mode === "cool",
  "off chip calls set_hvac_mode",
);

const powerOn = recordingHass(offState);
await setClimatePower(powerOn.hass, offState, true, "dry");
assert(powerOn.calls.length === 1 && powerOn.calls[0]?.service === "turn_on", "power on uses turn_on first");

const powerFallback = recordingHass(offState, ["turn_on"]);
await setClimatePower(powerFallback.hass, offState, true, "cool");
assert(
  powerFallback.calls.length === 1 &&
    powerFallback.calls[0]?.service === "set_hvac_mode" &&
    powerFallback.calls[0]?.data.hvac_mode === "cool",
  "turn_on failure restores the last mode",
);

const powerFirst = recordingHass(offState, ["turn_on"]);
await setClimatePower(powerFirst.hass, offState, true);
assert(powerFirst.calls[0]?.data.hvac_mode === "heat", "turn_on failure uses the first non-off mode");

const powerOff = recordingHass(heat, ["turn_off"]);
await setClimatePower(powerOff.hass, heat, false);
assert(
  powerOff.calls.length === 1 && powerOff.calls[0]?.service === "set_hvac_mode" && powerOff.calls[0]?.data.hvac_mode === "off",
  "turn_off failure uses set_hvac_mode off",
);

const noOffMode = entity("climate.room", "heat", { ...heat.attributes, hvac_modes: ["heat", "cool"] });
const powerStuck = recordingHass(noOffMode, ["turn_off"]);
let powerStuckMessage = "";
try {
  await setClimatePower(powerStuck.hass, noOffMode, false);
} catch (err) {
  powerStuckMessage = err instanceof Error ? err.message : "";
}
assert(powerStuckMessage === "not supported" && powerStuck.calls.length === 0, "shutdown failure stays visible");

const bothFail = recordingHass(offState, ["turn_on", "set_hvac_mode"]);
let bothMessage = "";
try {
  await setClimatePower(bothFail.hass, offState, true, "cool");
} catch (err) {
  bothMessage = err instanceof Error ? err.message : "";
}
assert(bothMessage === "not supported", "power failure is not swallowed");

const fanOff = recordingHass(offState);
await setClimateFan(fanOff.hass, offState, 0.4);
assert(fanOff.calls[0]?.service === "set_fan_mode" && fanOff.calls[0]?.data.fan_mode === "40", "fan while off still writes");

const unavailableState = { ...heat, state: "unavailable" };
const blocked = recordingHass(unavailableState);
let blockedMessage = "";
try {
  await setClimateMode(blocked.hass, unavailableState, "cool");
} catch (err) {
  blockedMessage = err instanceof Error ? err.message : "";
}
assert(blockedMessage === "不可用" && blocked.calls.length === 0, "unavailable does not write");

const climateConfig = { entity: "climate.room" };
const climateSnap = { view: buildClimateView(climateConfig, hass), error: "" };
const climateKey = paintChanged("", climateSnap);
const noisyClimate = {
  states: { ...hass.states, "light.other": entity("light.other", "on") },
} as unknown as HomeAssistant;
assert(
  !paintChanged(climateKey.key, { view: buildClimateView(climateConfig, noisyClimate), error: "" }).changed,
  "unrelated climate hass refresh does not repaint",
);
assert(
  paintChanged(climateKey.key, { view: buildClimateView(climateConfig, { states: { "climate.room": cool } } as unknown as HomeAssistant), error: "" }).changed,
  "climate mode change repaints",
);

const deviceConfig = { entity: "switch.legacy", name: "旧开关" };
const deviceHass = { states: { "switch.legacy": entity("switch.legacy", "on", { friendly_name: "旧开关" }) } } as unknown as HomeAssistant;
const deviceKey = paintChanged("", { view: buildView(deviceConfig, deviceHass), picture: "", error: "" });
const deviceNoisy = {
  states: {
    ...deviceHass.states,
    "sensor.other": entity("sensor.other", "1"),
  },
} as unknown as HomeAssistant;
assert(
  !paintChanged(deviceKey.key, { view: buildView(deviceConfig, deviceNoisy), picture: "", error: "" }).changed,
  "unrelated device hass refresh does not repaint",
);

const sensorConfig = { entity: "sensor.air", show_timeline: false };
const sensorKey = paintChanged("", { view: buildSensorView(sensorConfig, sensorHass), error: "" });
const sensorNoisy = {
  states: { ...sensorHass.states, "light.other": entity("light.other", "off") },
} as unknown as HomeAssistant;
assert(
  !paintChanged(sensorKey.key, { view: buildSensorView(sensorConfig, sensorNoisy), error: "" }).changed,
  "unrelated sensor hass refresh does not repaint",
);

const mediaNow = Date.parse("2026-11-28T00:00:00Z");
const mediaConfig = { entity: "media_player.speaker" };
const mediaKey = paintChanged("", { view: buildMediaView(mediaConfig, mediaHass, mediaNow), image: "", error: "" });
const mediaNoisy = {
  states: { ...mediaHass.states, "light.other": entity("light.other", "on") },
} as unknown as HomeAssistant;
assert(
  !paintChanged(mediaKey.key, { view: buildMediaView(mediaConfig, mediaNoisy, mediaNow), image: "", error: "" }).changed,
  "unrelated media hass refresh does not repaint",
);
const ticking = entity("media_player.speaker", "playing", {
  friendly_name: "Speaker",
  media_position: 10,
  media_duration: 245,
  media_position_updated_at: new Date(mediaNow).toISOString(),
});
const tickingHass = { states: { "media_player.speaker": ticking } } as unknown as HomeAssistant;
const tickKey = paintChanged("", { view: buildMediaView(mediaConfig, tickingHass, mediaNow), image: "", error: "" });
assert(
  !paintChanged(tickKey.key, { view: buildMediaView(mediaConfig, tickingHass, mediaNow + 200), image: "", error: "" }).changed,
  "media label is stable inside the same second",
);
assert(
  paintChanged(tickKey.key, { view: buildMediaView(mediaConfig, tickingHass, mediaNow + 1500), image: "", error: "" }).changed,
  "media clock still repaints when the label changes",
);

const home = {
  states: {
    "climate.gone": entity("climate.gone", "unavailable", { hvac_modes: ["off", "cool"] }),
    "climate.room": entity("climate.room", "off", {
      friendly_name: "客厅空调",
      current_temperature: 25,
      hvac_modes: ["off", "cool", "heat"],
    }),
    "light.bed": entity("light.bed", "on", { friendly_name: "灯", brightness: 200 }),
    "humidifier.bed": entity("humidifier.bed", "on", {
      friendly_name: "加湿",
      current_humidity: 40,
      available_modes: ["auto"],
    }),
    "fan.room": entity("fan.room", "on", { friendly_name: "风扇" }),
    "switch.lamp": entity("switch.lamp", "on", { friendly_name: "开关" }),
    "sensor.plain": entity("sensor.plain", "3", { friendly_name: "计数" }),
    "sensor.other": entity("sensor.other", "8", { friendly_name: "另一计数" }),
    "sensor.temp": entity("sensor.temp", "21.5", { unit_of_measurement: "°C", friendly_name: "温度", device_class: "temperature" }),
    "media_player.speaker": entity("media_player.speaker", "playing", { friendly_name: "音箱" }),
    "binary_sensor.door": entity("binary_sensor.door", "on", { friendly_name: "门" }),
  },
} as unknown as HomeAssistant;

const climatePicked = climateStub(home, ["climate.gone"], ["climate.room"]);
assert(climatePicked.entity === "climate.room", `climate stub prefers a usable entity, got ${climatePicked.entity}`);
const climateView = buildClimateView(climatePicked, home);
assert(climateView.kind === "card" && climateView.value === "25.0\u00A0°" && climateView.chips.length > 0, "climate stub renders a card");
assert(climateStub({ states: {} } as unknown as HomeAssistant, [], []).entity === "", "climate stub stays empty without a climate");
assert(climateStub(home, [], []).entity === "climate.room", "climate stub scans hass when the lists are empty");

const devicePicked = deviceStub(home, ["light.bed", "switch.lamp"], ["humidifier.bed"]);
assert(devicePicked.entity === "humidifier.bed" && devicePicked.layout === "large", "device stub prefers a humidifier");
const lightOnly = { states: { "light.bed": home.states["light.bed"] } } as unknown as HomeAssistant;
const fanOnly = { states: { "fan.room": home.states["fan.room"] } } as unknown as HomeAssistant;
const switchOnly = { states: { "switch.lamp": home.states["switch.lamp"] } } as unknown as HomeAssistant;
assert(deviceStub(lightOnly, ["light.bed"], []).layout === "vertical" && deviceStub(lightOnly, ["light.bed"], []).entity === "light.bed", "light stub is vertical");
assert(deviceStub(fanOnly, ["fan.room"], []).entity === "fan.room" && deviceStub(fanOnly, ["fan.room"], []).layout === "large", "fan stub is large");
assert(deviceStub(switchOnly, ["switch.lamp"], []).entity === "switch.lamp" && deviceStub(switchOnly, ["switch.lamp"], []).layout === "large", "switch stub");
assert(buildView(devicePicked, home).empty === false, "device stub is not the empty card");
assert(deviceStub({ states: {} } as unknown as HomeAssistant).entity === "", "device stub stays empty");

const sensorPicked = sensorStub(home, ["sensor.plain", "sensor.temp"], []);
assert(sensorPicked.layout === "insight" && sensorPicked.entity === "sensor.temp", "sensor stub prefers a unit");
assert(buildSensorView(sensorPicked, home).value === "21.5\u00A0°C", "sensor stub shows the reading");
const metricsPicked = sensorStub(
  { states: { "sensor.plain": home.states["sensor.plain"], "sensor.other": home.states["sensor.other"] } } as unknown as HomeAssistant,
  ["sensor.plain", "sensor.other"],
  [],
);
assert(metricsPicked.layout === "metrics" && metricsPicked.metrics?.length === 2, "two plain sensors become metrics");
assert(buildSensorView(metricsPicked, home).tiles.length === 2, "metrics stub has tiles");
assert(sensorStub({ states: {} } as unknown as HomeAssistant).entity === "", "sensor stub stays empty");
const doorOnly = { states: { "binary_sensor.door": home.states["binary_sensor.door"] } } as unknown as HomeAssistant;
assert(sensorStub(doorOnly, ["binary_sensor.door"], []).entity === "binary_sensor.door", "binary sensor still previews");

const mediaPicked = mediaStub(home, [], ["media_player.speaker"]);
assert(mediaPicked.entity === "media_player.speaker" && !mediaPicked.rooms, "media stub does not invent rooms");
assert(buildMediaView(mediaPicked, home, mediaNow).kind === "card", "media stub renders");
assert(mediaStub({ states: {} } as unknown as HomeAssistant).entity === "", "media stub stays empty");

console.log("vha climate / sensor / media checks passed");
