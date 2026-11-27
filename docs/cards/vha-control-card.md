# 调控卡 `custom:vha-control-card`

工单：[#7](https://github.com/Virus0418/VHA/issues/7)  
目标列：待办。Projects V2 未创建，说明见 [规划 · 看板](../plugin-development.md#看板)。

## 目标

独立的数值调节。滑条不要全部塞进设备卡。

替换盈松小窝书房里的两张 mushroom-number-card：

| 名称 | 实体 |
| --- | --- |
| 纵向 | `input_number.shang_xia_bai_feng_jiao_du` |
| 横向 | `input_number.zuo_you_bai_feng_jiao_du` |

风扇本体的开关、一键回正、上下摆风开关仍归 [设备卡](vha-device-card.md)。这张卡只负责角度（以及同类连续数值）。

## 适配实体

- `input_number`
- `number`
- 需要单独滑条时的 `light` 亮度、`fan` 百分比。仅当用户不想用设备卡附加控件、而要一条独立滑条时使用

不用于气候目标温度，温度圆环是 [气候卡](vha-climate-card.md)。

## 功能设计

- 一行或一块：名称、当前值、单位、横向滑条。
- 拖动或按步进修改。松手（或步进按钮）再调用服务，拖动中只更新预览数字。
- `input_number` / `number` 调用 `number.set_value`（`input_number` 用 `input_number.set_value`）。
- `light` 调用 `light.turn_on`，`brightness_pct` 取滑条值。
- `fan` 调用 `fan.set_percentage`。
- 显示实体当前值。配置了 `min` / `max` / `step` 时覆盖实体属性，只作为滑条范围，不改实体本身的上下限以外的非法值：超出实体允许范围时夹到实体的 min/max。

## 交互入口

| 操作 | 结果 |
| --- | --- |
| 拖动滑条 | 数字预览，松手写值 |
| 点击滑条轨道 | 跳到该位置并写值 |
| 键盘左右或步进按钮 | 按 `step` 增减并写值 |
| 点击名称 | more-info |
| 不可用 | 滑条禁用，保留最后一次已知值或显示「不可用」 |

无开关。若只要开灯，用设备卡。

## 前端界面需求

- 白底、16px 圆角，比 HA 原生 slider 更轻：无厚重轨道，高度约 8px，两端全圆角。
- 滑条已填充部分用 `#1a1a1a` 或设计稿色带的蓝紫一端；滑块是白点加轻微阴影，直径约 16px，和设备卡开关的圆点同一视觉。
- 名称 14px 加粗在左，当前值和单位 14px 在右，滑条在下一行全宽。
- 可选左侧图标，线性、灰色，不使用 mushroom 的彩色大图标。
- 建议网格：6 列、2 行。两张角度卡可以上下叠，或并排放。

## 配置项

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `entity` | 是 | `input_number`、`number`、`light` 或 `fan` |
| `name` | 否 | 默认友好名称 |
| `min` | 否 | 覆盖滑条最小值 |
| `max` | 否 | 覆盖滑条最大值 |
| `step` | 否 | 覆盖步进 |
| `unit` | 否 | 覆盖单位，角度可用 `°` |
| `icon` | 否 | mdi 图标名 |

示例：

```yaml
type: custom:vha-control-card
entity: input_number.shang_xia_bai_feng_jiao_du
name: 纵向
unit: °
```

```yaml
type: custom:vha-control-card
entity: input_number.zuo_you_bai_feng_jiao_du
name: 横向
unit: °
```

## 验收要点

1. 两枚摆风角度 `input_number` 拖动后，HA 里的值改变，松手只调用一次 `input_number.set_value`。
2. `min` / `max` / `step` 能覆盖显示范围，写出的值仍落在实体允许范围内。
3. 灯亮度、风扇百分比各能调一次，服务域正确。
4. 点击名称打开 more-info，拖动不会打开。
5. 样式是细轨道圆角滑条，不是 mushroom 的竖向大滑条。
6. 不把这张卡做成设备卡的一种布局。
