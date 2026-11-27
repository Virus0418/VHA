import { parseActions } from "./control";
import { moduleAvailability, resolveLayout } from "./model";
import type { DeviceActionConfig, HomeAssistant, VhaDeviceCardConfig } from "./types";

const LAYOUT_OPTIONS = [
  { value: "large", label: "大图设备" },
  { value: "vertical", label: "竖图控制" },
  { value: "electronics", label: "电子设备" },
];

const FIT_OPTIONS = [
  { value: "auto", label: "自动" },
  { value: "contain", label: "完整显示（浅底）" },
  { value: "cover", label: "铺满" },
];

const LABELS: Record<string, string> = {
  entity: "实体",
  name: "名称（留空则使用友好名称）",
  model: "型号 / 副标题",
  status: "状态文案（留空则自动）",
  image: "图片地址（留空则使用实体图片）",
  images: "更多图片（逗号分隔，竖图左右切换）",
  show_toggle: "显示电源开关",
  layout: "排版形式",
  value_entity: "主数值实体（留空则从主实体读取）",
  image_fit: "图片适应",
  show_image: "产品图",
  show_placeholder: "产品图占位",
  show_power: "电源开关",
  show_uptime: "开机时长",
  show_battery: "电池",
  show_network: "网络",
  show_location: "位置",
  show_temperature: "温度",
  show_memory: "内存占用",
  show_cpu: "CPU 占用",
  show_gpu: "GPU 占用",
  show_metrics: "指标",
  power_entity: "电源实体（留空则使用主实体）",
  uptime_entity: "开机时长实体",
  battery_entity: "电池实体",
  network_entity: "网络实体",
  location_entity: "位置实体",
  temperature_entity: "温度实体",
  memory_entity: "内存实体",
  cpu_entity: "CPU 实体",
  gpu_entity: "GPU 实体",
  temperature_label: "温度名称",
  memory_label: "内存名称",
  cpu_label: "CPU 名称",
  gpu_label: "GPU 名称",
  action_1_entity: "动作 1 实体",
  action_1_name: "动作 1 名称",
  action_2_entity: "动作 2 实体",
  action_2_name: "动作 2 名称",
  action_3_entity: "动作 3 实体",
  action_3_name: "动作 3 名称",
};

const TEXT_KEYS = [
  "entity",
  "name",
  "model",
  "status",
  "image",
  "images",
  "value_entity",
  "power_entity",
  "uptime_entity",
  "battery_entity",
  "network_entity",
  "location_entity",
  "temperature_entity",
  "memory_entity",
  "cpu_entity",
  "gpu_entity",
  "temperature_label",
  "memory_label",
  "cpu_label",
  "gpu_label",
] as const;

const MODULE_FLAGS = [
  "show_image",
  "show_placeholder",
  "show_power",
  "show_uptime",
  "show_battery",
  "show_network",
  "show_location",
  "show_temperature",
  "show_memory",
  "show_cpu",
  "show_gpu",
  "show_metrics",
] as const;

type SchemaItem = {
  name: string;
  required?: boolean;
  disabled?: boolean;
  selector: Record<string, unknown>;
};

function entityField(name: string): SchemaItem {
  return { name, selector: { entity: {} } };
}

function textField(name: string): SchemaItem {
  return { name, selector: { text: {} } };
}

function boolField(name: string, disabled = false): SchemaItem {
  return { name, disabled, selector: { boolean: {} } };
}

function buildSchema(config: VhaDeviceCardConfig, hass?: HomeAssistant): SchemaItem[] {
  const layout = resolveLayout(config.layout);
  const availability = moduleAvailability(config, hass);
  const schema: SchemaItem[] = [
    { name: "entity", required: true, selector: { entity: {} } },
    textField("name"),
    {
      name: "layout",
      selector: { select: { options: LAYOUT_OPTIONS, mode: "dropdown" } },
    },
  ];
  if (layout === "large") {
    schema.push(
      textField("model"),
      textField("status"),
      textField("image"),
      { name: "image_fit", selector: { select: { options: FIT_OPTIONS, mode: "dropdown" } } },
      boolField("show_toggle"),
      entityField("value_entity"),
      entityField("action_1_entity"),
      textField("action_1_name"),
      entityField("action_2_entity"),
      textField("action_2_name"),
      entityField("action_3_entity"),
      textField("action_3_name"),
    );
  } else if (layout === "vertical") {
    schema.push(
      textField("image"),
      textField("images"),
      { name: "image_fit", selector: { select: { options: FIT_OPTIONS, mode: "dropdown" } } },
    );
  } else {
    schema.push(
      textField("model"),
      textField("image"),
      { name: "image_fit", selector: { select: { options: FIT_OPTIONS, mode: "dropdown" } } },
      boolField("show_image"),
      boolField("show_placeholder"),
      boolField("show_power", !availability.show_power && config.show_power !== true),
      entityField("power_entity"),
      boolField("show_uptime", !availability.show_uptime && config.show_uptime !== true),
      entityField("uptime_entity"),
      boolField("show_battery", !availability.show_battery && config.show_battery !== true),
      entityField("battery_entity"),
      boolField("show_network", !availability.show_network && config.show_network !== true),
      entityField("network_entity"),
      boolField("show_location", !availability.show_location && config.show_location !== true),
      entityField("location_entity"),
      boolField("show_metrics", !availability.show_metrics && config.show_metrics !== true),
      boolField("show_temperature", !availability.show_temperature && config.show_temperature !== true),
      entityField("temperature_entity"),
      textField("temperature_label"),
      boolField("show_memory", !availability.show_memory && config.show_memory !== true),
      entityField("memory_entity"),
      textField("memory_label"),
      boolField("show_cpu", !availability.show_cpu && config.show_cpu !== true),
      entityField("cpu_entity"),
      textField("cpu_label"),
      boolField("show_gpu", !availability.show_gpu && config.show_gpu !== true),
      entityField("gpu_entity"),
      textField("gpu_label"),
    );
  }
  return schema;
}

