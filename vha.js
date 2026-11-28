function p(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function h(t) {
  return p(t).replace(/'/g, "&#39;");
}
function x(t) {
  return typeof t == "string" && t.trim() ? t.trim() : void 0;
}
function u(t) {
  if (typeof t == "number" && Number.isFinite(t)) return t;
  if (typeof t == "string" && t.trim() && Number.isFinite(Number(t))) return Number(t);
}
function b(t, e) {
  const n = Math.round(t * 10) / 10, i = (Number.isInteger(n), String(n)), a = (e ?? "").trim();
  if (!a) return i;
  const r = a.replace(/\s+/g, "");
  return r === "%" || r === "％" ? `${i} %` : r === "°C" || r === "℃" || r.toLowerCase() === "celsius" ? `${i} °C` : r === "°F" || r === "℉" ? `${i} °F` : r === "°" || r.toLowerCase() === "deg" ? `${i} °` : `${i} ${a}`;
}
function C(t) {
  return x(t?.attributes.unit_of_measurement) ?? "";
}
function D(t) {
  let e = "";
  return t instanceof Error ? e = t.message : typeof t == "string" ? e = t : t && typeof t == "object" && "message" in t && (e = String(t.message)), e = e.replace(/\s+/g, " ").trim(), /[\u4e00-\u9fff]/.test(e) && e.length <= 24 ? e : "操作失败";
}
function jt(t) {
  if (!t || t.state === "unavailable")
    return { value: "不可用", label: "不可用", tone: "muted" };
  if (t.state === "unknown")
    return { value: "未知", label: "未知", tone: "muted" };
  const e = u(t.state) ?? u(t.attributes.battery_level) ?? u(t.attributes.battery), n = String(
    t.attributes.battery_state ?? t.attributes.charging_status ?? ""
  ).toLowerCase(), i = t.attributes.battery_charging === !0 || t.attributes.charging === !0 || t.attributes.is_charging === !0 || n === "charging", a = n === "full" || n === "charged" || e != null && e >= 100, r = e == null ? "不可用" : b(e, "%");
  return a && e != null ? { value: r, label: "已充满", tone: "full" } : i ? { value: r, label: "充电中", tone: "charging" } : { value: r, label: "未充电", tone: "idle" };
}
function Wt(t) {
  if (!t || t.state === "unavailable") return "不可用";
  if (t.state === "unknown") return "未知";
  if (t.attributes.connected === !1 || t.state === "off" || t.state === "disconnected")
    return "未连接";
  const e = x(t.attributes.ssid) || x(t.attributes.network_name) || x(t.attributes.wifi) || t.state, n = e.trim().toLowerCase();
  return !n || ["none", "unknown", "unavailable", "disconnected", "off", "not_connected", "未连接", "—", "-", "null"].includes(
    n
  ) ? "未连接" : e.trim();
}
function Ut(t) {
  if (!t || t.state === "unavailable") return "不可用";
  if (t.state === "unknown") return "未知";
  const e = (x(t.attributes.zone) || t.state).trim(), n = e.toLowerCase();
  return n === "home" || e === "在家" ? "在家" : n === "not_home" || n === "away" || e === "离家" ? "离家" : e;
}
function Qt(t, e = Date.now()) {
  if (!t || t.state === "unavailable") return "不可用";
  if (t.state === "unknown") return "未知";
  const n = $t(t, e);
  if (n == null) {
    const i = t.state.trim();
    return i ? i.startsWith("已开机") ? i : `已开机 ${i}` : "未知";
  }
  return `已开机 ${_t(n)}`;
}
function _t(t) {
  const e = Math.max(0, Math.floor(t)), n = Math.floor(e / 86400), i = Math.floor(e % 86400 / 3600), a = Math.floor(e % 3600 / 60), r = [];
  return n && r.push(`${n}天`), (i || n) && r.push(`${i}小时`), r.push(`${a}分钟`), r.join(" ");
}
function $t(t, e) {
  const n = x(t.attributes.device_class);
  if (n === "timestamp") {
    const r = Date.parse(t.state);
    return Number.isNaN(r) ? void 0 : Math.max(0, (e - r) / 1e3);
  }
  const i = u(t.state) ?? u(t.attributes.uptime);
  if (i == null) return;
  const a = (C(t) || (u(t.attributes.uptime) != null ? "s" : "")).toLowerCase();
  if (a === "s" || a === "sec" || a === "seconds" || a === "秒") return i;
  if (a === "min" || a === "m" || a === "minutes" || a === "分钟") return i * 60;
  if (a === "h" || a === "hr" || a === "hours" || a === "小时") return i * 3600;
  if (a === "d" || a === "days" || a === "天") return i * 86400;
  if (n === "duration") return i;
}
function Ht(t) {
  if (!t || t.state === "unavailable") return "不可用";
  if (t.state === "unknown") return "未知";
  const e = u(t.state);
  return e == null ? t.state : b(e, C(t));
}
const te = {
  auto: "自动",
  sleep: "睡眠",
  baby: "婴儿",
  boost: "强力",
  comfort: "舒适",
  eco: "节能",
  normal: "正常",
  home: "在家",
  away: "离家",
  quiet: "静音"
};
function vt(t) {
  return te[t.toLowerCase()] ?? t;
}
const ee = /* @__PURE__ */ new Set([
  "light",
  "switch",
  "fan",
  "input_boolean",
  "cover",
  "lock",
  "climate",
  "media_player",
  "humidifier",
  "siren",
  "remote",
  "vacuum",
  "water_heater",
  "valve",
  "automation",
  "script",
  "input_button",
  "scene",
  "button"
]), ne = /* @__PURE__ */ new Set([
  "on",
  "open",
  "opening",
  "unlocked",
  "unlocking",
  "playing",
  "paused",
  "home",
  "heat",
  "cool",
  "heat_cool",
  "auto",
  "dry",
  "fan_only",
  "cleaning",
  "returning"
]);
function v(t) {
  return t.split(".")[0] ?? "";
}
function O(t) {
  return ee.has(v(t));
}
function g(t) {
  if (!t || t.state === "unavailable" || t.state === "unknown") return !1;
  const e = v(t.entity_id);
  return e === "cover" ? !["closed", "closing"].includes(t.state) : e === "lock" ? !["locked", "locking"].includes(t.state) : e === "media_player" ? t.state === "playing" || t.state === "buffering" : e === "vacuum" ? !["docked", "idle", "off", "paused"].includes(t.state) : ne.has(t.state);
}
async function j(t, e) {
  const n = e.entity_id, i = v(n), a = { entity_id: n }, r = g(e);
  switch (i) {
    case "lock":
      await t.callService("lock", r ? "lock" : "unlock", a);
      return;
    case "cover":
      await t.callService("cover", r ? "close_cover" : "open_cover", a);
      return;
    case "climate":
      await t.callService("climate", r ? "turn_off" : "turn_on", a);
      return;
    case "media_player":
      await t.callService(
        "media_player",
        r ? "media_pause" : "media_play",
        a
      );
      return;
    case "vacuum":
      await t.callService("vacuum", r ? "return_to_base" : "start", a);
      return;
    case "scene":
    case "script":
    case "button":
    case "input_button":
      await t.callService(i, i === "input_button" || i === "button" ? "press" : "turn_on", a);
      return;
    default:
      await t.callService(i, r ? "turn_off" : "turn_on", a);
  }
}
const kt = ["steam", "chevron", "droplet"];
function ct(t) {
  if (!Array.isArray(t)) return [];
  const e = [];
  for (const n of t) {
    if (!n || typeof n != "object") continue;
    const i = n, a = i.icon === "steam" || i.icon === "chevron" || i.icon === "droplet" ? i.icon : void 0, r = typeof i.entity == "string" && i.entity.trim() ? i.entity.trim() : void 0, o = typeof i.name == "string" && i.name.trim() ? i.name.trim() : void 0, s = typeof i.mode == "string" && i.mode.trim() ? i.mode.trim() : void 0;
    !r && !o && !s || e.push({ entity: r, name: o, icon: a, mode: s });
  }
  return e.slice(0, 3);
}
function ie(t, e, n) {
  const i = ct(t);
  if (i.length)
    return i.map((o, s) => ({
      name: o.name || (o.mode ? vt(o.mode) : "动作"),
      icon: o.icon || kt[s] || "droplet",
      entity: o.entity,
      mode: o.mode,
      pressed: !!(o.mode && e && n && At(e) === o.mode)
    }));
  if (!e) return [];
  const a = v(e.entity_id);
  return (a === "humidifier" ? Et(e.attributes.available_modes) : a === "fan" ? Et(e.attributes.preset_modes) : []).slice(0, 3).map((o, s) => ({
    name: vt(o),
    icon: kt[s] || "droplet",
    mode: o,
    pressed: n && At(e) === o
  }));
}
function At(t) {
  return v(t.entity_id) === "fan" ? typeof t.attributes.preset_mode == "string" ? t.attributes.preset_mode : void 0 : typeof t.attributes.mode == "string" ? t.attributes.mode : void 0;
}
function Et(t) {
  return Array.isArray(t) ? t.filter((e) => typeof e == "string" && e.trim() !== "") : [];
}
async function I(t, e, n) {
  g(e) !== n && await j(t, e);
}
async function ae(t, e, n, i) {
  if (e.state === "unavailable" || e.state === "unknown")
    throw new Error("不可用");
  if (i) {
    await I(t, e, !0);
    return;
  }
  for (const a of n) {
    if (!a.entity || a.entity === e.entity_id) continue;
    const r = t.states[a.entity];
    !r || !g(r) || await I(t, r, !1);
  }
  await I(t, t.states[e.entity_id] ?? e, !1);
}
async function re(t, e, n) {
  if (e.state === "unavailable" || e.state === "unknown") throw new Error("不可用");
  if (n.mode) {
    g(e) || await I(t, e, !0), await oe(t, e, n.mode);
    return;
  }
  if (!n.entity) return;
  const i = t.states[n.entity];
  if (!i) throw new Error("实体不存在");
  if (i.state === "unavailable" || i.state === "unknown") throw new Error("不可用");
  n.entity !== e.entity_id && !g(e) && await I(t, e, !0), await j(t, i);
}
async function oe(t, e, n) {
  const i = v(e.entity_id), a = e.entity_id;
  if (i === "humidifier") {
    await t.callService("humidifier", "set_mode", { entity_id: a, mode: n });
    return;
  }
  if (i === "fan") {
    await t.callService("fan", "set_preset_mode", { entity_id: a, preset_mode: n });
    return;
  }
  throw new Error("当前实体不支持该动作");
}
function se(t) {
  if (!t) return { supported: !1, fraction: 0, label: "不能调节", icon: "sun" };
  const e = v(t.entity_id);
  return e === "light" ? ue(t) : e === "fan" ? pe(t) : e === "humidifier" ? he(t) : e === "cover" ? fe(t) : e === "media_player" ? me(t) : e === "input_number" || e === "number" ? ye(t) : { supported: !1, fraction: 0, label: "不能调节", icon: "sun" };
}
function le(t, e) {
  const n = v(t.entity_id), i = M(e);
  if (n === "light" || n === "fan" || n === "media_player" || n === "cover")
    return b(Math.round(i * 100), "%");
  if (n === "humidifier") {
    if (i <= 0.04) return "关";
    const { min: a, max: r } = dt(t);
    return b(Lt(i, a, r), "%");
  }
  if (n === "input_number" || n === "number") {
    const { min: a, max: r } = ut(t), o = a + i * (r - a);
    return b(o, C(t));
  }
  return b(Math.round(i * 100), "%");
}
async function ce(t, e, n) {
  if (e.state === "unavailable" || e.state === "unknown") throw new Error("不可用");
  const i = v(e.entity_id), a = e.entity_id, r = M(n);
  if (i === "light") {
    if (r <= 0) {
      await t.callService("light", "turn_off", { entity_id: a });
      return;
    }
    await t.callService("light", "turn_on", {
      entity_id: a,
      brightness: Math.max(1, Math.round(r * 255))
    });
    return;
  }
  if (i === "fan") {
    const o = Math.round(r * 100);
    if (o <= 0) {
      await t.callService("fan", "turn_off", { entity_id: a });
      return;
    }
    g(e) || await t.callService("fan", "turn_on", { entity_id: a }), await t.callService("fan", "set_percentage", { entity_id: a, percentage: o });
    return;
  }
  if (i === "humidifier") {
    if (r <= 0.04) {
      await t.callService("humidifier", "turn_off", { entity_id: a });
      return;
    }
    const { min: o, max: s } = dt(e);
    g(e) || await t.callService("humidifier", "turn_on", { entity_id: a }), await t.callService("humidifier", "set_humidity", {
      entity_id: a,
      humidity: Lt(r, o, s)
    });
    return;
  }
  if (i === "cover") {
    const o = Math.round(r * 100);
    if (o <= 0) {
      await t.callService("cover", "close_cover", { entity_id: a });
      return;
    }
    await t.callService("cover", "set_cover_position", { entity_id: a, position: o });
    return;
  }
  if (i === "media_player") {
    !g(e) && e.state === "off" && await t.callService("media_player", "turn_on", { entity_id: a }), await t.callService("media_player", "volume_set", {
      entity_id: a,
      volume_level: Math.round(r * 100) / 100
    });
    return;
  }
  if (i === "input_number" || i === "number") {
    const { min: o, max: s } = ut(e), l = u(e.attributes.step) ?? 1, c = o + r * (s - o), d = Math.round(c / l) * l;
    await t.callService(i, "set_value", { entity_id: a, value: d });
    return;
  }
  throw new Error("当前实体不能用滑杆调节");
}
function de(t, e) {
  return t ? e.some((n) => {
    if (!n.entity) return !1;
    const i = t.states[n.entity];
    return !!(i && g(i));
  }) : !1;
}
function ue(t) {
  const e = g(t), n = u(t.attributes.brightness), i = e ? n != null ? Math.round(n / 255 * 100) : Math.round(u(t.attributes.brightness_pct) ?? 0) : 0;
  return { supported: !0, fraction: M(i / 100), label: b(i, "%"), icon: "sun" };
}
function pe(t) {
  const n = g(t) ? Math.round(u(t.attributes.percentage) ?? 0) : 0;
  return { supported: !0, fraction: M(n / 100), label: b(n, "%"), icon: "steam" };
}
function he(t) {
  const { min: e, max: n } = dt(t);
  if (!g(t)) return { supported: !0, fraction: 0, label: "关", icon: "droplet" };
  const i = u(t.attributes.humidity) ?? u(t.attributes.current_humidity) ?? e;
  return {
    supported: !0,
    fraction: be(i, e, n),
    label: b(i, "%"),
    icon: "droplet"
  };
}
function fe(t) {
  const e = g(t) ? Math.round(u(t.attributes.current_position) ?? 0) : 0;
  return { supported: !0, fraction: M(e / 100), label: b(e, "%"), icon: "sun" };
}
function me(t) {
  const e = u(t.attributes.volume_level) ?? 0, n = Math.round(M(e) * 100);
  return { supported: !0, fraction: M(e), label: b(n, "%"), icon: "sun" };
}
function ye(t) {
  const { min: e, max: n } = ut(t), i = u(t.state) ?? e, a = n - e || 1;
  return {
    supported: !0,
    fraction: M((i - e) / a),
    label: b(i, C(t)),
    icon: "sun"
  };
}
function dt(t) {
  const e = u(t.attributes.min_humidity) ?? 30, n = u(t.attributes.max_humidity) ?? 80;
  return { min: e, max: n > e ? n : e + 1 };
}
function ut(t) {
  const e = u(t.attributes.min) ?? 0, n = u(t.attributes.max) ?? 100;
  return { min: e, max: n > e ? n : e + 1 };
}
function be(t, e, n) {
  const i = n - e || 1;
  return 0.08 + M((t - e) / i) * 0.92;
}
function Lt(t, e, n) {
  const i = M((t - 0.08) / 0.92);
  return Math.round(e + i * (n - e));
}
function M(t) {
  return Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 0;
}
function Bt(t) {
  return !!(t && O(t));
}
const Yt = `<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4" fill="none"/>
<path d="M7.5 9.2c.9-1.1 1.8-1.1 2.7 0s1.8 1.1 2.7 0 1.8-1.1 2.7 0M7.5 12c.9-1.1 1.8-1.1 2.7 0s1.8 1.1 2.7 0 1.8-1.1 2.7 0M7.5 14.8c.9-1.1 1.8-1.1 2.7 0s1.8 1.1 2.7 0 1.8-1.1 2.7 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/>`, ge = '<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', we = '<path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', xe = '<path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', zt = `<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4" fill="none"/>
<path d="M12 7.4s3.3 3.5 3.3 5.5a3.3 3.3 0 1 1-6.6 0c0-2 3.3-5.5 3.3-5.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" fill="none"/>`, ve = `<circle cx="12" cy="12" r="3.1" stroke="currentColor" stroke-width="1.5" fill="none"/>
<path d="M12 5v1.6M12 17.4V19M5 12h1.6M17.4 12H19M7.05 7.05l1.13 1.13M15.82 15.82l1.13 1.13M7.05 16.95l1.13-1.13M15.82 8.18l1.13-1.13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>`, ke = `<path d="M5 12.4a10 10 0 0 1 14 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
<path d="M8.2 15.5a5.4 5.4 0 0 1 7.6 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
<circle cx="12" cy="18.6" r="1.15" fill="currentColor"/>`, Ae = `<path d="M4 11.2 12 4.5l8 6.7V19a1.8 1.8 0 0 1-1.8 1.8H5.8A1.8 1.8 0 0 1 4 19V11.2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
<path d="M9.5 20.6V14.4h5v6.2" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>`, Ee = `<rect x="3" y="8" width="15.5" height="9" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
<rect x="19.2" y="11" width="1.6" height="3" rx="0.4" fill="currentColor"/>
<rect x="5" y="10" width="4.4" height="5" rx="0.6" fill="currentColor"/>`, Se = `<rect x="2.75" y="7.33" width="14.2" height="8.25" rx="1.8" stroke="currentColor" stroke-width="1.5" fill="none"/>
<rect x="17.6" y="10.08" width="1.47" height="2.75" rx="0.4" fill="currentColor"/>
<rect x="4.58" y="9.17" width="10.54" height="4.58" rx="0.55" fill="currentColor"/>`, Me = `<path fill="#C5C6CB" d="M50 8H30c-2.2 0-4 1.8-4 4v50c0 2.2 1.8 4 4 4h20c2.2 0 4-1.8 4-4V12c0-2.2-1.8-4-4-4z"/>
<path fill="#E8E8EA" d="M31 14h18a1 1 0 0 1 0 2H31a1 1 0 0 1 0-2zm0 5h18a1 1 0 0 1 0 2H31a1 1 0 0 1 0-2zm0 5h18a1 1 0 0 1 0 2H31a1 1 0 0 1 0-2zm0 5h18a1 1 0 0 1 0 2H31a1 1 0 0 1 0-2z"/>
<circle cx="40" cy="56" r="2.4" fill="#E8E8EA"/>
<path fill="#B4B5BA" d="M25.5 66h29a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-29a1.5 1.5 0 0 1-1.5-1.5v-1A1.5 1.5 0 0 1 25.5 66z"/>`, Ce = `<path fill="#C5C6CB" d="M62.5 16h-45A3.5 3.5 0 0 0 14 19.5v29A3.5 3.5 0 0 0 17.5 52h45a3.5 3.5 0 0 0 3.5-3.5v-29A3.5 3.5 0 0 0 62.5 16z"/>
<path fill="#E8E8EA" d="M33 19h14a1 1 0 0 1 0 2H33a1 1 0 0 1 0-2z"/>
<path fill="#B4B5BA" d="M8 54h64s-2.5 8-8 8H16c-5.5 0-8-8-8-8z"/>`, Fe = `<rect x="22" y="10" width="36" height="56" rx="8" fill="#C5C6CB"/>
<rect x="28" y="16" width="24" height="36" rx="3" fill="#E8E8EA"/>
<circle cx="40" cy="58" r="2.2" fill="#E8E8EA"/>`;
function W(t, e, n) {
  return `<svg viewBox="${t}" width="${n}" height="${n}" fill="none" aria-hidden="true">${e}</svg>`;
}
function qe(t, e = 24) {
  return W("0 0 24 24", t === "steam" ? Yt : t === "chevron" ? ge : zt, e);
}
function L(t, e = 24) {
  return W("0 0 24 24", {
    sun: ve,
    wifi: ke,
    home: Ae,
    battery: Ee,
    "battery-full": Se,
    "chevron-left": we,
    "chevron-right": xe,
    droplet: zt,
    steam: Yt
  }[t], e);
}
const Je = '<circle cx="5" cy="12" r="1.35" fill="currentColor"/><circle cx="12" cy="12" r="1.35" fill="currentColor"/><circle cx="19" cy="12" r="1.35" fill="currentColor"/>', Te = `<path d="M12 3.6v6.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
<path d="M7.05 6.7a6.15 6.15 0 1 0 9.9 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none"/>`, He = '<path d="M8.2 6.4v11.2l9.2-5.6-9.2-5.6z" fill="currentColor"/>', Le = '<path d="M7.4 5.8h2.6v12.4H7.4zM14 5.8h2.6v12.4H14z" fill="currentColor"/>', Be = '<path d="M16.2 6.2 9.2 12l7 5.8V6.2z" fill="currentColor"/><path d="M7.2 6.2v11.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>', Ye = '<path d="M7.8 6.2 14.8 12l-7 5.8V6.2z" fill="currentColor"/><path d="M16.8 6.2v11.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>';
function J(t, e = 22) {
  return W("0 0 24 24", {
    ellipsis: Je,
    power: Te,
    play: He,
    pause: Le,
    prev: Be,
    next: Ye
  }[t], e);
}
function ze(t) {
  return W("0 0 80 80", t === "tower" ? Me : t === "laptop" ? Ce : Fe, 96);
}
function Y(t) {
  return t === "vertical" || t === "electronics" ? t : "large";
}
function Ie(t, e) {
  return t === "contain" || t === "cover" ? t : e === "electronics" ? "contain" : "cover";
}
function Re(t, e) {
  const n = [], i = (a) => {
    if (typeof a != "string") return;
    const r = a.trim();
    r && !n.includes(r) && n.push(r);
  };
  return i(t.image), Array.isArray(t.images) ? t.images.forEach(i) : typeof t.images == "string" && t.images.split(",").forEach(i), i(x(e?.attributes.entity_picture)), i(x(e?.attributes.image)), n;
}
function K(t, e) {
  const i = (t.entity && e ? e.states[t.entity] : void 0)?.attributes ?? {}, a = !!(t.temperature_entity || t.memory_entity || t.cpu_entity || t.gpu_entity);
  return {
    show_image: !0,
    show_placeholder: !0,
    show_power: !!t.power_entity || Bt(t.entity),
    show_uptime: !!t.uptime_entity || i.uptime != null || i.device_class === "timestamp",
    show_battery: !!t.battery_entity || i.battery != null || i.battery_level != null,
    show_network: !!t.network_entity || i.ssid != null,
    show_location: !!t.location_entity || i.zone != null || i.location != null,
    show_temperature: !!t.temperature_entity,
    show_memory: !!t.memory_entity,
    show_cpu: !!t.cpu_entity,
    show_gpu: !!t.gpu_entity,
    show_metrics: a
  };
}
function Oe(t, e, n = 0) {
  const i = Y(t.layout), a = t.entity?.trim() || void 0, r = a && e ? e.states[a] : void 0, o = !r || r.state === "unavailable" || r.state === "unknown", s = t.name || x(r?.attributes.friendly_name) || a || "设备", l = Re(t, r), c = l.length ? (n % l.length + l.length) % l.length : 0, d = l[c], f = {
    layout: i,
    entityId: a,
    empty: !a,
    blocked: o,
    name: s,
    image: d,
    images: l,
    imageFit: Ie(t.image_fit, i),
    dim: !1
  };
  return a ? i === "vertical" ? { ...f, ...Ne(t, r, o, l.length > 1) } : i === "electronics" ? { ...f, ...Xe(t, e, r, s, o, d) } : { ...f, ...Ve(t, e, r, s, o, a) } : f;
}
function Ve(t, e, n, i, a, r) {
  const o = !!(n && g(n)), s = ie(t.actions, n, o).map((m) => {
    const y = !!(m.entity && e?.states[m.entity] && g(e.states[m.entity]));
    return {
      name: m.name,
      icon: m.icon,
      entity: m.entity,
      mode: m.mode,
      pressed: !a && (m.pressed || y),
      disabled: a
    };
  }), l = o || de(e, s), c = O(r) && t.show_toggle !== !1, d = !a && l, f = Ge(t, e, n, i, a);
  return {
    dim: a || O(r) && !d,
    large: {
      ...f,
      showSwitch: c,
      switchOn: d,
      actions: s
    }
  };
}
function Ge(t, e, n, i, a) {
  if (a && !t.value_entity) {
    const s = n?.state === "unknown" ? "未知" : "不可用";
    return { value: s, valueKind: "text", caption: s };
  }
  if (t.value_entity) {
    const s = e?.states[t.value_entity], l = t.status || t.model || i;
    if (!s || s.state === "unavailable") return { value: "不可用", valueKind: "text", caption: "不可用" };
    if (s.state === "unknown") return { value: "未知", valueKind: "text", caption: "未知" };
    const c = u(s.state);
    return c != null ? { value: b(c, C(s)), valueKind: "number", caption: l } : { value: s.state, valueKind: "text", caption: l };
  }
  if (!n) return { value: "不可用", valueKind: "text", caption: "不可用" };
  const r = v(n.entity_id);
  if (r === "humidifier") {
    const s = u(n.attributes.current_humidity) ?? u(n.attributes.humidity);
    if (s != null)
      return { value: b(s, "%"), valueKind: "number", caption: t.status || "湿度" };
  }
  if (r === "light") {
    const s = g(n), l = u(n.attributes.brightness), c = s && l != null ? Math.round(l / 255 * 100) : 0;
    return { value: b(c, "%"), valueKind: "number", caption: t.status || "亮度" };
  }
  if (r === "fan") {
    const s = g(n) ? Math.round(u(n.attributes.percentage) ?? 0) : 0;
    return { value: b(s, "%"), valueKind: "number", caption: t.status || "风速" };
  }
  if (r === "sensor" || r === "input_number" || r === "number") {
    const s = u(n.state);
    if (s != null)
      return {
        value: b(s, C(n)),
        valueKind: "number",
        caption: t.status || t.model || i
      };
  }
  const o = t.status || t.model || "";
  return { value: i, valueKind: "text", caption: o === i ? "" : o };
}
function Ne(t, e, n, i) {
  const a = e ? v(e.entity_id) : "";
  if (n)
    return {
      dim: !0,
      vertical: {
        fraction: 0,
        label: e?.state === "unknown" ? "未知" : "不可用",
        icon: "sun",
        disabled: !0,
        showNav: i
      }
    };
  const r = se(e);
  return {
    dim: ["light", "fan", "humidifier", "cover", "media_player"].includes(a) && !g(e),
    vertical: {
      fraction: r.fraction,
      label: r.label,
      icon: r.icon,
      disabled: !r.supported,
      note: r.supported ? void 0 : "此实体不能用滑杆调节",
      showNav: i
    }
  };
}
function Xe(t, e, n, i, a, r) {
  const o = t.power_entity || (Bt(t.entity) ? t.entity : void 0), l = !!((t.show_power !== void 0 ? t.show_power : t.show_toggle !== !1) && o), c = o && e ? e.states[o] : void 0, d = !c || c.state === "unavailable" || c.state === "unknown", f = !!(l && !d && g(c)), m = t.show_image !== !1 && !!r, y = !m && t.show_placeholder !== !1, k = {
    uptime: U(t.show_uptime, !!t.uptime_entity) ? Qt(t.uptime_entity ? e?.states[t.uptime_entity] : void 0) : void 0,
    showPower: l,
    powerOn: f,
    powerDisabled: l && d,
    powerEntityId: l ? o : void 0,
    network: St(t.show_network, t.network_entity, e, Wt),
    location: St(t.show_location, t.location_entity, e, Ut),
    showWell: m || y,
    showPhoto: m,
    placeholderLabel: t.model || i,
    silhouette: De(`${i} ${t.model ?? ""}`),
    battery: Pe(t, e),
    tiles: Ke(t, e)
  };
  return {
    image: m ? r : void 0,
    dim: l ? d || !f : a,
    electronics: k
  };
}
function U(t, e) {
  return t === !1 ? !1 : e;
}
function St(t, e, n, i) {
  if (!(!U(t, !!e) || !e))
    return { text: i(n?.states[e]), entityId: e };
}
function Pe(t, e) {
  if (!(!U(t.show_battery, !!t.battery_entity) || !t.battery_entity))
    return { ...jt(e?.states[t.battery_entity]), entityId: t.battery_entity };
}
function Ke(t, e) {
  if (t.show_metrics === !1) return [];
  const n = [
    [t.show_temperature, t.temperature_entity, t.temperature_label, "温度"],
    [t.show_memory, t.memory_entity, t.memory_label, "内存"],
    [t.show_cpu, t.cpu_entity, t.cpu_label, "CPU 占用"],
    [t.show_gpu, t.gpu_entity, t.gpu_label, "GPU 占用"]
  ], i = [];
  for (const [a, r, o, s] of n) {
    if (!U(a, !!r) || !r) continue;
    const l = e?.states[r];
    i.push({
      label: o || Ze(l, s),
      value: Ht(l),
      entityId: r
    });
  }
  return i;
}
function Ze(t, e) {
  const n = x(t?.attributes.friendly_name);
  return n && !n.includes(".") ? n : e;
}
function De(t) {
  const e = t.toLowerCase();
  return /macbook|laptop|notebook|笔记本/.test(e) ? "laptop" : /ipad|iphone|phone|手机|平板/.test(e) ? "generic" : /pc|desktop|tower|电脑|主机/.test(e) ? "tower" : "generic";
}
function V(t, e) {
  const n = JSON.stringify(e) ?? "";
  return { key: n, changed: n !== t };
}
const je = /* @__PURE__ */ new Set(["unavailable", "unknown"]);
function Q(t) {
  let e = t;
  for (; e; ) {
    if (e instanceof Element && e.tagName === "HUI-CARD-PICKER") return !0;
    e = e instanceof ShadowRoot ? e.host : e.parentNode;
  }
  return !1;
}
function Mt(t) {
  return Array.isArray(t) ? t.filter((e) => typeof e == "string" && e.includes(".")) : [];
}
function It(t) {
  return t.split(".")[0] ?? "";
}
function _(t, e, n) {
  const i = Mt(e), a = new Set(i), r = Mt(n).filter((s) => !a.has(s));
  for (const s of r) a.add(s);
  const o = Object.keys(t?.states ?? {}).filter((s) => !a.has(s));
  return [...i, ...r, ...o];
}
function N(t, e) {
  return t?.states[e];
}
function pt(t, e) {
  const n = N(t, e);
  return !!(n && !je.has(n.state));
}
function Ct(t, e, n, i) {
  for (const a of e)
    if (n.includes(It(a)) && N(t, a) && i(a))
      return a;
}
function G(t, e, n, i) {
  const a = Ct(
    t,
    e,
    n,
    (r) => pt(t, r) && (i ? i(r) : !0)
  );
  return a || Ct(t, e, n, (r) => i ? i(r) : !0);
}
function We(t, e) {
  const n = N(t, e)?.attributes.hvac_modes;
  return Array.isArray(n) && n.some((i) => i !== "off");
}
function Ue(t, e, n) {
  const i = _(t, e, n);
  return { type: "custom:vha-climate-card", entity: G(t, i, ["climate"], (r) => We(t, r)) ?? G(t, i, ["climate"]) ?? "" };
}
const Qe = [
  { domains: ["humidifier"], layout: "large" },
  { domains: ["light"], layout: "vertical" },
  { domains: ["fan"], layout: "large" },
  { domains: ["switch", "input_boolean"], layout: "large" },
  { domains: ["cover", "lock", "vacuum", "water_heater"], layout: "large" }
];
function _e(t, e, n) {
  const i = _(t, e, n);
  for (const a of Qe) {
    const r = G(t, i, a.domains);
    if (r) return { type: "custom:vha-device-card", entity: r, layout: a.layout };
  }
  return { type: "custom:vha-device-card", entity: "", layout: "large" };
}
function Rt(t, e) {
  if (It(e) !== "sensor") return !1;
  const n = N(t, e);
  return !!(n && u(n.state) != null);
}
function $e(t, e) {
  if (!Rt(t, e) || !pt(t, e)) return !1;
  const n = N(t, e), i = n?.attributes.unit_of_measurement, a = n?.attributes.device_class;
  return typeof i == "string" && i.trim() !== "" || typeof a == "string" && a.trim() !== "";
}
function tn(t, e, n) {
  const i = _(t, e, n), a = i.find((s) => $e(t, s));
  if (a) return { type: "custom:vha-sensor-card", entity: a, layout: "insight" };
  const r = i.filter((s) => pt(t, s) && Rt(t, s));
  if (r.length >= 2)
    return {
      type: "custom:vha-sensor-card",
      layout: "metrics",
      metrics: r.slice(0, 2).map((s) => ({ entity: s }))
    };
  if (r[0]) return { type: "custom:vha-sensor-card", entity: r[0], layout: "insight" };
  const o = G(t, i, ["sensor", "binary_sensor"]);
  return o ? { type: "custom:vha-sensor-card", entity: o, layout: "insight" } : { type: "custom:vha-sensor-card", entity: "", layout: "insight" };
}
function en(t, e, n) {
  const i = _(t, e, n);
  return { type: "custom:vha-media-card", entity: G(t, i, ["media_player"]) ?? "" };
}
const nn = "data:font/woff2;base64,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", an = "data:font/woff2;base64,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", rn = "data:font/woff2;base64,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", on = '"Geist", "Noto Sans SC", "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif', q = '"Noto Sans SC", "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif', $ = `
@font-face {
  font-family: "Geist";
  src: url("${nn}") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Geist";
  src: url("${an}") format("woff2");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Noto Sans SC";
  src: url("${rn}") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

:host {
  display: block;
  min-width: 0;
  max-width: 100%;
  color: #111111;
  color-scheme: light;
  font-family: ${on};
  -webkit-font-smoothing: antialiased;
  --ha-card-background: #F0EFF2;
  --ha-card-border-width: 0;
  --primary-text-color: #111111;
  --secondary-text-color: #3A3A3C;
}

* { box-sizing: border-box; }

ha-card, .card {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  --ha-card-background: #F0EFF2;
  --ha-card-border-width: 0;
  --ha-card-border-color: transparent;
  --ha-card-border-radius: 40px;
  --ha-card-box-shadow: 0 10px 28px rgba(0, 0, 0, 0.07);
  --primary-text-color: #111111;
  --secondary-text-color: #3A3A3C;
  background: var(--ha-card-background);
  color: var(--primary-text-color);
  color-scheme: light;
  border-width: var(--ha-card-border-width);
  border-style: solid;
  border-color: transparent;
  border-radius: var(--ha-card-border-radius);
  box-shadow: var(--ha-card-box-shadow);
  overflow: hidden;
  container-type: inline-size;
  container-name: vha;
}

button, .info {
  font-family: inherit;
  color: inherit;
}

.info {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
  min-width: 0;
}

button:focus-visible, .vslider:focus-visible {
  outline: 2px solid #5C574E;
  outline-offset: 3px;
}

.layout-large {
  display: flex;
  flex-direction: column;
  min-height: 280px;
  padding: 24px 20px 24px 24px;
  gap: 12px;
}

.shell {
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 16px;
  min-width: 0;
  min-height: 240px;
  flex: 1 1 auto;
}

.main {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.l-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}

.reading { flex: 1 1 120px; min-width: 0; text-align: left; }

.value {
  display: block;
  margin: 0;
  font-weight: 500;
  font-size: 44px;
  line-height: 52px;
  letter-spacing: -0.5px;
  color: #111111;
  white-space: nowrap;
}
.value.is-text {
  font-weight: 400;
  font-size: 32px;
  line-height: 38px;
  letter-spacing: -0.4px;
  white-space: normal;
  overflow-wrap: anywhere;
}
.caption {
  display: block;
  margin: 2px 0 0;
  font-size: 20px;
  line-height: 26px;
  letter-spacing: -0.2px;
  color: #3A3A3C;
  overflow-wrap: anywhere;
}

.switch {
  appearance: none;
  width: 51px;
  height: 31px;
  flex: 0 0 51px;
  border: 0;
  border-radius: 999px;
  background: #C8C8C8;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
}
.switch::after {
  content: "";
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background: #FFFFFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.16);
}
.switch.on { background: #5C574E; justify-content: flex-end; }
.switch.on::after { background: #3A372F; }
.switch:disabled { opacity: 0.45; cursor: default; }

.photo, .v-photo, .well {
  background: #F7F8FA;
  border-radius: 28px;
  overflow: hidden;
  position: relative;
  min-width: 0;
}
.photo {
  flex: 1 1 auto;
  min-height: 220px;
  aspect-ratio: 6 / 5;
  width: 100%;
  border: 0;
  padding: 0;
  cursor: pointer;
}
.photo img, .v-photo img, .well img {
  width: 100%;
  height: 100%;
  display: block;
}
.fit-cover img { object-fit: cover; }
.fit-contain img { object-fit: contain; background: #F7F8FA; }
.is-off img { filter: grayscale(1); opacity: 0.48; }

.ph {
  width: 100%;
  height: 100%;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #8A8B8E;
  background: #F7F8FA;
}
.ph-label {
  font-size: 13px;
  line-height: 16px;
  color: #8A8B8E;
  text-align: center;
  padding: 0 12px;
}

.rail {
  flex: 0 0 64px;
  width: 64px;
  background: #FFFFFF;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  padding: 18px 8px;
}
.rail-btn {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #3A3A3C;
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;
}
.rail-btn[aria-pressed="true"] { background: #E4E4E8; color: #111111; }
.rail-btn:disabled { opacity: 0.4; cursor: default; }

/* Narrow columns: the 64px rail moves under the photo and becomes a horizontal capsule. */
@container vha (max-width: 320px) {
  .layout-large { padding: 20px; }
  .shell { flex-direction: column; min-height: 0; }
  .rail {
    flex: 1 1 auto;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    height: auto;
    min-height: 64px;
    border-radius: 999px;
    justify-content: space-evenly;
    gap: 8px 22px;
  }
}

.layout-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-height: 420px;
  padding: 0 0 20px;
}
.v-photo {
  width: 100%;
  aspect-ratio: 220 / 196;
  max-height: 280px;
  border-radius: 40px 40px 0 0;
  flex: 0 0 auto;
}
.v-photo img { object-fit: cover; }
.photo-hit {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  padding: 0;
  background: transparent;
}
.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border: 0;
  background: transparent;
  color: #3A3A3C;
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;
  z-index: 1;
}
.nav.prev { left: 8px; }
.nav.next { right: 8px; }
.v-title {
  width: 100%;
  padding: 0 16px;
  text-align: center;
  font-size: 28px;
  line-height: 34px;
  letter-spacing: -0.3px;
  font-weight: 400;
  color: #111111;
  overflow-wrap: anywhere;
}
.vslider {
  --p: 0;
  width: 80px;
  flex: 1 1 auto;
  min-height: 168px;
  margin: 0 auto;
  background: #FFFFFF;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  touch-action: none;
  color: #3A3A3C;
}
.vslider .thumb {
  position: absolute;
  left: 50%;
  top: calc(22px + (1 - var(--p)) * (100% - 100px));
  transform: translateX(-50%);
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1.2px solid rgba(58, 58, 60, 0.13);
  background: #FFFFFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.16);
  display: grid;
  place-items: center;
  padding: 0;
  color: #3A3A3C;
  pointer-events: none;
}
.vslider .pct {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 18px;
  text-align: center;
  font-size: 13px;
  line-height: 16px;
  color: #3A3A3C;
  pointer-events: none;
  white-space: nowrap;
}
.vslider.is-disabled { opacity: 0.45; }

.layout-electronics {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  min-width: 0;
}
.e-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}
.e-id { min-width: 0; flex: 1 1 auto; text-align: left; }
.e-title {
  display: block;
  margin: 0;
  font-size: 32px;
  line-height: 38px;
  letter-spacing: -0.4px;
  font-weight: 400;
  color: #111111;
  overflow-wrap: anywhere;
}
.uptime {
  display: block;
  margin: 2px 0 0;
  font-family: ${q};
  font-size: 20px;
  line-height: 26px;
  letter-spacing: -0.2px;
  color: #3A3A3C;
  overflow-wrap: anywhere;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 12px;
  width: 100%;
  min-width: 0;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
  flex: 1 1 auto;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: #8A8B8E;
  font-family: ${q};
  font-size: 13px;
  line-height: 16px;
  text-align: left;
}
.meta-item span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.meta-item.location { justify-content: flex-end; }
.well {
  width: 100%;
  aspect-ratio: 10 / 7;
  max-height: 320px;
  border: 0;
  padding: 0;
  cursor: pointer;
}
.well .ph { position: absolute; inset: 0; }
.battery {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  text-align: left;
  color: inherit;
}
.battery-value {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  font-weight: 500;
  font-size: 44px;
  line-height: 52px;
  letter-spacing: -0.5px;
  color: #111111;
}
.battery-label {
  display: block;
  margin: 2px 0 0;
  font-family: ${q};
  font-size: 20px;
  line-height: 26px;
  letter-spacing: -0.2px;
}
.battery-label.full { color: #3E8F6A; }
.battery-label.charging { color: #3A3A3C; }
.battery-label.idle, .battery-label.muted { color: #8A8B8E; }
.metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  min-width: 0;
}
.tile {
  flex: 1 1 140px;
  min-width: min(140px, 100%);
  background: #FFFFFF;
  border: 0;
  border-radius: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 18px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  text-align: center;
}
.tile .k {
  font-family: ${q};
  font-size: 16px;
  line-height: 21px;
  letter-spacing: -0.1px;
  color: #6B6C6F;
  overflow-wrap: anywhere;
}
.tile .v {
  font-size: 16px;
  line-height: 20px;
  letter-spacing: -0.1px;
  color: #111111;
  white-space: nowrap;
}

.error, .note, .warning {
  margin: 0;
  font-family: ${q};
  font-size: 13px;
  line-height: 16px;
}
.error, .note { padding: 0 24px 16px; }
.error { color: #8C3A3A; }
.note { color: #6B6C6F; text-align: center; }
.warning {
  color: #6B6C6F;
  text-align: center;
  padding: 48px 24px;
}

.cjk { font-family: ${q}; }

button:disabled { opacity: 0.45; cursor: default; }

.ihead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-width: 0;
}
.ititle {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  font-size: 32px;
  line-height: 38px;
  letter-spacing: -0.4px;
  font-weight: 400;
  color: #111111;
  overflow-wrap: anywhere;
  text-align: left;
}
.layout-climate .ititle {
  display: block;
  overflow: hidden;
  overflow-wrap: normal;
  word-break: keep-all;
}
.layout-climate .clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: normal;
  line-height: 38px;
  max-height: 76px;
}
.iactions { display: flex; align-items: center; gap: 4px; flex: 0 0 auto; }
.overflow {
  width: 32px;
  height: 32px;
  border: 0;
  background: transparent;
  color: #3A3A3C;
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
}
.power {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 999px;
  background: #FFFFFF;
  color: #8A8B8E;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
}
.power.on { color: #111111; }
.eyebrow, .tagline, .hero, .media-time, .metrics-title {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
}
.eyebrow {
  display: block;
  width: 100%;
  margin-top: 28px;
  text-align: center;
  font-size: 20px;
  line-height: 26px;
  letter-spacing: -0.2px;
  color: #3A3A3C;
}
.hero {
  display: block;
  width: 100%;
  margin-top: 16px;
  text-align: center;
  font-weight: 500;
  font-size: clamp(44px, 22cqw, 96px);
  line-height: 1.08;
  letter-spacing: -1.5px;
  color: #111111;
  white-space: nowrap;
}
.tagline {
  display: block;
  width: 100%;
  margin-top: 12px;
  text-align: center;
  font-size: 20px;
  line-height: 26px;
  letter-spacing: -0.2px;
  color: #111111;
  overflow-wrap: anywhere;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  margin-top: 28px;
}
.chip {
  flex: 1 1 72px;
  min-width: 0;
  border: 0;
  background: #FFFFFF;
  color: #111111;
  border-radius: 24px;
  padding: 14px 12px;
  font-size: 18px;
  line-height: 22px;
  letter-spacing: -0.2px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}
.chip[aria-pressed="true"] {
  background: #111111;
  color: #FFFFFF;
  box-shadow: none;
}
.fanblock { width: 100%; margin-top: 28px; display: flex; flex-direction: column; gap: 8px; }
.fan-label {
  margin: 0;
  font-size: 16px;
  line-height: 21px;
  letter-spacing: -0.1px;
  color: #3A3A3C;
}
.hslider {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
  touch-action: none;
}
.hslider[data-disabled="true"] { opacity: 0.45; }
.htrack { position: relative; flex: 1 1 auto; height: 20px; min-width: 0; }
.htrack::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 8px;
  height: 4px;
  border-radius: 999px;
  background: #FFFFFF;
}
.hthumb {
  position: absolute;
  top: 2px;
  left: calc(var(--p, 0) * (100% - 16px));
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: #FFFFFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.16);
}
.hpct {
  flex: 0 0 auto;
  min-width: 48px;
  text-align: right;
  font-size: 13px;
  line-height: 16px;
  color: #3A3A3C;
  white-space: nowrap;
}

ha-card.tone-heat, .card.tone-heat {
  --ha-card-background: linear-gradient(90deg, #FFE7C4 0%, #FFF1DC 40%, #F7EEE4 100%);
}
ha-card.tone-cool, .card.tone-cool {
  --ha-card-background: linear-gradient(90deg, #DCEAFB 0%, #E7F1EE 45%, #E4EEF7 100%);
}
ha-card.tone-neutral, .card.tone-neutral {
  --ha-card-background: linear-gradient(90deg, #E7F1EE 0%, #F0EFF2 55%, #E4EEF7 100%);
}
ha-card.tone-off, .card.tone-off { --ha-card-background: #F0EFF2; }
.layout-climate { padding: 28px 28px 24px; }

ha-card.card-lg, .card.card-lg {
  --ha-card-border-radius: 44px;
  border-radius: 44px;
}
ha-card.insight, .card.insight {
  --ha-card-background: linear-gradient(160deg, #FFEDC5 0%, #F8F0C8 24%, #F0F0D8 46%, #E7F1EE 70%, #D8EBFF 100%);
  background: var(--ha-card-background);
}
.layout-insight { padding: 32px 28px 28px; }
.layout-insight .eyebrow { margin-top: 32px; }
.layout-insight .hero { margin-top: 20px; }
.layout-insight .tagline { margin-top: 20px; }
.timeline { width: 100%; margin-top: 28px; }
.thours, .tbands {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  font-size: 13px;
  line-height: 16px;
  color: #6B6C6F;
}
.thours span, .tbands span { flex: 1 1 0; text-align: center; min-width: 0; }
.tticks {
  height: 22px;
  margin: 8px 0;
  background-image: repeating-linear-gradient(90deg, #111111 0 1px, transparent 1px 10px);
  opacity: 0.45;
}
.timeline-empty {
  margin: 4px 0 0;
  text-align: center;
  font-family: ${q};
  font-size: 13px;
  line-height: 16px;
  color: #6B6C6F;
}

ha-card.metrics, .card.metrics {
  --ha-card-background: linear-gradient(180deg, #E4F0FB 0%, #E8EDF5 52%, #F0EBEC 100%);
  background: var(--ha-card-background);
}
.layout-metrics {
  padding: 28px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.metrics-title {
  display: block;
  max-width: 4.6em;
  margin: 0 auto;
  text-align: center;
  font-size: 28px;
  line-height: 34px;
  letter-spacing: -0.3px;
  font-weight: 400;
  color: #111111;
  overflow-wrap: anywhere;
}
.stack-tiles { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.stack-tiles .tile { flex: none; width: 100%; }

ha-card.media, .card.media {
  --ha-card-background: #E3E9EE;
  background: var(--ha-card-background);
}
.layout-media {
  padding: 24px 20px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.media-body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
  min-width: 0;
}
.player {
  flex: 0 0 148px;
  width: 148px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.media-time {
  font-size: 13px;
  line-height: 16px;
  color: #8A8B8E;
  text-align: center;
}
.ring {
  width: 148px;
  height: 148px;
  border-radius: 999px;
  border: 1.2px solid rgba(197, 200, 204, 0.85);
  background: transparent;
  display: grid;
  place-items: center;
  padding: 0;
  overflow: hidden;
}
.ring img, .disc-ph {
  width: 128px;
  height: 128px;
  border-radius: 999px;
  display: block;
}
.ring img { object-fit: cover; object-position: center 18%; background: #E4E4E8; }
.disc-ph { background: #F7F8FA; }
.transport { display: flex; align-items: center; gap: 16px; }
.transport button {
  width: 32px;
  height: 32px;
  border: 0;
  background: transparent;
  color: #3A3A3C;
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
}
.transport button:disabled { opacity: 0.35; cursor: default; }
.rooms {
  flex: 1 1 180px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.room {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 47px;
  padding: 8px 8px 8px 16px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.6);
}
.room-name {
  flex: 1 1 auto;
  min-width: 0;
  border: 0;
  background: transparent;
  padding: 0;
  text-align: left;
  font-size: 16px;
  line-height: 21px;
  letter-spacing: -0.1px;
  color: #111111;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}
@container vha (max-width: 420px) {
  .layout-climate, .layout-insight { padding-left: 20px; padding-right: 20px; }
  .media-body { flex-direction: column; align-items: stretch; }
  .player { width: 100%; flex-basis: auto; }
  .layout-media { padding: 20px; }
}
@container vha (max-width: 400px) {
  .layout-climate { padding: 16px; }
  .layout-climate .eyebrow { margin-top: 12px; }
  .layout-climate .hero { margin-top: 8px; }
  .layout-climate .tagline { margin-top: 8px; }
  .layout-climate .chips { margin-top: 12px; }
  .layout-climate .fanblock { margin-top: 12px; }
}
`;
class sn extends HTMLElement {
  constructor() {
    super(), this._config = {}, this._error = "", this._imageIndex = 0, this._broken = /* @__PURE__ */ new Set(), this._dragging = !1, this._paintKey = "", this.attachShadow({ mode: "open" });
  }
  static getConfigElement() {
    return document.createElement("vha-device-card-editor");
  }
  static getStubConfig(e, n = [], i = []) {
    return _e(e, n, i);
  }
  setConfig(e) {
    if (!e || typeof e != "object") throw new Error("VHA 设备卡需要一份配置");
    this._config = { ...e }, this._error = "", this._render();
  }
  set hass(e) {
    this._hass = e, !this._dragging && this._render();
  }
  get hass() {
    return this._hass;
  }
  getCardSize() {
    const e = this._config.layout;
    return e === "vertical" ? 6 : 5;
  }
  getGridOptions() {
    const e = this._config.layout;
    return e === "vertical" ? { columns: 3, min_columns: 2, rows: 6, min_rows: 4 } : e === "electronics" ? { columns: 6, min_columns: 2, rows: 4, min_rows: 2 } : { columns: 6, min_columns: 2, rows: 4, min_rows: 3 };
  }
  connectedCallback() {
    this._render();
  }
  _ensureStyles() {
    !this.shadowRoot || this._sheet || (this._sheet = new CSSStyleSheet(), this._sheet.replaceSync($), this.shadowRoot.adoptedStyleSheets = [this._sheet]);
  }
  _openMoreInfo(e) {
    e && this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: !0,
        composed: !0,
        detail: { entityId: e }
      })
    );
  }
  _view() {
    return Oe(this._config, this._hass, this._imageIndex);
  }
  async _run(e) {
    if (!Q(this)) {
      try {
        await e(), this._error = "";
      } catch (n) {
        this._error = D(n);
      }
      this._render();
    }
  }
  _render() {
    if (!this.shadowRoot || this._dragging) return;
    this._ensureStyles();
    const e = this._view();
    if (e.empty) {
      const a = V(this._paintKey, { empty: !0, error: this._error });
      if (!a.changed) return;
      this.shadowRoot.innerHTML = '<ha-card class="card"><p class="warning">请选择一个实体</p></ha-card>', this._paintKey = a.key;
      return;
    }
    const n = e.image && !this._broken.has(e.image) ? e.image : void 0, i = V(this._paintKey, { view: e, picture: n ?? "", error: this._error });
    i.changed && (this.shadowRoot.innerHTML = ln(e, n, this._error), this._bind(e), this._paintKey = i.key);
  }
  _bind(e) {
    const n = this.shadowRoot;
    if (!n) return;
    n.querySelectorAll("[data-info]").forEach((a) => {
      a.addEventListener("click", (r) => {
        r.stopPropagation(), this._openMoreInfo(a.dataset.info || "");
      });
    }), n.querySelectorAll("[data-switch]").forEach((a) => {
      a.addEventListener("click", (r) => {
        r.stopPropagation(), r.preventDefault();
        const o = a.dataset.switch || "", s = o ? this._hass?.states[o] : void 0;
        if (!this._hass || !s || a.disabled) return;
        const l = a.getAttribute("aria-checked") !== "true", c = (e.large?.actions ?? []).map((d) => ({
          name: d.name,
          icon: d.icon,
          pressed: d.pressed,
          entity: d.entity,
          mode: d.mode
        }));
        this._run(() => ae(this._hass, s, c, l));
      });
    }), n.querySelectorAll("[data-action]").forEach((a) => {
      a.addEventListener("click", (r) => {
        r.stopPropagation(), r.preventDefault();
        const o = e.large?.actions[Number(a.dataset.action)], s = e.entityId ? this._hass?.states[e.entityId] : void 0;
        !this._hass || !s || !o || a.disabled || this._run(() => re(this._hass, s, o));
      });
    }), n.querySelectorAll("[data-nav]").forEach((a) => {
      a.addEventListener("click", (r) => {
        r.stopPropagation(), r.preventDefault(), this._imageIndex += Number(a.dataset.nav) || 0, this._render();
      });
    }), n.querySelectorAll("img[data-src]").forEach((a) => {
      a.addEventListener("error", () => {
        const r = a.dataset.src;
        !r || this._broken.has(r) || (this._broken.add(r), this._render());
      });
    });
    const i = n.querySelector(".vslider");
    i && this._bindSlider(i, e);
  }
  _bindSlider(e, n) {
    if (e.dataset.disabled === "true") return;
    const i = (o) => {
      const s = e.getBoundingClientRect(), l = Math.max(1, s.height - 100), c = o - s.top - 22, d = Math.min(1, Math.max(0, 1 - (c - 22) / l));
      e.style.setProperty("--p", String(d));
      const f = e.querySelector(".pct"), w = n.entityId ? this._hass?.states[n.entityId] : void 0;
      return f && w && (f.textContent = le(w, d)), e.setAttribute("aria-valuenow", String(Math.round(d * 100))), d;
    }, a = (o) => {
      const s = n.entityId ? this._hass?.states[n.entityId] : void 0;
      !this._hass || !s || this._run(() => ce(this._hass, s, o));
    };
    e.addEventListener("pointerdown", (o) => {
      o.stopPropagation(), o.preventDefault(), this._dragging = !0, e.setPointerCapture(o.pointerId), i(o.clientY);
    }), e.addEventListener("pointermove", (o) => {
      this._dragging && (o.stopPropagation(), i(o.clientY));
    });
    const r = (o) => {
      if (!this._dragging) return;
      o.stopPropagation();
      const s = i(o.clientY);
      this._dragging = !1, a(s);
    };
    e.addEventListener("pointerup", r), e.addEventListener("pointercancel", () => {
      this._dragging = !1, this._render();
    }), e.addEventListener("keydown", (o) => {
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(o.key)) return;
      o.preventDefault(), o.stopPropagation();
      const l = Number(e.style.getPropertyValue("--p") || e.dataset.fraction || "0");
      let c = l;
      (o.key === "ArrowUp" || o.key === "ArrowRight") && (c = Math.min(1, l + 0.05)), (o.key === "ArrowDown" || o.key === "ArrowLeft") && (c = Math.max(0, l - 0.05)), o.key === "Home" && (c = 0), o.key === "End" && (c = 1), a(c);
    });
  }
}
function ln(t, e, n) {
  const i = t.layout === "vertical" ? un(t, e) : t.layout === "electronics" ? pn(t, e) : cn(t, e), a = [
    t.vertical?.note ? `<p class="note">${p(t.vertical.note)}</p>` : "",
    n ? `<p class="error">${p(n)}</p>` : ""
  ].join("");
  return `<ha-card class="card">${i}${a}</ha-card>`;
}
function cn(t, e) {
  const n = t.large;
  if (!n || !t.entityId) return "";
  const i = n.valueKind === "number" ? "value" : "value is-text", a = t.dim ? " is-off" : "", r = t.imageFit === "contain" ? "fit-contain" : "fit-cover", o = n.showSwitch ? `<button class="switch${n.switchOn ? " on" : ""}" type="button" role="switch" aria-checked="${n.switchOn}" data-switch="${h(t.entityId)}" ${t.blocked ? "disabled" : ""} aria-label="电源开关"></button>` : "", s = n.actions.length ? `<div class="rail" role="toolbar" aria-label="动作">${n.actions.map((l, c) => dn(l, c)).join("")}</div>` : "";
  return `<div class="layout-large">
    <div class="shell">
      <div class="main">
        <div class="l-head">
          <button class="reading info" type="button" data-info="${h(t.entityId)}">
            <span class="${i}">${p(n.value)}</span>
            ${n.caption ? `<span class="caption">${p(n.caption)}</span>` : ""}
          </button>
          ${o}
        </div>
        <button class="photo info ${r}${a}" type="button" data-info="${h(t.entityId)}" aria-label="${h(t.name)}">
          ${ht(e, t.name, "generic")}
        </button>
      </div>
      ${s}
    </div>
  </div>`;
}
function dn(t, e) {
  return `<button class="rail-btn" type="button" data-action="${e}" aria-label="${h(t.name)}" aria-pressed="${t.pressed}" ${t.disabled ? "disabled" : ""}>${qe(t.icon, t.icon === "chevron" ? 22 : 24)}</button>`;
}
function un(t, e) {
  const n = t.vertical;
  if (!n || !t.entityId) return "";
  const i = t.dim ? " is-off" : "", a = n.showNav ? `<button class="nav prev" type="button" data-nav="-1" aria-label="上一张">${L("chevron-left", 20)}</button>
       <button class="nav next" type="button" data-nav="1" aria-label="下一张">${L("chevron-right", 20)}</button>` : "", r = n.icon === "droplet" ? "droplet" : n.icon === "steam" ? "steam" : "sun";
  return `<div class="layout-vertical">
    <div class="v-photo${i}">
      <button class="photo-hit info" type="button" data-info="${h(t.entityId)}" aria-label="${h(t.name)}">${ht(e, t.name, "generic")}</button>
      ${a}
    </div>
    <button class="v-title info" type="button" data-info="${h(t.entityId)}">${p(t.name)}</button>
    <div class="vslider${n.disabled ? " is-disabled" : ""}" role="slider" tabindex="${n.disabled ? "-1" : "0"}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(n.fraction * 100)}" aria-label="调节" data-fraction="${n.fraction}" data-disabled="${n.disabled}" style="--p:${n.fraction}">
      <span class="thumb">${L(r, 22)}</span>
      <span class="pct">${p(n.label)}</span>
    </div>
  </div>`;
}
function pn(t, e) {
  const n = t.electronics;
  if (!n || !t.entityId) return "";
  const i = t.dim ? " is-off" : "", a = t.imageFit === "cover" ? "fit-cover" : "fit-contain", r = n.showPower && n.powerEntityId ? `<button class="switch${n.powerOn ? " on" : ""}" type="button" role="switch" aria-checked="${n.powerOn}" data-switch="${h(n.powerEntityId)}" ${n.powerDisabled ? "disabled" : ""} aria-label="电源开关"></button>` : "", o = n.uptime ? `<span class="uptime">${p(n.uptime)}</span>` : "", s = hn(n.network, n.location), l = n.showWell ? `<button class="well info ${a}${i}" type="button" data-info="${h(t.entityId)}" aria-label="${h(t.name)}">${e && n.showPhoto ? ht(e, n.placeholderLabel, n.silhouette) : Ot(n.placeholderLabel, n.silhouette)}</button>` : "", c = n.battery ? `<button class="battery" type="button" data-info="${h(n.battery.entityId)}">
        <span class="battery-value">${p(n.battery.value)}${L(n.battery.tone === "full" ? "battery-full" : "battery", 22)}</span>
        <span class="battery-label ${n.battery.tone}">${p(n.battery.label)}</span>
      </button>` : "", d = n.tiles.length ? `<div class="metrics">${n.tiles.map(
    (f) => `<button class="tile" type="button" data-info="${h(f.entityId)}">
            <span class="k">${p(f.label)}</span>
            <span class="v">${p(f.value)}</span>
          </button>`
  ).join("")}</div>` : "";
  return `<div class="layout-electronics">
    <div class="e-head">
      <button class="e-id info" type="button" data-info="${h(t.entityId)}">
        <span class="e-title">${p(t.name)}</span>
        ${o}
      </button>
      ${r}
    </div>
    ${s}
    ${l}
    ${c}
    ${d}
  </div>`;
}
function hn(t, e) {
  if (!t && !e) return "";
  const n = t ? `<button class="meta-item" type="button" data-info="${h(t.entityId)}">${L("wifi", 16)}<span>${p(t.text)}</span></button>` : "<span></span>", i = e ? `<button class="meta-item location" type="button" data-info="${h(e.entityId)}">${L("home", 16)}<span>${p(e.text)}</span></button>` : "";
  return `<div class="meta">${n}${i}</div>`;
}
function ht(t, e, n) {
  return t ? `<img alt="" src="${h(t)}" data-src="${h(t)}">` : Ot(e, n);
}
function Ot(t, e) {
  const n = e === "generic" && !t ? "" : `<span class="ph-label">${p(t)}</span>`;
  return `<span class="ph">${ze(e)}${n}</span>`;
}
function ft(t, e) {
  e && t.dispatchEvent(
    new CustomEvent("hass-more-info", {
      bubbles: !0,
      composed: !0,
      detail: { entityId: e }
    })
  );
}
function mt(t, e) {
  t.querySelectorAll("[data-info]").forEach((n) => {
    n.addEventListener("click", (i) => {
      i.stopPropagation(), e(n.dataset.info || "");
    });
  });
}
function yt(t) {
  return b(Math.round(Math.min(1, Math.max(0, t)) * 100), "%");
}
function Vt(t, e) {
  if (t.dataset.disabled === "true") return;
  const n = t.querySelector(".htrack");
  if (!n) return;
  let i = !1;
  const a = (o) => {
    const s = n.getBoundingClientRect(), l = Math.max(1, s.width - 16), c = Math.min(1, Math.max(0, (o - s.left - 8) / l));
    t.style.setProperty("--p", String(c));
    const d = t.querySelector(".hpct");
    return d && (d.textContent = e.labelFor(c)), t.setAttribute("aria-valuenow", String(Math.round(c * 100))), c;
  };
  t.addEventListener("pointerdown", (o) => {
    o.stopPropagation(), o.preventDefault(), i = !0, e.setDragging(!0), t.setPointerCapture(o.pointerId), a(o.clientX);
  }), t.addEventListener("pointermove", (o) => {
    i && (o.stopPropagation(), a(o.clientX));
  });
  const r = (o) => {
    i && (o.stopPropagation(), i = !1, e.setDragging(!1), e.commit(a(o.clientX)));
  };
  t.addEventListener("pointerup", r), t.addEventListener("pointercancel", () => {
    i && (i = !1, e.setDragging(!1));
  }), t.addEventListener("keydown", (o) => {
    if (o.key !== "ArrowLeft" && o.key !== "ArrowRight") return;
    o.preventDefault(), o.stopPropagation();
    const s = Number(t.style.getPropertyValue("--p") || "0"), l = Math.min(1, Math.max(0, s + (o.key === "ArrowRight" ? 0.05 : -0.05)));
    t.style.setProperty("--p", String(l));
    const c = t.querySelector(".hpct");
    c && (c.textContent = e.labelFor(l)), e.commit(l);
  });
}
const fn = {
  off: "关闭",
  heat: "制热",
  cool: "制冷",
  heat_cool: "冷热",
  auto: "自动",
  dry: "除湿",
  fan_only: "送风",
  fan: "送风"
};
function Gt(t) {
  return fn[t] ?? t;
}
function mn(t) {
  return Math.round(t * 10) / 10;
}
function Ft(t) {
  return `${t.toFixed(1)} °`;
}
function et(t) {
  return b(mn(t), "°");
}
function X(t) {
  return Array.isArray(t) ? t.filter((e) => typeof e == "string" && e.trim() !== "") : [];
}
function ot(t) {
  const e = t.trim().match(/^(\d+(?:\.\d+)?)\s*%?$/);
  if (!e) return;
  const n = Number(e[1]);
  if (Number.isFinite(n))
    return Math.min(100, Math.max(0, n));
}
function yn(t) {
  const e = X(t?.attributes.fan_modes);
  if (!t || e.length === 0)
    return { show: !1, fraction: 0, label: b(0, "%") };
  const n = x(t.attributes.fan_mode) ?? "", i = e.map(ot);
  let a = 0;
  i.every((o) => o != null) ? a = (ot(n) ?? 0) / 100 : e.length === 1 ? a = n === e[0] ? 1 : 0 : a = Math.max(0, e.indexOf(n)) / (e.length - 1);
  const r = Math.round(Math.min(1, Math.max(0, a)) * 100);
  return { show: !0, fraction: a, label: b(r, "%") };
}
function bn(t, e) {
  const n = X(t.attributes.fan_modes);
  if (!n.length) return;
  const i = n.map(ot), a = Math.min(1, Math.max(0, e));
  if (i.every((o) => o != null)) {
    const o = Math.round(a * 100);
    let s = n[0], l = 1 / 0;
    return n.forEach((c, d) => {
      const f = Math.abs(i[d] - o);
      f < l && (l = f, s = c);
    }), s;
  }
  const r = Math.round(a * (n.length - 1));
  return n[Math.max(0, Math.min(n.length - 1, r))];
}
function Nt(t) {
  return u(t.attributes.temperature) ?? u(t.attributes.target_temp_high) ?? u(t.attributes.target_temp_low);
}
function gn(t) {
  if (!t || t.state === "unavailable") return "不可用";
  if (t.state === "unknown") return "未知";
  if (t.state === "off") return "已关闭";
  if (t.state === "fan_only" || t.state === "fan") return "送风";
  if (t.state === "heat_cool") {
    const a = u(t.attributes.target_temp_low), r = u(t.attributes.target_temp_high);
    if (a != null && r != null) return `维持 ${et(a)} – ${et(r)}`;
  }
  const e = Nt(t), i = {
    heat: "制热至",
    cool: "制冷至",
    auto: "自动至",
    dry: "除湿至"
  }[t.state];
  return i && e != null ? `${i} ${et(e)}` : Gt(t.state);
}
function wn(t) {
  if (!t || t.state === "off" || t.state === "unavailable" || t.state === "unknown") return "off";
  const e = x(t.attributes.hvac_action) ?? "";
  return t.state === "heat" || e === "heating" ? "heat" : t.state === "cool" || e === "cooling" ? "cool" : t.state === "heat_cool" || t.state === "auto" ? e === "cooling" ? "cool" : e === "heating" ? "heat" : t.state === "auto" ? "neutral" : "heat" : "neutral";
}
function xn(t) {
  return !t || t.state === "unavailable" || t.state === "unknown";
}
function vn(t) {
  return {
    columns: 6,
    min_columns: 4,
    rows: t ? 8 : 7,
    min_rows: t ? 6 : 5
  };
}
function kn(t, e) {
  const n = X(t.attributes.hvac_modes).filter((i) => i !== "off");
  return e && n.includes(e) ? e : n[0];
}
function An(t, e) {
  const n = t.entity?.trim();
  if (!n)
    return nt("empty", "请选择一个实体");
  const i = n.split(".")[0] ?? "", a = e?.states[n], r = t.name || x(a?.attributes.friendly_name) || n;
  if (i !== "climate")
    return { ...nt("invalid", "请选择气候实体"), entityId: n, title: r };
  if (!a)
    return {
      ...nt("card", "实体不存在"),
      entityId: n,
      title: r,
      value: "不可用",
      tagline: "实体不存在",
      controlsDisabled: !0,
      powerDisabled: !0
    };
  const o = u(a.attributes.current_temperature), s = Nt(a);
  let l = "—";
  a.state === "unavailable" ? l = "不可用" : a.state === "unknown" ? l = "未知" : o != null ? l = Ft(o) : s != null && (l = Ft(s));
  const c = X(a.attributes.hvac_modes).filter((m) => m !== "off"), d = yn(a), f = a.state === "unavailable" || a.state === "unknown", w = a.state === "off";
  return {
    kind: "card",
    entityId: n,
    title: r,
    caption: "气候",
    value: l,
    tagline: gn(a),
    tone: wn(a),
    chips: c.map((m) => ({
      mode: m,
      label: Gt(m),
      selected: !f && !w && a.state === m
    })),
    showFan: t.show_fan !== !1 && d.show,
    fanFraction: d.fraction,
    fanLabel: d.label,
    controlsDisabled: xn(a),
    powerOn: !f && !w,
    powerDisabled: f
  };
}
function nt(t, e) {
  return {
    kind: t,
    message: e,
    title: "",
    caption: "气候",
    value: "",
    tagline: "",
    tone: "off",
    chips: [],
    showFan: !1,
    fanFraction: 0,
    fanLabel: b(0, "%"),
    controlsDisabled: !0,
    powerOn: !1,
    powerDisabled: !0
  };
}
function bt(t) {
  if (!t || t.state === "unavailable" || t.state === "unknown")
    throw new Error(t?.state === "unknown" ? "未知" : "不可用");
  return t;
}
async function En(t, e, n, i) {
  const a = bt(e);
  if (a.state !== "off" === n) return;
  const o = a.entity_id;
  if (n)
    try {
      await t.callService("climate", "turn_on", { entity_id: o });
      return;
    } catch (s) {
      const l = kn(a, i);
      if (!l) throw s instanceof Error ? s : new Error("无法开机");
      await t.callService("climate", "set_hvac_mode", { entity_id: o, hvac_mode: l });
      return;
    }
  try {
    await t.callService("climate", "turn_off", { entity_id: o });
  } catch (s) {
    if (!X(a.attributes.hvac_modes).includes("off")) throw s instanceof Error ? s : new Error("无法关机");
    await t.callService("climate", "set_hvac_mode", { entity_id: o, hvac_mode: "off" });
  }
}
async function Sn(t, e, n) {
  const i = bt(e);
  !n || n === "off" || i.state !== n && await t.callService("climate", "set_hvac_mode", { entity_id: i.entity_id, hvac_mode: n });
}
async function Mn(t, e, n) {
  const i = bt(e), a = bn(i, n);
  a && await t.callService("climate", "set_fan_mode", { entity_id: i.entity_id, fan_mode: a });
}
class Cn extends HTMLElement {
  constructor() {
    super(), this._config = {}, this._error = "", this._dragging = !1, this._paintKey = "", this._lastMode = "", this.attachShadow({ mode: "open" });
  }
  static getConfigElement() {
    return document.createElement("vha-climate-card-editor");
  }
  static getStubConfig(e, n = [], i = []) {
    return Ue(e, n, i);
  }
  setConfig(e) {
    if (!e || typeof e != "object") throw new Error("VHA 气候卡需要一份配置");
    const n = this._config.entity;
    this._config = { ...e }, e.entity !== n && (this._lastMode = ""), this._error = "", this._render();
  }
  set hass(e) {
    this._hass = e, !this._dragging && this._render();
  }
  get hass() {
    return this._hass;
  }
  getCardSize() {
    return 6;
  }
  getGridOptions() {
    return vn(this._config.show_fan !== !1);
  }
  connectedCallback() {
    this._render();
  }
  _ensureStyles() {
    !this.shadowRoot || this._sheet || (this._sheet = new CSSStyleSheet(), this._sheet.replaceSync($), this.shadowRoot.adoptedStyleSheets = [this._sheet]);
  }
  async _run(e) {
    if (!Q(this)) {
      try {
        await e(), this._error = "";
      } catch (n) {
        this._error = D(n);
      }
      this._render();
    }
  }
  _remember(e) {
    const n = e.chips.find((i) => i.selected);
    n && (this._lastMode = n.mode);
  }
  _render() {
    if (!this.shadowRoot || this._dragging) return;
    this._ensureStyles();
    const e = An(this._config, this._hass);
    this._remember(e);
    const n = V(this._paintKey, { view: e, error: this._error });
    n.changed && (this.shadowRoot.innerHTML = Fn(e, this._error), this._bind(e), this._paintKey = n.key);
  }
  _bind(e) {
    const n = this.shadowRoot;
    if (!n) return;
    mt(n, (a) => ft(this, a)), n.querySelector("[data-power]")?.addEventListener("click", (a) => {
      a.stopPropagation(), a.preventDefault();
      const r = e.entityId ? this._hass?.states[e.entityId] : void 0;
      !this._hass || !r || e.powerDisabled || this._run(() => En(this._hass, r, !e.powerOn, this._lastMode));
    }), n.querySelectorAll("[data-mode]").forEach((a) => {
      a.addEventListener("click", (r) => {
        r.stopPropagation(), r.preventDefault();
        const o = e.entityId ? this._hass?.states[e.entityId] : void 0;
        !this._hass || !o || a.disabled || this._run(() => Sn(this._hass, o, a.dataset.mode || ""));
      });
    });
    const i = n.querySelector("[data-slider='fan']");
    i && Vt(i, {
      labelFor: yt,
      setDragging: (a) => {
        this._dragging = a;
      },
      commit: (a) => {
        const r = e.entityId ? this._hass?.states[e.entityId] : void 0;
        !this._hass || !r || this._run(() => Mn(this._hass, r, a));
      }
    });
  }
}
function Fn(t, e) {
  if (t.kind === "empty" || t.kind === "invalid")
    return `<ha-card class="card"><p class="warning">${p(t.message || "请选择一个实体")}</p></ha-card>`;
  const n = t.entityId || "", i = t.chips.map(
    (r) => `<button class="chip" type="button" data-mode="${h(r.mode)}" aria-pressed="${r.selected}" ${t.controlsDisabled ? "disabled" : ""}>${p(r.label)}</button>`
  ).join(""), a = t.showFan ? `<div class="fanblock">
        <p class="fan-label">风速</p>
        <div class="hslider" data-slider="fan" role="slider" tabindex="${t.controlsDisabled ? "-1" : "0"}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(t.fanFraction * 100)}" aria-label="风速" data-disabled="${t.controlsDisabled}" style="--p:${t.fanFraction}">
          <div class="htrack"><span class="hthumb"></span></div>
          <span class="hpct">${p(t.fanLabel)}</span>
        </div>
      </div>` : "";
  return `<ha-card class="card tone-${t.tone}">
    <div class="layout-climate">
      <div class="ihead">
        <button class="ititle info" type="button" data-info="${h(n)}"><span class="clamp">${p(t.title)}</span></button>
        <div class="iactions">
          <button class="overflow" type="button" data-info="${h(n)}" aria-label="更多信息">${J("ellipsis", 22)}</button>
          <button class="power${t.powerOn ? " on" : ""}" type="button" data-power aria-pressed="${t.powerOn}" ${t.powerDisabled ? "disabled" : ""} aria-label="电源">${J("power", 22)}</button>
        </div>
      </div>
      <button class="eyebrow info" type="button" data-info="${h(n)}">${p(t.caption)}</button>
      <button class="hero info" type="button" data-info="${h(n)}">${p(t.value)}</button>
      <button class="tagline info" type="button" data-info="${h(n)}">${p(t.tagline)}</button>
      ${i ? `<div class="chips">${i}</div>` : ""}
      ${a}
    </div>
    ${e ? `<p class="error">${p(e)}</p>` : ""}
  </ha-card>`;
}
function T(t) {
  return { name: t, selector: { text: {} } };
}
function Z(t, e) {
  return { name: t, selector: { entity: e ? { domain: e } : {} } };
}
const gt = `
  .vha-editor { display: grid; gap: 10px; font-family: "Noto Sans SC", "PingFang SC", sans-serif; }
  .vha-editor label { display: grid; gap: 4px; font-size: 12px; color: #444; }
  .vha-editor input[type="text"], .vha-editor select {
    height: 36px; border: 1px solid #e4e6ea; border-radius: 8px; padding: 0 10px; font: inherit;
  }
  .vha-editor .row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
`;
function Xt(t) {
  return { name: t, selector: { boolean: {} } };
}
function qn(t, e) {
  return { name: t, selector: { select: { options: e, mode: "dropdown" } } };
}
function wt(t, e) {
  if (!customElements.get("ha-form") || !e.hass) return !1;
  let n = t.querySelector("ha-form");
  return n || (t.innerHTML = "", n = document.createElement("ha-form"), t.appendChild(n), n.addEventListener("value-changed", (i) => {
    const a = i.detail?.value;
    a && e.onChange(a);
  })), n.hass = e.hass, n.schema = e.schema, n.data = e.data, n.computeLabel = (i) => e.labels[i.name] || i.name, !0;
}
function st(t, e) {
  t.innerHTML = "";
  const n = document.createElement("style");
  n.textContent = `
    .vha-list { display: grid; gap: 10px; margin-top: 12px; font-family: "Noto Sans SC", sans-serif; }
    .vha-list h3 { margin: 0; font-size: 13px; font-weight: 500; color: #3A3A3C; }
    .vha-row { display: grid; gap: 6px; padding: 8px 0; border-top: 1px solid #ececef; }
    .vha-row label { display: grid; gap: 4px; font-size: 12px; color: #444; }
    .vha-row input[type="text"] { height: 32px; border: 1px solid #e4e6ea; border-radius: 8px; padding: 0 8px; font: inherit; }
    .vha-row .check { display: flex; align-items: center; gap: 8px; font-size: 13px; }
    .vha-list button { height: 32px; border: 0; border-radius: 8px; background: #F0EFF2; cursor: pointer; }
  `;
  const i = document.createElement("div");
  i.className = "vha-list";
  const a = document.createElement("h3");
  a.textContent = e.title, i.append(a), e.rows.forEach((o, s) => {
    const l = document.createElement("div");
    l.className = "vha-row";
    for (const d of e.columns) {
      const f = document.createElement("label");
      if (f.textContent = d.label, d.kind === "bool") {
        f.className = "check";
        const w = document.createElement("input");
        w.type = "checkbox", w.checked = o[d.key] !== !1, w.addEventListener("change", () => {
          const m = e.rows.map((y) => ({ ...y }));
          m[s] = { ...m[s], [d.key]: w.checked }, e.onChange(m);
        }), f.prepend(w);
      } else {
        const w = document.createElement("input");
        w.type = "text", w.value = typeof o[d.key] == "string" ? String(o[d.key]) : "", w.addEventListener("change", () => {
          const m = e.rows.map((y) => ({ ...y }));
          m[s] = { ...m[s], [d.key]: w.value.trim() }, e.onChange(m);
        }), f.append(w);
      }
      l.append(f);
    }
    const c = document.createElement("button");
    c.type = "button", c.textContent = "删除", c.addEventListener("click", () => {
      e.onChange(e.rows.filter((d, f) => f !== s));
    }), l.append(c), i.append(l);
  });
  const r = document.createElement("button");
  r.type = "button", r.textContent = e.addLabel, r.addEventListener("click", () => {
    const o = {};
    for (const s of e.columns) o[s.key] = s.kind === "bool" ? !0 : "";
    e.onChange([...e.rows, o]);
  }), i.append(r), t.append(n, i);
}
const Jn = {
  entity: "实体",
  name: "名称（留空则使用友好名称）",
  show_fan: "显示风速滑杆"
};
class Tn extends HTMLElement {
  constructor() {
    super(...arguments), this._config = { type: "custom:vha-climate-card" }, this._built = !1;
  }
  set hass(e) {
    this._hass = e, this._render();
  }
  setConfig(e) {
    this._config = { type: "custom:vha-climate-card", ...e }, this._render();
  }
  _emit(e) {
    this._config = e, this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: e }, bubbles: !0, composed: !0 }));
  }
  _data() {
    return {
      entity: this._config.entity ?? "",
      name: this._config.name ?? "",
      show_fan: this._config.show_fan !== !1
    };
  }
  _render() {
    const e = [Z("entity", "climate"), T("name"), Xt("show_fan")];
    e[0] = { ...e[0], required: !0 }, !wt(this, {
      hass: this._hass,
      data: this._data(),
      schema: e,
      labels: Jn,
      onChange: (n) => {
        this._emit({
          type: "custom:vha-climate-card",
          entity: qt(n.entity),
          name: qt(n.name),
          show_fan: n.show_fan !== !1
        });
      }
    }) && this._fallback();
  }
  _fallback() {
    this._built || (this.innerHTML = `
        <style>${gt}</style>
        <div class="vha-editor">
          <label>实体 <input data-key="entity" type="text" placeholder="climate.living_room" /></label>
          <label>名称 <input data-key="name" type="text" placeholder="可选" /></label>
          <label class="row"><input data-key="show_fan" type="checkbox" /> 显示风速滑杆</label>
        </div>`, this.querySelectorAll("input").forEach((n) => {
      n.addEventListener("change", () => this._fromFallback());
    }), this._built = !0);
    const e = this._config;
    this.querySelector('[data-key="entity"]').value = e.entity ?? "", this.querySelector('[data-key="name"]').value = e.name ?? "", this.querySelector('[data-key="show_fan"]').checked = e.show_fan !== !1;
  }
  _fromFallback() {
    const e = (n) => this.querySelector(`[data-key="${n}"]`).value.trim();
    this._emit({
      type: "custom:vha-climate-card",
      entity: e("entity") || void 0,
      name: e("name") || void 0,
      show_fan: this.querySelector('[data-key="show_fan"]').checked
    });
  }
}
function qt(t) {
  return typeof t == "string" && t.trim() ? t.trim() : void 0;
}
const Pt = [
  { value: "large", label: "大图设备" },
  { value: "vertical", label: "竖图控制" },
  { value: "electronics", label: "电子设备" }
], B = [
  { value: "auto", label: "自动" },
  { value: "contain", label: "完整显示（浅底）" },
  { value: "cover", label: "铺满" }
], z = {
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
  action_3_name: "动作 3 名称"
}, Hn = [
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
  "gpu_label"
], Ln = [
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
  "show_metrics"
];
function E(t) {
  return { name: t, selector: { entity: {} } };
}
function A(t) {
  return { name: t, selector: { text: {} } };
}
function S(t, e = !1) {
  return { name: t, disabled: e, selector: { boolean: {} } };
}
function Bn(t, e) {
  const n = Y(t.layout), i = K(t, e), a = [
    { name: "entity", required: !0, selector: { entity: {} } },
    A("name"),
    {
      name: "layout",
      selector: { select: { options: Pt, mode: "dropdown" } }
    }
  ];
  return n === "large" ? a.push(
    A("model"),
    A("status"),
    A("image"),
    { name: "image_fit", selector: { select: { options: B, mode: "dropdown" } } },
    S("show_toggle"),
    E("value_entity"),
    E("action_1_entity"),
    A("action_1_name"),
    E("action_2_entity"),
    A("action_2_name"),
    E("action_3_entity"),
    A("action_3_name")
  ) : n === "vertical" ? a.push(
    A("image"),
    A("images"),
    { name: "image_fit", selector: { select: { options: B, mode: "dropdown" } } }
  ) : a.push(
    A("model"),
    A("image"),
    { name: "image_fit", selector: { select: { options: B, mode: "dropdown" } } },
    S("show_image"),
    S("show_placeholder"),
    S("show_power", !i.show_power && t.show_power !== !0),
    E("power_entity"),
    S("show_uptime", !i.show_uptime && t.show_uptime !== !0),
    E("uptime_entity"),
    S("show_battery", !i.show_battery && t.show_battery !== !0),
    E("battery_entity"),
    S("show_network", !i.show_network && t.show_network !== !0),
    E("network_entity"),
    S("show_location", !i.show_location && t.show_location !== !0),
    E("location_entity"),
    S("show_metrics", !i.show_metrics && t.show_metrics !== !0),
    S("show_temperature", !i.show_temperature && t.show_temperature !== !0),
    E("temperature_entity"),
    A("temperature_label"),
    S("show_memory", !i.show_memory && t.show_memory !== !0),
    E("memory_entity"),
    A("memory_label"),
    S("show_cpu", !i.show_cpu && t.show_cpu !== !0),
    E("cpu_entity"),
    A("cpu_label"),
    S("show_gpu", !i.show_gpu && t.show_gpu !== !0),
    E("gpu_entity"),
    A("gpu_label")
  ), a;
}
function Yn(t, e) {
  return t === !1 ? !1 : t === !0 ? !0 : e;
}
function Jt(t, e) {
  const n = Y(t.layout), i = ct(t.actions), a = K(t, e), r = {
    ...t,
    type: "custom:vha-device-card",
    layout: n,
    show_toggle: t.show_toggle !== !1,
    image_fit: t.image_fit || "auto"
  };
  if (n === "large")
    for (let o = 0; o < 3; o += 1)
      r[`action_${o + 1}_entity`] = i[o]?.entity ?? "", r[`action_${o + 1}_name`] = i[o]?.name ?? "";
  if (n === "electronics")
    for (const o of Ln)
      r[o] = Yn(t[o], !!a[o]);
  return r;
}
function Tt(t) {
  const e = { ...t, type: "custom:vha-device-card" };
  for (const i of Hn) {
    const a = e[i];
    if (typeof a == "string") {
      const r = a.trim();
      r ? e[i] = r : delete e[i];
    }
  }
  e.image_fit === "auto" && delete e.image_fit, e.layout = Y(typeof e.layout == "string" ? e.layout : void 0);
  const n = [1, 2, 3].map((i) => {
    const a = `action_${i}_entity`, r = `action_${i}_name`, o = a in t || r in t, s = typeof e[a] == "string" ? String(e[a]) : void 0, l = typeof e[r] == "string" ? String(e[r]) : void 0;
    return delete e[a], delete e[r], { present: o, entity: s, name: l };
  });
  if (n.some((i) => i.present)) {
    const i = ct(t.actions), a = [];
    n.forEach((r, o) => {
      const s = i[o];
      if (!r.entity && !r.name) {
        s?.mode && a.push(s);
        return;
      }
      a.push({
        entity: r.entity,
        name: r.name || s?.name,
        icon: s?.icon || ["steam", "chevron", "droplet"][o],
        mode: s?.mode
      });
    }), a.length ? e.actions = a : delete e.actions;
  }
  return e;
}
class zn extends HTMLElement {
  constructor() {
    super(...arguments), this._config = { type: "custom:vha-device-card" }, this._fallbackKey = "", this._rendering = !1;
  }
  set hass(e) {
    this._hass = e, this._render();
  }
  setConfig(e) {
    this._config = { type: "custom:vha-device-card", show_toggle: !0, ...e }, this._render();
  }
  _signature() {
    const e = K(this._config, this._hass);
    return `${Y(this._config.layout)}:${Object.values(e).join("")}`;
  }
  _emit(e) {
    const n = this._signature();
    this._config = e, this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: e }, bubbles: !0, composed: !0 })
    ), (!!(customElements.get("ha-form") && this._hass) || n !== this._signature()) && this._render();
  }
  _render() {
    if (!this._rendering) {
      this._rendering = !0;
      try {
        this._renderBody();
      } finally {
        this._rendering = !1;
      }
    }
  }
  _renderBody() {
    if (customElements.get("ha-form") && this._hass) {
      this._renderHaForm();
      return;
    }
    this._renderFallback();
  }
  _renderHaForm() {
    let e = this.querySelector("ha-form");
    e || (this.innerHTML = "", e = document.createElement("ha-form"), this.appendChild(e), e.addEventListener("value-changed", (n) => {
      const i = n.detail?.value;
      i && this._emit(Tt({ ...this._config, ...i }));
    })), e.hass = this._hass, e.schema = Bn(this._config, this._hass), e.data = Jt(this._config, this._hass), e.computeLabel = (n) => z[n.name] || n.name;
  }
  _renderFallback() {
    const e = Y(this._config.layout), n = K(this._config, this._hass), i = `${e}:${Object.values(n).join("")}`;
    this._fallbackKey !== i && (this._fallbackKey = i, this.innerHTML = `${In()}${Rn(e, n, this._config)}`, this.querySelectorAll("input, select").forEach((r) => {
      r.addEventListener("change", () => this._fromFallback()), r.addEventListener("input", () => this._fromFallback());
    }));
    const a = Jt(this._config, this._hass);
    this.querySelectorAll("[data-key]").forEach((r) => {
      const o = r.dataset.key || "", s = a[o];
      r instanceof HTMLInputElement && r.type === "checkbox" ? r.checked = s === !0 : r.value = s == null ? "" : String(s);
    });
  }
  _fromFallback() {
    const e = { ...this._config, type: "custom:vha-device-card" };
    this.querySelectorAll("[data-key]").forEach((n) => {
      const i = n.dataset.key || "";
      n instanceof HTMLInputElement && n.type === "checkbox" ? e[i] = n.checked : e[i] = n.value;
    }), this._emit(Tt(e));
  }
}
function In() {
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
function Rn(t, e, n) {
  const i = (s, l = "") => `<label>${z[s] || s}<input data-key="${s}" type="text" placeholder="${l}" /></label>`, a = (s, l) => `<label>${z[s]}<select data-key="${s}">${l.map((c) => `<option value="${c.value}">${c.label}</option>`).join("")}</select></label>`, r = (s) => {
    const l = n[s], c = !e[s] && l !== !0;
    return `<label class="row"><input data-key="${s}" type="checkbox" ${c ? "disabled" : ""}/> ${z[s]}</label>`;
  }, o = [
    i("entity", "light.living_room"),
    i("name", "可选"),
    a("layout", Pt)
  ];
  if (t === "vertical")
    return `<div class="vha-editor">${o.join("")}<p class="hint">竖图用滑杆调节，不另放电源开关。关态滑杆回到底部。</p>${i("image")}${i("images")}${a("image_fit", B)}</div>`;
  if (t === "electronics") {
    const s = [
      r("show_image"),
      r("show_placeholder"),
      r("show_power"),
      i("power_entity"),
      r("show_uptime"),
      i("uptime_entity"),
      r("show_battery"),
      i("battery_entity"),
      r("show_network"),
      i("network_entity"),
      r("show_location"),
      i("location_entity"),
      r("show_metrics"),
      r("show_temperature"),
      i("temperature_entity"),
      r("show_memory"),
      i("memory_entity"),
      r("show_cpu"),
      i("cpu_entity"),
      r("show_gpu"),
      i("gpu_entity")
    ];
    return `<div class="vha-editor">${o.join("")}${i("model")}${i("image")}${a("image_fit", B)}${s.join("")}<p class="hint">没有对应实体时，模块开关会禁用。关掉「指标」会收起温度、内存、CPU、GPU。</p></div>`;
  }
  return `<div class="vha-editor">${o.join("")}${i("model")}${i("status")}${i("image")}${a("image_fit", B)}<label class="row"><input data-key="show_toggle" type="checkbox" /> ${z.show_toggle}</label>${i("value_entity")}${i("action_1_entity")}${i("action_1_name")}${i("action_2_entity")}${i("action_2_name")}${i("action_3_entity")}${i("action_3_name")}<p class="hint">不填动作时，加湿器或风扇会用自己的模式生成右侧动作栏。栏宽不足 320px 时，动作栏改到图片下方横排。</p></div>`;
}
function Kt(t) {
  if (!Array.isArray(t)) return [];
  const e = [];
  for (const n of t) {
    if (!n || typeof n != "object") continue;
    const i = n, a = typeof i.entity == "string" ? i.entity.trim() : "", r = typeof i.name == "string" ? i.name.trim() : "";
    !a && !r || e.push({
      entity: a || void 0,
      name: r || void 0,
      show: i.show === !1 ? !1 : void 0
    });
  }
  return e;
}
function it(t) {
  const e = Math.max(0, Math.round(t)), n = Math.floor(e / 3600), i = Math.floor(e % 3600 / 60), a = e % 60;
  return n > 0 ? `${n}:${String(i).padStart(2, "0")}:${String(a).padStart(2, "0")}` : `${i}:${String(a).padStart(2, "0")}`;
}
function On(t, e = Date.now()) {
  const n = u(t.attributes.media_position);
  if (n == null) return;
  if (t.state !== "playing" && t.state !== "buffering") return n;
  const i = Date.parse(String(t.attributes.media_position_updated_at ?? ""));
  if (Number.isNaN(i)) return n;
  const a = u(t.attributes.media_duration), r = n + Math.max(0, (e - i) / 1e3);
  return a != null && a > 0 ? Math.min(a, r) : r;
}
function Vn(t, e = Date.now()) {
  if (!t || t.state === "unavailable") return "不可用";
  if (t.state === "unknown") return "未知";
  const n = x(t.attributes.media_title), i = On(t, e), a = u(t.attributes.media_duration);
  return i == null ? t.state === "off" ? "已关闭" : !n || t.state === "idle" || t.state === "standby" ? "空闲" : "无进度" : a != null && a > 0 ? `${it(i)} / ${it(a)}` : it(i);
}
function Gn(t, e, n = Date.now()) {
  const i = t.entity?.trim();
  if (!i) return at("empty", "请选择一个实体");
  const a = e?.states[i], r = t.name || x(a?.attributes.friendly_name) || i;
  if (v(i) !== "media_player")
    return { ...at("invalid", "请选择媒体播放器"), entityId: i, title: r };
  const o = Kt(t.rooms).filter((l) => l.show !== !1 && l.entity).map((l) => {
    const c = e?.states[l.entity], d = !c || c.state === "unavailable" || c.state === "unknown";
    return {
      entityId: l.entity,
      name: l.name || x(c?.attributes.friendly_name) || l.entity,
      on: !!(c && !d && g(c)),
      disabled: d || !O(l.entity)
    };
  });
  if (!a)
    return {
      ...at("card", "实体不存在"),
      entityId: i,
      title: r,
      timeLabel: "不可用",
      dim: !0,
      transportDisabled: !0,
      rooms: o
    };
  const s = a.state === "unavailable" || a.state === "unknown";
  return {
    kind: "card",
    entityId: i,
    title: r,
    image: t.image || x(a.attributes.entity_picture) || void 0,
    timeLabel: Vn(a, n),
    dim: s || a.state === "off" || a.state === "idle" || a.state === "standby",
    playing: g(a),
    transportDisabled: s,
    rooms: o
  };
}
function at(t, e) {
  return {
    kind: t,
    message: e,
    title: "",
    timeLabel: "",
    dim: !0,
    playing: !1,
    transportDisabled: !0,
    rooms: []
  };
}
async function Nn(t, e, n) {
  if (e.state === "unavailable" || e.state === "unknown")
    throw new Error(e.state === "unknown" ? "未知" : "不可用");
  const i = e.entity_id;
  if (n === "prev") {
    await t.callService("media_player", "media_previous_track", { entity_id: i });
    return;
  }
  if (n === "next") {
    await t.callService("media_player", "media_next_track", { entity_id: i });
    return;
  }
  e.state === "off" && await t.callService("media_player", "turn_on", { entity_id: i }), await t.callService(
    "media_player",
    g(e) ? "media_pause" : "media_play",
    { entity_id: i }
  );
}
async function Xn(t, e) {
  const n = t.states[e];
  if (!n || n.state === "unavailable" || n.state === "unknown")
    throw new Error(n?.state === "unknown" ? "未知" : "不可用");
  if (!O(e)) throw new Error("不能开关");
  await j(t, n);
}
class Pn extends HTMLElement {
  constructor() {
    super(), this._config = {}, this._error = "", this._broken = /* @__PURE__ */ new Set(), this._paintKey = "", this.attachShadow({ mode: "open" });
  }
  static getConfigElement() {
    return document.createElement("vha-media-card-editor");
  }
  static getStubConfig(e, n = [], i = []) {
    return en(e, n, i);
  }
  setConfig(e) {
    if (!e || typeof e != "object") throw new Error("VHA 媒体卡需要一份配置");
    this._config = { ...e }, this._error = "", this._render();
  }
  set hass(e) {
    this._hass = e, this._render();
  }
  get hass() {
    return this._hass;
  }
  getCardSize() {
    return 4;
  }
  getGridOptions() {
    return { columns: 6, min_columns: 2, rows: 4, min_rows: 3 };
  }
  connectedCallback() {
    this._render();
  }
  _ensureStyles() {
    !this.shadowRoot || this._sheet || (this._sheet = new CSSStyleSheet(), this._sheet.replaceSync($), this.shadowRoot.adoptedStyleSheets = [this._sheet]);
  }
  async _run(e) {
    if (!Q(this)) {
      try {
        await e(), this._error = "";
      } catch (n) {
        this._error = D(n);
      }
      this._render();
    }
  }
  _render() {
    if (!this.shadowRoot) return;
    this._ensureStyles();
    const e = Gn(this._config, this._hass), n = e.image && !this._broken.has(e.image) ? e.image : void 0, i = V(this._paintKey, { view: e, image: n ?? "", error: this._error });
    i.changed && (this.shadowRoot.innerHTML = Kn(e, n, this._error), this._bind(e), this._paintKey = i.key);
  }
  _bind(e) {
    const n = this.shadowRoot;
    n && (mt(n, (i) => ft(this, i)), n.querySelectorAll("[data-transport]").forEach((i) => {
      i.addEventListener("click", (a) => {
        a.stopPropagation(), a.preventDefault();
        const r = e.entityId ? this._hass?.states[e.entityId] : void 0, o = i.dataset.transport;
        !this._hass || !r || i.disabled || o !== "prev" && o !== "play" && o !== "next" || this._run(() => Nn(this._hass, r, o));
      });
    }), n.querySelectorAll("[data-room]").forEach((i) => {
      i.addEventListener("click", (a) => {
        a.stopPropagation(), a.preventDefault();
        const r = i.dataset.room || "";
        !this._hass || !r || i.disabled || this._run(() => Xn(this._hass, r));
      });
    }), n.querySelectorAll("img[data-src]").forEach((i) => {
      i.addEventListener("error", () => {
        const a = i.dataset.src;
        !a || this._broken.has(a) || (this._broken.add(a), this._render());
      });
    }));
  }
}
function Kn(t, e, n) {
  if (t.kind === "empty" || t.kind === "invalid")
    return `<ha-card class="card"><p class="warning">${p(t.message || "请选择一个实体")}</p></ha-card>`;
  const i = t.entityId || "", a = e ? `<img data-src="${h(e)}" src="${h(e)}" alt="">` : '<span class="disc-ph" aria-hidden="true"></span>', r = t.rooms.map(
    (s) => `<div class="room">
        <button class="room-name info" type="button" data-info="${h(s.entityId)}">${p(s.name)}</button>
        <button class="switch${s.on ? " on" : ""}" type="button" role="switch" aria-checked="${s.on}" data-room="${h(s.entityId)}" ${s.disabled ? "disabled" : ""} aria-label="${h(s.name)}"></button>
      </div>`
  ).join(""), o = t.transportDisabled ? "disabled" : "";
  return `<ha-card class="card media">
    <div class="layout-media">
      <div class="ihead">
        <button class="ititle info" type="button" data-info="${h(i)}">${p(t.title)}</button>
        <button class="overflow" type="button" data-info="${h(i)}" aria-label="更多信息">${J("ellipsis", 22)}</button>
      </div>
      <div class="media-body">
        <div class="player">
          <button class="media-time info" type="button" data-info="${h(i)}">${p(t.timeLabel)}</button>
          <button class="ring info${t.dim ? " is-off" : ""}" type="button" data-info="${h(i)}" aria-label="封面">${a}</button>
          <div class="transport">
            <button type="button" data-transport="prev" ${o} aria-label="上一首">${J("prev", 22)}</button>
            <button type="button" data-transport="play" ${o} aria-label="${t.playing ? "暂停" : "播放"}">${J(t.playing ? "pause" : "play", 22)}</button>
            <button type="button" data-transport="next" ${o} aria-label="下一首">${J("next", 22)}</button>
          </div>
        </div>
        ${r ? `<div class="rooms">${r}</div>` : ""}
      </div>
    </div>
    ${n ? `<p class="error">${p(n)}</p>` : ""}
  </ha-card>`;
}
const Zn = {
  entity: "实体",
  name: "名称（留空则使用友好名称）",
  image: "产品图（留空则使用实体图片）"
};
class Dn extends HTMLElement {
  constructor() {
    super(...arguments), this._config = { type: "custom:vha-media-card" }, this._painting = !1;
  }
  set hass(e) {
    this._hass = e, this._render();
  }
  setConfig(e) {
    this._config = { type: "custom:vha-media-card", ...e, rooms: Kt(e.rooms) }, this._painting || this._render();
  }
  _emit(e) {
    const n = { type: "custom:vha-media-card" };
    e.entity && (n.entity = e.entity), e.name && (n.name = e.name), e.image && (n.image = e.image), e.rooms?.length && (n.rooms = e.rooms), this._config = n, this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: n }, bubbles: !0, composed: !0 })), !this._painting && (this._painting = !0, this._render(), this._painting = !1);
  }
  _render() {
    const e = this.querySelector("[data-form]") ?? document.createElement("div"), n = this.querySelector("[data-extra]") ?? document.createElement("div");
    this.querySelector("[data-form]") || (e.setAttribute("data-form", ""), n.setAttribute("data-extra", ""), this.replaceChildren(e, n)), wt(e, {
      hass: this._hass,
      data: {
        entity: this._config.entity ?? "",
        name: this._config.name ?? "",
        image: this._config.image ?? ""
      },
      schema: [{ ...Z("entity", "media_player"), required: !0 }, T("name"), T("image")],
      labels: Zn,
      onChange: (a) => {
        this._emit({
          ...this._config,
          entity: rt(a.entity),
          name: rt(a.name),
          image: rt(a.image)
        });
      }
    }) || this._fallback(e), st(n, {
      title: "房间（可增删，取消显示则保留配置但不画出）",
      addLabel: "添加房间",
      columns: [
        { key: "entity", label: "实体", kind: "text" },
        { key: "name", label: "名称", kind: "text" },
        { key: "show", label: "显示", kind: "bool" }
      ],
      rows: (this._config.rooms ?? []).map((a) => ({
        entity: a.entity ?? "",
        name: a.name ?? "",
        show: a.show !== !1
      })),
      onChange: (a) => {
        const r = a.map((o) => ({
          entity: String(o.entity ?? "").trim() || void 0,
          name: String(o.name ?? "").trim() || void 0,
          show: o.show === !1 ? !1 : void 0
        })).filter((o) => o.entity || o.name);
        this._emit({ ...this._config, rooms: r });
      }
    });
  }
  _fallback(e) {
    e.querySelector("[data-key='entity']") || (e.innerHTML = `
        <style>${gt}</style>
        <div class="vha-editor">
          <label>实体 <input data-key="entity" type="text" placeholder="media_player.speaker" /></label>
          <label>名称 <input data-key="name" type="text" /></label>
          <label>产品图 <input data-key="image" type="text" placeholder="留空则使用实体图片" /></label>
        </div>`, e.querySelectorAll("input").forEach((n) => {
      n.addEventListener("change", () => {
        const i = (a) => e.querySelector(`[data-key="${a}"]`).value.trim();
        this._emit({
          ...this._config,
          entity: i("entity") || void 0,
          name: i("name") || void 0,
          image: i("image") || void 0
        });
      });
    })), e.querySelector("[data-key='entity']").value = this._config.entity ?? "", e.querySelector("[data-key='name']").value = this._config.name ?? "", e.querySelector("[data-key='image']").value = this._config.image ?? "";
  }
}
function rt(t) {
  return typeof t == "string" && t.trim() ? t.trim() : void 0;
}
function R(t) {
  return t === "metrics" ? "metrics" : "insight";
}
function jn(t, e) {
  const n = (e ?? "").replace(/\s+/g, "");
  return n === "%" || n === "％" ? t >= 70 ? "优" : t >= 50 ? "良" : t >= 30 ? "中" : "差" : t <= 50 ? "优" : t <= 100 ? "良" : t <= 150 ? "中" : "差";
}
const Zt = [8, 10, 12, 14, 16, 18, 20];
function Dt() {
  return Zt.map((t) => `${String(t).padStart(2, "0")}:00`);
}
function Wn(t, e, n = /* @__PURE__ */ new Date()) {
  if (!t.length) return [];
  const i = new Date(n);
  return i.setHours(0, 0, 0, 0), Zt.map((a) => {
    const r = i.getTime() + a * 3600 * 1e3;
    let o, s = 1 / 0;
    for (const c of t) {
      const d = Math.abs(c.at - r);
      d < s && (s = d, o = c);
    }
    const l = o && s <= 2 * 3600 * 1e3 ? o : void 0;
    return {
      label: `${String(a).padStart(2, "0")}:00`,
      text: l ? jn(l.value, e) : ""
    };
  });
}
function Un(t, e) {
  const n = Qn(t, e), i = [];
  for (const a of n) {
    if (!a || typeof a != "object") continue;
    const r = a, o = r.s ?? r.state, s = u(o), l = r.lu ?? r.last_updated ?? r.last_changed ?? r.lc, c = typeof l == "number" ? l : Date.parse(String(l ?? ""));
    s == null || Number.isNaN(c) || i.push({ at: c, value: s });
  }
  return i;
}
function Qn(t, e) {
  if (!t) return [];
  if (Array.isArray(t)) {
    const n = t.find((i) => Array.isArray(i) || i && typeof i == "object");
    return Array.isArray(n) ? n : t;
  }
  if (typeof t == "object" && t && e in t) {
    const n = t[e];
    return Array.isArray(n) ? n : [];
  }
  return [];
}
function _n(t) {
  if (!Array.isArray(t)) return [];
  const e = [];
  for (const n of t) {
    if (!n || typeof n != "object") continue;
    const i = n, a = typeof i.name == "string" ? i.name.trim() : "", r = typeof i.entity == "string" ? i.entity.trim() : "", o = typeof i.mode == "string" ? i.mode.trim() : "";
    !a && !r || e.push({ name: a || void 0, entity: r || void 0, mode: o || void 0 });
  }
  return e;
}
function $n(t) {
  if (!Array.isArray(t)) return [];
  const e = [];
  for (const n of t) {
    if (!n || typeof n != "object") continue;
    const i = n, a = typeof i.entity == "string" ? i.entity.trim() : "";
    if (!a) continue;
    const r = typeof i.name == "string" ? i.name.trim() : "";
    e.push({ entity: a, name: r || void 0 });
  }
  return e;
}
function ti(t, e) {
  if (!t || t.state === "unavailable" || t.state === "unknown") return !1;
  if (!e) return g(t);
  const n = v(t.entity_id);
  return n === "climate" ? t.state === e : n === "fan" ? t.attributes.preset_mode === e : t.attributes.mode === e;
}
function ei(t) {
  return t ? t.state === "on" ? "开" : t.state === "off" ? "关" : Ht(t) : "不可用";
}
function lt(t) {
  if (!t) return { fraction: 0, label: "不可用", supported: !1 };
  if (t.state === "unavailable") return { fraction: 0, label: "不可用", supported: !1 };
  if (t.state === "unknown") return { fraction: 0, label: "未知", supported: !1 };
  const e = v(t.entity_id);
  if (e === "humidifier") {
    const n = u(t.attributes.min_humidity) ?? 30, i = u(t.attributes.max_humidity) ?? 80, a = u(t.attributes.humidity) ?? n, r = Math.max(1, i - n);
    return {
      fraction: Math.min(1, Math.max(0, (a - n) / r)),
      label: b(a, "%"),
      supported: !0
    };
  }
  if (e === "number" || e === "input_number") {
    const n = u(t.attributes.min) ?? 0, i = u(t.attributes.max) ?? 100, a = u(t.state) ?? n, r = Math.max(1, i - n);
    return {
      fraction: Math.min(1, Math.max(0, (a - n) / r)),
      label: b(a, C(t)),
      supported: !0
    };
  }
  if (e === "fan") {
    const n = u(t.attributes.percentage) ?? 0;
    return { fraction: n / 100, label: b(n, "%"), supported: !0 };
  }
  return { fraction: 0, label: "不能调节", supported: !1 };
}
function ni(t, e) {
  const n = v(t.entity_id), i = Math.min(1, Math.max(0, e));
  if (n === "humidifier") {
    const a = u(t.attributes.min_humidity) ?? 30, r = u(t.attributes.max_humidity) ?? 80, o = Math.round(a + i * (r - a));
    return { service: "set_humidity", data: { entity_id: t.entity_id, humidity: o } };
  }
  if (n === "number" || n === "input_number") {
    const a = u(t.attributes.min) ?? 0, r = u(t.attributes.max) ?? 100, o = u(t.attributes.step) ?? 1, s = a + i * (r - a), l = Math.round((s - a) / o), c = Math.min(r, Math.max(a, a + l * o));
    return { service: "set_value", data: { entity_id: t.entity_id, value: c } };
  }
  if (n === "fan") {
    const a = Math.round(i * 100);
    return { service: "set_percentage", data: { entity_id: t.entity_id, percentage: a } };
  }
}
function ii(t) {
  if (!t) return { value: "不可用", tagline: "实体不存在" };
  if (t.state === "unavailable") return { value: "不可用", tagline: "不可用" };
  if (t.state === "unknown") return { value: "未知", tagline: "未知" };
  const e = u(t.state);
  return e == null ? t.state === "on" ? { value: "开", tagline: "" } : t.state === "off" ? { value: "关", tagline: "" } : { value: t.state, tagline: "" } : { value: b(e, C(t)), tagline: "" };
}
function ai(t, e) {
  const n = R(t.layout), i = $n(t.metrics), a = t.entity?.trim();
  if (n === "metrics") {
    const y = i.length ? i : a ? [{ entity: a, name: t.name }] : [];
    if (!y.length)
      return { kind: "empty", layout: n, title: "", caption: "", value: "", tagline: "", showTimeline: !1, chips: [], tiles: [], message: "请选择一个实体" };
    const k = y.map((F) => {
      const xt = F.entity && e ? e.states[F.entity] : void 0;
      return {
        entityId: F.entity || "",
        label: F.name || x(xt?.attributes.friendly_name) || F.entity || "指标",
        value: ei(xt)
      };
    }), tt = t.name || k[0]?.label || "用电";
    return {
      kind: "metrics",
      layout: n,
      entityId: a,
      title: tt,
      caption: "",
      value: "",
      tagline: "",
      showTimeline: !1,
      chips: [],
      tiles: k
    };
  }
  if (!a)
    return { kind: "empty", layout: n, title: "", caption: "", value: "", tagline: "", showTimeline: !1, chips: [], tiles: [], message: "请选择一个实体" };
  const r = v(a), o = e?.states[a], s = ["sensor", "binary_sensor", "number", "input_number"].includes(r), l = t.name || x(o?.attributes.friendly_name) || a;
  if (!s)
    return {
      kind: "invalid",
      layout: n,
      entityId: a,
      title: l,
      caption: "",
      value: "",
      tagline: "",
      showTimeline: !1,
      chips: [],
      tiles: [],
      message: "请选择传感器"
    };
  const c = ii(o), d = _n(t.chips).map((y) => {
    const k = y.entity && e ? e.states[y.entity] : void 0, tt = !!(y.entity && e && !k), F = !y.entity || !k || k.state === "unavailable" || k.state === "unknown";
    return {
      name: y.name || x(k?.attributes.friendly_name) || "模式",
      entityId: y.entity,
      mode: y.mode,
      selected: ti(k, y.mode),
      disabled: F || tt
    };
  }), f = t.target_entity?.trim();
  let w;
  if (f) {
    const y = e?.states[f], k = lt(y);
    w = {
      entityId: f,
      label: t.target_label || x(y?.attributes.friendly_name) || "目标",
      fraction: k.fraction,
      valueLabel: y ? k.label : "实体不存在",
      disabled: !y || !k.supported || y.state === "unavailable" || y.state === "unknown",
      supported: !!(y && k.supported)
    };
  }
  const m = c.tagline;
  return {
    kind: "insight",
    layout: n,
    entityId: a,
    title: l,
    caption: t.caption || "空气质量",
    value: c.value,
    tagline: t.status || m,
    showTimeline: t.show_timeline !== !1,
    chips: d,
    target: w,
    tiles: []
  };
}
async function ri(t, e) {
  if (!e.entityId) return;
  const n = t.states[e.entityId];
  if (!n || n.state === "unavailable" || n.state === "unknown") throw new Error(n?.state === "unknown" ? "未知" : "不可用");
  const i = v(n.entity_id);
  if (e.mode && i === "climate") {
    n.state === "off" && await t.callService("climate", "turn_on", { entity_id: n.entity_id }), await t.callService("climate", "set_hvac_mode", { entity_id: n.entity_id, hvac_mode: e.mode });
    return;
  }
  if (e.mode && i === "humidifier") {
    await t.callService("humidifier", "set_mode", { entity_id: n.entity_id, mode: e.mode });
    return;
  }
  if (e.mode && i === "fan") {
    await t.callService("fan", "set_preset_mode", { entity_id: n.entity_id, preset_mode: e.mode });
    return;
  }
  await j(t, n);
}
async function oi(t, e, n) {
  const i = t.states[e];
  if (!i || i.state === "unavailable" || i.state === "unknown")
    throw new Error(i?.state === "unknown" ? "未知" : "不可用");
  const a = ni(i, n);
  if (!a) throw new Error("不能调节");
  await t.callService(v(e), a.service, a.data);
}
class si extends HTMLElement {
  constructor() {
    super(), this._config = {}, this._error = "", this._dragging = !1, this._historyToken = 0, this._paintKey = "", this.attachShadow({ mode: "open" });
  }
  static getConfigElement() {
    return document.createElement("vha-sensor-card-editor");
  }
  static getStubConfig(e, n = [], i = []) {
    return tn(e, n, i);
  }
  setConfig(e) {
    if (!e || typeof e != "object") throw new Error("VHA 传感器卡需要一份配置");
    this._config = { ...e }, this._error = "", this._render();
  }
  set hass(e) {
    this._hass = e, !this._dragging && this._render();
  }
  get hass() {
    return this._hass;
  }
  getCardSize() {
    return this._config.layout === "metrics" ? 4 : 7;
  }
  getGridOptions() {
    return this._config.layout === "metrics" ? { columns: 3, min_columns: 2, rows: 4, min_rows: 3 } : { columns: 6, min_columns: 2, rows: 6, min_rows: 4 };
  }
  connectedCallback() {
    this._render();
  }
  _ensureStyles() {
    !this.shadowRoot || this._sheet || (this._sheet = new CSSStyleSheet(), this._sheet.replaceSync($), this.shadowRoot.adoptedStyleSheets = [this._sheet]);
  }
  async _run(e) {
    if (!Q(this)) {
      try {
        await e(), this._error = "";
      } catch (n) {
        this._error = D(n);
      }
      this._render();
    }
  }
  _render() {
    if (!this.shadowRoot || this._dragging) return;
    this._ensureStyles();
    const e = ai(this._config, this._hass), n = V(this._paintKey, { view: e, error: this._error });
    n.changed && (this.shadowRoot.innerHTML = di(e, this._error), this._bind(e), this._paintKey = n.key, e.kind === "insight" && e.showTimeline && e.entityId && this._loadHistory(e.entityId));
  }
  async _loadHistory(e) {
    const n = ++this._historyToken, i = this._hass;
    if (!i?.callWS) return;
    const a = /* @__PURE__ */ new Date(), r = /* @__PURE__ */ new Date();
    r.setHours(0, 0, 0, 0);
    try {
      const o = await i.callWS({
        type: "history/history_during_period",
        start_time: r.toISOString(),
        end_time: a.toISOString(),
        entity_ids: [e],
        minimal_response: !0,
        no_attributes: !0
      });
      if (n !== this._historyToken || this._dragging) return;
      const s = i.states[e], l = Wn(Un(o, e), C(s), a), c = this.shadowRoot?.querySelector("[data-timeline]");
      if (!c) return;
      const d = l.some((f) => f.text);
      c.innerHTML = d ? ci(l) : '<p class="timeline-empty">暂无历史</p>';
    } catch {
      const o = this.shadowRoot?.querySelector("[data-timeline]");
      o && n === this._historyToken && (o.innerHTML = '<p class="timeline-empty">暂无历史</p>');
    }
  }
  _bind(e) {
    const n = this.shadowRoot;
    if (!n) return;
    mt(n, (a) => ft(this, a)), n.querySelectorAll("[data-chip]").forEach((a) => {
      a.addEventListener("click", (r) => {
        r.stopPropagation(), r.preventDefault();
        const o = e.chips[Number(a.dataset.chip)];
        !this._hass || !o || a.disabled || this._run(() => ri(this._hass, o));
      });
    });
    const i = n.querySelector("[data-slider='target']");
    if (i && e.target) {
      const a = e.target;
      Vt(i, {
        labelFor: (r) => {
          const o = this._hass?.states[a.entityId];
          return o ? li(o.entity_id, o, r) : yt(r);
        },
        setDragging: (r) => {
          this._dragging = r;
        },
        commit: (r) => {
          this._hass && this._run(() => oi(this._hass, a.entityId, r));
        }
      });
    }
  }
}
function P(t, e) {
  return typeof t == "number" && Number.isFinite(t) ? t : e;
}
function li(t, e, n) {
  if (t.startsWith("humidifier.")) {
    const r = P(e.attributes.min_humidity, 30), o = P(e.attributes.max_humidity, 80);
    return lt({
      ...e,
      attributes: { ...e.attributes, humidity: Math.round(r + n * (o - r)) }
    }).label;
  }
  if (t.startsWith("fan.")) return yt(n);
  const i = P(e.attributes.min, 0), a = P(e.attributes.max, 100);
  return lt({
    ...e,
    state: String(i + n * (a - i))
  }).label;
}
function ci(t) {
  const e = Dt().map((i) => `<span>${p(i)}</span>`).join(""), n = t.map((i) => `<span>${p(i.text)}</span>`).join("");
  return `<div class="thours">${e}</div><div class="tticks"></div><div class="tbands">${n}</div>`;
}
function di(t, e) {
  if (t.kind === "empty" || t.kind === "invalid")
    return `<ha-card class="card"><p class="warning">${p(t.message || "请选择一个实体")}</p></ha-card>`;
  const n = e ? `<p class="error">${p(e)}</p>` : "";
  if (t.kind === "metrics") {
    const l = t.tiles.map(
      (c) => `<button class="tile" type="button" data-info="${h(c.entityId)}"><span class="k">${p(c.label)}</span><span class="v">${p(c.value)}</span></button>`
    ).join("");
    return `<ha-card class="card metrics">
      <div class="layout-metrics">
        <button class="metrics-title info" type="button" data-info="${h(t.tiles[0]?.entityId || t.entityId || "")}">${p(t.title)}</button>
        <div class="stack-tiles">${l}</div>
      </div>
      ${n}
    </ha-card>`;
  }
  const i = t.entityId || "", a = t.chips.map(
    (l, c) => `<button class="chip" type="button" data-chip="${c}" aria-pressed="${l.selected}" ${l.disabled ? "disabled" : ""}>${p(l.name)}</button>`
  ).join(""), r = t.showTimeline ? `<div class="timeline" data-timeline><div class="thours">${Dt().map((l) => `<span>${l}</span>`).join("")}</div><div class="tticks"></div><p class="timeline-empty">暂无历史</p></div>` : "", o = t.target ? `<div class="fanblock">
        <p class="fan-label">${p(t.target.label)}</p>
        <div class="hslider" data-slider="target" role="slider" tabindex="${t.target.disabled ? "-1" : "0"}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(t.target.fraction * 100)}" aria-label="${h(t.target.label)}" data-disabled="${t.target.disabled}" style="--p:${t.target.fraction}">
          <div class="htrack"><span class="hthumb"></span></div>
          <span class="hpct">${p(t.target.valueLabel)}</span>
        </div>
      </div>` : "", s = t.tagline ? `<button class="tagline info" type="button" data-info="${h(i)}">${p(t.tagline)}</button>` : "";
  return `<ha-card class="card card-lg insight">
    <div class="layout-insight">
      <div class="ihead">
        <button class="ititle info" type="button" data-info="${h(i)}">${p(t.title)}</button>
        <button class="overflow" type="button" data-info="${h(i)}" aria-label="更多信息">${J("ellipsis", 22)}</button>
      </div>
      <button class="eyebrow info" type="button" data-info="${h(i)}">${p(t.caption)}</button>
      <button class="hero info" type="button" data-info="${h(i)}">${p(t.value)}</button>
      ${s}
      ${r}
      ${a ? `<div class="chips">${a}</div>` : ""}
      ${o}
    </div>
    ${n}
  </ha-card>`;
}
const ui = {
  entity: "实体",
  name: "名称（留空则使用友好名称）",
  layout: "排版形式",
  caption: "眉题（如空气质量）",
  status: "短说明（留空则自动）",
  show_timeline: "显示时间轴",
  target_entity: "加湿器目标（留空则不显示、不调节）",
  target_label: "目标滑杆名称"
};
class pi extends HTMLElement {
  constructor() {
    super(...arguments), this._config = { type: "custom:vha-sensor-card", layout: "insight" }, this._painting = !1;
  }
  set hass(e) {
    this._hass = e, this._render();
  }
  setConfig(e) {
    this._config = { type: "custom:vha-sensor-card", layout: "insight", show_timeline: !0, ...e }, this._painting || this._render();
  }
  _emit(e) {
    this._config = hi(e), this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: !0, composed: !0 })
    ), !this._painting && (this._painting = !0, this._render(), this._painting = !1);
  }
  _render() {
    const e = R(this._config.layout), n = this.querySelector("[data-form]") ?? document.createElement("div"), i = this.querySelector("[data-extra]") ?? document.createElement("div");
    this.querySelector("[data-form]") || (n.setAttribute("data-form", ""), i.setAttribute("data-extra", ""), this.replaceChildren(n, i));
    const a = [
      { ...Z("entity"), required: e === "insight" },
      T("name"),
      qn("layout", [
        { value: "insight", label: "洞察（空气质量）" },
        { value: "metrics", label: "指标（用电）" }
      ])
    ];
    e === "insight" && a.push(
      T("caption"),
      T("status"),
      Xt("show_timeline"),
      Z("target_entity"),
      T("target_label")
    );
    const r = {
      entity: this._config.entity ?? "",
      name: this._config.name ?? "",
      layout: e,
      caption: this._config.caption ?? "",
      status: this._config.status ?? "",
      show_timeline: this._config.show_timeline !== !1,
      target_entity: this._config.target_entity ?? "",
      target_label: this._config.target_label ?? ""
    };
    if (wt(n, {
      hass: this._hass,
      data: r,
      schema: a,
      labels: ui,
      onChange: (s) => {
        this._emit({
          ...this._config,
          entity: H(s.entity),
          name: H(s.name),
          layout: s.layout === "metrics" ? "metrics" : "insight",
          caption: H(s.caption),
          status: H(s.status),
          show_timeline: s.show_timeline !== !1,
          target_entity: H(s.target_entity),
          target_label: H(s.target_label)
        });
      }
    }) || this._fallback(n), e === "metrics") {
      st(i, {
        title: "指标磁贴",
        addLabel: "添加指标",
        columns: [
          { key: "entity", label: "实体", kind: "text" },
          { key: "name", label: "名称", kind: "text" }
        ],
        rows: (this._config.metrics ?? []).map((s) => ({ entity: s.entity ?? "", name: s.name ?? "" })),
        onChange: (s) => {
          const l = s.map((c) => ({ entity: String(c.entity ?? "").trim(), name: String(c.name ?? "").trim() || void 0 })).filter((c) => c.entity);
          this._emit({ ...this._config, metrics: l });
        }
      });
      return;
    }
    st(i, {
      title: "模式芯片（不填则不显示）",
      addLabel: "添加芯片",
      columns: [
        { key: "name", label: "名称", kind: "text" },
        { key: "entity", label: "实体", kind: "text" },
        { key: "mode", label: "模式值（可空）", kind: "text" }
      ],
      rows: (this._config.chips ?? []).map((s) => ({
        name: s.name ?? "",
        entity: s.entity ?? "",
        mode: s.mode ?? ""
      })),
      onChange: (s) => {
        const l = s.map((c) => ({
          name: String(c.name ?? "").trim() || void 0,
          entity: String(c.entity ?? "").trim() || void 0,
          mode: String(c.mode ?? "").trim() || void 0
        })).filter((c) => c.name || c.entity);
        this._emit({ ...this._config, chips: l });
      }
    });
  }
  _fallback(e) {
    const n = R(this._config.layout);
    if (e.querySelector("[data-key='entity']") && e.dataset.layout === n) {
      e.querySelector("[data-key='entity']").value = this._config.entity ?? "", e.querySelector("[data-key='name']").value = this._config.name ?? "", e.querySelector("[data-key='layout']").value = R(this._config.layout);
      const a = e.querySelector("[data-key='caption']");
      a && (a.value = this._config.caption ?? "");
      const r = e.querySelector("[data-key='status']");
      r && (r.value = this._config.status ?? "");
      const o = e.querySelector("[data-key='show_timeline']");
      o && (o.checked = this._config.show_timeline !== !1);
      const s = e.querySelector("[data-key='target_entity']");
      s && (s.value = this._config.target_entity ?? "");
      const l = e.querySelector("[data-key='target_label']");
      l && (l.value = this._config.target_label ?? "");
      return;
    }
    const i = n === "insight";
    e.dataset.layout = n, e.innerHTML = `
      <style>${gt}</style>
      <div class="vha-editor">
        <label>实体 <input data-key="entity" type="text" placeholder="sensor.air_quality" /></label>
        <label>名称 <input data-key="name" type="text" /></label>
        <label>排版形式
          <select data-key="layout">
            <option value="insight">洞察（空气质量）</option>
            <option value="metrics">指标（用电）</option>
          </select>
        </label>
        ${i ? `<label>眉题 <input data-key="caption" type="text" /></label>
        <label>短说明 <input data-key="status" type="text" /></label>
        <label class="row"><input data-key="show_timeline" type="checkbox" /> 显示时间轴</label>
        <label>加湿器目标（留空不显示） <input data-key="target_entity" type="text" /></label>
        <label>目标滑杆名称 <input data-key="target_label" type="text" /></label>` : ""}
      </div>`, e.querySelectorAll("input, select").forEach((a) => {
      a.addEventListener("change", () => this._fromFallback(e));
    }), this._fallback(e);
  }
  _fromFallback(e) {
    const n = (i) => e.querySelector(`[data-key="${i}"]`)?.value.trim();
    this._emit({
      ...this._config,
      entity: n("entity") || void 0,
      name: n("name") || void 0,
      layout: n("layout") === "metrics" ? "metrics" : "insight",
      caption: n("caption") || void 0,
      status: n("status") || void 0,
      show_timeline: e.querySelector("[data-key='show_timeline']")?.checked !== !1,
      target_entity: n("target_entity") || void 0,
      target_label: n("target_label") || void 0
    });
  }
}
function H(t) {
  return typeof t == "string" && t.trim() ? t.trim() : void 0;
}
function hi(t) {
  const e = { type: "custom:vha-sensor-card", layout: R(t.layout) };
  return t.entity && (e.entity = t.entity), t.name && (e.name = t.name), t.caption && (e.caption = t.caption), t.status && (e.status = t.status), t.show_timeline === !1 && (e.show_timeline = !1), t.target_entity && (e.target_entity = t.target_entity), t.target_label && (e.target_label = t.target_label), t.chips?.length && (e.chips = t.chips), t.metrics?.length && (e.metrics = t.metrics), e;
}
const fi = [
  ["vha-device-card", sn, "vha-device-card-editor", zn],
  ["vha-climate-card", Cn, "vha-climate-card-editor", Tn],
  ["vha-sensor-card", si, "vha-sensor-card-editor", pi],
  ["vha-media-card", Pn, "vha-media-card-editor", Dn]
];
for (const [t, e, n, i] of fi)
  customElements.get(t) || customElements.define(t, e), customElements.get(n) || customElements.define(n, i);
window.customCards = window.customCards || [];
const mi = [
  {
    type: "vha-device-card",
    name: "VHA 设备卡",
    description: "设备卡：大图设备、竖图滑杆、电子设备模块三种排版。"
  },
  {
    type: "vha-climate-card",
    name: "VHA 气候卡",
    description: "气候卡：制热与制冷共用一张洞察卡，含模式芯片和风速滑杆。"
  },
  {
    type: "vha-sensor-card",
    name: "VHA 传感器卡",
    description: "传感器卡：空气质量洞察或用电指标，两种排版。"
  },
  {
    type: "vha-media-card",
    name: "VHA 媒体卡",
    description: "媒体卡：圆形播放器与可配置的房间开关。"
  }
];
for (const t of mi)
  window.customCards.some((e) => e.type === t.type) || window.customCards.push({ ...t, preview: !0 });
console.info(
  "%c VHA %c 1.0.0 ",
  "background:#3d82f2;color:#fff;border-radius:4px 0 0 4px;padding:2px 6px",
  "background:#111;color:#fff;border-radius:0 4px 4px 0;padding:2px 6px"
);
