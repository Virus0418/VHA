import { VhaDeviceCard } from "./card";
import { VhaDeviceCardEditor } from "./editor";

if (!customElements.get("vha-device-card")) {
  customElements.define("vha-device-card", VhaDeviceCard);
}
if (!customElements.get("vha-device-card-editor")) {
  customElements.define("vha-device-card-editor", VhaDeviceCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "vha-device-card")) {
  window.customCards.push({
    type: "vha-device-card",
    name: "VHA 设备卡",
    description: "浅色产品化设备卡片：名称、型号、图片、状态和底部开关。",
    preview: true,
  });
}

console.info(
  "%c VHA %c 1.0.0  device card ",
  "background:#3d82f2;color:#fff;border-radius:4px 0 0 4px;padding:2px 6px",
  "background:#111;color:#fff;border-radius:0 4px 4px 0;padding:2px 6px",
);
