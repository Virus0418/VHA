import { editorStyle, entityField, mountHaForm, mountList, textField } from "./form";
import { parseRooms } from "./media-model";
import type { HomeAssistant, MediaRoomConfig, VhaMediaCardConfig } from "./types";

const LABELS: Record<string, string> = {
  entity: "实体",
  name: "名称（留空则使用友好名称）",
  image: "产品图（留空则使用实体图片）",
};

export class VhaMediaCardEditor extends HTMLElement {
  private _config: VhaMediaCardConfig = { type: "custom:vha-media-card" };
  private _hass?: HomeAssistant;
  private _painting = false;

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this._render();
  }

  setConfig(config: VhaMediaCardConfig) {
    this._config = { type: "custom:vha-media-card", ...config, rooms: parseRooms(config.rooms) };
    if (!this._painting) this._render();
  }

  private _emit(config: VhaMediaCardConfig) {
    const next: VhaMediaCardConfig = { type: "custom:vha-media-card" };
    if (config.entity) next.entity = config.entity;
    if (config.name) next.name = config.name;
    if (config.image) next.image = config.image;
    if (config.rooms?.length) next.rooms = config.rooms;
    this._config = next;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
    if (this._painting) return;
    this._painting = true;
    this._render();
    this._painting = false;
  }

  private _render() {
    const formHost = (this.querySelector("[data-form]") as HTMLElement | null) ?? document.createElement("div");
    const extraHost = (this.querySelector("[data-extra]") as HTMLElement | null) ?? document.createElement("div");
    if (!this.querySelector("[data-form]")) {
      formHost.setAttribute("data-form", "");
      extraHost.setAttribute("data-extra", "");
      this.replaceChildren(formHost, extraHost);
    }
    const used = mountHaForm(formHost, {
      hass: this._hass,
      data: {
        entity: this._config.entity ?? "",
        name: this._config.name ?? "",
        image: this._config.image ?? "",
      },
      schema: [{ ...entityField("entity", "media_player"), required: true }, textField("name"), textField("image")],
      labels: LABELS,
      onChange: (value) => {
        this._emit({
          ...this._config,
          entity: text(value.entity),
          name: text(value.name),
          image: text(value.image),
        });
      },
    });
    if (!used) this._fallback(formHost);
    mountList(extraHost, {
      title: "房间（可增删，取消显示则保留配置但不画出）",
      addLabel: "添加房间",
      columns: [
        { key: "entity", label: "实体", kind: "text" },
        { key: "name", label: "名称", kind: "text" },
        { key: "show", label: "显示", kind: "bool" },
      ],
      rows: (this._config.rooms ?? []).map((room) => ({
        entity: room.entity ?? "",
        name: room.name ?? "",
        show: room.show !== false,
      })),
      onChange: (rows) => {
        const rooms: MediaRoomConfig[] = rows
          .map((row) => ({
            entity: String(row.entity ?? "").trim() || undefined,
            name: String(row.name ?? "").trim() || undefined,
            show: row.show === false ? false : undefined,
          }))
          .filter((row) => row.entity || row.name);
        this._emit({ ...this._config, rooms });
      },
    });
  }

  private _fallback(host: HTMLElement) {
    if (!host.querySelector("[data-key='entity']")) {
      host.innerHTML = `
        <style>${editorStyle}</style>
        <div class="vha-editor">
          <label>实体 <input data-key="entity" type="text" placeholder="media_player.speaker" /></label>
          <label>名称 <input data-key="name" type="text" /></label>
          <label>产品图 <input data-key="image" type="text" placeholder="留空则使用实体图片" /></label>
        </div>`;
      host.querySelectorAll("input").forEach((input) => {
        input.addEventListener("change", () => {
          const read = (key: string) => (host.querySelector(`[data-key="${key}"]`) as HTMLInputElement).value.trim();
          this._emit({
            ...this._config,
            entity: read("entity") || undefined,
            name: read("name") || undefined,
            image: read("image") || undefined,
          });
        });
      });
    }
    (host.querySelector("[data-key='entity']") as HTMLInputElement).value = this._config.entity ?? "";
    (host.querySelector("[data-key='name']") as HTMLInputElement).value = this._config.name ?? "";
    (host.querySelector("[data-key='image']") as HTMLInputElement).value = this._config.image ?? "";
  }
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
