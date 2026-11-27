import "./index";
import type { HassEntity, HomeAssistant, VhaDeviceCardConfig } from "./types";
import humidifierUrl from "./assets/preview/humidifier.jpg";
import lampUrl from "./assets/preview/lamp.jpg";
import iphoneUrl from "./assets/preview/iphone.jpg";
import ipadUrl from "./assets/preview/ipad.png";
import cameraUrl from "./assets/xiaomi-camera.png";
import hueUrl from "./assets/hue-bloom.png";

type Store = Record<string, HassEntity>;

function entity(id: string, state: string, attributes: Record<string, unknown> = {}): HassEntity {
  return { entity_id: id, state, attributes };
}

const boot = new Date(Date.now() - (((8 * 24 + 1) * 60 + 41) * 60 * 1000)).toISOString();

function createHass(): { hass: HomeAssistant; store: Store } {
  const store: Store = {
    "humidifier.bedroom": entity("humidifier.bedroom", "on", {
      friendly_name: "卧室加湿",
      current_humidity: 35,
      humidity: 45,
      min_humidity: 30,
      max_humidity: 80,
      available_modes: ["boost", "sleep", "auto"],
      entity_picture: humidifierUrl,
    }),
    "humidifier.bedroom_off": entity("humidifier.bedroom_off", "off", {
      friendly_name: "卧室加湿",
      current_humidity: 35,
      humidity: 40,
      min_humidity: 30,
      max_humidity: 80,
      available_modes: ["boost", "sleep", "auto"],
      mode: "boost",
      entity_picture: humidifierUrl,
    }),
    "humidifier.no_image": entity("humidifier.no_image", "on", {
      friendly_name: "缺图加湿",
      current_humidity: 48,
      humidity: 48,
      available_modes: ["auto"],
    }),
    "humidifier.gone": entity("humidifier.gone", "unavailable", {
      friendly_name: "不可用加湿",
      current_humidity: 35,
    }),
    "switch.fail": entity("switch.fail", "on", {
      friendly_name: "失败演示",
      _fail: true,
    }),
    "switch.camera": entity("switch.camera", "on", {
      friendly_name: "Indoor Camera",
      model: "Xiaomi Smart Camera",
      entity_picture: cameraUrl,
    }),
    "light.bedroom": entity("light.bedroom", "on", {
      friendly_name: "Bedroom",
      brightness: Math.round(0.7 * 255),
      entity_picture: lampUrl,
    }),
    "light.bedroom_off": entity("light.bedroom_off", "off", {
      friendly_name: "Bedroom",
      brightness: Math.round(0.7 * 255),
      entity_picture: lampUrl,
    }),
    "light.gone": entity("light.gone", "unavailable", {
      friendly_name: "Bedroom",
      brightness: 200,
      entity_picture: lampUrl,
    }),
    "switch.plain": entity("switch.plain", "on", { friendly_name: "普通开关" }),
    "switch.pc": entity("switch.pc", "on", { friendly_name: "PC PRO MAX" }),
    "switch.mac": entity("switch.mac", "on", { friendly_name: "MacBook 电源" }),
    "sensor.pc_uptime": entity("sensor.pc_uptime", boot, {
      device_class: "timestamp",
      friendly_name: "开机时长",
    }),
    "sensor.gpu_temp": entity("sensor.gpu_temp", "58", {
      unit_of_measurement: "°C",
      friendly_name: "显卡温度",
      device_class: "temperature",
    }),
    "sensor.mem": entity("sensor.mem", "49", { unit_of_measurement: "%", friendly_name: "内存" }),
    "sensor.cpu": entity("sensor.cpu", "14", { unit_of_measurement: "%", friendly_name: "CPU 占用" }),
    "sensor.gpu_load": entity("sensor.gpu_load", "11", { unit_of_measurement: "%", friendly_name: "GPU 占用" }),
    "sensor.iphone_battery": entity("sensor.iphone_battery", "35", {
      unit_of_measurement: "%",
      device_class: "battery",
      battery_state: "discharging",
      friendly_name: "iPhone 电量",
    }),
    "sensor.iphone_net": entity("sensor.iphone_net", "disconnected", { friendly_name: "Wi-Fi" }),
    "device_tracker.iphone": entity("device_tracker.iphone", "home", { friendly_name: "iPhone" }),
    "sensor.ipad_battery": entity("sensor.ipad_battery", "100", {
      unit_of_measurement: "%",
      device_class: "battery",
      battery_state: "full",
      friendly_name: "iPad 电量",
    }),
    "sensor.ipad_net": entity("sensor.ipad_net", "Pig Breeder", { ssid: "Pig Breeder", friendly_name: "Wi-Fi" }),
    "device_tracker.ipad": entity("device_tracker.ipad", "home", { friendly_name: "iPad" }),
    "sensor.mac_battery": entity("sensor.mac_battery", "80", {
      unit_of_measurement: "%",
      device_class: "battery",
      battery_charging: true,
      friendly_name: "Mac 电量",
    }),
    "sensor.mac_net": entity("sensor.mac_net", "OPPO", { ssid: "OPPO" }),
    "device_tracker.mac": entity("device_tracker.mac", "not_home", { friendly_name: "Mac" }),
    "switch.mini": entity("switch.mini", "on", { friendly_name: "掌机" }),
    "sensor.mini_battery": entity("sensor.mini_battery", "62", {
      unit_of_measurement: "%",
      battery_state: "not_charging",
    }),
  };

  const refresh = () => {
    document.querySelectorAll("vha-device-card").forEach((el) => {
      (el as HTMLElement & { hass: HomeAssistant }).hass = hass;
    });
  };

  const hass: HomeAssistant = {
    states: store,
    language: "zh-CN",
    callService: async (domain, service, data) => {
      const id = String(data?.entity_id ?? "");
      const current = store[id];
      if (!current) throw new Error("实体不存在");
      if (current.attributes._fail) throw new Error("服务调用失败");
      let next = current.state;
      const attributes = { ...current.attributes };
      if (service === "turn_off" || service === "close_cover" || service === "lock") next = "off";
      else if (service === "turn_on" || service === "unlock" || service === "open_cover") next = "on";
      else if (domain === "media_player" && service === "media_pause") next = "paused";
      else if (domain === "media_player" && service === "media_play") next = "playing";
      else if (service === "set_mode" && typeof data?.mode === "string") attributes.mode = data.mode;
      else if (service === "set_preset_mode" && typeof data?.preset_mode === "string") {
        attributes.preset_mode = data.preset_mode;
      }
      if (domain === "light" && service === "turn_on" && typeof data?.brightness === "number") {
        next = "on";
        attributes.brightness = data.brightness;
      }
      if (domain === "light" && service === "turn_off") {
        next = "off";
      }
      if (domain === "fan" && service === "set_percentage" && typeof data?.percentage === "number") {
        attributes.percentage = data.percentage;
        next = data.percentage > 0 ? "on" : "off";
      }
      if (domain === "humidifier" && service === "set_humidity" && typeof data?.humidity === "number") {
        attributes.humidity = data.humidity;
        next = "on";
      }
      if (domain === "humidifier" && service === "turn_off") next = "off";
      store[id] = { ...current, state: next, attributes };
      refresh();
    },
  };
  return { hass, store };
}