function checked(value: boolean | undefined, available: boolean): boolean {
  if (value === false) return false;
  if (value === true) return true;
  return available;
}

function formData(config: VhaDeviceCardConfig, hass?: HomeAssistant): Record<string, unknown> {
  const layout = resolveLayout(config.layout);
  const actions = parseActions(config.actions);
  const availability = moduleAvailability(config, hass);
  const data: Record<string, unknown> = {
    ...config,
    type: "custom:vha-device-card",
    layout,
    show_toggle: config.show_toggle !== false,
    image_fit: config.image_fit || "auto",
  };
  if (layout === "large") {
    for (let i = 0; i < 3; i += 1) {
      data[`action_${i + 1}_entity`] = actions[i]?.entity ?? "";
      data[`action_${i + 1}_name`] = actions[i]?.name ?? "";
    }
  }
  if (layout === "electronics") {
    for (const key of MODULE_FLAGS) {
      data[key] = checked(config[key], Boolean(availability[key]));
    }
  }
  return data;
}

function clean(config: Record<string, unknown>): VhaDeviceCardConfig {
  const next: Record<string, unknown> = { ...config, type: "custom:vha-device-card" };
  for (const key of TEXT_KEYS) {
    const value = next[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) delete next[key];
      else next[key] = trimmed;
    }
  }
  if (next.image_fit === "auto") delete next.image_fit;
  next.layout = resolveLayout(typeof next.layout === "string" ? next.layout : undefined);
  const slots = [1, 2, 3].map((index) => {
    const entityKey = `action_${index}_entity`;
    const nameKey = `action_${index}_name`;
    const present = entityKey in config || nameKey in config;
    const entity = typeof next[entityKey] === "string" ? String(next[entityKey]) : undefined;
    const name = typeof next[nameKey] === "string" ? String(next[nameKey]) : undefined;
    delete next[entityKey];
    delete next[nameKey];
    return { present, entity, name };
  });
  if (slots.some((slot) => slot.present)) {
    const previous = parseActions(config.actions);
    const actions: DeviceActionConfig[] = [];
    slots.forEach((slot, index) => {
      const old = previous[index];
      if (!slot.entity && !slot.name) {
        if (old?.mode) actions.push(old);
        return;
      }
      actions.push({
        entity: slot.entity,
        name: slot.name || old?.name,
        icon: old?.icon || (["steam", "chevron", "droplet"] as const)[index],
        mode: old?.mode,
      });
    });
    if (actions.length) next.actions = actions;
    else delete next.actions;
  }
  return next as VhaDeviceCardConfig;
}

export class VhaDeviceCardEditor extends HTMLElement {
  private _config: VhaDeviceCardConfig = { type: "custom:vha-device-card" };
  private _hass?: HomeAssistant;
  private _fallbackKey = "";
  private _rendering = false;

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this._render();
  }

  setConfig(config: VhaDeviceCardConfig) {
    this._config = { type: "custom:vha-device-card", show_toggle: true, ...config };
    this._render();
  }

  private _signature(): string {
    const availability = moduleAvailability(this._config, this._hass);
    return `${resolveLayout(this._config.layout)}:${Object.values(availability).join("")}`;
  }

  private _emit(config: VhaDeviceCardConfig) {
    const previous = this._signature();
    this._config = config;
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }),
    );
    const formReady = Boolean(customElements.get("ha-form") && this._hass);
    if (formReady || previous !== this._signature()) this._render();
  }

  private _render() {
    if (this._rendering) return;
    this._rendering = true;
    try {
      this._renderBody();
    } finally {
      this._rendering = false;
    }
  }

  private _renderBody() {
    if (customElements.get("ha-form") && this._hass) {
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
        const value = (ev as CustomEvent).detail?.value as Record<string, unknown> | undefined;
        if (!value) return;
        this._emit(clean({ ...this._config, ...value }));
      });
    }
    form.hass = this._hass;
    form.schema = buildSchema(this._config, this._hass);
    form.data = formData(this._config, this._hass);
    form.computeLabel = (schema: { name: string }) => LABELS[schema.name] || schema.name;
  }

  private _renderFallback() {
    const layout = resolveLayout(this._config.layout);
    const availability = moduleAvailability(this._config, this._hass);
    const key = `${layout}:${Object.values(availability).join("")}`;
    if (this._fallbackKey !== key) {
      this._fallbackKey = key;
      this.innerHTML = `${fallbackStyle()}${fallbackFields(layout, availability, this._config)}`;
      this.querySelectorAll("input, select").forEach((input) => {
        input.addEventListener("change", () => this._fromFallback());
        input.addEventListener("input", () => this._fromFallback());
      });
    }
    const data = formData(this._config, this._hass);
    this.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-key]").forEach((input) => {
      const field = input.dataset.key || "";
      const value = data[field];
      if (input instanceof HTMLInputElement && input.type === "checkbox") {
        input.checked = value === true;
      } else {
        input.value = value == null ? "" : String(value);
      }
    });
  }

  private _fromFallback() {
    const next: Record<string, unknown> = { ...this._config, type: "custom:vha-device-card" };
    this.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-key]").forEach((input) => {
      const field = input.dataset.key || "";
      if (input instanceof HTMLInputElement && input.type === "checkbox") next[field] = input.checked;
      else next[field] = input.value;
    });
    this._emit(clean(next));
  }
}

