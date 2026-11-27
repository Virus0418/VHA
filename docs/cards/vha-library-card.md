# 媒体库卡 `custom:vha-library-card`

工单：@@ISSUE_LIBRARY@@  
看板：@@PROJECT_URL@@ ，列「待办」

## 目标

用一张卡覆盖 Tech 视图「WBC-EMBY 媒体库」那一整组，不要把电影数、最近添加、继续观看拆成多张插件卡。

分区标题 heading「WBC-EMBY 媒体库」继续用 HA 原生。

当前被这张卡替换的内容：

| 现有卡片 | 实体 | 在新卡中的位置 |
| --- | --- | --- |
| entity 扫描 | `binary_sensor.virusemby_library_scan_active` | 状态行 |
| entity 服务器连接 | `binary_sensor.virusemby_server_connected` | 状态行 |
| entity 版本 | `sensor.virusemby_server_version` | 状态行 |
| entity 更新 | `update.emby_media_update` | 状态行 |
| button-card 最近添加 | `sensor.wbc_emby_wbc_emby_recently_added`，读 `attributes.items` | 下部横向封面 |
| tile 电影数 | `sensor.wbc_emby_movies` | 上部数量 |
| tile 合集数 | `sensor.wbc_emby_collections` | 上部数量 |
| tile 电视剧数 | `sensor.wbc_emby_tv_shows` | 上部数量 |
| tile 剧集数 | `sensor.wbc_emby_episodes` | 上部数量 |
| button-card 继续观看 | `sensor.wbc_emby_wbc_emby_continue_watching`，剧集显示「剧名 - 集名」 | 下部横向封面 |
| mushroom-template 最后连接用户 | `binary_sensor.wbc_emby_server_connected` | 状态行里的用户字段，模板可映射 |
| tile 最后活动 | `sensor.wbc_emby_last_activity` | 状态行 |

属性结构按现在的 Emby 类集成来（`attributes.items` 里有 `name`、`type`、`series_name`、封面和可选 url），同时每个字段都能在配置里改路径，以便以后接到 Plex 或 Jellyfin 的同类传感器。不要把 `sensor.wbc_emby_*` 写死在代码里。

## 适配实体

以「一个媒体库数据源」为中心，全部由编辑器映射：

- `server_entity`：在线或连接，`binary_sensor`
- `stats`：数量传感器列表（电影、合集、剧、集）
- `recent_entity`：最近添加，状态属性里是条目数组
- `continue_entity`：继续观看，同样是条目数组
- `activity_entity`：最后活动
- `scan_entity`：正在扫描
- `version_entity`：服务器版本
- `update_entity`：更新
- `user_entity` 或 `user_template`：最后连接用户

缺哪项就隐藏哪一块。只有电影数、没有最近添加时，仍然是这张卡。

## 功能设计

上部：

- 服务状态：连接正常 / 断开，扫描中时加一枚「扫描中」
- 版本、更新、最后活动、最后用户，各一行小字
- 数量指标横排：电影、合集、电视剧、剧集。标签用配置的 `name`，不写死中文四个词以外的实体 ID

下部：

- 「最近添加」「继续观看」两个横滑行
- 每项：封面、标题。剧集且能读到剧名时，标题为「剧名 - 集名」，与现在 button-card 的模板一致
- 条目数量默认最多 12，可配置。没有 `items` 时该行显示「暂无」

字段映射（默认值针对当前 Emby 传感器，可改）：

| 用途 | 默认属性路径 |
| --- | --- |
| 条目数组 | `items` |
| 标题 | `name` |
| 类型 | `type` |
| 剧名 | `series_name` |
| 封面 | `image` 或 `poster` |
| 链接 | `url` |

`type == Episode` 且有剧名时用「剧名 - 集名」，否则用标题。类型判断的字符串也可配置，默认 `Episode`。

## 交互入口

