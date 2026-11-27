import { readSlider } from "./control";
import { batteryInfo, formatQuantity, networkText, uptimeText } from "./format";
import { buildView } from "./model";
import type { HassEntity, HomeAssistant } from "./types";

function entity(id: string, state: string, attributes: Record<string, unknown> = {}): HassEntity {
  return { entity_id: id, state, attributes };
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const percent = formatQuantity(35, "%");
assert(percent === "35\u00A0%", `percent spacing: ${JSON.stringify(percent)}`);
assert(formatQuantity(58, "°C") === "58\u00A0°C", "celsius spacing");
assert(formatQuantity(22.5, "°") === "22.5\u00A0°", "degree spacing");
assert(formatQuantity(22.54, "°") === "22.5\u00A0°", "degree rounding");

const charging = batteryInfo(entity("sensor.b", "80", { battery_charging: true, unit_of_measurement: "%" }));
assert(charging.label === "充电中" && charging.value === "80\u00A0%", "charging copy");
const idle = batteryInfo(entity("sensor.b", "35", { battery_state: "discharging" }));
assert(idle.label === "未充电", "not charging copy");
const full = batteryInfo(entity("sensor.b", "100", { battery_state: "full" }));
assert(full.label === "已充满" && full.tone === "full", "full copy");
assert(batteryInfo(entity("sensor.b", "unavailable")).label === "不可用", "battery unavailable");
assert(!/闲置/.test(idle.label + charging.label + full.label), "no idle wording");

assert(networkText(entity("sensor.n", "disconnected")) === "未连接", "disconnected");
assert(networkText(entity("sensor.n", "Pig Breeder", { ssid: "Pig Breeder" })) === "Pig Breeder", "ssid");
assert(networkText(entity("sensor.n", "unknown")) === "未知", "network unknown");

const now = Date.parse("2026-11-27T12:00:00Z");
const boot = new Date(now - (((8 * 24 + 1) * 60 + 41) * 60 * 1000)).toISOString();
assert(
  uptimeText(entity("sensor.up", boot, { device_class: "timestamp" }), now) === "已开机 8天 1小时 41分钟",
  "uptime",
);

const lightOff = entity("light.bed", "off", { brightness: 200 });
const offSlider = readSlider(lightOff);
assert(offSlider.label === "0\u00A0%" && offSlider.fraction === 0, "light off is 0 %");
const lightOn = entity("light.bed", "on", { brightness: Math.round(0.7 * 255) });
assert(readSlider(lightOn).label === "70\u00A0%", "light on percent");

const humidOff = entity("humidifier.room", "off", { current_humidity: 35, humidity: 40, available_modes: ["boost"] });
assert(readSlider(humidOff).label === "关", "humidifier off is not a fake percent");

const hass = {
  states: {
    "humidifier.room": entity("humidifier.room", "on", {
      current_humidity: 35,
      available_modes: ["boost", "sleep", "auto"],
      mode: "boost",
    }),
    "switch.legacy": entity("switch.legacy", "on", { friendly_name: "旧开关" }),
    "sensor.cpu": entity("sensor.cpu", "14", { unit_of_measurement: "%", friendly_name: "CPU 占用" }),
  },
} as unknown as HomeAssistant;

const legacy = buildView({ entity: "switch.legacy", name: "旧开关", status: "On", show_toggle: true }, hass);
assert(legacy.layout === "large" && legacy.large?.showSwitch === true, "old yaml stays large with toggle");
assert(legacy.large?.value === "旧开关" && legacy.large.caption === "On", "old name and status");

const picture = buildView({ entity: "switch.legacy", layout: "picture" }, hass);
assert(picture.layout === "large", "picture alias");

const humid = buildView({ entity: "humidifier.room", layout: "large" }, hass);
assert(humid.large?.value === "35\u00A0%", "humidity value");
assert(humid.large?.switchOn === true, "humidifier on");
assert(humid.large?.actions.length === 3, "mode rail");
assert(humid.large?.actions[0]?.pressed === true, "active mode pressed");
assert(humid.dim === false, "on photo is not dimmed");

const humidClosed = buildView(
  { entity: "humidifier.room", layout: "large" },
  { states: { "humidifier.room": { ...hass.states["humidifier.room"], state: "off" } } } as unknown as HomeAssistant,
);
assert(humidClosed.large?.switchOn === false, "off switch");
assert(humidClosed.large?.actions.every((action) => !action.pressed) === true, "off rail is not spraying");
assert(humidClosed.dim === true, "off photo dims");

const hidden = buildView({ entity: "switch.legacy", show_toggle: false }, hass);
assert(hidden.large?.showSwitch === false, "show_toggle false");

const unavailable = buildView(
  { entity: "light.missing", layout: "vertical" },
  { states: {} } as unknown as HomeAssistant,
);
assert(unavailable.blocked === true && unavailable.vertical?.disabled === true && unavailable.vertical.label === "不可用", "missing entity");

const metricsOff = buildView(
  {
    entity: "switch.legacy",
    layout: "electronics",
    show_power: false,
    show_metrics: false,
    show_cpu: true,
    cpu_entity: "sensor.cpu",
    show_image: false,
    show_placeholder: false,
  },
  hass,
);
assert(metricsOff.electronics?.tiles.length === 0, "metrics master hides tiles");
assert(metricsOff.electronics?.showWell === false, "hug without image");

const metricsOn = buildView(
  {
    entity: "switch.legacy",
    layout: "electronics",
    show_power: false,
    show_metrics: true,
    cpu_entity: "sensor.cpu",
    show_image: false,
    show_placeholder: true,
  },
  hass,
);
assert(metricsOn.electronics?.tiles[0]?.value === "14\u00A0%", "cpu tile spacing");
assert(metricsOn.electronics?.tiles[0]?.label === "CPU 占用", "cpu label");

console.log("vha device card checks passed");
