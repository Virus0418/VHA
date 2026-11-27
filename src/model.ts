import {
  entityIsToggleable,
  linkedActionOn,
  readSlider,
  resolveActions,
  type ResolvedAction,
} from "./control";
import {
  attrText,
  batteryInfo,
  formatQuantity,
  locationText,
  metricText,
  networkText,
  unitOf,
  uptimeText,
  type BatteryInfo,
} from "./format";
import { asNumber } from "./format";
import { domainOf, isActive, isToggleable } from "./toggle";
import type {
  DeviceLayout,
  HassEntity,
  HomeAssistant,
  ImageFit,
  VhaDeviceCardConfig,
} from "./types";

export interface RailButton {
  name: string;
  icon: ResolvedAction["icon"];
  pressed: boolean;
  disabled: boolean;
  entity?: string;
  mode?: string;
}

export interface MetricTile {
  label: string;
  value: string;
  entityId: string;
}

export interface CardView {
  layout: DeviceLayout;
  entityId?: string;
  empty: boolean;
  blocked: boolean;
  name: string;
  image?: string;
  images: string[];
  imageFit: "contain" | "cover";
  dim: boolean;
  large?: {
    value: string;
    valueKind: "number" | "text";
    caption: string;
    showSwitch: boolean;
    switchOn: boolean;
    actions: RailButton[];
  };
  vertical?: {
    fraction: number;
    label: string;
    icon: "sun" | "droplet" | "steam";
    disabled: boolean;
    note?: string;
    showNav: boolean;
  };
  electronics?: {
    uptime?: string;
    showPower: boolean;
    powerOn: boolean;
    powerDisabled: boolean;
    powerEntityId?: string;
    network?: { text: string; entityId: string };
    location?: { text: string; entityId: string };
    showWell: boolean;
    showPhoto: boolean;
    placeholderLabel: string;
    silhouette: "tower" | "laptop" | "generic";
    battery?: BatteryInfo & { entityId: string };
    tiles: MetricTile[];
  };
}

export function resolveLayout(layout?: string): DeviceLayout {
  if (layout === "vertical" || layout === "electronics") return layout;
  return "large";
}

export function resolveImageFit(fit: ImageFit | undefined, layout: DeviceLayout): "contain" | "cover" {
  if (fit === "contain" || fit === "cover") return fit;
  return layout === "electronics" ? "contain" : "cover";
}

export function collectImages(config: VhaDeviceCardConfig, state?: HassEntity): string[] {
  const out: string[] = [];
  const push = (value: unknown) => {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (trimmed && !out.includes(trimmed)) out.push(trimmed);
  };
  push(config.image);
  if (Array.isArray(config.images)) config.images.forEach(push);
  else if (typeof config.images === "string") config.images.split(",").forEach(push);
  push(attrText(state?.attributes.entity_picture));
  push(attrText(state?.attributes.image));
  return out;
}

export function moduleAvailability(
  config: VhaDeviceCardConfig,
  hass?: HomeAssistant,
): Record<string, boolean> {
  const state = config.entity && hass ? hass.states[config.entity] : undefined;
  const attrs = state?.attributes ?? {};
  const metric = Boolean(
    config.temperature_entity || config.memory_entity || config.cpu_entity || config.gpu_entity,
  );
  return {
    show_image: true,
    show_placeholder: true,
    show_power: Boolean(config.power_entity) || entityIsToggleable(config.entity),
    show_uptime: Boolean(config.uptime_entity) || attrs.uptime != null || attrs.device_class === "timestamp",
    show_battery: Boolean(config.battery_entity) || attrs.battery != null || attrs.battery_level != null,
    show_network: Boolean(config.network_entity) || attrs.ssid != null,
    show_location: Boolean(config.location_entity) || attrs.zone != null || attrs.location != null,
    show_temperature: Boolean(config.temperature_entity),
    show_memory: Boolean(config.memory_entity),
    show_cpu: Boolean(config.cpu_entity),
    show_gpu: Boolean(config.gpu_entity),
    show_metrics: metric,
  };
}