function fallbackStyle(): string {
  return `<style>
    .vha-editor { display: grid; gap: 10px; font-family: "Noto Sans SC", "PingFang SC", sans-serif; }
    .vha-editor label { display: grid; gap: 4px; font-size: 12px; color: #3A3A3C; }
    .vha-editor input[type="text"], .vha-editor select {
      height: 36px; border: 1px solid #E4E4E8; border-radius: 8px; padding: 0 10px; font: inherit; background: #fff; color: #111;
    }
    .vha-editor .row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
    .vha-editor .hint { margin: 0; font-size: 12px; line-height: 16px; color: #6B6C6F; }
    .vha-editor input:disabled { opacity: 0.45; }
  </style>`;
}

function fallbackFields(
  layout: string,
  availability: Record<string, boolean>,
  config: VhaDeviceCardConfig,
): string {
  const text = (key: string, placeholder = "") =>
    `<label>${LABELS[key] || key}<input data-key="${key}" type="text" placeholder="${placeholder}" /></label>`;
  const select = (key: string, options: Array<{ value: string; label: string }>) =>
    `<label>${LABELS[key]}<select data-key="${key}">${options
      .map((option) => `<option value="${option.value}">${option.label}</option>`)
      .join("")}</select></label>`;
  const check = (key: string) => {
    const current = (config as Record<string, unknown>)[key];
    const disabled = !availability[key] && current !== true;
    return `<label class="row"><input data-key="${key}" type="checkbox" ${disabled ? "disabled" : ""}/> ${LABELS[key]}</label>`;
  };
  const common = [
    text("entity", "light.living_room"),
    text("name", "可选"),
    select("layout", LAYOUT_OPTIONS),
  ];
  if (layout === "vertical") {
    return `<div class="vha-editor">${common.join("")}<p class="hint">竖图用滑杆调节，不另放电源开关。关态滑杆回到底部。</p>${text("image")}${text("images")}${select("image_fit", FIT_OPTIONS)}</div>`;
  }
  if (layout === "electronics") {
    const modules = [
      check("show_image"),
      check("show_placeholder"),
      check("show_power"),
      text("power_entity"),
      check("show_uptime"),
      text("uptime_entity"),
      check("show_battery"),
      text("battery_entity"),
      check("show_network"),
      text("network_entity"),
      check("show_location"),
      text("location_entity"),
      check("show_metrics"),
      check("show_temperature"),
      text("temperature_entity"),
      check("show_memory"),
      text("memory_entity"),
      check("show_cpu"),
      text("cpu_entity"),
      check("show_gpu"),
      text("gpu_entity"),
    ];
    return `<div class="vha-editor">${common.join("")}${text("model")}${text("image")}${select("image_fit", FIT_OPTIONS)}${modules.join("")}<p class="hint">没有对应实体时，模块开关会禁用。关掉「指标」会收起温度、内存、CPU、GPU。</p></div>`;
  }
  return `<div class="vha-editor">${common.join("")}${text("model")}${text("status")}${text("image")}${select("image_fit", FIT_OPTIONS)}<label class="row"><input data-key="show_toggle" type="checkbox" /> ${LABELS.show_toggle}</label>${text("value_entity")}${text("action_1_entity")}${text("action_1_name")}${text("action_2_entity")}${text("action_2_name")}${text("action_3_entity")}${text("action_3_name")}<p class="hint">不填动作时，加湿器或风扇会用自己的模式生成右侧动作栏。栏宽不足 320px 时，动作栏改到图片下方横排。</p></div>`;
}

interface HAForm extends HTMLElement {
  hass?: HomeAssistant;
  data?: unknown;
  schema?: unknown;
  computeLabel?: (schema: { name: string }) => string;
}