interface Demo {
  title: string;
  width: "large" | "narrow" | "vertical" | "electronics" | "dark";
  config: VhaDeviceCardConfig;
}

const { hass } = createHass();

const sections: Array<{ heading: string; cards: Demo[] }> = [
  {
    heading: "大图设备",
    cards: [
      {
        title: "开",
        width: "large",
        config: {
          entity: "humidifier.bedroom",
          name: "卧室加湿",
          status: "Humidity",
          layout: "large",
        },
      },
      {
        title: "关",
        width: "large",
        config: {
          entity: "humidifier.bedroom_off",
          status: "Humidity",
          layout: "large",
        },
      },
      {
        title: "缺图",
        width: "large",
        config: { entity: "humidifier.no_image", layout: "large", show_toggle: true },
      },
      {
        title: "不可用",
        width: "large",
        config: { entity: "humidifier.gone", layout: "large" },
      },
      {
        title: "旧配置",
        width: "large",
        config: {
          entity: "switch.camera",
          name: "Indoor Camera",
          model: "Xiaomi Smart Camera",
          status: "Motion Active",
          show_toggle: true,
        },
      },
      {
        title: "窄栏折行",
        width: "narrow",
        config: { entity: "humidifier.bedroom", status: "Humidity", layout: "large" },
      },
      {
        title: "服务失败",
        width: "large",
        config: { entity: "switch.fail", name: "失败演示", layout: "large" },
      },
      {
        title: "深色页面",
        width: "dark",
        config: { entity: "humidifier.bedroom", status: "Humidity", layout: "large" },
      },
    ],
  },
  {
    heading: "竖图控制",
    cards: [
      {
        title: "亮度 70 %",
        width: "vertical",
        config: {
          entity: "light.bedroom",
          name: "Bedroom",
          layout: "vertical",
          images: [lampUrl, hueUrl],
        },
      },
      {
        title: "关",
        width: "vertical",
        config: { entity: "light.bedroom_off", name: "Bedroom", layout: "vertical", image: lampUrl },
      },
      {
        title: "不可用",
        width: "vertical",
        config: { entity: "light.gone", name: "Bedroom", layout: "vertical", image: lampUrl },
      },
      {
        title: "不能调节",
        width: "vertical",
        config: { entity: "switch.plain", name: "普通开关", layout: "vertical" },
      },
    ],
  },
  {
    heading: "电子设备",
    cards: [
      {
        title: "指标全开",
        width: "electronics",
        config: {
          layout: "electronics",
          entity: "switch.pc",
          name: "PC PRO MAX",
          model: "PC PRO MAX",
          show_power: false,
          show_uptime: true,
          uptime_entity: "sensor.pc_uptime",
          show_metrics: true,
          show_temperature: true,
          temperature_entity: "sensor.gpu_temp",
          show_memory: true,
          memory_entity: "sensor.mem",
          show_cpu: true,
          cpu_entity: "sensor.cpu",
          show_gpu: true,
          gpu_entity: "sensor.gpu_load",
          show_battery: false,
          show_network: false,
          show_location: false,
        },
      },
      {
        title: "手机",
        width: "electronics",
        config: {
          layout: "electronics",
          entity: "device_tracker.iphone",
          name: "iPhone 18 PM",
          image: iphoneUrl,
          image_fit: "cover",
          show_power: false,
          show_uptime: false,
          show_metrics: false,
          show_network: true,
          network_entity: "sensor.iphone_net",
          show_location: true,
          location_entity: "device_tracker.iphone",
          show_battery: true,
          battery_entity: "sensor.iphone_battery",
        },
      },
      {
        title: "平板浅底",
        width: "electronics",
        config: {
          layout: "electronics",
          entity: "device_tracker.ipad",
          name: "iPad Pro",
          image: ipadUrl,
          image_fit: "contain",
          show_power: false,
          show_metrics: false,
          show_network: true,
          network_entity: "sensor.ipad_net",
          show_location: true,
          location_entity: "device_tracker.ipad",
          show_battery: true,
          battery_entity: "sensor.ipad_battery",
        },
      },
      {
        title: "笔记本占位",
        width: "electronics",
        config: {
          layout: "electronics",
          entity: "device_tracker.mac",
          name: "MacBook Pro",
          model: "MacBook",
          show_image: false,
          show_placeholder: true,
          show_power: true,
          power_entity: "switch.mac",
          show_metrics: false,
          show_network: true,
          network_entity: "sensor.mac_net",
          show_location: true,
          location_entity: "device_tracker.mac",
          show_battery: true,
          battery_entity: "sensor.mac_battery",
        },
      },
      {
        title: "只留电池",
        width: "electronics",
        config: {
          layout: "electronics",
          entity: "switch.mini",
          name: "掌机",
          show_image: false,
          show_placeholder: false,
          show_power: false,
          show_metrics: false,
          show_network: false,
          show_location: false,
          show_battery: true,
          battery_entity: "sensor.mini_battery",
        },
      },
      {
        title: "实体已删除",
        width: "electronics",
        config: {
          layout: "electronics",
          entity: "switch.missing_device",
          name: "已删除的设备",
          show_power: false,
          show_placeholder: true,
          show_battery: true,
          battery_entity: "sensor.missing_battery",
          show_metrics: true,
          show_cpu: true,
          cpu_entity: "sensor.missing_cpu",
        },
      },
    ],
  },
];

