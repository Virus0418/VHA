import { boolField, editorStyle, entityField, mountHaForm, textField } from "./form";
import type { HomeAssistant, VhaClimateCardConfig } from "./types";

const LABELS: Record<string, string> = {
  entity: "实体",
  name: "名称（留空则使用友好名称）",
  show_fan: "显示风速滑杆",
};

export class VhaClimateCardEditor extends HTMLElement {
  private _config: VhaClimateCardConfig = { type: "custom:vha-climate-card" };
  private _hass?: HomeAssistant;
  private _built = false;

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this._render();
  }

  setConfig(config: VhaClimateCardConfig) {
    this._config = { type: "custom:vha-climate-card", ...config };
    this._render();
  }

  private _emit(config: VhaClimateCardConfig) {
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }

  private _data(): Record<string, unknown> {
    return {
      entity: this._config.entity ?? "",
      name: this._config.name ?? "",
      show_fan: this._config.show_fan !== false,
    };
  }

  private _render() {
    const schema = [entityField("entity", "climate"), textField("name"), boolField("show_fan")];
    schema[0] = { ...schema[0], required: true };
    if (
      mountHaForm(this, {
        hass: this._hass,
        data: this._data(),
        schema,
        labels: LABELS,
        onChange: (value) => {
          this._emit({
            type: "custom:vha-climate-card",
            entity: text(value.entity),
            name: text(value.name),
            show_fan: value.show_fan !== false,
          });
        },
      })
    ) {
      return;
    }
    this._fallback();
  }

  private _fallback() {
    if (!this._built) {
      this.innerHTML = `
        <style>${editorStyle}</style>
        <div class="vha-editor">
          <label>实体 <input data-key="entity" type="text" placeholder="climate.living_room" /></label>
          <label>名称 <input data-key="name" type="text" placeholder="可选" /></label>
          <label class="row"><input data-key="show_fan" type="checkbox" /> 显示风速滑杆</label>
        </div>`;
      this.querySelectorAll("input").forEach((input) => {
        input.addEventListener("change", () => this._fromFallback());
      });
      this._built = true;
    }
    const cfg = this._config;
    (this.querySelector('[data-key="entity"]') as HTMLInputElement).value = cfg.entity ?? "";
    (this.querySelector('[data-key="name"]') as HTMLInputElement).value = cfg.name ?? "";
    (this.querySelector('[data-key="show_fan"]') as HTMLInputElement).checked = cfg.show_fan !== false;
  }

  private _fromFallback() {
    const read = (key: string) => (this.querySelector(`[data-key="${key}"]`) as HTMLInputElement).value.trim();
    this._emit({
      type: "custom:vha-climate-card",
      entity: read("entity") || undefined,
      name: read("name") || undefined,
      show_fan: (this.querySelector('[data-key="show_fan"]') as HTMLInputElement).checked,
    });
  }
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
