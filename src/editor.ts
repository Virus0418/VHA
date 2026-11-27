import type { HomeAssistant, VhaDeviceCardConfig } from "./types";

const SCHEMA = [
  {
    name: "entity",
    required: true,
    selector: { entity: {} },
  },
  {
    name: "name",
    selector: { text: {} },
  },
  {
    name: "model",
    selector: { text: {} },
  },
  {
    name: "status",
    selector: { text: {} },
  },
  {
    name: "image",
    selector: { text: {} },
  },
  {
    name: "show_toggle",
    selector: { boolean: {} },
  },
] as const;

const LABELS: Record<string, string> = {
  entity: "实体",
  name: "名称（留空则使用友好名称）",
  model: "型号 / 副标题",
  status: "状态文案（留空则根据实体状态自动显示）",
  image: "图片地址（留空则使用实体图片）",
  show_toggle: "显示底部开关",
};

/**
 * Visual editor used by the Lovelace “添加卡片” dialog.
 * Relies on Home Assistant's ha-form + entity selector when running inside HA.
 * In the local preview it falls back to plain inputs.
 */
export class VhaDeviceCardEditor extends HTMLElement {
  private _config: VhaDeviceCardConfig = { type: "custom:vha-device-card" };
  private _hass?: HomeAssistant;
  private _built = false;

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this._render();
  }

  setConfig(config: VhaDeviceCardConfig) {
    this._config = { type: "custom:vha-device-card", show_toggle: true, ...config };
    this._render();
  }

  private _emit(config: VhaDeviceCardConfig) {
    this._config = config;
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }),
    );
  }

  private _render() {
    const haForm = customElements.get("ha-form");
    if (haForm && this._hass) {
      this._renderHaForm();
      return;
    }
    this._renderFallback();
  }

  private _renderHaForm() {
    let form = this.querySelector("ha-form") as HAForm | null;
    if (!form) {
      this.innerHTML = "";
      form = document.createElement("ha-form") as HAForm;
      this.appendChild(form);
      form.addEventListener("value-changed", (ev: Event) => {
        const value = (ev as CustomEvent).detail.value as VhaDeviceCardConfig;
        this._emit({ ...this._config, ...value, type: "custom:vha-device-card" });
      });
    }
    form.hass = this._hass;
    form.data = this._config;
    form.schema = SCHEMA;
    form.computeLabel = (schema: { name: string }) => LABELS[schema.name] || schema.name;
  }

  private _renderFallback() {
    if (!this._built) {
      this.innerHTML = `
        <style>
          .vha-editor { display: grid; gap: 10px; font-family: Inter, sans-serif; }
          .vha-editor label { display: grid; gap: 4px; font-size: 12px; color: #444; }
          .vha-editor input[type="text"] {
            height: 36px; border: 1px solid #e4e6ea; border-radius: 8px; padding: 0 10px; font: inherit;
          }
          .vha-editor .row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
        </style>
        <div class="vha-editor">
          <label>实体 <input data-key="entity" type="text" placeholder="light.living_room" /></label>
          <label>名称 <input data-key="name" type="text" placeholder="可选" /></label>
          <label>型号 / 副标题 <input data-key="model" type="text" placeholder="可选" /></label>
          <label>状态文案 <input data-key="status" type="text" placeholder="留空则自动" /></label>
          <label>图片地址 <input data-key="image" type="text" placeholder="留空则使用实体图片" /></label>
          <label class="row"><input data-key="show_toggle" type="checkbox" /> 显示底部开关</label>
        </div>
      `;
      this.querySelectorAll("input").forEach((input) => {
        input.addEventListener("change", () => this._fromFallback());
        input.addEventListener("input", () => this._fromFallback());
      });
      this._built = true;
    }
    const cfg = this._config;
    (this.querySelector('[data-key="entity"]') as HTMLInputElement).value = cfg.entity ?? "";
    (this.querySelector('[data-key="name"]') as HTMLInputElement).value = cfg.name ?? "";
    (this.querySelector('[data-key="model"]') as HTMLInputElement).value = cfg.model ?? "";
    (this.querySelector('[data-key="status"]') as HTMLInputElement).value = cfg.status ?? "";
    (this.querySelector('[data-key="image"]') as HTMLInputElement).value = cfg.image ?? "";
    (this.querySelector('[data-key="show_toggle"]') as HTMLInputElement).checked =
      cfg.show_toggle !== false;
  }

  private _fromFallback() {
    const read = (key: string) =>
      (this.querySelector(`[data-key="${key}"]`) as HTMLInputElement).value.trim();
    this._emit({
      type: "custom:vha-device-card",
      entity: read("entity") || undefined,
      name: read("name") || undefined,
      model: read("model") || undefined,
      status: read("status") || undefined,
      image: read("image") || undefined,
      show_toggle: (this.querySelector('[data-key="show_toggle"]') as HTMLInputElement).checked,
    });
  }
}

interface HAForm extends HTMLElement {
  hass?: HomeAssistant;
  data?: unknown;
  schema?: unknown;
  computeLabel?: (schema: { name: string }) => string;
}
