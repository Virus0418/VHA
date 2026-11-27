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

export interface VhaDeviceCardConfig {
  type?: string;
  entity?: string;
  name?: string;
  model?: string;
  status?: string;
  image?: string;
  show_toggle?: boolean;
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
