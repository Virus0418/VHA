# 气候卡 `custom:vha-climate-card`

工单：[#3](https://github.com/Virus0418/VHA/issues/3)  
目标列：待办。Projects V2 未创建，说明见 [规划 · 看板](../plugin-development.md#看板)。

## 目标

替换设计稿右侧 Temperature Control，以及盈松小窝里的三张 thermostat：

| 名称 | 实体 | 现有功能 |
| --- | --- | --- |
| 客厅空调 | `climate.lmkj_cn_2003088651_bf1001` | climate-hvac-modes、climate-fan-modes |
| 书房空调 | `climate.qjiang_cn_921972649_ac02` | climate-hvac-modes、climate-fan-modes |
| 卧室空调 | `climate.cuco_cn_539690460_cp6` | climate-hvac-modes、climate-fan-modes |

移动设备分区里这三台空调的 entity / device 卡也用这一张卡替换，不做成设备卡。

卧室空调已有耗电统计 `sensor.cuco_cn_539690460_cp6_power_consumption_p_7_1`（今日、本月各一张 statistic）。气候卡可以挂上这个实体，没有能耗实体时不显示该块。独立的统计卡仍由 [传感器卡](vha-sensor-card.md) 的 `statistic` 布局负责，避免为耗电再做一种卡。

## 适配实体

主实体是 `climate`。

可选：

- `consumption_entity`：`sensor`，带统计（state_class / unit）时显示今日或本月耗电
- `swing_entity`：摆风如果不是 climate 的 `swing_mode`，而是一枚 `switch`，就挂这枚开关

模式来自实体实际属性，不写死设计稿上的四个英文：

- `hvac_modes`
- `fan_modes`（有则显示）
- `swing_modes` 或 `swing_mode`（有则显示）
- 配置了 `swing_entity` 时，摆风胶囊操作那枚开关

## 功能设计

- 大圆环表示温度。中心主数字是目标温度；当前温度用较小字放在主数字下方。实体没有目标温度时，主数字改为当前温度。
- 圆环可设定目标温度。步进用实体的 `target_temp_step`，没有则用 0.5 或 1，与实体 `precision` 一致。范围用 `min_temp` / `max_temp`。
- 下部：设备名、型号、运行剩余或状态、电源开关。
- 模式胶囊：一组 hvac，一组风扇（有 fan_modes 才出现）。选中项高亮。
- 电源：`climate.turn_on` / `climate.turn_off`。关闭即 hvac `off`（若 `hvac_modes` 含 `off`，与 turn_off 等效，优先 turn_off）。
- 可选能耗：今日耗电，副文案可写本月。无 `consumption_entity` 时整块不占位。
- 名称区点击打开 more-info。圆环、胶囊、电源不冒泡。

运行剩余：若属性里有 `remaining` 或类似的剩余时间就显示；没有则显示 hvac 状态的本地化文案（制冷中、送风、关闭），不编造倒计时。

## 交互入口

| 操作 | 结果 |
| --- | --- |
| 沿圆环拖动，或点击圆环某一刻度 | `climate.set_temperature`，温度按步进吸附 |
| 点击 hvac 胶囊 | `climate.set_hvac_mode` |
| 点击风扇胶囊 | `climate.set_fan_mode` |
| 点击摆风胶囊 | 有 `swing_modes` 时 `climate.set_swing_mode`；否则切换 `swing_entity` |
| 点击电源 | `climate.turn_on` 或 `climate.turn_off` |
| 点击名称或型号 | more-info |
| 实体不可用 | 圆环、胶囊、电源禁用 |

拖动过程中主数字跟着预览，松手再调用服务。服务失败时数字回到实体里的目标温度。

## 前端界面需求

对齐设计稿右侧圆环，不复制那四个英文标签：

- 白底、16px 圆角，内边距与设备卡接近（约 14px）。
- 圆环直径在卡片内尽量大。轨道为浅灰刻度；当前设定点用一段高亮弧和一枚端点。设计稿里设定在顶部、底部有蓝色弧，实现时高亮位置随温度在 min/max 之间移动，不把 27°C 固定在 12 点钟。
- 中心温度数字大号（设计稿约 27），单位 °C 较小，靠在数字右上。字体与设备卡相同。
- 设备名 14px 加粗，型号 11px 灰色，状态 12px。电源用设备卡同款 36×20 开关，靠右。
- 模式胶囊等宽、全圆角，横排可换行。未选中白底浅灰字，选中深色底白字（与开关的 `#1a1a1a` 一致）。胶囊文案用 HA 的本地化模式名（制冷、送风、制热、自动、干燥等），英文实体值只在没有翻译时显示。
- 能耗块在模式下方：一行「今日 x kWh」，有本月数据时第二行较小。样式安静，不要做成传感器卡那条彩虹色带；色带留给传感器卡的 `energy` 布局。
- 建议网格：约 6 列、6 行，能独立放在视图右侧。

## 配置项

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `entity` | 是 | `climate` 实体 |
| `name` | 否 | 默认友好名称 |
| `model` | 否 | 默认型号属性 |
| `consumption_entity` | 否 | 耗电传感器。不填则不显示能耗 |
| `consumption_period` | 否 | `day`（默认）或 `month`。主数字用这个周期 |
| `show_modes` | 否 | 默认 true。false 时隐藏胶囊 |
| `show_power` | 否 | 默认 true |
| `swing_entity` | 否 | 摆风开关。climate 自己有 swing 时可以不填 |

示例：

```yaml
type: custom:vha-climate-card
entity: climate.cuco_cn_539690460_cp6
name: 卧室空调
consumption_entity: sensor.cuco_cn_539690460_cp6_power_consumption_p_7_1
show_modes: true
show_power: true
```

## 验收要点

1. 三台空调都能设定目标温度，步进与实体一致，调用 `climate.set_temperature`。
2. hvac、fan 胶囊只出现实体实际有的模式，文案不是设计稿里的 Auto / Wind / Heat / Swing。
3. 电源能开能关。`off` 时圆环仍显示当前温度，目标区标明已关闭。
4. 不填 `consumption_entity` 时没有能耗空白；填上床室耗电传感器后能看到今日（或所选周期）电量。
5. 点击名称打开 more-info；拖圆环不会打开 more-info。
6. 卡片可单独添加，编辑器里 `entity` 必填。
7. 视觉在浅色视图里与设备卡的字号、圆角、开关一致。
