export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
  last_updated?: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  language?: string;
  locale?: { language?: string };
  callService: (
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
    target?: { entity_id?: string | string[] },
  ) => Promise<unknown>;
  formatEntityState?: (stateObj: HassEntity) => string;
  /** Optional. Real Home Assistant provides this; the local preview uses it for sensor history. */
  callWS?: (message: { type: string; [key: string]: unknown }) => Promise<unknown>;
}

export type DeviceLayout = "large" | "vertical" | "electronics";

export type ActionIcon = "steam" | "chevron" | "droplet";

export type ImageFit = "auto" | "contain" | "cover";

/** One side-rail action. `mode` sets a mode on the main entity; `entity` toggles another entity. */
export interface DeviceActionConfig {
  entity?: string;
  name?: string;
  icon?: ActionIcon;
  mode?: string;
}

export interface VhaDeviceCardConfig {
  type?: string;
  entity?: string;
  name?: string;
  model?: string;
  status?: string;
  image?: string;
  /** Extra pictures for the vertical layout. A comma-separated string is also accepted. */
  images?: string[] | string;
  show_toggle?: boolean;
  /** `large` big photo, `vertical` slider, `electronics` module card. Omitted means `large`. */
  layout?: string;
  /** Optional sensor that supplies the big number on the large layout. */
  value_entity?: string;
  image_fit?: ImageFit;
  actions?: DeviceActionConfig[];

  show_image?: boolean;
  show_placeholder?: boolean;
  show_power?: boolean;
  show_uptime?: boolean;
  show_battery?: boolean;
  show_network?: boolean;
  show_location?: boolean;
  show_temperature?: boolean;
  show_memory?: boolean;
  show_cpu?: boolean;
  show_gpu?: boolean;
  /** Master switch for the metric tiles (temperature, memory, CPU, GPU). */
  show_metrics?: boolean;

  power_entity?: string;
  uptime_entity?: string;
  battery_entity?: string;
  network_entity?: string;
  location_entity?: string;
  temperature_entity?: string;
  memory_entity?: string;
  cpu_entity?: string;
  gpu_entity?: string;
  temperature_label?: string;
  memory_label?: string;
  cpu_label?: string;
  gpu_label?: string;
}

export interface VhaClimateCardConfig {
  type?: string;
  entity?: string;
  name?: string;
  /** Hide the fan slider. Omitted means show it when the entity has fan modes. */
  show_fan?: boolean;
}

export interface SensorChipConfig {
  name?: string;
  entity?: string;
  mode?: string;
}

export interface SensorMetricConfig {
  entity?: string;
  name?: string;
}

export interface VhaSensorCardConfig {
  type?: string;
  entity?: string;
  name?: string;
  /** `insight` air-quality readout, or `metrics` tiled numbers. Omitted means `insight`. */
  layout?: string;
  caption?: string;
  status?: string;
  show_timeline?: boolean;
  chips?: SensorChipConfig[];
  /** Optional linked entity for the bottom target slider. Omitted means the slider is absent. */
  target_entity?: string;
  target_label?: string;
  metrics?: SensorMetricConfig[];
}

export interface MediaRoomConfig {
  entity?: string;
  name?: string;
  /** `false` hides the row and keeps it in the config. */
  show?: boolean;
}

export interface VhaMediaCardConfig {
  type?: string;
  entity?: string;
  name?: string;
  image?: string;
  rooms?: MediaRoomConfig[];
}

declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description?: string;
      preview?: boolean;
      documentationURL?: string;
    }>;
  }
}
