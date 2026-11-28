# 设备卡 `custom:vha-device-card`

工单：[#2](https://github.com/Virus0418/VHA/issues/2)。

同一张卡有三种排版，用字段 `layout` 切换。不另注册卡片类型，也不为电脑、手机、平板、笔记本各做一套外壳。省略 `layout`，或写成 `picture`、`compact` 以及其他无法识别的值，都按大图设备显示，因此旧的 Quick Access YAML 仍能打开。

在「添加卡片」里，按加湿器、灯、风扇、开关这个顺序挑一台已有实体做示意。加湿器、风扇和开关用大图，灯用竖图。没有这些实体时仍显示「请选择一个实体」。示意不会向设备发服务。

视觉以 [设计规范 1.0](../design-spec-1.0.md) 为准：底色 `#F0EFF2`，圆角 40，内边距与间距 24 / 16（大图为 24 / 20 / 24 / 24），阴影 `0 10px 28px rgba(0,0,0,0.07)`。宽度跟着 Home Assistant 的栏走，不把设计稿上的 220 或 448 写死。

## 三种形式

### 大图设备 `layout: large`

大数值、电源开关、产品图，右侧最多三枚动作。适合加湿器、风扇，以及原来的产品图瓦。

- 主数值优先读 `value_entity`，否则读主实体上的湿度、亮度等。数值和单位之间有空格，例如 `35 %`。没有数值时，大字用名称。
- `status` 有值就用作说明；否则用型号或自动状态。
- `show_toggle: false` 隐藏电源开关。域不能开关时也不显示。
- 不写 `actions` 时，加湿器用 `available_modes`、风扇用 `preset_modes`，最多生成三枚模式按钮。写了 `actions` 就用配置，同样最多三枚。
- 设备关闭或不可用时，产品图去色并降低透明度。模式按钮只在设备开着且模式吻合时按下。关闭电源时，先关掉动作里单独绑定的实体，再关主实体。
- 栏宽不足 320px（容器查询）时，右侧 64px 动作栏改到图片下方，变成横排胶囊，避免和图重叠。

### 竖图控制 `layout: vertical`

上方产品图，中间标题，下方竖向滑杆。适合灯。设计稿里灯没有单独的电源开关，滑杆就是控件。

- `image` 是第一张图。`images` 可以是字符串数组，或逗号分隔的地址。多于一张时，左右箭头切换，箭头不打开更多信息。
- 灯、风扇、窗帘、媒体音量、`input_number` / `number` 可以拖动。灯和风扇在关闭时滑杆显示 `0 %`，即使实体里还留着上次亮度。加湿器关闭时显示「关」，打开后在 `min_humidity`（默认 30）和 `max_humidity`（默认 80）之间调节。媒体音量不会把播放器关掉。
- 不能用滑杆调节的域显示「此实体不能用滑杆调节」，滑杆禁用。
- `show_toggle` 在这种排版里不画出开关，但配置会保留。

### 电子设备模块 `layout: electronics`

标题、可选电源、开机时长、网络、位置、产品图或占位、电池，以及温度 / 内存 / CPU / GPU。高度随打开的模块收缩，不为电脑、手机、平板、笔记本分四套外壳。

- 有图且「产品图」开着时显示照片。没有图、或图片加载失败时，若「产品图占位」开着，则显示浅底占位和设备轮廓。两个都关掉则不留图槽。
- `image_fit` 省略或为 `auto` 时，电子设备用完整显示（`contain`）放在浅底 `#F7F8FA` 上，避免深色产品图变成一大块黑。写成 `cover` 则铺满。
- 电池文案只用「充电中」「未充电」「已充满」。电量到 100%，或 `battery_state` 为 `full`，显示「已充满」。正在充电且低于 100% 显示「充电中」，其余为「未充电」。
- 网络：未连接、SSID、不可用、未知。位置：在家、离家，或其他区域名。
- 开机时长形如 `已开机 8天 1小时 41分钟`，数字和「天 / 小时 / 分钟」之间不加空格。
- 指标磁贴随栏宽换行，不写死 194px。主开关「指标」关掉后，温度、内存、CPU、GPU 一起收起。

## 编辑器

Home Assistant 里使用 `ha-form`，标签为中文。本地预览没有 `ha-form` 时退回普通表单，字段相同。换排版后，编辑器只保留该排版用得到的字段。

电子设备的模块开关：实体或数据不存在，且该项没有被明确设为 `true` 时，开关禁用。开关的勾选与卡片一致：没写该字段、但数据存在时视为打开；写成 `false` 则隐藏。

| 字段 | 用在 | 说明 |
| --- | --- | --- |
| `entity` | 全部 | 必填。主实体 |
| `name` | 全部 | 标题。留空用友好名称 |
| `layout` | 全部 | `large`、`vertical`、`electronics`。省略则为 `large` |
| `model` | 大图、电子设备 | 副标题或占位图下的型号 |
| `status` | 大图 | 数值下方的说明。留空则自动 |
| `image` | 全部 | 图片地址。留空用 `entity_picture` 或 `image` 属性 |
| `images` | 竖图 | 更多图片，数组或逗号分隔 |
| `image_fit` | 全部 | `auto`、`contain`、`cover`。省略等于 `auto` |
| `show_toggle` | 大图 | 是否显示电源开关，默认显示。竖图不画开关，但保留该值 |
| `value_entity` | 大图 | 主数值来源。留空则从主实体读 |
| `actions` | 大图 | 最多 3 项。每项可有 `entity`、`name`、`icon`（`steam` / `chevron` / `droplet`）、`mode`。`mode` 调用加湿器 `set_mode` 或风扇 `set_preset_mode` |
| `show_image` | 电子设备 | 产品图。默认在有图时显示 |
| `show_placeholder` | 电子设备 | 无图时的占位。默认显示 |
| `show_power` | 电子设备 | 电源开关。省略时跟随 `show_toggle` |
| `power_entity` | 电子设备 | 电源实体。留空则在主实体可开关时用主实体 |
| `show_uptime` | 电子设备 | 开机时长 |
| `uptime_entity` | 电子设备 | 开机时长实体 |
| `show_battery` | 电子设备 | 电池 |
| `battery_entity` | 电子设备 | 电池实体 |
| `show_network` | 电子设备 | 网络 |
| `network_entity` | 电子设备 | 网络实体 |
| `show_location` | 电子设备 | 位置 |
| `location_entity` | 电子设备 | 位置实体 |
| `show_metrics` | 电子设备 | 指标总开关。`false` 时收起下面四项 |
| `show_temperature` | 电子设备 | 温度磁贴 |
| `temperature_entity` | 电子设备 | 温度实体 |
| `temperature_label` | 电子设备 | 温度名称。留空用友好名称或「温度」 |
| `show_memory` | 电子设备 | 内存磁贴 |
| `memory_entity` | 电子设备 | 内存实体 |
| `memory_label` | 电子设备 | 内存名称 |
| `show_cpu` | 电子设备 | CPU 磁贴 |
| `cpu_entity` | 电子设备 | CPU 实体 |
| `cpu_label` | 电子设备 | CPU 名称 |
| `show_gpu` | 电子设备 | GPU 磁贴 |
| `gpu_entity` | 电子设备 | GPU 实体 |
| `gpu_label` | 电子设备 | GPU 名称 |

编辑器里的动作是三组「实体 + 名称」。保存时写回 `actions`，并尽量保留原来的 `mode` 和 `icon`。

## 点击与异常

- 点标题、说明、产品图，打开主实体的更多信息。
- 点指标、电池、网络、位置，打开这一项自己的实体。
- 开关、滑杆、动作按钮、左右箭头自己处理点击，不打开更多信息。
- `unavailable` 显示「不可用」，`unknown` 显示「未知」，并禁用写入。
- 服务失败时卡片底部留一句中文。原文不超过 24 个字则原样显示，否则显示「操作失败」。
- 实体被删除、域不能调节、图片地址失效时，卡片仍在：占位或隐藏图槽，不出现破图，也不让视图白屏。

浅色是验收环境。卡片使用明确的 `#111111` 字色和 `#F0EFF2` 底色，并声明 `color-scheme: light`。深色主题不作为本卡的支持项，但不会变成白字白底。

Sections 里的建议格子：大图约 6 列、最少 2 列；竖图约 3 列、最少 2 列；电子设备约 6 列、最少 2 列。实际宽度始终是格子的 100%。

## 旧配置

下面这些字段继续有效：

```yaml
type: custom:vha-device-card
entity: switch.living_room_camera
name: 客厅摄像
model: Camera
status: Idle
image: /local/devices/camera.png
show_toggle: true
```

没写 `layout` 时就是大图。`show_toggle: false` 仍然隐藏开关。

## 本轮不做

不新增第十种卡片。气候、传感器、媒体、摄像、调控、家电、提醒、媒体库都不在这张卡里实现。

也不做这些后续项：脚本 / 场景 / 按钮的「执行」文案、风扇摆风角度、超过三枚的动作、Quick Access 那种 16px 圆角紧凑瓦。

## 示例

```yaml
type: custom:vha-device-card
layout: large
entity: humidifier.bedroom
name: 卧室加湿
status: Humidity
```

```yaml
type: custom:vha-device-card
layout: vertical
entity: light.bedroom
name: Bedroom
```

```yaml
type: custom:vha-device-card
layout: electronics
entity: switch.pc
name: PC PRO MAX
show_image: false
uptime_entity: sensor.pc_uptime
temperature_entity: sensor.gpu_temp
temperature_label: 显卡温度
memory_entity: sensor.mem
memory_label: 内存
cpu_entity: sensor.cpu
cpu_label: CPU 占用
gpu_entity: sensor.gpu
gpu_label: GPU 占用
```

本地预览：`npm install` 后 `npm run dev`，打开 http://localhost:4174 。页面包含三种排版、关态、不可用、缺图、窄栏、模块组合和编辑器回退表单。
