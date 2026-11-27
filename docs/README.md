# VHA 文档

这里是 VHA 的中文开发文档。插件只做 Home Assistant Lovelace 自定义卡片（HACS 类型：Dashboard）。

## 规划

- [插件开发规划](plugin-development.md)：目标、归并原则、现有仪表盘映射、九张卡一览、路线图、看板
- 看板：没有建成。目标列和原因见 [规划 · 看板](plugin-development.md#看板)。

## 卡片

九张卡各一份，不再拆开，也不另加第 10 张。

| 顺序 | 卡片 | 类型 | 文档 | 工单 | 目标列 |
| --- | --- | --- | --- | --- | --- |
| 1 | 设备卡 | `custom:vha-device-card` | [vha-device-card](cards/vha-device-card.md) | [#2](https://github.com/Virus0418/VHA/issues/2) | 待审查 |
| 2 | 气候卡 | `custom:vha-climate-card` | [vha-climate-card](cards/vha-climate-card.md) | [#3](https://github.com/Virus0418/VHA/issues/3) | 待办 |
| 3 | 传感器卡 | `custom:vha-sensor-card` | [vha-sensor-card](cards/vha-sensor-card.md) | [#4](https://github.com/Virus0418/VHA/issues/4) | 待办 |
| 4 | 媒体卡 | `custom:vha-media-card` | [vha-media-card](cards/vha-media-card.md) | [#5](https://github.com/Virus0418/VHA/issues/5) | 待办 |
| 5 | 摄像卡 | `custom:vha-camera-card` | [vha-camera-card](cards/vha-camera-card.md) | [#6](https://github.com/Virus0418/VHA/issues/6) | 待办 |
| 6 | 调控卡 | `custom:vha-control-card` | [vha-control-card](cards/vha-control-card.md) | [#7](https://github.com/Virus0418/VHA/issues/7) | 待办 |
| 7 | 家电卡 | `custom:vha-appliance-card` | [vha-appliance-card](cards/vha-appliance-card.md) | [#8](https://github.com/Virus0418/VHA/issues/8) | 待办 |
| 8 | 提醒卡 | `custom:vha-reminder-card` | [vha-reminder-card](cards/vha-reminder-card.md) | [#9](https://github.com/Virus0418/VHA/issues/9) | 待办 |
| 9 | 媒体库卡 | `custom:vha-library-card` | [vha-library-card](cards/vha-library-card.md) | [#10](https://github.com/Virus0418/VHA/issues/10) | 待办 |

设备卡 1.0 已有拉取请求 [#1](https://github.com/Virus0418/VHA/pull/1)，工单放在「待审查」。本文档不合并该请求。
