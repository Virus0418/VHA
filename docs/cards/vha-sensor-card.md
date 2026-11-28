# 传感器卡 `custom:vha-sensor-card`

工单：[#4](https://github.com/Virus0418/VHA/issues/4)。目标列：待审查。尚未在真实 Home Assistant 上验收，不能标「卡片通过」。

同一类型用 `layout` 切换两种排版。宽度跟着栏走，不把设计稿上的 480 或 220 写死。

## 洞察 `layout: insight`

对应空气质量展示。省略 `layout` 时也是这种。

- 圆角 44，内边距 32 / 28 / 28，渐变 `#FFEDC5 → #F8F0C8 → #F0F0D8 → #E7F1EE → #D8EBFF`。
- 眉题、主数值、可选短说明。主数值和单位之间有空格，例如 `35 %`。
- `show_timeline` 省略或为真时，向 Home Assistant 请求当天历史，画 08:00 到 20:00 的七段。有样本才标「优 / 良 / 中 / 差」。没有历史时显示「暂无历史」，不编造 Good / Poor。百分比按数值高低分档；其他单位按数值越低越好（接近 AQI）。
- 模式芯片只有配置了 `chips` 才出现。芯片可以切关联实体的模式，或在没有 `mode` 时开关该实体。
- 底部目标滑杆只有填写了 `target_entity` 才出现，并允许调节。留空时不显示、不写入，也不会默认再绑一台加湿器。百分比写成 `45 %`。可写的域：`humidifier`（`set_humidity`）、`number` / `input_number`（`set_value`）、`fan`（`set_percentage`）。

主实体域：`sensor`、`binary_sensor`、`number`、`input_number`。

## 指标 `layout: metrics`

对应用电展示。渐变 `#E4F0FB → #E8EDF5 → #F0EBEC`，圆角 40。标题居中，窄栏时按约 4.6em 折行。下面是白磁贴，每块一个名称和一个带空格的数值。

- 写了 `metrics` 就用这些磁贴，可以增删。
- 没写 `metrics` 时，用主实体画一块磁贴。
- 内边距用 28 / 20 / 20，磁贴间距 12。规范里那处 18px 底部留白是已知问题，不当作新规范。

## 本轮不做

工单里的体重曲线、统计、电量、连通性、能耗色带、主机多指标、横排 glance 仍未实现。不要把本轮的两种排版当成那九种布局已经完成。

## 状态

不可用显示「不可用」，未知显示「未知」，芯片和目标滑杆禁用。域不对、实体被删、历史请求失败时不白屏。服务失败在卡上留一句短错误。点标题或主数值打开更多信息。

## 配置项

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `layout` | 否 | `insight` 或 `metrics`。省略为 `insight` |
| `entity` | 洞察必填 | 主传感器。指标排版可省略，改由 `metrics` 提供实体 |
| `name` | 否 | 标题 |
| `caption` | 否 | 洞察眉题，例如空气质量 |
| `status` | 否 | 洞察短说明。留空则自动 |
| `show_timeline` | 否 | 洞察时间轴，默认显示 |
| `chips` | 否 | `{ name, entity, mode? }`。不填不显示 |
| `target_entity` | 否 | 底部目标。不填不显示、不调节 |
| `target_label` | 否 | 目标滑杆名称 |
| `metrics` | 否 | `{ entity, name? }`，仅指标排版 |

```yaml
type: custom:vha-sensor-card
layout: insight
entity: sensor.bedroom_air
name: Bedroom
caption: Air Quality
chips:
  - name: Purify
    entity: fan.purify
    mode: auto
target_entity: humidifier.bedroom
target_label: Humidifier — Target
```

```yaml
type: custom:vha-sensor-card
layout: metrics
name: Power Usage
metrics:
  - entity: sensor.solar_power
    name: Solar
  - entity: sensor.grid_power
    name: Grid
```