export function buildView(
  config: VhaDeviceCardConfig,
  hass?: HomeAssistant,
  imageIndex = 0,
): CardView {
  const layout = resolveLayout(config.layout);
  const entityId = config.entity?.trim() || undefined;
  const state = entityId && hass ? hass.states[entityId] : undefined;
  const blocked = !state || state.state === "unavailable" || state.state === "unknown";
  const name =
    config.name ||
    attrText(state?.attributes.friendly_name) ||
    entityId ||
    "设备";
  const images = collectImages(config, state);
  const index = images.length ? ((imageIndex % images.length) + images.length) % images.length : 0;
  const image = images[index];
  const base: CardView = {
    layout,
    entityId,
    empty: !entityId,
    blocked,
    name,
    image,
    images,
    imageFit: resolveImageFit(config.image_fit, layout),
    dim: false,
  };
  if (!entityId) return base;
  if (layout === "vertical") return { ...base, ...verticalPart(config, state, blocked, images.length > 1) };
  if (layout === "electronics") return { ...base, ...electronicsPart(config, hass, state, name, blocked, image) };
  return { ...base, ...largePart(config, hass, state, name, blocked, entityId) };
}

function largePart(
  config: VhaDeviceCardConfig,
  hass: HomeAssistant | undefined,
  state: HassEntity | undefined,
  name: string,
  blocked: boolean,
  entityId: string,
): Pick<CardView, "dim" | "large"> {
  const active = Boolean(state && isActive(state));
  const actions = resolveActions(config.actions, state, active).map((action) => {
    const linkedOn = Boolean(
      action.entity && hass?.states[action.entity] && isActive(hass.states[action.entity]),
    );
    return {
      name: action.name,
      icon: action.icon,
      entity: action.entity,
      mode: action.mode,
      pressed: !blocked && (action.pressed || linkedOn),
      disabled: blocked,
    };
  });
  const running = active || linkedActionOn(hass, actions);
  const showSwitch = isToggleable(entityId) && config.show_toggle !== false;
  const switchOn = !blocked && running;
  const reading = largeReading(config, hass, state, name, blocked);
  const dim = blocked || (isToggleable(entityId) && !switchOn);
  return {
    dim,
    large: {
      ...reading,
      showSwitch,
      switchOn,
      actions,
    },
  };
}

function largeReading(
  config: VhaDeviceCardConfig,
  hass: HomeAssistant | undefined,
  state: HassEntity | undefined,
  name: string,
  blocked: boolean,
): { value: string; valueKind: "number" | "text"; caption: string } {
  if (blocked && !config.value_entity) {
    const label = state?.state === "unknown" ? "未知" : "不可用";
    return { value: label, valueKind: "text", caption: label };
  }
  if (config.value_entity) {
    const sensor = hass?.states[config.value_entity];
    const caption = config.status || config.model || name;
    if (!sensor || sensor.state === "unavailable") return { value: "不可用", valueKind: "text", caption: "不可用" };
    if (sensor.state === "unknown") return { value: "未知", valueKind: "text", caption: "未知" };
    const numeric = asNumber(sensor.state);
    if (numeric != null) return { value: formatQuantity(numeric, unitOf(sensor)), valueKind: "number", caption };
    return { value: sensor.state, valueKind: "text", caption };
  }
  if (!state) return { value: "不可用", valueKind: "text", caption: "不可用" };
  const domain = domainOf(state.entity_id);
  if (domain === "humidifier") {
    const humidity = asNumber(state.attributes.current_humidity) ?? asNumber(state.attributes.humidity);
    if (humidity != null) {
      return { value: formatQuantity(humidity, "%"), valueKind: "number", caption: config.status || "湿度" };
    }
  }
  if (domain === "light") {
    const on = isActive(state);
    const brightness = asNumber(state.attributes.brightness);
    const pct = on && brightness != null ? Math.round((brightness / 255) * 100) : 0;
    return { value: formatQuantity(pct, "%"), valueKind: "number", caption: config.status || "亮度" };
  }
  if (domain === "fan") {
    const pct = isActive(state) ? Math.round(asNumber(state.attributes.percentage) ?? 0) : 0;
    return { value: formatQuantity(pct, "%"), valueKind: "number", caption: config.status || "风速" };
  }
  if (domain === "sensor" || domain === "input_number" || domain === "number") {
    const numeric = asNumber(state.state);
    if (numeric != null) {
      return {
        value: formatQuantity(numeric, unitOf(state)),
        valueKind: "number",
        caption: config.status || config.model || name,
      };
    }
  }
  const caption = config.status || config.model || "";
  return { value: name, valueKind: "text", caption: caption === name ? "" : caption };
}

function verticalPart(
  config: VhaDeviceCardConfig,
  state: HassEntity | undefined,
  blocked: boolean,
  showNav: boolean,
): Pick<CardView, "dim" | "vertical"> {
  const domain = state ? domainOf(state.entity_id) : "";
  if (blocked) {
    return {
      dim: true,
      vertical: {
        fraction: 0,
        label: state?.state === "unknown" ? "未知" : "不可用",
        icon: "sun",
        disabled: true,
        showNav,
      },
    };
  }
  const slider = readSlider(state);
  const levelOff = ["light", "fan", "humidifier", "cover", "media_player"].includes(domain) && !isActive(state!);
  return {
    dim: levelOff,
    vertical: {
      fraction: slider.fraction,
      label: slider.label,
      icon: slider.icon,
      disabled: !slider.supported,
      note: slider.supported ? undefined : "此实体不能用滑杆调节",
      showNav,
    },
  };
}