const app = document.getElementById("app");
if (app) {
  for (const section of sections) {
    const block = document.createElement("section");
    const heading = document.createElement("h2");
    heading.textContent = section.heading;
    const grid = document.createElement("div");
    grid.className = "grid";
    block.append(heading, grid);
    for (const demo of section.cards) {
      const slot = document.createElement("div");
      slot.className = `slot ${demo.width}`;
      const label = document.createElement("h2");
      label.textContent = demo.title;
      const card = document.createElement("vha-device-card") as HTMLElement & {
        setConfig: (config: VhaDeviceCardConfig) => void;
        hass: HomeAssistant;
      };
      card.setConfig({ type: "custom:vha-device-card", ...demo.config });
      card.hass = hass;
      slot.append(label, card);
      grid.append(slot);
    }
    app.append(block);
  }

  const editorBlock = document.createElement("section");
  const editorHeading = document.createElement("h2");
  editorHeading.textContent = "编辑器字段（本地回退）";
  const editorSlot = document.createElement("div");
  editorSlot.className = "slot editor";
  const editor = document.createElement("vha-device-card-editor") as HTMLElement & {
    setConfig: (config: VhaDeviceCardConfig) => void;
    hass: HomeAssistant;
  };
  editor.hass = hass;
  editor.setConfig({
    type: "custom:vha-device-card",
    layout: "electronics",
    entity: "switch.pc",
    name: "PC PRO MAX",
    uptime_entity: "sensor.pc_uptime",
    temperature_entity: "sensor.gpu_temp",
    memory_entity: "sensor.mem",
  });
  editorSlot.append(editor);
  editorBlock.append(editorHeading, editorSlot);
  app.append(editorBlock);
}