| 操作 | 结果 |
| --- | --- |
| 点击封面或条目标题 | 该项有 `url` 时在新标签打开；没有 url 则对来源传感器打开 more-info |
| 点击数量、版本、扫描、更新、最后活动 | 打开对应实体的 more-info |
| 点击连接状态或最后用户 | 打开 `server_entity` 或 `user_entity` 的 more-info |
| 横滑 | 只滚动，不触发点击 |

没有播放控制。播 Kodi 用 [媒体卡](vha-media-card.md)。

## 前端界面需求

- 白底、16px 圆角，字体与设备卡相同。
- 上部左：状态点（连接为绿，断开为红）+ 服务器名 14px。右或下一行：四个数量，数字 18px 加粗，标签 11px 灰色。
- 状态次行：扫描、版本、更新、最后活动、最后用户，12px，用中点分隔，过长省略。
- 下部两个标题 12px 加粗，其下横向卡片：封面 2:3 圆角 8px，标题最多两行。行可横向滚动，隐藏滚动条或用细滚动条。
- 不使用 button-card 的自定义 HTML，也不嵌入 mini-graph。
- 建议网格：12 列、4 行以上，随两行海报增高。

## 配置项

全部可选映射，至少填一个实体，否则编辑器提示「请映射至少一项」。不设唯一必填实体 ID。

| 字段 | 说明 |
| --- | --- |
| `name` | 卡片标题，默认「媒体库」 |
| `server_entity` | 连接状态 |
| `scan_entity` | 扫描中 |
| `version_entity` | 版本 |
| `update_entity` | 更新 |
| `activity_entity` | 最后活动 |
| `user_entity` | 最后用户相关实体 |
| `user_template` | 可选展示模板，默认用 `user_entity` 的状态 |
| `stats` | `{ entity, name }[]` |
| `recent_entity` | 最近添加 |
| `continue_entity` | 继续观看 |
| `item_path` | 条目数组属性名，默认 `items` |
| `title_field` | 默认 `name` |
| `series_field` | 默认 `series_name` |
| `type_field` | 默认 `type` |
| `episode_type` | 默认 `Episode` |
| `image_field` | 默认 `image` |
| `url_field` | 默认 `url` |
| `max_items` | 默认 12 |

示例（字段都是映射，代码里不要写成常量实体）：

```yaml
type: custom:vha-library-card
name: WBC-EMBY
server_entity: binary_sensor.virusemby_server_connected
scan_entity: binary_sensor.virusemby_library_scan_active
version_entity: sensor.virusemby_server_version
update_entity: update.emby_media_update
activity_entity: sensor.wbc_emby_last_activity
recent_entity: sensor.wbc_emby_wbc_emby_recently_added
continue_entity: sensor.wbc_emby_wbc_emby_continue_watching
stats:
  - entity: sensor.wbc_emby_movies
    name: 电影
  - entity: sensor.wbc_emby_collections
    name: 合集
  - entity: sensor.wbc_emby_tv_shows
    name: 电视剧
  - entity: sensor.wbc_emby_episodes
    name: 剧集
```

最后连接用户若只存在于 mushroom 模板、没有独立传感器，实施时看该模板实际读的属性再映射到 `user_entity` / `user_template`。规划不发明一个不存在的用户实体 ID。

## 验收要点

1. 一张卡同时看到四个数量、连接/扫描/版本/更新/最后活动，以及最近添加和继续观看的横向封面。
2. 剧集标题为「剧名 - 集名」；电影只显示名称。
3. 有 url 的封面点击会打开链接；数量和状态行点击打开对应 more-info。
4. 换成另一组实体 ID（模拟 Plex）时，只要属性路径配置正确，界面不变。代码路径里搜不到 `wbc_emby` 字符串。
5. 不配 `recent_entity` 时没有空的封面横条占位错误，只隐藏该节。
6. 不新增电影数卡、继续观看卡等额外类型。
7. heading 与顶栏徽章不由本卡替换。