function electronicsPart(
  config: VhaDeviceCardConfig,
  hass: HomeAssistant | undefined,
  state: HassEntity | undefined,
  name: string,
  blocked: boolean,
  image: string | undefined,
): Pick<CardView, "dim" | "electronics" | "image"> {
  const powerId = config.power_entity || (entityIsToggleable(config.entity) ? config.entity : undefined);
  const wantPower = config.show_power !== undefined ? config.show_power : config.show_toggle !== false;
  const showPower = Boolean(wantPower && powerId);
  const powerState = powerId && hass ? hass.states[powerId] : undefined;
  const powerBlocked = !powerState || powerState.state === "unavailable" || powerState.state === "unknown";
  const powerOn = Boolean(showPower && !powerBlocked && isActive(powerState));
  const allowImage = config.show_image !== false;
  const showPhoto = allowImage && Boolean(image);
  const showPlaceholder = !showPhoto && config.show_placeholder !== false;
  const electronics = {
    uptime: shown(config.show_uptime, Boolean(config.uptime_entity))
      ? uptimeText(config.uptime_entity ? hass?.states[config.uptime_entity] : undefined)
      : undefined,
    showPower,
    powerOn,
    powerDisabled: showPower && powerBlocked,
    powerEntityId: showPower ? powerId : undefined,
    network: textModule(config.show_network, config.network_entity, hass, networkText),
    location: textModule(config.show_location, config.location_entity, hass, locationText),
    showWell: showPhoto || showPlaceholder,
    showPhoto,
    placeholderLabel: config.model || name,
    silhouette: silhouetteFor(`${name} ${config.model ?? ""}`),
    battery: batteryModule(config, hass),
    tiles: metricTiles(config, hass),
  };
  return {
    image: showPhoto ? image : undefined,
    dim: showPower ? powerBlocked || !powerOn : blocked,
    electronics,
  };
}

function shown(flag: boolean | undefined, hasData: boolean): boolean {
  if (flag === false) return false;
  if (flag === true) return hasData;
  return hasData;
}

function textModule(
  flag: boolean | undefined,
  entityId: string | undefined,
  hass: HomeAssistant | undefined,
  format: (state?: HassEntity) => string,
): { text: string; entityId: string } | undefined {
  if (!shown(flag, Boolean(entityId)) || !entityId) return undefined;
  return { text: format(hass?.states[entityId]), entityId };
}

function batteryModule(config: VhaDeviceCardConfig, hass?: HomeAssistant) {
  if (!shown(config.show_battery, Boolean(config.battery_entity)) || !config.battery_entity) return undefined;
  return { ...batteryInfo(hass?.states[config.battery_entity]), entityId: config.battery_entity };
}

function metricTiles(config: VhaDeviceCardConfig, hass?: HomeAssistant): MetricTile[] {
  if (config.show_metrics === false) return [];
  const specs: Array<[boolean | undefined, string | undefined, string | undefined, string]> = [
    [config.show_temperature, config.temperature_entity, config.temperature_label, "温度"],
    [config.show_memory, config.memory_entity, config.memory_label, "内存"],
    [config.show_cpu, config.cpu_entity, config.cpu_label, "CPU 占用"],
    [config.show_gpu, config.gpu_entity, config.gpu_label, "GPU 占用"],
  ];
  const tiles: MetricTile[] = [];
  for (const [flag, entityId, label, fallback] of specs) {
    if (!shown(flag, Boolean(entityId)) || !entityId) continue;
    const state = hass?.states[entityId];
    tiles.push({
      label: label || friendlyLabel(state, fallback),
      value: metricText(state),
      entityId,
    });
  }
  return tiles;
}

function friendlyLabel(state: HassEntity | undefined, fallback: string): string {
  const friendly = attrText(state?.attributes.friendly_name);
  if (friendly && !friendly.includes(".")) return friendly;
  return fallback;
}

export function silhouetteFor(label: string): "tower" | "laptop" | "generic" {
  const value = label.toLowerCase();
  if (/macbook|laptop|notebook|笔记本/.test(value)) return "laptop";
  if (/ipad|iphone|phone|手机|平板/.test(value)) return "generic";
  if (/pc|desktop|tower|电脑|主机/.test(value)) return "tower";
  return "generic";
}
