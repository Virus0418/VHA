# 提醒卡 `custom:vha-reminder-card`

工单：@@ISSUE_REMINDER@@  
看板：@@PROJECT_URL@@ ，列「待办」

## 目标

对齐设计稿 Smart Reminder：上面是告警或状态列表，底部是一条 Today Usage 洞察。

当前两个视图都没有同类卡。markdown 欢迎语和「数据面板」标题继续用 HA 原生，这张卡不做欢迎栏。

它是按设计稿新增的能力，不替换某一张现成的 mushroom 或 tile。列表项来自用户配置的实体。

## 适配实体

每一条可以是：

- `binary_sensor`
- `lock`
- `switch`
- `input_boolean`

洞察条挂一个 `sensor`，例如今日用电，用来写对比文案。没有洞察实体时不显示底条。

设计稿上的两条示例（实现时做成配置，不要写死文案和实体）：

- 门锁仍未锁：图标、标题、说明「主门已解锁 12 分钟」、右侧开关
- 加湿器仍在运行：图标、标题、说明、右侧开关
- 底部：今日用电 2.4 kWh，比昨天低 18%

家里如果还没有这些实体，卡片仍然要能配上任意锁、开关和用电传感器。

## 功能设计

- `items` 列表。每项：实体、标题、说明模板、是否显示开关。
- 说明支持简单模板：实体状态、友好名称、以及「自上次变化经过的时间」。门锁示例里的「12 分钟」来自 `last_changed`，不是写死的句子。
- 有开关的项可以切换：锁调用 lock / unlock，开关和 input_boolean 调用 turn_on / turn_off。
- 无开关的项只展示。`binary_sensor` 默认无开关。
- 洞察：图标、标题、一行对比文案。文案模板可读今日值，以及相对昨天的百分比（用统计数据；算不出来就只显示今日值，不编造 18%）。
- 列表为空时显示一行「没有提醒」，不塌成 0 高度。

## 交互入口

| 操作 | 结果 |
| --- | --- |
| 点击一行的文字或图标 | 该项实体的 more-info |
| 点击右侧开关 | 只切换该项，不打开 more-info |
| 无 `show_toggle` 或实体不可切换 | 不显示开关 |
| 点击洞察条 | 若配置了 `insight.entity`，打开该传感器 more-info |
| 不可用 | 该行开关禁用，说明显示「不可用」 |

## 前端界面需求

对齐设计稿 Smart Reminder：

- 白底、16px 圆角，内部分成列表和底条。
- 每行：左图标（线框，圆角方底），中间标题 14px 加粗、说明 12px `#6f747c` 最多两行，右侧设备卡同款开关。
- 行与行之间留白，不用粗分割线。
- 底条浅蓝背景（约 `#e8f1ff`），圆角略小，左图标，标题「今日用电」一类，下面一行对比文案。设计稿是灯泡图标加 “Today Usage / 2.4 kWh used today · 18% lower than yesterday”。中文默认：「今日用电」和「今日 2.4 kWh · 比昨天低 18%」。颜色保持浅蓝，不要改成能耗卡的彩虹色带。
- 标题栏可以有卡片名「Smart Reminder」或配置的 `name`，右上 ⋮ 打开第一项或卡片帮助。⋮ 不是必须；若保留，点击打开 more-info 会不清楚，因此 ⋮ 改为不放置，避免和设备卡的实体 ⋮ 混淆。卡片名称用 14px 放在列表上方即可。
- 建议网格：6 列、4 行，随条目变高。

## 配置项

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 否 | 默认「提醒」 |
| `items` | 是 | 至少一项。见下表 |
| `insight` | 否 | 不填则没有底条 |

`items` 每项：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `entity` | 是 | 行实体 |
| `title` | 否 | 默认友好名称 |
| `description` | 否 | 模板。可用 `state`、`relative_time`。留空则用状态文案 |
| `show_toggle` | 否 | 锁和开关默认 true，binary_sensor 默认 false |
| `icon` | 否 | mdi 图标 |

`insight`：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `entity` | 是 | 传感器 |
| `title` | 否 | 默认「今日用电」 |
| `description` | 否 | 模板。可用今日值、昨日对比。留空则自动生成 |

示例：

```yaml
type: custom:vha-reminder-card
name: 提醒
items:
  - entity: lock.front_door
    title: 前门仍未锁
    description: "主门已{{ '解锁' if is_state(entity, 'unlocked') else '锁上' }} {{ relative_time }}"
    show_toggle: true
  - entity: switch.humidifier
    title: 加湿器仍在运行
    description: 未检测到移动，加湿器还开着
    show_toggle: true
insight:
  entity: sensor.today_energy
  title: 今日用电
```

示例实体是设计稿语义，不是当前仪表盘里的 ID。用电可以改挂卧室空调的耗电传感器，或以后单独的全屋今日电量。对比百分比只有统计源里真有昨天的数据才显示。

模板若实现成本高，第一版可以只支持：固定文案、`{{ state }}`、`{{ relative_time }}`。不要引入完整 Jinja 之外再做一套不可测的语言；若直接使用 HA 模板引擎，则与卡片其他模板一致，并在编辑器里写明。

## 验收要点

1. 两行配置能出现图标、标题、说明、开关，底条是浅蓝洞察，整体接近设计稿。
2. 门锁开关调用 lock / unlock；普通开关调用 turn_on / turn_off。
3. `show_toggle: false` 的行没有开关，点击行打开 more-info。
4. 不配 `insight` 时没有底条空白。
5. 昨天的用电不存在时，底条不显示虚构的百分比。
6. 欢迎语用的 markdown 不受影响，本卡没有欢迎文案槽位。
7. 卡片可单独添加。
