# 传感器卡 `custom:vha-sensor-card`

工单：@@ISSUE_SENSOR@@  
看板：@@PROJECT_URL@@ ，列「待办」

## 目标

一张卡覆盖只读数值、统计、趋势、状态和能耗色带。用 `layout` 切换外观，或 `auto` 按实体特点选择。不要拆成 graph、statistic、battery 三张卡。

没有破坏性写操作。`number` 只读展示；要拖滑条去改值，用 [调控卡](vha-control-card.md)。

## 适配实体

- `sensor`
- `binary_sensor`
- `number`（只展示，不写）
- 带统计周期的传感器（HA statistic / `state_class`）
- `update` 仅在当状态徽章用时可以，媒体库更新实体归 [媒体库卡](vha-library-card.md)

## 要替换的现有卡

盈松小窝：

- 体重：button-card 小松 `sensor.s200_home_weight_song`、盈子 `sensor.s200_home_weight_ying`，以及嵌套的 mini-graph（约 7 天）
- 显卡温度 `sensor.virus_pc_virus_pc_gputemperature`、GPU 占用 `sensor.virus_pc_virus_pc_gpuload`
- 开机时长 `sensor.dian_nao_kai_ji_shi_chang`、内存 `sensor.virus_pc_virus_pc_memoryusage`、CPU `sensor.virus_pc_virus_pc_cpuload`
- 卧室 statistic 今日/本月耗电 `sensor.cuco_cn_539690460_cp6_power_consumption_p_7_1`
- 电量 button-card：iPhone `sensor.iphone18_pro_max_battery_level`、iPad `sensor.ipad_battery_level`、MacBook `sensor.wang_yan_song_de_macbook_pro_internal_battery_level`
- PS5 附属 entities：`sensor.viruswhk_last_online`、`binary_sensor.viruswhk_subscribed_to_playstation_plus`、`sensor.viruswhk_now_playing`

Tech：

- 连通性 button-card：DeepSeek `sensor.deepseek_balance`、ChatGPT `sensor.tech_https_chatgpt`、百度 `sensor.tech_https_baidu`、Google `sensor.tech_https_google`
- NAS：运行时间 `sensor.ugnasyun_xing_shi_jian_ge_shi_hua`、系统版本 `sensor.ugreen_nas_nas_ugos_version`、VOL 1/2 用量、CPU / CPU 温度 / 内存三条 mini-graph、当月上传下载 statistic（`sensor.192_168_50_1_upload`、`sensor.192_168_50_1_download`）、网卡上传下载 mini-graph、四块盘通电时间 glance、四块盘状态 tile
- PC 按钮卡里嵌套的显卡温度、GPU 占用曲线
- 网络连通性分区里的 CPU、GPU、WIFI 连接数 `sensor.192_168_50_1_devices_connected`

设计稿右下 Energy Efficiency / Total Energy / 色带，用 `energy` 布局，不新开卡。

## 布局

`layout: auto` 时按下面的顺序判断，命中即用，不再往下：

1. `device_class` 为 battery，或实体名/单位像电量百分比 → `battery`
2. 配置了 `entities` 且都是同类传感器 → `glance`；若同时像一台主机的 CPU/内存/温度 → `host`
3. 配置了 `image` 或要头像 → `profile`
4. 实体是统计用传感器且配置了 `period` → `statistic`
5. 二元传感器或连通性（on/off、up/down） → `status`
6. 其余 → `value`

用户指定 `layout` 后不自动改判。

### `value`

大数值、单位、名称。用于开机时长、卷容量、WIFI 连接数、系统版本、运行时间。

### `statistic`

周期统计。周期 `day` / `month`（也可 `week`），聚合 `sum` / `mean` / `max`，对应 HA 的 statistic 卡。今日耗电、本月耗电、NAS 当月上传、当月下载用这个布局。同一实体配两张卡、不同 `period`，分别替换今日和本月。

### `graph`

迷你折线，可配置 `hours_to_show`。替换 mini-graph-card：NAS CPU、温度、内存、网卡上下行，PC GPU 温度和占用。点或按住显示该点的值。

### `profile`

头像或图片、名称、当前值、右侧或下方趋势图。替换小松 / 盈子体重卡：头像 + 体重 + 嵌套 7 天曲线。`hours_to_show` 默认 168。

### `battery`

设备名、电量百分比、充电或低电的颜色。低电阈值默认 20，可配 `thresholds`。用于三台移动设备。充电状态若能从属性 `is_charging` / 对应 binary_sensor 读到就显示，读不到只显示百分比。

### `status`

服务或连通性。正常用绿色点，异常用红色点或徽章。DeepSeek 余额可以是数值加状态色（余额低于阈值变色）。ChatGPT / 百度 / Google、PS Plus、硬盘健康用这个布局。

### `energy`

