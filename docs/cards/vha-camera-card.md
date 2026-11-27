# 摄像卡 `custom:vha-camera-card`

工单：@@ISSUE_CAMERA@@  
看板：@@PROJECT_URL@@ ，列「待办」

## 目标

按设计稿左上 CCTV Camera 预留：大画面、Live 徽章、时间戳、多镜头切换。

盈松小窝和 Tech 的主视图里几乎没有真正的 camera 直播。现有 picture-entity（极米投影仪、小米风扇、PC PRO MAX、PS5 在线状态）是产品图加开关或状态，归 [设备卡](vha-device-card.md)。不要把那些开关图做成摄像卡。

这张卡服务以后接入的摄像头，现在就可以加到视图里单独使用。

## 适配实体

- `camera`
- 带实体图片的 `image`
- `entities` 列表做多镜头。每一项是一个 `camera` 或 `image`

不接受 `switch` + `entity_picture` 这种产品图。编辑器里实体选择器限制为 `camera` 和 `image`。

## 功能设计

- 16:9 圆角画面，显示当前镜头的实时流或图片。
- 左上 Live 徽章。`live: false` 或实体不是实时流时隐藏徽章，避免静态图也写着 Live。
- 右上时间。默认取画面时间或客户端当前时间，格式与设计稿接近：`25 May 2026, 10:10 AM` 这种本地化日期时间。`show_timestamp: false` 时隐藏。
- 底部镜头名，左右箭头切换。只有一个镜头时仍显示名称，隐藏箭头。
- 点击画面：优先全屏看流；没有全屏流时打开 more-info。
- 可选静音、抓拍。实体不支持就不显示按钮。静音只影响卡片里的音频，不调用无关服务。抓拍调用 `camera.snapshot` 需要用户在配置里给出可写路径时才提供，默认不显示抓拍，避免误写磁盘。文档要求「实体支持时可选」，编辑器里 `show_snapshot` 默认 false。

## 交互入口

| 操作 | 结果 |
| --- | --- |
| 点击画面 | 全屏播放当前相机；做不到则 more-info |
| 点击左 / 右箭头或底部镜头名 | 切换 `entities` 中的镜头，不切换服务调用以外的状态 |
| 点击 Live 或时间 | 不单独动作 |
| 静音（可选） | 仅卡片内音频 |
| 抓拍（可选，默认关） | 实体支持且用户打开 `show_snapshot` 时调用抓拍 |
| 不可用 | 画面区显示「不可用」，保留镜头切换 |

左右切换只改卡片里的当前下标，不改 HA 里其他实体。

## 前端界面需求

对齐设计稿 CCTV：

- 外框白底或画面自带圆角 16px，比例 16:9，`object-fit: cover`。
- 左上红色或深色胶囊「Live」，白字，小圆点。
- 右上时间，白字带轻微阴影，保证亮画面上仍可读。
- 底部居中半透明胶囊，显示镜头名（如 Living Room CCTV 2）。左右各一枚圆形箭头按钮，叠在画面下沿。
- 多镜头时名称随当前项变化。名称用配置的 `name`，否则用友好名称。
- 不要画设备卡那种底部开关。
- 建议网格：约 8 列、4 行。

## 配置项

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `entity` | 与 `entities` 二选一 | 单个镜头 |
| `entities` | 与 `entity` 二选一 | 多镜头。项为实体 ID 或 `{ entity, name }` |
| `name` | 否 | 单镜头标题，或卡片无障碍名称 |
| `show_timestamp` | 否 | 默认 true |
| `live` | 否 | 默认 true。false 时不显示 Live 徽章 |
| `show_snapshot` | 否 | 默认 false |

示例：

```yaml
type: custom:vha-camera-card
live: true
show_timestamp: true
entities:
  - entity: camera.living_room
    name: Living Room CCTV 2
  - entity: camera.entry
    name: Entry CCTV 1
```

示例里的实体 ID 是说明用的。当前仪表盘没有这些相机，不要写进默认配置。

## 验收要点

1. 一个 `camera` 能出 16:9 画面、Live、时间、底部名称。
2. 两个以上镜头能左右切换，名称跟着变。
3. 点击画面进入全屏或 more-info。
4. `image` 实体显示图片，且 `live: false` 时没有 Live 徽章。
5. 编辑器不能把 `switch` 产品图选成这张卡的主实体。
6. 默认没有抓拍按钮。不支持音频时没有静音按钮。
7. 卡片可单独添加，不依赖 Quick Access 或设备卡。
