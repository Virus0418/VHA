# 媒体卡 `custom:vha-media-card`

工单：[#5](https://github.com/Virus0418/VHA/issues/5)。目标列：待审查。尚未在真实 Home Assistant 上验收，不能标「卡片通过」。

视觉以 [设计规范 1.0](../design-spec-1.0.md) 的媒体卡为准：底色 `#E3E9EE`，圆角 40，内边距 24 / 20 / 20 / 24，块间距 12。宽度跟着栏走，不把 448 写死。栏宽不足 420px 时，左侧播放器和右侧房间改成上下排列，不重叠。

在「添加卡片」里，会从家里的 `media_player` 里挑一台做示意，不自动添加房间，也不调用播放。没有媒体播放器时仍显示「请选择一个实体」。

## 本轮做了什么

- 标题和溢出菜单。点标题或圆形产品图打开播放器的更多信息。
- 圆形产品图用 `image`，留空则用实体的 `entity_picture`。没有图或图片加载失败时显示浅色圆，不出现破图，也不白屏。
- 播放、上一首、下一首。播放中（`playing` / `buffering`）中间是暂停，其余是播放。播放器处于关闭时，先 `turn_on` 再 `media_play`。
- 时间用 Home Assistant 常见的进度：有时长时写成 `2:27 / 4:05`，只有进度时写成 `2:27`。稿面上的 `2.27` 不解释成小数进度。
- 右侧房间是开关行。`rooms` 可增删。`show: false` 保留配置但不画出。房间实体不可用或未知时，该行开关禁用。
- 空闲、待机且没有进度时显示「空闲」，关闭显示「已关闭」，不可用显示「不可用」，未知显示「未知」。不可用或未知时播放键禁用，房间开关仍按各自实体工作。
- 域不是 `media_player`、实体被删、服务失败时不白屏。服务失败在卡上留一句短错误。

## 本轮不做

工单里的封面条、音量、艺术家行，以及 `show_remote` 遥控模块，都不在这张卡上。遥控仍不是第 10 种类型，只是还没做。

## 配置项

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `entity` | 是 | `media_player` |
| `name` | 否 | 标题。留空用友好名称 |
| `image` | 否 | 产品图地址。留空用 `entity_picture` |
| `rooms` | 否 | `{ entity, name?, show? }`。`show: false` 隐藏该行 |

```yaml
type: custom:vha-media-card
entity: media_player.speaker
name: Speaker
rooms:
  - entity: switch.living
    name: Living room
  - entity: light.bedroom
    name: Bedroom
    show: false
```

编辑器在 Home Assistant 里用 `ha-form` 和房间列表，标签为中文。
