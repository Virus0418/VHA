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
