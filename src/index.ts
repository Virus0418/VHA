import { VhaDeviceCard } from "./card";
import { VhaClimateCard } from "./climate-card";
import { VhaClimateCardEditor } from "./climate-editor";
import { VhaDeviceCardEditor } from "./editor";
import { VhaMediaCard } from "./media-card";
import { VhaMediaCardEditor } from "./media-editor";
import { VhaSensorCard } from "./sensor-card";
import { VhaSensorCardEditor } from "./sensor-editor";

const cards = [
  ["vha-device-card", VhaDeviceCard, "vha-device-card-editor", VhaDeviceCardEditor],
  ["vha-climate-card", VhaClimateCard, "vha-climate-card-editor", VhaClimateCardEditor],
  ["vha-sensor-card", VhaSensorCard, "vha-sensor-card-editor", VhaSensorCardEditor],
  ["vha-media-card", VhaMediaCard, "vha-media-card-editor", VhaMediaCardEditor],
] as const;

for (const [tag, element, editorTag, editor] of cards) {
  if (!customElements.get(tag)) customElements.define(tag, element);
  if (!customElements.get(editorTag)) customElements.define(editorTag, editor);
}

window.customCards = window.customCards || [];
const definitions = [
  {
    type: "vha-device-card",
    name: "VHA 设备卡",
    description: "设备卡：大图设备、竖图滑杆、电子设备模块三种排版。",
  },
  {
    type: "vha-climate-card",
    name: "VHA 气候卡",
    description: "气候卡：制热与制冷共用一张洞察卡，含模式芯片和风速滑杆。",
  },
  {
    type: "vha-sensor-card",
    name: "VHA 传感器卡",
    description: "传感器卡：空气质量洞察或用电指标，两种排版。",
  },
  {
    type: "vha-media-card",
    name: "VHA 媒体卡",
    description: "媒体卡：圆形播放器与可配置的房间开关。",
  },
];
for (const definition of definitions) {
  if (!window.customCards.some((card) => card.type === definition.type)) {
    window.customCards.push({ ...definition, preview: true });
  }
}

console.info(
  "%c VHA %c 1.0.0 ",
  "background:#3d82f2;color:#fff;border-radius:4px 0 0 4px;padding:2px 6px",
  "background:#111;color:#fff;border-radius:0 4px 4px 0;padding:2px 6px",
);
