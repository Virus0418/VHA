import { asNumber, attrText } from "./format";
import { domainOf, isActive, isToggleable, toggleEntity } from "./toggle";
import type { HassEntity, HomeAssistant, MediaRoomConfig, VhaMediaCardConfig } from "./types";

export interface MediaRoomView {
  entityId: string;
  name: string;
  on: boolean;
  disabled: boolean;
}

export interface MediaView {
  kind: "empty" | "invalid" | "card";
  message?: string;
  entityId?: string;
  title: string;
  image?: string;
  timeLabel: string;
  dim: boolean;
  playing: boolean;
  transportDisabled: boolean;
  rooms: MediaRoomView[];
}

export function parseRooms(value: unknown): MediaRoomConfig[] {
  if (!Array.isArray(value)) return [];
  const rooms: MediaRoomConfig[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const raw = item as MediaRoomConfig;
    const entity = typeof raw.entity === "string" ? raw.entity.trim() : "";
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    if (!entity && !name) continue;
    rooms.push({
      entity: entity || undefined,
      name: name || undefined,
      show: raw.show === false ? false : undefined,
    });
  }
  return rooms;
}

export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  if (hours > 0) return `${hours}:${String(mins).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  return `${mins}:${String(rest).padStart(2, "0")}`;
}

export function mediaPosition(state: HassEntity, now = Date.now()): number | undefined {
  const position = asNumber(state.attributes.media_position);
  if (position == null) return undefined;
  if (state.state !== "playing" && state.state !== "buffering") return position;
  const updated = Date.parse(String(state.attributes.media_position_updated_at ?? ""));
  if (Number.isNaN(updated)) return position;
  const duration = asNumber(state.attributes.media_duration);
  const elapsed = position + Math.max(0, (now - updated) / 1000);
  if (duration != null && duration > 0) return Math.min(duration, elapsed);
  return elapsed;
}

export function mediaTimeLabel(state?: HassEntity, now = Date.now()): string {
  if (!state) return "不可用";
  if (state.state === "unavailable") return "不可用";
  if (state.state === "unknown") return "未知";
  const title = attrText(state.attributes.media_title);
  const position = mediaPosition(state, now);
  const duration = asNumber(state.attributes.media_duration);
  if (position == null) {
    if (state.state === "off") return "已关闭";
    if (!title || state.state === "idle" || state.state === "standby") return "空闲";
    return "无进度";
  }
  if (duration != null && duration > 0) return `${formatClock(position)} / ${formatClock(duration)}`;
  return formatClock(position);
}

export function buildMediaView(config: VhaMediaCardConfig, hass?: HomeAssistant, now = Date.now()): MediaView {
  const entityId = config.entity?.trim();
  if (!entityId) return blank("empty", "请选择一个实体");
  const state = hass?.states[entityId];
  const title = config.name || attrText(state?.attributes.friendly_name) || entityId;
  if (domainOf(entityId) !== "media_player") {
    return { ...blank("invalid", "请选择媒体播放器"), entityId, title };
  }
  const rooms = parseRooms(config.rooms)
    .filter((room) => room.show !== false && room.entity)
    .map((room) => {
      const roomState = hass?.states[room.entity as string];
      const dead = !roomState || roomState.state === "unavailable" || roomState.state === "unknown";
      return {
        entityId: room.entity as string,
        name: room.name || attrText(roomState?.attributes.friendly_name) || (room.entity as string),
        on: Boolean(roomState && !dead && isActive(roomState)),
        disabled: dead || !isToggleable(room.entity as string),
      };
    });
  if (!state) {
    return {
      ...blank("card", "实体不存在"),
      entityId,
      title,
      timeLabel: "不可用",
      dim: true,
      transportDisabled: true,
      rooms,
    };
  }
  const dead = state.state === "unavailable" || state.state === "unknown";
  return {
    kind: "card",
    entityId,
    title,
    image: config.image || attrText(state.attributes.entity_picture) || undefined,
    timeLabel: mediaTimeLabel(state, now),
    dim: dead || state.state === "off" || state.state === "idle" || state.state === "standby",
    playing: isActive(state),
    transportDisabled: dead,
    rooms,
  };
}

function blank(kind: MediaView["kind"], message: string): MediaView {
  return {
    kind,
    message,
    title: "",
    timeLabel: "",
    dim: true,
    playing: false,
    transportDisabled: true,
    rooms: [],
  };
}

export async function pressTransport(
  hass: HomeAssistant,
  state: HassEntity,
  action: "prev" | "play" | "next",
): Promise<void> {
  if (state.state === "unavailable" || state.state === "unknown") {
    throw new Error(state.state === "unknown" ? "未知" : "不可用");
  }
  const entityId = state.entity_id;
  if (action === "prev") {
    await hass.callService("media_player", "media_previous_track", { entity_id: entityId });
    return;
  }
  if (action === "next") {
    await hass.callService("media_player", "media_next_track", { entity_id: entityId });
    return;
  }
  if (state.state === "off") {
    await hass.callService("media_player", "turn_on", { entity_id: entityId });
  }
  await hass.callService(
    "media_player",
    isActive(state) ? "media_pause" : "media_play",
    { entity_id: entityId },
  );
}

export async function pressRoom(hass: HomeAssistant, entityId: string): Promise<void> {
  const state = hass.states[entityId];
  if (!state || state.state === "unavailable" || state.state === "unknown") {
    throw new Error(state?.state === "unknown" ? "未知" : "不可用");
  }
  if (!isToggleable(entityId)) throw new Error("不能开关");
  await toggleEntity(hass, state);
}
