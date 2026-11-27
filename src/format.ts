import type { HassEntity } from "./types";

const NBSP = "\u00A0";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

export function attrText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

/** Number and unit, with a space: `35 %`, `58 °C`, `22.5 °`. */
export function formatQuantity(value: number, unit?: string): string {
  const rounded = Math.round(value * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : String(rounded);
  const raw = (unit ?? "").trim();
  if (!raw) return text;
  const norm = raw.replace(/\s+/g, "");
  if (norm === "%" || norm === "％") return `${text}${NBSP}%`;
  if (norm === "°C" || norm === "℃" || norm.toLowerCase() === "celsius") return `${text}${NBSP}°C`;
  if (norm === "°F" || norm === "℉") return `${text}${NBSP}°F`;
  if (norm === "°" || norm.toLowerCase() === "deg") return `${text}${NBSP}°`;
  return `${text}${NBSP}${raw}`;
}

export function unitOf(state?: HassEntity): string {
  return attrText(state?.attributes.unit_of_measurement) ?? "";
}

export function shortError(err: unknown): string {
  let msg = "";
  if (err instanceof Error) msg = err.message;
  else if (typeof err === "string") msg = err;
  else if (err && typeof err === "object" && "message" in err) {
    msg = String((err as { message: unknown }).message);
  }
  msg = msg.replace(/\s+/g, " ").trim();
  if (/[\u4e00-\u9fff]/.test(msg) && msg.length <= 24) return msg;
  return "操作失败";
}

export interface BatteryInfo {
  value: string;
  label: string;
  tone: "full" | "charging" | "idle" | "muted";
}

export function batteryInfo(state?: HassEntity): BatteryInfo {
  if (!state || state.state === "unavailable") {
    return { value: "不可用", label: "不可用", tone: "muted" };
  }
  if (state.state === "unknown") {
    return { value: "未知", label: "未知", tone: "muted" };
  }
  const level =
    asNumber(state.state) ??
    asNumber(state.attributes.battery_level) ??
    asNumber(state.attributes.battery);
  const status = String(
    state.attributes.battery_state ?? state.attributes.charging_status ?? "",
  ).toLowerCase();
  const charging =
    state.attributes.battery_charging === true ||
    state.attributes.charging === true ||
    state.attributes.is_charging === true ||
    status === "charging";
  const full =
    status === "full" ||
    status === "charged" ||
    (level != null && level >= 100);
  const value = level == null ? "不可用" : formatQuantity(level, "%");
  if (full && level != null) return { value, label: "已充满", tone: "full" };
  if (charging) return { value, label: "充电中", tone: "charging" };
  return { value, label: "未充电", tone: "idle" };
}

export function networkText(state?: HassEntity): string {
  if (!state || state.state === "unavailable") return "不可用";
  if (state.state === "unknown") return "未知";
  if (
    state.attributes.connected === false ||
    state.state === "off" ||
    state.state === "disconnected"
  ) {
    return "未连接";
  }
  const raw =
    attrText(state.attributes.ssid) ||
    attrText(state.attributes.network_name) ||
    attrText(state.attributes.wifi) ||
    state.state;
  const token = raw.trim().toLowerCase();
  if (
    !token ||
    ["none", "unknown", "unavailable", "disconnected", "off", "not_connected", "未连接", "—", "-", "null"].includes(
      token,
    )
  ) {
    return "未连接";
  }
  return raw.trim();
}

export function locationText(state?: HassEntity): string {
  if (!state || state.state === "unavailable") return "不可用";
  if (state.state === "unknown") return "未知";
  const zone = (attrText(state.attributes.zone) || state.state).trim();
  const token = zone.toLowerCase();
  if (token === "home" || zone === "在家") return "在家";
  if (token === "not_home" || token === "away" || zone === "离家") return "离家";
  return zone;
}

export function uptimeText(state?: HassEntity, now = Date.now()): string {
  if (!state || state.state === "unavailable") return "不可用";
  if (state.state === "unknown") return "未知";
  const seconds = uptimeSeconds(state, now);
  if (seconds == null) {
    const text = state.state.trim();
    if (!text) return "未知";
    return text.startsWith("已开机") ? text : `已开机 ${text}`;
  }
  return `已开机 ${formatDuration(seconds)}`;
}

function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const parts: string[] = [];
  if (days) parts.push(`${days}天`);
  if (hours || days) parts.push(`${hours}小时`);
  parts.push(`${mins}分钟`);
  return parts.join(" ");
}

function uptimeSeconds(state: HassEntity, now: number): number | undefined {
  const deviceClass = attrText(state.attributes.device_class);
  if (deviceClass === "timestamp") {
    const t = Date.parse(state.state);
    if (Number.isNaN(t)) return undefined;
    return Math.max(0, (now - t) / 1000);
  }
  const numeric = asNumber(state.state) ?? asNumber(state.attributes.uptime);
  if (numeric == null) return undefined;
  const unit = (unitOf(state) || (asNumber(state.attributes.uptime) != null ? "s" : "")).toLowerCase();
  if (unit === "s" || unit === "sec" || unit === "seconds" || unit === "秒") return numeric;
  if (unit === "min" || unit === "m" || unit === "minutes" || unit === "分钟") return numeric * 60;
  if (unit === "h" || unit === "hr" || unit === "hours" || unit === "小时") return numeric * 3600;
  if (unit === "d" || unit === "days" || unit === "天") return numeric * 86400;
  if (deviceClass === "duration") return numeric;
  return undefined;
}

export function metricText(state?: HassEntity): string {
  if (!state || state.state === "unavailable") return "不可用";
  if (state.state === "unknown") return "未知";
  const numeric = asNumber(state.state);
  if (numeric == null) return state.state;
  return formatQuantity(numeric, unitOf(state));
}

const MODE_LABELS: Record<string, string> = {
  auto: "自动",
  sleep: "睡眠",
  baby: "婴儿",
  boost: "强力",
  comfort: "舒适",
  eco: "节能",
  normal: "正常",
  home: "在家",
  away: "离家",
  quiet: "静音",
};

export function modeLabel(mode: string): string {
  return MODE_LABELS[mode.toLowerCase()] ?? mode;
}
