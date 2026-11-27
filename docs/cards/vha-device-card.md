# 设备卡 `custom:vha-device-card`

工单：[#2](https://github.com/Virus0418/VHA/issues/2)  
目标列：待审查。Projects V2 未创建，说明见 [规划 · 看板](../plugin-development.md#看板)。  
实现：[PR #1](https://github.com/Virus0418/VHA/pull/1)，分支 `cursor/add-vha-device-card-510d`。1.0 已提交，未合并。本规划不合并它。

## 目标

做 Quick Access 那种设备瓦：名称、型号、产品图、状态文案、底部开关。一张卡覆盖常用开关类实体。可以单独加到任意视图，不强制包在 Quick Access 容器里。横排靠 HA 的 sections 或 grid。

它替换这些现有卡：

- 大量 tile：电脑开关、显示器灯、脚本按钮、自动化按钮
- mushroom-light-card（小米显示器灯 `light.yeelink_cn_649098006_lamp22_s_2`）
- mushroom-fan-card 的基础开关（书房风扇 `fan.zhimi_cn_507346713_fa1_s_2_fan`）
- 用作产品图的 picture-entity：极米投影仪 `switch.h3s_switch_2`、小米风扇、PC PRO MAX `switch.dian_nao_kai_guan`、PS5 在线状态 `sensor.viruswhk_online_status`
- 移动设备和网络连通性里重复出现的灯、显示器、主机 entity 行

风扇「一键回正」「上下摆风」和 picture-entity 大图是这张卡的后续，不另开卡。摆风角度滑条归 [调控卡](vha-control-card.md)。

## 适配实体

1.0 已支持、底部可出现开关或动作的域（见 PR 中 `src/toggle.ts`）：

`light`、`switch`、`fan`、`input_boolean`、`cover`、`lock`、`climate`、`media_player`、`humidifier`、`siren`、`remote`、`vacuum`、`water_heater`、`valve`、`automation`、`script`、`input_button`、`scene`、`button`。

产品图瓦也接受只有状态、没有开关的实体（例如 PS5 在线传感器）。`show_toggle: false` 或域不在上表时只展示，不显示开关。

简单 camera 若只是一张静态图加开关，仍用设备卡。直播画面用 [摄像卡](vha-camera-card.md)。

## 1.0 已经做到的

- 视觉编辑器字段：`entity`（必填）、`name`、`model`、`status`、`image`、`show_toggle`
- 名称回落到 `friendly_name`，型号回落到 `model` / `model_id` / `device_class` / 域，图片回落到 `entity_picture`
- 点击卡片或右上角 ⋮ 打开 more-info；点击开关不打开 more-info
- 开关调用对应域服务。`media_player` 只有 `playing` / `buffering` 视为开，暂停后再次点击调用 `media_play`
- `lock` 使用 lock / unlock，`cover` 使用 open_cover / close_cover
- 关态产品图由样式处理；本地预览四张瓦（空气净化器、台灯、摄像头、音箱）与设计稿一致
- 根目录 `vha.js`，HACS 资源 `/hacsfiles/VHA/vha.js`

1.0 里脚本、场景、按钮、自动化仍显示同一枚开关，点击即 `turn_on` 或 `press`。目标交互见下一节，放在同一工单的后续里改，不新开卡。

## 功能设计

- 左文右图：标题、型号在上，状态在开关上方，产品图靠右下。
- 可切换实体显示底部开关。
- 脚本、场景、按钮、自动化：主按钮文案为「执行」，不显示开关。点按调用 `script.turn_on`、`scene.turn_on`、`button.press`、`input_button.press` 或 `automation.trigger`。这是相对 1.0 的后续项。
- 可选附加控件（同一工单后续，默认不显示）：一组小开关，例如风扇「一键回正」`switch.zhimi_cn_507346713_fa1_one_key_back_p_5_9`、「上下摆风」`switch.zhimi_cn_507346713_fa1_vertical_swing_p_2_4`。每项有自己的实体、名称，调用该实体自己的开关服务。
- 可选大图布局：接近 picture-entity，图作为背景或主视觉，名称和开关叠在上面。用于 PC PRO MAX、极米、PS5。默认仍是 Quick Access 紧凑瓦。

## 交互入口

| 操作 | 结果 |
| --- | --- |
| 点击卡片上开关和附加控件以外的区域 | `hass-more-info` |
| 点击右上角 ⋮ | 同上 |
| 点击底部开关 | 对应域服务。灯/开关/风扇等 `turn_on` / `turn_off`；锁、窗帘、媒体播放器按 1.0 规则 |
| 点击「执行」 | 脚本、场景、按钮、自动化的一次性服务。无开/关状态 |
| 点击附加开关 | 只切换该项实体 |
| 实体不可用 | 开关禁用，状态显示「不可用」 |

键盘：卡片可聚焦，Enter / 空格打开 more-info。开关单独可聚焦。

## 前端界面需求

对齐设计稿 Quick Access，并与 1.0 预览一致：

- 圆角 16px。设计稿是白底；1.0 实现底色为 `#f6f8fa`。审查 1.0 时按已实现的预览验收，新布局再统一到白底。
- 标题 14px 加粗，型号 11px `#9aa0a8`，状态 12px `#6f747c`。
- 产品图在右下，约卡片宽度 58%、高度 78%，`object-fit: contain`，不挡点击。
- 无关态图片时用线框占位，不留破图。
- 开关 36×20。关 `#e4e6ea`、白点；开 `#1a1a1a`、白点在右。
- 关闭或非活动时，产品图降低饱和度并加透明度。1.0 若尚未做饱和度，作为同一工单的界面补齐，不新开卡。
- 大图布局：16px 圆角，图铺满，底部一条半透明信息带放名称和开关。
- 附加控件：开关下方或标题下的小号开关行，沿用同一枚开关样式，不要换成 HA 默认 toggle。
- `getGridOptions` 保持约 6 列、3 行，便于四个瓦排成设计稿那一行。

## 配置项

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `entity` | 是 | 实体 ID |
| `name` | 否 | 留空用友好名称 |
| `model` | 否 | 副标题。留空用 `model` / `model_id` / `device_class` |
| `status` | 否 | 状态文案。留空按实体状态自动显示 |
| `image` | 否 | 图片 URL。留空用 `entity_picture` |
| `show_toggle` | 否 | 默认在可切换实体上为 true |
| `layout` | 否 | 后续。`compact`（默认）或 `picture` |
| `actions` | 否 | 后续。附加控件列表：`entity`、`name` |

1.0 编辑器只包含前六个字段。后两个随后续增强加进同一个编辑器。

示例：

```yaml
type: custom:vha-device-card
entity: fan.zhimi_cn_507346713_fa1_s_2_fan
name: 小米风扇
model: 书房
show_toggle: true
actions:
  - entity: switch.zhimi_cn_507346713_fa1_one_key_back_p_5_9
    name: 一键回正
  - entity: switch.zhimi_cn_507346713_fa1_vertical_swing_p_2_4
    name: 上下摆风
```

`actions` 在后续版本才生效。1.0 会忽略未知字段，不能因此报错。

## 验收要点

1. HACS Dashboard 安装后，资源为 `/hacsfiles/VHA/vha.js`，添加卡片能搜到「VHA 设备卡」。不改 `configuration.yaml`，不出现侧边栏入口。
2. 灯、开关、风扇、input_boolean 的开关会调用对应 `turn_on` / `turn_off`，状态跟着变。
3. 媒体播放器：播放或缓冲时开关为开；暂停后开关为关；再点调用 `media_play`。
4. 点击卡片主体打开 more-info，点击开关不会打开。
5. 不填 `name` / `model` / `image` / `status` 时能用实体属性兜底。
6. 本地预览或 HA 中，四张 Quick Access 样例的名称、型号、图、状态、开关位置与设计稿一致。
7. PR #1 合并前，工单保持在「待审查」，不把后续附加控件算进 1.0 阻塞项。
8. 后续：脚本卡显示「执行」而不是开关；可配置附加开关；`layout: picture` 能盖住 PC / 投影仪那种大图场景。
