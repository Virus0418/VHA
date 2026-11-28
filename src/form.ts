import type { HomeAssistant } from "./types";

export interface SchemaItem {
  name: string;
  required?: boolean;
  selector: Record<string, unknown>;
}

interface HAForm extends HTMLElement {
  hass?: HomeAssistant;
  data?: unknown;
  schema?: unknown;
  computeLabel?: (schema: { name: string }) => string;
}

export function textField(name: string): SchemaItem {
  return { name, selector: { text: {} } };
}

export function entityField(name: string, domain?: string): SchemaItem {
  return { name, selector: { entity: domain ? { domain } : {} } };
}

export const editorStyle = `
  .vha-editor { display: grid; gap: 10px; font-family: "Noto Sans SC", "PingFang SC", sans-serif; }
  .vha-editor label { display: grid; gap: 4px; font-size: 12px; color: #444; }
  .vha-editor input[type="text"], .vha-editor select {
    height: 36px; border: 1px solid #e4e6ea; border-radius: 8px; padding: 0 10px; font: inherit;
  }
  .vha-editor .row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
`;

export function boolField(name: string): SchemaItem {
  return { name, selector: { boolean: {} } };
}

export function selectField(name: string, options: Array<{ value: string; label: string }>): SchemaItem {
  return { name, selector: { select: { options, mode: "dropdown" } } };
}

export function mountHaForm(
  host: HTMLElement,
  options: {
    hass?: HomeAssistant;
    data: Record<string, unknown>;
    schema: SchemaItem[];
    labels: Record<string, string>;
    onChange: (value: Record<string, unknown>) => void;
  },
): boolean {
  if (!customElements.get("ha-form") || !options.hass) return false;
  let form = host.querySelector("ha-form") as HAForm | null;
  if (!form) {
    host.innerHTML = "";
    form = document.createElement("ha-form") as HAForm;
    host.appendChild(form);
    form.addEventListener("value-changed", (ev: Event) => {
      const value = (ev as CustomEvent).detail?.value as Record<string, unknown> | undefined;
      if (value) options.onChange(value);
    });
  }
  form.hass = options.hass;
  form.schema = options.schema;
  form.data = options.data;
  form.computeLabel = (schema) => options.labels[schema.name] || schema.name;
  return true;
}

export interface ListColumn {
  key: string;
  label: string;
  kind: "text" | "bool";
}

export function mountList(
  host: HTMLElement,
  options: {
    title: string;
    addLabel: string;
    columns: ListColumn[];
    rows: Array<Record<string, string | boolean | undefined>>;
    onChange: (rows: Array<Record<string, string | boolean | undefined>>) => void;
  },
): void {
  host.innerHTML = "";
  const style = document.createElement("style");
  style.textContent = `
    .vha-list { display: grid; gap: 10px; margin-top: 12px; font-family: "Noto Sans SC", sans-serif; }
    .vha-list h3 { margin: 0; font-size: 13px; font-weight: 500; color: #3A3A3C; }
    .vha-row { display: grid; gap: 6px; padding: 8px 0; border-top: 1px solid #ececef; }
    .vha-row label { display: grid; gap: 4px; font-size: 12px; color: #444; }
    .vha-row input[type="text"] { height: 32px; border: 1px solid #e4e6ea; border-radius: 8px; padding: 0 8px; font: inherit; }
    .vha-row .check { display: flex; align-items: center; gap: 8px; font-size: 13px; }
    .vha-list button { height: 32px; border: 0; border-radius: 8px; background: #F0EFF2; cursor: pointer; }
  `;
  const wrap = document.createElement("div");
  wrap.className = "vha-list";
  const title = document.createElement("h3");
  title.textContent = options.title;
  wrap.append(title);
  options.rows.forEach((row, index) => {
    const box = document.createElement("div");
    box.className = "vha-row";
    for (const column of options.columns) {
      const label = document.createElement("label");
      label.textContent = column.label;
      if (column.kind === "bool") {
        label.className = "check";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = row[column.key] !== false;
        input.addEventListener("change", () => {
          const next = options.rows.map((item) => ({ ...item }));
          next[index] = { ...next[index], [column.key]: input.checked };
          options.onChange(next);
        });
        label.prepend(input);
      } else {
        const input = document.createElement("input");
        input.type = "text";
        input.value = typeof row[column.key] === "string" ? String(row[column.key]) : "";
        input.addEventListener("change", () => {
          const next = options.rows.map((item) => ({ ...item }));
          next[index] = { ...next[index], [column.key]: input.value.trim() };
          options.onChange(next);
        });
        label.append(input);
      }
      box.append(label);
    }
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "删除";
    remove.addEventListener("click", () => {
      options.onChange(options.rows.filter((_, rowIndex) => rowIndex !== index));
    });
    box.append(remove);
    wrap.append(box);
  });
  const add = document.createElement("button");
  add.type = "button";
  add.textContent = options.addLabel;
  add.addEventListener("click", () => {
    const blank: Record<string, string | boolean | undefined> = {};
    for (const column of options.columns) blank[column.key] = column.kind === "bool" ? true : "";
    options.onChange([...options.rows, blank]);
  });
  wrap.append(add);
  host.append(style, wrap);
}
