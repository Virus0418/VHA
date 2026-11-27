# 媒体卡 `custom:vha-media-card`

工单：@@ISSUE_MEDIA@@  
看板：@@PROJECT_URL@@ ，列「待办」

遥控不是另一张卡。方向键、触摸板、键盘都是这张卡底部的可选模块，由 `show_remote` 控制。

## 目标

对齐设计稿底部 Speaker 媒体条，并替换盈松小窝里的：

- media-control：KODI，`media_player.kodi7s`，仅在 on 时显示
- custom:universal-remote-card：platform Kodi，同一台 `media_player.kodi7s`（方向键、home / back / menu、触摸板、键盘或搜索、音量）

任意 `media_player` 都能用。没有遥控能力时不渲染遥控区。

## 适配实体

- 主实体：`media_player`
- 可选 `remote_entity`：`remote`。不填则按键发给 `media_player` 的播放服务，或 `media_player.play_media` / 厂商服务里已有的按键映射
- 右侧设备图用 `image`，或实体的 `entity_picture`。媒体封面优先用 `entity_picture` / `media_image`，和设备图分开

## 功能设计

媒体条：

- 封面、来源名称、曲目、艺术家
- 进度条；实体没有时长时改为细波形或隐藏进度，不显示 0:00 / 0:00 的假进度
- 上一首、播放/暂停、下一首
- 音量
- 电源开关
- 右侧设备图

遥控模块（默认收起）：

- 方向键、OK
- Home、Back、Menu
- 触摸板：滑动映射方向，点击映射 OK
- 键盘/搜索：文本输入后发送
- 音量加、音量减（与媒体条音量二选一展示，避免两套音量同时抢，默认遥控区也保留音量，媒体条保留）
- 按键表可配置，不写死 Kodi

空闲或关机：折叠成一行（名称 + 电源），隐藏进度、播控和遥控。与现在 KODI 卡「关掉就不占一大块」一致。用户仍可用 Lovelace visibility 整个隐藏。`collapse_when_off` 默认 true。

## 交互入口

| 操作 | 结果 |
| --- | --- |
| 播放 / 暂停 | `media_play`、`media_pause`。正在播放或缓冲视为在播 |
| 上一首 / 下一首 | `media_previous_track`、`media_next_track` |
| 拖动进度 | 实体支持 `media_seek` 时按位置调用；不支持则进度只读 |
| 音量 | `media_player.volume_set` 或 `volume_up` / `volume_down` |
| 电源 | `turn_on` / `turn_off` |
| 遥控按键 | 配置表里的服务。默认：方向和 OK 用 `media_player` 的方向服务（若有）或 `remote.send_command` |
| 触摸板滑动 | 滑动超过阈值发送一次方向命令，不连续刷服务 |
| 键盘确认 | 发送文本。Kodi 上对应搜索或 `Input.SendText` 一类命令，放在按键表里，不写进卡片类型 |
| 点击封面或标题 | more-info |
| 无遥控实体且按键表为空 | 不渲染遥控区，即使 `show_remote: true` 也只显示一行「未配置遥控」而不是一堆无效键。默认 `show_remote: false` 时什么都不显示 |

## 前端界面需求

- 横向条，白底，16px 圆角，高度紧凑，接近设计稿底部通栏。
- 左：圆角封面约 48–56px。中：来源或设备名 14px 加粗，曲目/艺术家 12px 灰色，其下进度或波形。波形用短竖线，播放时才动画；暂停静止。
- 播控三个圆形按钮，中间播放键填充 `#1a1a1a`，两侧线框。再往右是音量和电源。电源用设备卡同款开关。
- 最右设备图，高度撑满、垂直居中，关态降低饱和度。
- 进度条可拖，已播放部分深色，剩余浅灰。时间用 `m:ss`。
- 遥控展开在媒体条下方，同一张卡片里，顶部分割线。方向键圆角方阵，触摸板一块浅灰圆角区域，文字键（Home、Back、Menu、搜索）是胶囊。
- 折叠态只有一行，和设备卡底栏一样高，不要留下空白遥控位。
- 建议网格：12 列、2 行；展开遥控后行数增加。

## 配置项

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `entity` | 是 | `media_player` |
| `name` | 否 | 来源名。默认友好名称或 `media_title` 的来源 |
| `show_artwork` | 否 | 默认 true |
| `show_volume` | 否 | 默认 true |
| `show_power` | 否 | 默认 true |
| `show_remote` | 否 | 默认 false。true 时在卡片下部提供遥控，可再被用户收起 |
| `collapse_when_off` | 否 | 默认 true |
| `image` | 否 | 右侧设备图 |
| `remote_entity` | 否 | `remote` 实体 |
| `remote_keys` | 否 | 按键表。每项：`id`、`label`、`command` 或 `service` + `data` |

默认按键表（仅当 `show_remote: true` 且用户没写 `remote_keys` 时使用，可用配置整个换掉）：

`up`、`down`、`left`、`right`、`select`、`home`、`back`、`menu`、`volume_up`、`volume_down`、`keyboard`。

示例：

```yaml
type: custom:vha-media-card
entity: media_player.kodi7s
name: KODI
show_artwork: true
show_volume: true
show_power: true
show_remote: true
collapse_when_off: true
remote_keys:
  - id: up
    label: 上
    command: Input.Up
  - id: select
    label: OK
    command: Input.Select
```

`command` 在有 `remote_entity` 时走 `remote.send_command`；否则走播放器集成能接受的服务。具体服务名放在按键项里，卡片不绑定 Kodi。

## 验收要点

1. `media_player.kodi7s` 能显示封面、标题、艺术家、播放暂停、上下一首、音量、电源。
2. 进度可拖时调用 seek；不支持 seek 的播放器进度不可拖。
3. `show_remote: false` 时没有方向键区域。打开后能发出方向、返回、菜单和文本，且收起后媒体条仍在。
4. 关机或 idle 时折叠成一行，电源可再打开。
5. 点击封面或标题打开 more-info，按钮点击不会打开。
6. 另一台没有遥控的 `media_player` 只显示媒体条。
7. 编辑器包含实体、名称、四个 show 开关、遥控按键配置。
8. 仓库里仍然只有 `custom:vha-media-card` 这一种媒体相关卡片类型。
