# VHA 插件开发规划

本文是 VHA 的总规划。卡片细节在 [docs/cards](cards/)。看板没有建成，原因和每张工单的目标列见文末「看板」。

依据是两份材料：

- 当前 Home Assistant 主仪表盘「概览 / lovelace」的两个视图：盈松小窝、Tech。清单里的每一张卡都在下面的映射表里。
- 设计稿：客厅总览。画面上有 CCTV、Smart Reminder、圆环温控、Quick Access 设备瓦、底部媒体条、右下能耗区。

1.0 设备卡已经按 Quick Access 做完，本地预览与设计稿的四张设备瓦一致。代码在 [PR #1](https://github.com/Virus0418/VHA/pull/1)（分支 `cursor/add-vha-device-card-510d`），尚未合并。本规划不实现代码，也不合并该请求。

## 目标

做一套 HACS Dashboard 类型的 Lovelace 自定义卡片，让盈松小窝和 Tech 上同类的第三方卡换成同一视觉语言，并补上设计稿里还没有的画面。

装好之后只在视图里添加卡片。HA 的侧边栏、顶栏、菜单保持原样。

## 归并原则

不按「HA 里每一种原生卡一张插件」来做。同类只做一张，靠实体域、布局和配置适配。

已定 9 张，不要再拆，不要再加第 10 张：

| 顺序 | 名称 | 类型 | 一张卡覆盖什么 | 工单 | 目标列 |
| --- | --- | --- | --- | --- | --- |
| 1 | 设备卡 | `custom:vha-device-card` | 开关、灯、风扇、门锁、封面、脚本/场景执行、产品图瓦片 | [#2](https://github.com/Virus0418/VHA/issues/2) | 待审查 |
| 2 | 气候卡 | `custom:vha-climate-card` | 空调圆环、模式、电源；可选耗电 | [#3](https://github.com/Virus0418/VHA/issues/3) | 待办 |
| 3 | 传感器卡 | `custom:vha-sensor-card` | 数值、统计、曲线、电量、连通性、能耗色带、主机多指标、横排 glance | [#4](https://github.com/Virus0418/VHA/issues/4) | 待办 |
| 4 | 媒体卡 | `custom:vha-media-card` | 播放条；遥控是同一张卡里的可选模块 | [#5](https://github.com/Virus0418/VHA/issues/5) | 待办 |
| 5 | 摄像卡 | `custom:vha-camera-card` | 直播画面与多镜头。产品图开关不是这张卡 | [#6](https://github.com/Virus0418/VHA/issues/6) | 待办 |
| 6 | 调控卡 | `custom:vha-control-card` | 独立滑条（摆风角度、亮度、风速百分比） | [#7](https://github.com/Virus0418/VHA/issues/7) | 待办 |
| 7 | 家电卡 | `custom:vha-appliance-card` | 洗衣、烘干、洗碗、扫地等程序类家电 | [#8](https://github.com/Virus0418/VHA/issues/8) | 待办 |
| 8 | 提醒卡 | `custom:vha-reminder-card` | 告警列表加底部用量洞察。不是欢迎语 | [#9](https://github.com/Virus0418/VHA/issues/9) | 待办 |
| 9 | 媒体库卡 | `custom:vha-library-card` | 一整组媒体库：数量、最近添加、继续观看、服务器状态 | [#10](https://github.com/Virus0418/VHA/issues/10) | 待办 |

明确不另开卡的内容：

- 风扇「一键回正」「上下摆风」是设备卡的可选附加控件，写在设备卡工单里。
- 纵向/横向摆风角度是调控卡，不塞进设备卡。
- Kodi 方向键、触摸板、键盘是媒体卡的 `show_remote` 模块，不做 `vha-remote-card`。
- 体重曲线、NAS 曲线、电量、今日耗电、能耗色带都是传感器卡的 `layout`，不拆成 graph / statistic / battery 三张卡。
- picture-entity 如果是产品图加开关或在线状态（极米、小米风扇、PC、PS5），归设备卡。真正的 `camera` 直播才用摄像卡。
- Tech 里 Emby 的九个左右瓦片合成一张媒体库卡。

## 不在范围内

这些继续用 Home Assistant 原生成页，插件不提供替代品：

- `heading`：房间和分区标题（客厅、书房、服务器、WBC-EMBY 媒体库等）
- 视图 badges：顶栏徽章（书桌灯、洗衣机剩余时间、三台空调、CPU、WIFI 等）
- `markdown`：欢迎语、「数据面板」标题、网络连通性说明
- 布局容器：sections、grid、stack。卡片单独添加，由视图自己排版
- 侧边栏面板、`panel_custom`、kiosk、整页 Dashboard 替换
- 修改 `configuration.yaml`

徽章和标题里的数据仍然由对应卡片展示。例如洗衣机剩余时间徽章保留原生，家电卡读取同一个传感器。

## 共享约定

每张卡在合并或发布前，都要按 [卡片审核与发布标准](card-review-standard.md) 审核。

- 视觉与 1.0 设备卡同一套：字体 Inter / SF Pro / 系统无衬线；标题 14px / 700；副标题 11px `#9aa0a8`；状态 12px `#6f747c`；圆角 16px；开关 36×20，关 `#e4e6ea`，开 `#1a1a1a`。设计稿是白底卡片放在浅灰视图上。1.0 设备卡底色是 `#f6f8fa`。新卡用白底 `#ffffff`，控件尺寸和字号跟设备卡走，不另做一套开关。
- 关态或离线：产品图降低饱和度和透明度，与设备卡一致。
- 编辑器统一用 Lovelace 可视化编辑器。HA 内走 `ha-form` 和实体选择器，标签用中文。本地预览可以退回普通输入。字段命名用蛇形，和设备卡的 `show_toggle` 同一风格。
- 每张卡注册进 `window.customCards`，可以单独在「添加卡片」里搜到。
- 全部卡片打进同一个构建产物：仓库根目录 `vha.js`。HACS 资源路径 `/hacsfiles/VHA/vha.js`（对应 `/config/www/community/VHA/vha.js`）。`hacs.json` 的 `filename` 保持 `vha.js`。
- 点击信息区打开 `hass-more-info`。开关、滑条、模式胶囊自己处理点击，不冒泡到 more-info。
- 不可用（`unavailable` / `unknown`）时禁用写操作，并显示「不可用」或「未知」。
- 服务调用失败不吞掉，卡片上留一行短错误，方便在 HA 里排查。

## 路线图

开发顺序就是看板从上到下的优先级。完成一张再开下一张的实现，文档和工单一次建齐。合并或发布前，按 [卡片审核与发布标准](card-review-standard.md) 审核。

1. 设备卡 1.0。进行中，[PR #1](https://github.com/Virus0418/VHA/pull/1) 已开。先审查、合并，再发 HACS。本任务不合并。
2. 气候卡。主视图三台空调，也是设计稿右侧圆环。
3. 传感器卡。替换数量最多：盈松小窝的体重、电量、PC 指标，Tech 的 NAS / PC / 连通性。
4. 媒体卡，含可选遥控模块。替换 KODI 媒体控制和 universal-remote-card。
5. 摄像卡。按设计稿预留，当前主视图没有真正的直播。
6. 调控卡。替换两张风扇角度滑条。
7. 家电卡。替换生活阳台洗衣机卡。
8. 提醒卡。设计稿 Smart Reminder，当前没有同类卡。
9. 媒体库卡。替换 Tech「WBC-EMBY 媒体库」整组。

设备卡合并之后的附加控件（回正、摆风开关、大图布局、脚本显示「执行」）仍算设备卡的后续，不插队成新类型，也不挡住气候卡开工。附加控件可以跟在 1.0 合并后的同一个工单里做。

## 现有仪表盘映射

读表方式：每一行对应清单里的一张卡。「归并」列只有上面 9 张卡，或「不纳入」。同一实体在多个分区重复出现时，仍然归到同一张卡，不因为重复而新开类型。

清单里没写出 `entity_id` 的 `entity` / `device` / `toggle`，落地时看域：`climate` 用气候卡，可开关的灯/开关/风扇/脚本用设备卡，只读传感器用传感器卡。

### 盈松小窝

类型统计：tile×13，entity×11，heading×6，button-card×5，picture-entity×4，thermostat×3，mini-graph-card×2，mushroom-number-card×2，sensor×2，statistic×2，device×2，universal-remote-card×1，media-control×1，entities×1，mushroom-fan-card×1，mushroom-light-card×1，toggle×1，tebo-washer-final-card×1，markdown×1。

| 分区 | 现有卡片 | 实体 / 说明 | 归并 |
| --- | --- | --- | --- |
| 客厅 | heading 客厅 | 分区标题 | 不纳入 |
| 客厅 | button-card 小松 | `sensor.s200_home_weight_song` | 传感器卡 `profile` |
| 客厅 | mini-graph-card | 同上，嵌套在按钮卡里，约 7 天曲线 | 传感器卡 `profile` 内的趋势，不单独成卡 |
| 客厅 | button-card 盈子 | `sensor.s200_home_weight_ying` | 传感器卡 `profile` |
| 客厅 | mini-graph-card | 同上，嵌套曲线 | 传感器卡 `profile` 内的趋势 |
| 客厅 | thermostat 客厅空调 | `climate.lmkj_cn_2003088651_bf1001`，带 hvac / fan modes | 气候卡 |
| 客厅 | universal-remote-card | 现用 platform Kodi，播放器 `media_player.kodi7s` | 媒体卡的遥控模块 |
| 客厅 | picture-entity 极米投影仪 | `switch.h3s_switch_2`，产品图加开关 | 设备卡 |
| 客厅 | media-control KODI | `media_player.kodi7s`，仅 on 时显示 | 媒体卡 |
| 客厅 | picture-entity PS5 | `sensor.viruswhk_online_status`，在线状态图 | 设备卡 |
| 客厅 | entities | `sensor.viruswhk_last_online`、`binary_sensor.viruswhk_subscribed_to_playstation_plus`、`sensor.viruswhk_now_playing` | 传感器卡 `status` / `glance`。这是只读附属信息；要控播放时把对应 `media_player` 配到媒体卡 |
| 客厅 | entity | 清单未写实体 | 按域归入，不新开类型 |
| 客厅 | entity | 清单未写实体 | 按域归入，不新开类型 |
| 书房 | heading 书房 | 分区标题 | 不纳入 |
| 书房 | thermostat | `climate.qjiang_cn_921972649_ac02`，带 hvac / fan modes | 气候卡 |
| 书房 | picture-entity 小米风扇 | `fan.zhimi_cn_507346713_fa1_s_2_fan` | 设备卡 |
| 书房 | mushroom-fan-card 书房风扇 | 同一台风扇的基础开关 | 设备卡。和上一张合并成一张设备卡 |
| 书房 | tile 一键回正 | `switch.zhimi_cn_507346713_fa1_one_key_back_p_5_9` | 设备卡可选附加控件 |
| 书房 | tile 上下摆风 | `switch.zhimi_cn_507346713_fa1_vertical_swing_p_2_4` | 设备卡可选附加控件 |
| 书房 | mushroom-number-card 纵向 | `input_number.shang_xia_bai_feng_jiao_du` | 调控卡 |
| 书房 | tile | `automation.gpuguo_re_kai_qi_feng_shan` | 设备卡（自动化，执行） |
| 书房 | mushroom-number-card 横向 | `input_number.zuo_you_bai_feng_jiao_du` | 调控卡 |
| 书房 | tile | `automation.gpuhui_fu_guan_bi_feng_shan` | 设备卡（自动化，执行） |
| 书房 | mushroom-light-card 小米显示器灯 | `light.yeelink_cn_649098006_lamp22_s_2` | 设备卡 |
| 书房 | tile 空调定时控温 | `script.1787983005044` | 设备卡（脚本，执行） |
| Window PC MAX | heading | 分区标题 | 不纳入 |
| Window PC MAX | picture-entity PC PRO MAX | `switch.dian_nao_kai_guan` | 设备卡。大图布局是同一张卡的后续 |
| Window PC MAX | sensor 显卡温度 | `sensor.virus_pc_virus_pc_gputemperature` | 传感器卡 `value` / `graph`，也可放进 `host` |
| Window PC MAX | sensor GPU 占用 | `sensor.virus_pc_virus_pc_gpuload` | 传感器卡 |
| Window PC MAX | tile 电脑开关 | `switch.dian_nao_kai_guan`，带 toggle | 设备卡。与 picture-entity 同一开关 |
| Window PC MAX | toggle | 清单未写实体 | 按域归设备卡 |
| Window PC MAX | tile 开机时长 | `sensor.dian_nao_kai_ji_shi_chang` | 传感器卡 `value`，可放进 `host` |
| Window PC MAX | tile 电脑显示器 | `light.monitor_control` | 设备卡 |
| Window PC MAX | tile 内存占用 | `sensor.virus_pc_virus_pc_memoryusage` | 传感器卡 |
| Window PC MAX | tile CPU 占用 | `sensor.virus_pc_virus_pc_cpuload` | 传感器卡 |
| 卧室 | heading 卧室 | 分区标题 | 不纳入 |
| 卧室 | thermostat 卧室空调 | `climate.cuco_cn_539690460_cp6`，带 hvac / fan modes | 气候卡 |
| 卧室 | statistic 今日耗电 | `sensor.cuco_cn_539690460_cp6_power_consumption_p_7_1` | 传感器卡 `statistic`。同一实体可挂到气候卡 `consumption_entity` |
| 卧室 | statistic 本月耗电 | 同一传感器，周期不同 | 传感器卡 `statistic`。气候卡可选再展示本月 |
| 卧室 | tile | `script.unknown` | 设备卡（脚本，执行） |
| 卧室 | tile | `script.2` | 设备卡（脚本，执行） |
| 卧室 | tile | `script.1` | 设备卡（脚本，执行） |
| 生活阳台 | heading | 分区标题 | 不纳入 |
| 生活阳台 | tebo-washer-final-card | 厂商洗衣机卡 | 家电卡 |
| 移动设备 | heading | 分区标题 | 不纳入 |
| 移动设备 | button-card iPhone 18 Pro Max | `sensor.iphone18_pro_max_battery_level` | 传感器卡 `battery` |
| 移动设备 | button-card iPad Pro | `sensor.ipad_battery_level` | 传感器卡 `battery` |
| 移动设备 | button-card MacBook Pro | `sensor.wang_yan_song_de_macbook_pro_internal_battery_level` | 传感器卡 `battery` |
| 移动设备 | markdown | 说明文字 | 不纳入 |
| 移动设备 | entity 书桌灯 | `light.yeelink_cn_649098006_lamp22_s_2` | 设备卡。与书房显示器灯同一实体 |
| 移动设备 | entity 显示器 | `light.monitor_control` | 设备卡 |
| 移动设备 | entity 主机 | `switch.dian_nao_kai_guan` | 设备卡 |
| 移动设备 | entity 洗衣机剩余时间 | `sensor.mibx5_cn_928578973_f531_left_time_p_2_10` | 家电卡的剩余时间实体。这一行被家电卡取代 |
| 移动设备 | entity | 清单未写实体 | 按域归入 |
| 移动设备 | entity（device）客厅空调 | `climate.lmkj_cn_2003088651_bf1001` | 气候卡 |
| 移动设备 | device | 清单未写实体，紧挨客厅空调 | 若是该空调设备则气候卡，否则按域 |
| 移动设备 | entity（device）书房空调 | `climate.qjiang_cn_921972649_ac02` | 气候卡 |
| 移动设备 | device | 清单未写实体，紧挨书房空调 | 若是该空调设备则气候卡，否则按域 |
| 移动设备 | entity 卧室空调 | `climate.cuco_cn_539690460_cp6` | 气候卡 |
| 移动设备 | entity | 清单未写实体 | 按域归入 |
| 顶栏徽章 | badge 书桌灯 | `light.yeelink_cn_649098006_lamp22_s_2` | 不纳入。设备卡展示同一灯 |
| 顶栏徽章 | badge 显示器 | `light.monitor_control` | 不纳入 |
| 顶栏徽章 | badge 主机 | `switch.dian_nao_kai_guan` | 不纳入 |
| 顶栏徽章 | badge 洗衣机剩余时间 | `sensor.mibx5_cn_928578973_f531_left_time_p_2_10` | 不纳入。家电卡读取该传感器 |
| 顶栏徽章 | badge 客厅空调 | `climate.lmkj_cn_2003088651_bf1001` | 不纳入 |
| 顶栏徽章 | badge 书房空调 | `climate.qjiang_cn_921972649_ac02` | 不纳入 |
| 顶栏徽章 | badge 卧室空调 | `climate.cuco_cn_539690460_cp6` | 不纳入 |

### Tech

类型统计：entity×11，button-card×10，tile×9，mini-graph-card×7，heading×4，statistic×2，glance×1，mushroom-template-card×1，markdown×1。

| 分区 | 现有卡片 | 实体 / 说明 | 归并 |
| --- | --- | --- | --- |
| （无标题） | button-card DeepSeek 余额 | `sensor.deepseek_balance` | 传感器卡 `status` |
| （无标题） | button-card ChatGPT | `sensor.tech_https_chatgpt` | 传感器卡 `status` |
| （无标题） | button-card 百度 | `sensor.tech_https_baidu` | 传感器卡 `status` |
| （无标题） | button-card Google | `sensor.tech_https_google` | 传感器卡 `status` |
| 服务器 | heading 服务器 | 分区标题 | 不纳入 |
| 服务器 | entity 运行时间 | `sensor.ugnasyun_xing_shi_jian_ge_shi_hua` | 传感器卡 `value`，可放进 `host` |
| （无标题） | button-card 系统版本 | `sensor.ugreen_nas_nas_ugos_version` | 传感器卡 `value` / `status` |
| （无标题） | button-card VOL 1 使用 | `sensor.ugreen_nas_pool_1_volume_1_used_size` | 传感器卡 `value` |
| （无标题） | button-card VOL 2 使用 | `sensor.ugreen_nas_pool_2_volume_1_used_size` | 传感器卡 `value` |
| （无标题） | mini-graph-card CPU | `sensor.ugreen_nas_cpu_usage` | 传感器卡 `graph`，可放进 `host` |
| （无标题） | mini-graph-card CPU 温度 | `sensor.ugreen_nas_cpu_temperature` | 传感器卡 `graph` / `host` |
| （无标题） | mini-graph-card 内存 | `sensor.ugreen_nas_ram_usage` | 传感器卡 `graph` / `host` |
| （无标题） | statistic 当月下载 | `sensor.192_168_50_1_download` | 传感器卡 `statistic` |
| （无标题） | statistic 当月上传 | `sensor.192_168_50_1_upload` | 传感器卡 `statistic` |
| （无标题） | glance 硬盘通电时间 | `sensor.ugreen_nas_pool_1_disk_4_power_on_hours`、`disk_1`、`disk_3`、`disk_2` | 传感器卡 `glance` |
| （无标题） | mini-graph-card 上传 | `sensor.ugreen_nas_overall_lan_upload_raw` | 传感器卡 `graph` |
| （无标题） | mini-graph-card 下载 | `sensor.ugreen_nas_overall_lan_download_raw` | 传感器卡 `graph` |
| （无标题） | tile 硬盘 1 | `sensor.ugreen_nas_pool_1_disk_4_status` | 传感器卡 `glance` 或 `status` |
| （无标题） | tile 硬盘 2 | `sensor.ugreen_nas_pool_1_disk_1_status` | 传感器卡 `glance` 或 `status` |
| （无标题） | tile 硬盘 3 | `sensor.ugreen_nas_pool_1_disk_2_status` | 传感器卡 `glance` 或 `status` |
| （无标题） | tile 硬盘 4 | `sensor.ugreen_nas_pool_1_disk_3_status` | 传感器卡 `glance` 或 `status` |
| Window PC MAX | heading | 分区标题 | 不纳入 |
| Window PC MAX | button-card | `switch.dian_nao_kai_guan`，内嵌两条曲线 | 开关用设备卡 |
| Window PC MAX | mini-graph-card 显卡温度 | `sensor.virus_pc_virus_pc_gputemperature`，嵌套 | 传感器卡 `graph` / `host` |
| Window PC MAX | mini-graph-card GPU 占用 | `sensor.virus_pc_virus_pc_gpuload`，嵌套 | 传感器卡 `graph` / `host` |
| WBC-EMBY 媒体库 | heading | 分区标题 | 不纳入。标题仍用原生 heading |
| WBC-EMBY 媒体库 | entity 扫描 | `binary_sensor.virusemby_library_scan_active` | 媒体库卡状态行 |
| WBC-EMBY 媒体库 | entity 连接 | `binary_sensor.virusemby_server_connected` | 媒体库卡 |
| WBC-EMBY 媒体库 | entity 版本 | `sensor.virusemby_server_version` | 媒体库卡 |
| WBC-EMBY 媒体库 | entity 更新 | `update.emby_media_update` | 媒体库卡 |
| （无标题） | button-card 最近添加 | `sensor.wbc_emby_wbc_emby_recently_added`，读 `attributes.items` | 媒体库卡 |
| （无标题） | tile 电影数 | `sensor.wbc_emby_movies` | 媒体库卡统计 |
| （无标题） | tile 合集数 | `sensor.wbc_emby_collections` | 媒体库卡统计 |
| （无标题） | tile 电视剧数 | `sensor.wbc_emby_tv_shows` | 媒体库卡统计 |
| （无标题） | tile 剧集数 | `sensor.wbc_emby_episodes` | 媒体库卡统计 |
| （无标题） | button-card 继续观看 | `sensor.wbc_emby_wbc_emby_continue_watching`，剧集显示「剧名 - 集名」 | 媒体库卡 |
| （无标题） | mushroom-template-card | `binary_sensor.wbc_emby_server_connected`，现用于最后连接用户 | 媒体库卡。用户字段可映射，不写死模板 |
| （无标题） | tile 最后活动 | `sensor.wbc_emby_last_activity` | 媒体库卡 |
| 网络连通性 | heading | 分区标题 | 不纳入 |
| 网络连通性 | markdown | 说明文字 | 不纳入 |
| 网络连通性 | entity 电脑 | `switch.dian_nao_kai_guan` | 设备卡 |
| 网络连通性 | entity CPU | `sensor.virus_pc_virus_pc_cpuload` | 传感器卡 |
| 网络连通性 | entity GPU | `sensor.virus_pc_virus_pc_gpuload` | 传感器卡 |
| 网络连通性 | entity 显示器 | `light.monitor_control` | 设备卡 |
| 网络连通性 | entity 台灯 | `light.yeelink_cn_649098006_lamp22_s_2` | 设备卡 |
| 网络连通性 | entity WIFI 连接 | `sensor.192_168_50_1_devices_connected` | 传感器卡 `value` |
| 顶栏徽章 | badge 电脑 | `switch.dian_nao_kai_guan` | 不纳入 |
| 顶栏徽章 | badge CPU | `sensor.virus_pc_virus_pc_cpuload` | 不纳入 |
| 顶栏徽章 | badge GPU | `sensor.virus_pc_virus_pc_gpuload` | 不纳入 |
| 顶栏徽章 | badge 显示器 | `light.monitor_control` | 不纳入 |
| 顶栏徽章 | badge 台灯 | `light.yeelink_cn_649098006_lamp22_s_2` | 不纳入 |
| 顶栏徽章 | badge WIFI 连接 | `sensor.192_168_50_1_devices_connected` | 不纳入 |

### 设计稿有、当前主视图没有的

| 设计稿区域 | 归并 | 说明 |
| --- | --- | --- |
| Quick Access 四张设备瓦 | 设备卡 | 1.0 已按此做完。视图用 HA 的 grid / sections 横排，插件不提供 Quick Access 容器 |
| Temperature Control 圆环 | 气候卡 | 替换三张 thermostat，不要照抄设计稿上写死的 Auto / Wind / Heat / Swing |
| Energy Efficiency、Total Energy、色带 | 传感器卡 `energy` | 卧室耗电统计仍可用 `statistic` 布局；色带是另一种布局 |
| Speaker 媒体条 | 媒体卡 | 替换 KODI media-control |
| CCTV Camera | 摄像卡 | 预留。现有 picture-entity 不是直播 |
| Smart Reminder 与 Today Usage | 提醒卡 | 预留。欢迎语继续用 markdown |

## 看板

计划中的 GitHub Projects V2 名称是「VHA 卡片开发」，状态列是：待办、进行中、待审查、已完成。设备卡应在「待审查」，其余八张在「待办」。

这次没有项目链接。用当前环境里的 `gh`（GitHub App 安装令牌，身份是 `cursor[bot]`）调用 `createProjectV2`，所有者为 Virus0418 时，GitHub 返回：`cursor[bot] does not have permission to create projects on ownerId U_kgDOCF12Fg`。同时带上本仓库 ID 再试一次，错误相同。Virus0418 名下没有组织，不能改放到组织项目。经典 Projects 接口返回 404。因此九个工单都还没进任何项目。下表是目标列，不是已经生效的看板列。

标签 `card` 和 `1.0` 也没能建。创建标签返回 403 `Resource not accessible by integration`。给工单追加已有标签同样被拒绝，所以工单目前没有标签。

工单由 `gh issue create` 建在 `Virus0418/VHA`。作者显示为 `cursor[bot]`，因为这台环境的 `gh` 用的是 Cursor GitHub App 的安装令牌，不是带 `project` scope 的用户登录。

| 工单 | 目标列 |
| --- | --- |
| 设备卡 [#2](https://github.com/Virus0418/VHA/issues/2) | 待审查（[PR #1](https://github.com/Virus0418/VHA/pull/1) 已开，未合并） |
| 气候卡 [#3](https://github.com/Virus0418/VHA/issues/3) | 待办 |
| 传感器卡 [#4](https://github.com/Virus0418/VHA/issues/4) | 待办 |
| 媒体卡 [#5](https://github.com/Virus0418/VHA/issues/5) | 待办 |
| 摄像卡 [#6](https://github.com/Virus0418/VHA/issues/6) | 待办 |
| 调控卡 [#7](https://github.com/Virus0418/VHA/issues/7) | 待办 |
| 家电卡 [#8](https://github.com/Virus0418/VHA/issues/8) | 待办 |
| 提醒卡 [#9](https://github.com/Virus0418/VHA/issues/9) | 待办 |
| 媒体库卡 [#10](https://github.com/Virus0418/VHA/issues/10) | 待办 |