对齐设计稿右下：左侧大号效率或占比，右侧「TOTAL ENERGY」和总量；一条绿到紫的色带；下方三档图例（Efficient / Average / Peak，文案可配置）。没有效率实体时只显示总量和色带。色带位置按当前值在最小和峰值之间。这是布局，不是新卡。

### `host`

同一主机多指标：CPU、内存、温度、网络、开机时长、版本。用于 NAS 和 PC。每项一行或一小格：名称、当前值、可选细火花线。项来自 `entities`。不要为了主机再做一张卡。

### `glance`

多个同类传感器横排：名称在上、数值在下。替换硬盘通电时间 glance，也可把四块盘的状态并成一排。

## 交互入口

| 操作 | 结果 |
| --- | --- |
| 点击卡片 | 单实体打开 more-info；多实体时点某一项打开该项 |
| `graph` 上点击或按住 | 显示该点时间和数值，松手消失。不写历史 |
| 任何布局 | 没有开关、没有滑条、没有服务调用 |

历史曲线用 HA 的 history / statistics API。没有历史时折线区显示「暂无历史」，不报错空白。

## 前端界面需求

- 白底、16px 圆角，字体和设备卡相同。
- `value`：数值约 28–32px，单位 12px 灰色，名称 12px 在下。
- `graph`：线高约 48–64px，无坐标轴网格，线色 `#1a1a1a` 或蓝色，面积可很淡。
- `profile`：左圆头像 40px，中间名称和数值，下方全宽细线。
- `battery`：百分比大号；低于阈值用琥珀色或红色，充电用绿色。不要再画一枚开关。
- `status`：8px 色点 + 名称 + 右侧状态词。
- `energy`：左 80% 一类的大数字（设计稿是效率），右上小标题 TOTAL ENERGY 和 4.2 kWh；色带两端圆角，高度约 8px，绿 → 黄 → 紫；图例三列，色点 + 名称 + 数值。文案默认可中文：高效 / 平常 / 峰值，编辑器可改。
- `host`：两列或列表，每项名称 11px、数值 14px 加粗。
- `glance`：等分列，细分割，数字 14px。
- 多张传感器卡并排时高度可由布局决定，不强制和设备卡一样高。

## 配置项

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `entity` | 与 `entities` 二选一 | 单实体 |
| `entities` | 与 `entity` 二选一 | 多实体。项可以是实体 ID，或 `{ entity, name }` |
| `layout` | 否 | `auto`（默认）、`value`、`statistic`、`graph`、`profile`、`battery`、`status`、`energy`、`host`、`glance` |
| `name` | 否 | 标题 |
| `unit` | 否 | 覆盖单位 |
| `hours_to_show` | 否 | 曲线时长，默认 24；体重建议 168 |
| `stat_type` | 否 | `sum` / `mean` / `max`，默认 `sum` |
| `period` | 否 | `day` / `week` / `month` |
| `image` | 否 | `profile` 的头像或图片 |
| `thresholds` | 否 | 色阶，如电量 20、余额、能耗分档 `{ label, value, color }` |
| `detail` | 否 | `battery` 可选的充电 binary_sensor |

示例：

```yaml
type: custom:vha-sensor-card
entity: sensor.s200_home_weight_song
name: 小松
layout: profile
hours_to_show: 168
image: /local/avatars/song.jpg
```

```yaml
type: custom:vha-sensor-card
layout: host
name: NAS
entities:
  - entity: sensor.ugreen_nas_cpu_usage
    name: CPU
  - entity: sensor.ugreen_nas_cpu_temperature
    name: CPU 温度
  - entity: sensor.ugreen_nas_ram_usage
    name: 内存
```

```yaml
type: custom:vha-sensor-card
layout: glance
entities:
  - sensor.ugreen_nas_pool_1_disk_1_power_on_hours
  - sensor.ugreen_nas_pool_1_disk_2_power_on_hours
  - sensor.ugreen_nas_pool_1_disk_3_power_on_hours
  - sensor.ugreen_nas_pool_1_disk_4_power_on_hours
```

## 验收要点

1. 上面九种布局都能选，并且 `auto` 对电量、二元连通性、普通传感器给出合理外观。
2. 体重卡同时有当前值和曲线；NAS 的 mini-graph 能用 `graph` 或 `host` 换掉。
3. 今日/本月耗电、NAS 当月上传下载用 `statistic` 显示周期和聚合，不调用任何写服务。
4. 四块硬盘通电时间用 `glance` 横排；DeepSeek / 三个网站用 `status` 看得出正常或异常。
5. `energy` 有大数字、色带、三档图例，配色接近设计稿的绿到紫。
6. 点击打开 more-info 或历史点值；卡片上没有开关。
7. 编辑器支持 `entity` 或 `entities`，以及布局、单位、时长、统计类型、周期、图片、阈值。
