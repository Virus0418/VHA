# VHA 卡片审查验收标准

每张卡在合并、安装到 Home Assistant、或标成「卡片通过」之前，按本文验收。本文分两层，避免把即将重做的视觉写死：

| 层 | 管什么 | 新设计稿来了之后 |
| --- | --- | --- |
| A. 平台 / 工程 | 自定义卡片怎么挂进 Lovelace、怎么编辑、怎么占网格、怎么跟 `hass` 和点击相处、怎么安装 | 不改。只在官方平台行为变了时改 |
| B. 产品 / 交互 / 状态 | 每类卡必须能做什么、点哪里、哪些状态必须看见 | 设计源更新后同步本节。更新前，已设计的类型以本节为准 |

视觉语言见 [设计规范 1.0](design-spec-1.0.md)，那是**当前参考**，不是不可更改的验收条件。用户即将重新设计卡片。字号、圆角、渐变、间距、阴影以新设计稿为准；新稿落地前，1.0 只用来对照「现在长什么样」。1.0 文内已记录的不严谨处（选中芯片对比弱、百分比空格不统一等）不得当成必须复刻的条件。

插件只做仪表板里的自定义卡片：加到视图上使用。不注册侧边栏面板，不要求修改 `configuration.yaml`，不用 `panel_custom`。分区标题、视图徽章、markdown 欢迎语继续用 Home Assistant 原生成页。九类归并以 [插件开发规划](plugin-development.md) 为准，不另加第 10 类。`electronics` 只是 `custom:vha-device-card` 的一种 `layout`，不是第 10 类。

「可以合并」和「卡片通过」是两档，见第 6 节。GitHub Pages 上的虚拟实体预览通过后，才考虑合并和 Home Assistant 安装测试。没有现场测试，审核结论不得写「卡片通过」。

---

## 1. 官方依据

下面每条平台规则都能回到这些页面。不要在实现里调用本文没有列出的 Home Assistant 前端 API。

| 主题 | 文档 |
| --- | --- |
| 自定义卡片生命周期、`setConfig`、`hass`、`getCardSize`、`getGridOptions`、编辑器里的 `preview` | [自定义卡片](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)（同一篇：[contributors 镜像](https://contributors.home-assistant.io/frontend/custom-ui/card/)） |
| 卡片是什么、怎么添加、Sections 里怎么改尺寸 | [仪表板卡片](https://www.home-assistant.io/dashboards/cards/) |
| Sections 视图（默认布局） | [Sections](https://www.home-assistant.io/dashboards/sections/) |
| 视图类型；Masonry 按卡片高度分栏 | [视图](https://www.home-assistant.io/dashboards/views/)、[Masonry](https://www.home-assistant.io/dashboards/masonry/) |
| 节宽、行高、一张卡一个职责 | [仪表板设计说明](https://contributors.home-assistant.io/design/dashboards/) |
| 网格尺寸定稿（行高 56、间距 8）与自定义卡片要声明默认 / 最小 / 最大尺寸 | [Dashboard chapter 1](https://www.home-assistant.io/blog/2024/03/04/dashboard-chapter-1)、[Dashboard chapter 2](https://www.home-assistant.io/blog/2024/07/26/dashboard-chapter-2/)、[2024.11 自定义卡片网格](https://contributors.home-assistant.io/blog/2024/11/06/custom-card-sections-support/) |
| 点按、长按、双击能做哪些动作 | [仪表板动作](https://www.home-assistant.io/dashboards/actions/) |
| 自定义卡片如何触发这些动作（`hass-action`） | [自定义卡片的动作事件](https://contributors.home-assistant.io/blog/2023/07/07/action-event-custom-cards/) |
| 点选实体后的更多信息对话框 | [更多信息](https://contributors.home-assistant.io/design/more-info/) |
| 选卡面板、`window.customCards`、`getStubConfig`、`getConfigForm`、`getConfigElement`、`config-changed` | [卡片编辑器与选卡面板](https://contributors.home-assistant.io/frontend/custom-ui/card-editor/) |
| `hass` 上有哪些字段、`callService`、状态与名称格式化 | [hass 对象](https://contributors.home-assistant.io/frontend/reference/hass-object/)、[formatEntityState](https://contributors.home-assistant.io/blog/2023/08/29/hass-format-state/)、[formatEntityName](https://contributors.home-assistant.io/blog/2026/05/11/format-entity-name-helper/) |
| `unavailable` / `unknown` | [不可用](https://contributors.home-assistant.io/glossary/unavailable/)、[状态与属性](https://contributors.home-assistant.io/core/entities/state-attributes/)、[状态对象](https://contributors.home-assistant.io/core/internals/states/) |
| 把卡片注册成仪表板资源 | [注册资源](https://contributors.home-assistant.io/frontend/custom-ui/resources/) |
| 浅色 / 深色主题变量 | [前端集成里的深色模式](https://www.home-assistant.io/integrations/frontend/#dark-mode-support) |
| HACS 里这个类型叫 Dashboard，校验类别仍是 `plugin` | [Plugin (Dashboard)](https://www.hacs.xyz/docs/publish/plugin/)、[发布通例与 hacs.json](https://www.hacs.xyz/docs/publish/start/)、[用户侧 Dashboard 说明](https://www.hacs.xyz/docs/use/repositories/type/dashboard/) |
| 2026.11 起 HACS 作为 Marketplace 安装 Dashboard 资源 | [发布说明](https://www.hacs.xyz/docs/publish/)、[如何发布一张仪表板卡片](https://contributors.home-assistant.io/marketplace/guides/dashboard/)、[Marketplace 如何工作](https://contributors.home-assistant.io/marketplace/how-it-works/) |

`ha-card` 以及其它 `ha-*` 元素可以用来贴近内置卡片，但官方写明它们不是稳定承诺的 API。验收不把「必须使用某个 `ha-*` 标签」当作唯一做法。

---

## 2. A. 平台 / 工程验收

本节不随视觉改版改写。

### 2.1 生命周期

依据：[自定义卡片](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)。

卡片是注册进 `customElements` 的自定义元素。标签名去掉 `custom:` 前缀后，就是仪表板配置里的 `type`。例如标签 `vha-device-card` 对应 `type: custom:vha-device-card`。

- [ ] 实现 `setConfig(config)`。配置非法时抛出 `Error`，让 Home Assistant 显示错误卡，而不是白屏。
- [ ] `setConfig` 只在卡片创建和配置变化时做事。不要在这里调用 `hass.callService`。
- [ ] 实现 `hass` 的 setter。每次家庭状态变化都会进来，而且很频繁。只更新真正变了的部分。比较方式用 `newHass.states[id] !== oldHass.states[id]`（[hass 对象](https://contributors.home-assistant.io/frontend/reference/hass-object/)）。
- [ ] 不得在每次 `hass` 更新时无条件整卡 `innerHTML` 重绘。官方示例是先建好节点，之后只改文本。整卡换掉 DOM 会拆掉正在进行的点击和拖动。
- [ ] 拖动滑杆期间忽略这次 `hass` 刷新，松手后再把结果写上并允许刷新。
- [ ] 需要服务时只用 `hass.callService(domain, service, data, target)`。失败必须在卡片上留下一句短错误，不能只在控制台里消失。`callService` 默认会弹出失败提示；卡片上的短错误仍然要留，方便在视图里看到。
- [ ] 名称和带单位的数值优先走 `hass.formatEntityName`、`hass.formatEntityState`、`hass.formatEntityAttributeValue`（或它们的 `ToParts`）。用户自己填写的标题按原文字返回。产品规定的短文案（「已关闭」「不可用」）可以覆盖原始状态，但不得把 `unavailable`、`unknown` 或未翻译的内部模式名直接画出来。

### 2.2 配置编辑器

依据：[卡片编辑器与选卡面板](https://contributors.home-assistant.io/frontend/custom-ui/card-editor/)。

- [ ] 有可视化编辑器。简单卡片用静态 `getConfigForm()` 返回 schema；字段不够时用静态 `getConfigElement()` 交回自己的编辑器元素。两者都有时，Home Assistant 用 `getConfigElement()`。
- [ ] 编辑器实现 `setConfig`，并接受 `hass`。配置一变就派发冒泡且 `composed: true` 的 `config-changed`，`detail.config` 是完整新配置。
- [ ] 实体字段用 `entity` 选择器，并按该卡允许的域过滤。标签用中文。
- [ ] 可视化编辑器与 YAML 来回改，结果一致；刷新仪表板后配置还在。
- [ ] 新字段用蛇形命名，和现有的 `show_toggle` 同一风格。已有 YAML 升级后仍能打开；改字段名必须兼容旧键，或在该卡文档里写迁移。
- [ ] 本地预览没有 `ha-form` 时可以退回普通输入，字段与 HA 内编辑器相同。
- [ ] 可选：`window.customCards` 上的 `getEntitySuggestion`（2026.6 起）只在域、设备类或支持的功能匹配时建议这张卡。对所有实体都建议，视为不合格。

### 2.3 选卡面板与 `getStubConfig`

依据：[卡片编辑器与选卡面板](https://contributors.home-assistant.io/frontend/custom-ui/card-editor/)。

- [ ] 模块加载时写入 `window.customCards`（先保证数组存在）。每张卡一条：`type`（不带 `custom:`）、`name`、`description`。`preview: true`，让选卡面板渲染实时预览。社区卡片出现在选卡面板的社区分组里。
- [ ] 实现静态 `getStubConfig(hass, entities, entitiesFallback)`。返回的对象**不要带** `type`，Home Assistant 会自己合并类型。
- [ ] `entities` 是还没放在这个仪表板上的实体，`entitiesFallback` 是已经在板上的。两个列表都不含 `unavailable` / `unknown`。先在 `entities` 里找同类域，没有再查 `entitiesFallback`。
- [ ] 找到同类实体时，选卡预览要接近成品：真实名称、真实状态、有图则显示图。不要用空壳、线框或另一类实体充数。
- [ ] 两个列表都没有同类实体时，才显示空卡示意（例如「请选择一个实体」）。不要套用官方示例里的 `sun.sun`，除非这张卡本来就是给太阳用的。不要写死别人家里的实体 ID。
- [ ] `getStubConfig` 只返回配置，不调用服务，不修改实体。
- [ ] 选卡面板和编辑器预览里的开关、滑杆、芯片、播放键都不得写入真实设备。审查：打开「添加卡片」，点击预览上的控件，到开发者工具 → 状态确认该实体没变。编辑器里卡片的 `preview` 会被设为 `true`（[自定义卡片](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)）；预览阶段不要给控件挂 `hass.callService`。保存并放到视图上之后，视图里的那张卡才响应操作。

### 2.4 点击：必须有结果，也不能被抢走

依据：[仪表板动作](https://www.home-assistant.io/dashboards/actions/)、[hass-action](https://contributors.home-assistant.io/blog/2023/07/07/action-event-custom-cards/)、[更多信息](https://contributors.home-assistant.io/design/more-info/)、[卡片原则](https://contributors.home-assistant.io/design/dashboards/)。

官方动作名是 `more-info`、`toggle`、`perform-action`、`navigate`、`url`、`assist`、`none`。自定义卡片触发它们的方式是派发冒泡且 `composed: true` 的 `hass-action`：`detail.action` 为 `tap`（或 `hold` / `double_tap`），`detail.config.entity` 是实体 ID，`detail.config.tap_action.action` 设为要做的动作。打开更多信息时，动作为 `more-info`。

- [ ] 信息区（标题、主数值、产品图、单项指标）点下去，打开**这一项那一个实体**的更多信息对话框。
- [ ] 开关、滑杆、模式芯片、播放键、换图箭头自己处理点击，并阻止冒泡。这些点击不得再打开更多信息。
- [ ] 不得吞掉点击：信息区不能点了没反应；控件不能既不执行、又不说明为什么。没有对应服务时，不要画一个点了毫无反馈的假按钮，直接不渲染该控件。
- [ ] 长按、双击、跳转、Assist 不是默认交互。某张卡要做，必须在 B 层写明，并使用上表里的动作名。

### 2.5 Sections 网格、推荐尺寸、编辑器窄栏

依据：[自定义卡片 · 网格](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/#sizing-in-the-sections-view)、[2024.11 说明](https://contributors.home-assistant.io/blog/2024/11/06/custom-card-sections-support/)、[Sections](https://www.home-assistant.io/dashboards/sections/)、[卡片尺寸页](https://www.home-assistant.io/dashboards/cards/#resizing-a-card)、[设计说明](https://contributors.home-assistant.io/design/dashboards/)、[chapter 2](https://www.home-assistant.io/blog/2024/07/26/dashboard-chapter-2/)。

一节是 12 列的网格。行高 56 像素，行与行、列与列之间 8 像素。一节大约 320–500 像素宽，屏幕变宽时增加的是节的列数，不是把同一节无限拉宽。没有 `getGridOptions()` 时，卡片占满整节，高度随内容，不能按行缩放。

`getGridOptions()` 返回：

| 字段 | 含义 |
| --- | --- |
| `columns` | 推荐列数。默认 12。可以是 `"full"`（整节）。推荐值用 3、6、9 或 12，才能和内置卡片对齐 |
| `rows` | 推荐行数。省略或 `"auto"` 时高度随内容，不能纵向缩放 |
| `min_columns` / `max_columns` | 用户能拉到的最窄 / 最宽 |
| `min_rows` / `max_rows` | 用户能拉到的最矮 / 最高 |

行高换算：`rows` 行的内容高度 = `rows × 56 + (rows − 1) × 8` 像素。2 行是 120 像素。

画板宽度不是运行时宽度。[设计规范 1.0](design-spec-1.0.md) 里的 220 / 448 / 480 是 Figma 画板。6 列只是半节：节宽 320 时大约一百多像素，节宽 500 时大约两百多像素，都不是 448。要接近 448 的画板，推荐列数应是 12（整节，约 320–500），或者设计稿同时画出半节宽度。审查时不接受「只在 448 画板上看过」。

编辑器预览是另一条宽度。官方没有公布这条预览栏的固定像素。卡片在编辑器里会被设上 `preview = true`。现场这条栏经常比设计画板窄，也经常比仪表板上同一推荐列数的卡片窄。

- [ ] 每张卡实现 `getGridOptions()`，至少给出推荐 `columns`、`rows`（或明确 `auto`）、`min_columns`、`min_rows`。推荐列数是 3 的倍数。
- [ ] 仪表板编辑器的布局页能看到这个推荐尺寸；关掉「使用推荐尺寸」后，不能拉到小于最小值。
- [ ] 在推荐尺寸和最小尺寸各看一次：不溢出、不重叠、控件仍能点到。
- [ ] 再在编辑器预览栏里看一次。标题按词换行，汉字完整落到下一行。禁止单行不换行加省略号，把中文标题截成半句。拉丁词在空格处断开。
- [ ] 卡片宽度用容器的 100%，不把 220、448、480 写进运行时宽度。
- [ ] 新设计若改变内容高度，重算 `rows` / `min_rows`，并改 B 层的尺寸表。不要沿用旧行数硬塞新布局。

当前四张卡已经声明的网格（重做前的基线；新稿必须重算，但仍然遵守上面的规则）：

| 卡 | 推荐列 × 行 | 最小列 × 行 |
| --- | --- | --- |
| 设备卡 `large` | 6 × 4 | 2 × 3 |
| 设备卡 `vertical` | 3 × 6 | 2 × 4 |
| 设备卡 `electronics` | 6 × 4 | 2 × 2 |
| 气候卡 | 6 × 5 | 2 × 4 |
| 传感器卡 `insight` | 6 × 6 | 2 × 4 |
| 传感器卡 `metrics` | 3 × 4 | 2 × 3 |
| 媒体卡 | 6 × 4 | 2 × 3 |

`electronics` 的模块可关。模块很少时不得留下大块空白；若推荐行数盖不住，改为 `rows: "auto"` 或按打开的模块重算，并在审核记录里写明。

### 2.6 Masonry 与 `getCardSize`

依据：[自定义卡片](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/#sizing-in-the-masonry-view)、[Masonry](https://www.home-assistant.io/dashboards/masonry/)。

新仪表板默认是 Sections。旧的 Masonry 仍会按 `getCardSize()` 把卡片分进各栏。返回值 1 表示大约 50 像素高；可以返回数字或 Promise。不实现时按 1 处理，高卡片会挤在一起。

- [ ] `getCardSize()` 接近真实高度除以 50、向上取整。布局变高后同步改这个数。
- [ ] 询问别的元素高度时，先 `await customElements.whenDefined(element.localName)`。

当前基线：设备卡大图 5、竖图 6、电子设备 5；气候卡 6；传感器洞察 7、指标 4；媒体卡 4。

### 2.7 浅色是默认验收，深色不得白字白底

依据：[深色模式](https://www.home-assistant.io/integrations/frontend/#dark-mode-support)、[卡片原则](https://contributors.home-assistant.io/design/dashboards/)。

- [ ] 浅色主题是默认验收环境。设计稿和 Pages 预览都先看浅色。
- [ ] 未单独声明支持深色时，深色不是「功能缺失」的否决项。
- [ ] 深色下不得白字贴白底，也不得深字贴近黑底导致正文读不出。卡片若固定用浅底，就要同时固定能读的字色，不要只依赖会被深色主题改掉的 `primary-text-color`，却留一张白色底。
- [ ] 声明支持深色之后，浅色和深色都要在 B 层列出的状态下看过，才能把深色算进「卡片通过」。

### 2.8 不可用、未知、缺实体、调用失败

依据：[不可用](https://contributors.home-assistant.io/glossary/unavailable/)、[状态与属性](https://contributors.home-assistant.io/core/entities/state-attributes/)、[状态对象](https://contributors.home-assistant.io/core/internals/states/)。

`available` 为假时，状态是 `unavailable`（设备离线或接口失败，集成不会编造一个读数）。状态为 `None` 时，前端看到的是 `unknown`。实体不在 `hass.states` 里，就是被删或 ID 写错。不可用时，域的状态属性和额外属性会缺席，不要假设亮度、模式列表还在。

- [ ] `unavailable` 显示「不可用」，`unknown` 显示「未知」。两者都禁止写入。
- [ ] 关闭、空闲、0、待机**不是**不可用。这些状态下，只要实体仍有对应服务，控件保持可操作。不得因为 `state === "off"` 禁用模式芯片，也不得拿掉「已关闭」或该类型规定的空闲文案。
- [ ] 实体不存在、域不匹配、图片地址失效：卡片仍在，不白屏，不拖垮视图，不出现破图图标。域不匹配时说明这张卡不能操作它，不要对错误域发写入。
- [ ] 服务失败：卡片上留一句中文短错误。
- [ ] 只显示实体实际支持的控件。不支持的模式、风速、静音、抓拍，直接不画。

### 2.9 安装与资源

依据：[注册资源](https://contributors.home-assistant.io/frontend/custom-ui/resources/)、[Plugin (Dashboard)](https://www.hacs.xyz/docs/publish/plugin/)、[hacs.json](https://www.hacs.xyz/docs/publish/start/)、[发布仪表板卡片](https://contributors.home-assistant.io/marketplace/guides/dashboard/)、[Dashboard 下载位置](https://www.hacs.xyz/docs/use/repositories/type/dashboard/)。

这个仓库的类别是 Dashboard。HACS 校验和目录里的类别名仍是 `plugin`。Marketplace（Home Assistant 2026.11 起内置）安装时会：把文件放到配置目录的 `www/community/<仓库名>/`，并登记一条 `module` 资源。默认 URL 形如 `/local/community/VHA/vha.js?v=<版本>`。仍使用 HACS 前端时，同一文件也可以走 `/hacsfiles/VHA/vha.js`。仓库名是 `VHA`，文件名是 `vha.js`，两者不同，所以 `hacs.json` 必须保留 `"filename": "vha.js"`，否则会按仓库名去找 `VHA.js`。

- [ ] 安装说明写明 Dashboard / `plugin`，以及上面两种资源 URL 分别在什么环境出现。不把侧边栏面板写成安装步骤。
- [ ] 默认不要求用户改 `configuration.yaml`。只有用户自己把 `lovelace.resource_mode` 设成 `yaml` 时，才按官方资源文档加一条 `type: module`。插件不使用 `frontend.extra_module_url` 作为安装方式。
- [ ] 安全模式不加载资源。审查时不要在安全模式里判定卡片丢失。
- [ ] 升级后旧的卡片 YAML 仍能打开。卸载或去掉资源后，仪表板能恢复，不留下侧边栏入口。
- [ ] 全部卡片仍在同一个 `vha.js` 里。发布物是已经构建好的文件；Marketplace 不会替仓库构建。

### 2.10 先 Pages 预览，再合并；现场测试之后才能写「卡片通过」

- [ ] 做完先用 GitHub Pages 上的虚拟实体预览审查。预览使用仓库里那套不连接真实 Home Assistant 的虚拟实体，覆盖 B 层列出的状态：开、关或空闲、不可用、未知、缺实体、窄栏、编辑器回退表单。虚拟实体上的操作只改预览里的状态。
- [ ] 本地 `npm run dev` 可以自查，不能代替这一关。Pages 还没发布时，先发布再审，不要把本地预览写成已通过。
- [ ] Pages 预览通过之后，才考虑合并，才安排 Home Assistant 安装测试。
- [ ] 第一次现场测试只放在单独的「VHA 试验」视图，不替换正在使用的主仪表板。
- [ ] 现场要看到：能添加、保存、刷新后配置还在；真实实体的显示和操作正确；不可用、删除实体、配错域；电脑浏览器和手机 App；推荐列宽和最小列宽。刷新或升级后，其它原生卡和现有视图不受影响。
- [ ] 审核记录里没有写明 Home Assistant 现场测试的日期和视图，结论不得为「卡片通过」。

---

## 3. 现场教训（硬性）

这些条不依赖旧视觉，两层都要过。

- [ ] **一设备一卡。** 一台设备的操作和主要状态只做在一张 VHA 卡上。电子设备的电量、网络、占用率是 `vha-device-card` 的模块，不是再开一张卡的理由，也不是第 10 类。历史上同一设备占了多张原生卡，归并时收成一张。
- [ ] **关闭和空闲仍可操作。** 除非状态是 `unavailable` / `unknown`，或该实体确实没有这项服务。不得因 `off` 禁用模式芯片，不得去掉「已关闭」。
- [ ] **`hass` 刷新不得打散点击。** 禁止无条件全量 `innerHTML` 重绘。拖动中不重绘。
- [ ] **`getStubConfig` 从当前家庭挑同类实体。** 选卡预览接近成品。没有同类实体才显示空卡。预览不得写入真实设备。
- [ ] **编辑器预览比设计稿窄。** 标题按词折行，不截断汉字。给出符合第 2.5 节的推荐尺寸和最小尺寸，并在审核记录里写明编辑器预览与仪表板实际宽度都看过。
- [ ] **浅色是默认环境。** 深色下不得白字贴白底。
- [ ] **Pages 虚拟实体预览通过，才考虑合并和安装测试。** 没有现场测试，不得标「卡片通过」。

---

## 4. B. 产品 / 交互 / 状态验收

设计稿更新后，只改本节和受影响的推荐行数。没在新稿里出现的画面细节，不要补进验收。下面「当前设计已覆盖」来自 [设计规范 1.0](design-spec-1.0.md) 和各卡文档，用来在新稿完成前对照 Figma。

### 4.1 每张卡都要有的交互和状态

固定交互类型只有这些。一张卡只用得到的那几种，并在该卡小节里点名入口：

| 类型 | 结果 |
| --- | --- |
| 打开更多信息 | 信息区打开对应实体的更多信息 |
| 开关写入 | `turn_on` / `turn_off`，或该域的等价动作（如 `lock.lock` / `lock.unlock`） |
| 模式写入 | 一次设置一个模式，如 `climate.set_hvac_mode`、`fan.set_preset_mode` |
| 连续值写入 | 拖动中只改预览数字；松手或按步进后调用一次 |
| 媒体传输 | 播放、暂停、上一首、下一首 |
| 卡片内部换页 | 换图、换镜头。只改卡片自己的下标，不调用无关服务 |
| 无动作 | 装饰、徽章、时间。点下去不得误开更多信息，也不得假装可点 |

建议的入口，除非该卡小节另有规定：

- 标题、主数值、产品图、程序名、时间：打开更多信息。
- 电源和房间开关：开关写入。
- 模式芯片：模式写入。
- 滑杆：连续值写入。
- 播放键和上下一首：媒体传输。
- 左右箭头：卡片内部换页。

绝对不可缺少的元素：

- [ ] 能看出是哪一台设备或哪一项数据的名称。没填配置时用实体的友好名称。
- [ ] 能看出当前状态的文案。关闭必须能读到「已关闭」；空闲类状态用该卡规定的词，不能留白。
- [ ] 一块不会被控件误触的信息点击区。
- [ ] 实体实际支持的那一个主操作。没有服务就不画按钮。

每张已设计的卡，下面这些状态都要在预览里能指给人看：

| 状态 | 必须看见 | 写入 |
| --- | --- | --- |
| 开或运行中 | 该卡规定的运行文案、数值或进度 | 允许 |
| 关闭 | 「已关闭」。电源或播放键仍可打开 | 允许，只要有服务 |
| 空闲 / 待机 | 该卡规定的空闲文案，不得显示成「已关闭」 | 允许，只要有服务 |
| `unavailable` | 「不可用」 | 禁止 |
| `unknown` | 「未知」 | 禁止 |
| 实体不存在或域不对 | 说明性占位，卡片还在 | 禁止 |
| 服务失败 | 一句短错误 | 该次失败可见 |
| 没有图片 | 占位或收起图槽，没有破图 | 与图无关的操作仍按上面各行 |

数值和单位之间有空格，例如 `35 %`、`22.5 °`。这是当前 1.0 的读数习惯，新设计稿可以改写法，但同一张卡里不得一会儿带空格、一会儿不带。

### 4.2 视觉：当前参考，不是硬条件

对照 [设计规范 1.0](design-spec-1.0.md) 时，只检查「信息还在、浅色下读得清、图和字不叠」。不要把 1.0 的圆角 40、底色 `#F0EFF2`、Geist / Noto 字号表、渐变色值写成合并条件。新设计稿替换这些值之后，删除本节里过时的举例，不要两边各算一版。

和平台有关、视觉改版也不能拿掉的，只有第 2.5 节的折行、第 2.7 节的对比度，以及关态仍可操作。

### 4.3 设备卡 `custom:vha-device-card`（已设计，已实现）

文档：[设备卡](cards/vha-device-card.md)。三种 `layout`：`large`、`vertical`、`electronics`。省略或无法识别时按 `large`，旧的 Quick Access YAML 仍能打开。不为电脑、手机、平板、笔记本各做一张卡。

当前设计必须覆盖的能力：

- 大图：主数值（优先 `value_entity`）、说明、电源开关、产品图、最多三枚动作。没有数值时大字用名称。
- 竖图：产品图、居中标题、一条竖向滑杆。多图时左右箭头换图。这种排版不另画电源开关。
- 电子设备：同一张卡用开关决定显示产品图或占位、电源、开机时长、网络、位置、电池，以及温度 / 内存 / CPU / GPU。主开关关掉指标后，四块磁贴一起收起。

| 入口 | 类型 |
| --- | --- |
| 标题、说明、产品图 | 打开主实体的更多信息 |
| 电池、网络、位置、一块指标 | 打开该项自己的实体 |
| 电源开关 | 开关写入。关的时候若动作上还绑了别的实体，先关那些，再关主实体 |
| 大图动作 | 模式写入，或该项配置的实体操作。当前上限三枚 |
| 竖图滑杆 | 连续值写入。灯和风扇关闭时显示 `0 %`，滑杆仍可拖；加湿器关闭时显示「关」，打开后在湿度范围内调节 |
| 左右箭头 | 卡片内部换页 |

状态：开、关（图可以变淡，但开关和滑杆仍可操作；关闭不是「不可用」）、运行或充电（电池只用「充电中」「未充电」「已充满」）、网络未连接、位置在家 / 离家、`unavailable`、`unknown`、缺图、图片加载失败、栏宽不足时动作栏改到图下。开机时长形如 `已开机 8天 1小时 41分钟`。

网格用第 2.5 节的三行基线。容器变窄时动作栏改排，不得盖住图片。

### 4.4 气候卡 `custom:vha-climate-card`（已设计，已实现）

文档：[气候卡](cards/vha-climate-card.md)。制热和制冷是同一张卡的模式变体，不是两张卡。圆环调温、摆风、耗电不在本轮验收范围；目标温度目前只出现在副文案里，修改走更多信息。这些没做的部分不要标成已完成。

| 入口 | 类型 |
| --- | --- |
| 标题、主数值 | 打开气候实体的更多信息 |
| 电源 | 开关写入 |
| 模式芯片 | 模式写入。芯片来自 `hvac_modes`，文案用中文。`off` 不做芯片，由电源负责 |
| 风速滑杆 | 连续值写入。有 `fan_modes` 且未关 `show_fan` 才显示。松手吸附到最近的风速并调用 `climate.set_fan_mode` |

必须看见的文案：当前温度一位小数，例如 `22.5 °`；制冷「制冷至 20 °」；制热「制热至 24 °」；关闭「已关闭」。不得套用画板上的英文 Heating to。

状态：制热、制冷、其它 `hvac_modes` 里实际有的模式、关闭、`unavailable`、`unknown`、域不是 `climate`、实体不存在、服务失败。

关闭时电源仍可打开，模式芯片和风速在实体提供对应服务时也仍可操作，不得只因为 `state === "off"` 禁用。气候卡文档里「关闭时芯片和风速禁用」是上一轮实现记录，审查以本段为准。不可用或未知时，电源、芯片、风速一起禁用。

网格基线：6 × 5，最小 2 × 4。窄栏时芯片换行，标题可以两行，不截断。

### 4.5 传感器卡 `custom:vha-sensor-card`（已设计，已实现）

文档：[传感器卡](cards/vha-sensor-card.md)。`layout` 为 `insight`（省略时）或 `metrics`。体重曲线、统计、电量、连通性、能耗色带、主机多指标、横排 glance 未实现，不要按已完成验收。

洞察必须能展示：眉题、主数值、可选短说明。配置了 `show_timeline`（默认开）时显示当天时段；没有历史就写「暂无历史」，不编造优 / 良。芯片只有配置了 `chips` 才出现。目标滑杆只有 `target_entity` 才出现，不得默认再绑一台加湿器。

指标必须能展示：标题，以及一至多块「名称 + 数值」。写了 `metrics` 就用这些；没写就用主实体一块。

| 入口 | 类型 |
| --- | --- |
| 标题、主数值 | 打开主实体的更多信息 |
| 芯片 | 有 `mode` 时模式写入；没有则开关写入该项实体 |
| 目标滑杆 | 连续值写入。域只接受加湿器湿度、`number` / `input_number`、风扇百分比 |

状态：有数值、无历史、未配置芯片、未配置目标、`unavailable`、`unknown`、域不对、实体被删、历史请求失败、服务失败。不可用或未知时禁用芯片和目标滑杆。主实体域：`sensor`、`binary_sensor`、`number`、`input_number`。指标排版可以不填主实体，改由 `metrics` 提供。

网格基线：洞察 6 × 6（最小 2 × 4）；指标 3 × 4（最小 2 × 3）。指标标题在窄栏按词折行。

### 4.6 媒体卡 `custom:vha-media-card`（已设计，已实现）

文档：[媒体卡](cards/vha-media-card.md)。本轮是圆形播放器和可增删的房间行。封面条、音量、艺术家、`show_remote` 遥控未实现。遥控仍不是第 10 类。

| 入口 | 类型 |
| --- | --- |
| 标题、圆形产品图 | 打开播放器的更多信息 |
| 播放 / 暂停 | 媒体传输。`playing` / `buffering` 显示暂停，其余显示播放。播放器处于关闭时，先 `turn_on` 再 `media_play` |
| 上一首、下一首 | 媒体传输 |
| 房间行开关 | 开关写入该行自己的实体。`show: false` 保留配置但不画 |

必须看见的文案：有时长时 `2:27 / 4:05`（不是把 `2.27` 当成小数进度）；只有进度时 `2:27`；空闲或待机且没有进度时「空闲」；关闭「已关闭」；不可用「不可用」；未知「未知」。

状态：播放中、暂停、空闲、关闭、`unavailable`、`unknown`、无图或加载失败（浅色圆，不破图）、房间行为不可用、域不是 `media_player`、实体被删、服务失败。播放器不可用或未知时禁用播放键；房间开关只看该行自己的实体。空闲和关闭时播放键仍可操作。

网格基线：6 × 4，最小 2 × 3。容器宽度不足约 420 像素时，播放器和房间上下排列，不重叠。这是容器宽度，不是列数。

### 4.7 尚未设计的五类

摄像、调控、家电、提醒、媒体库已有规划文档，没有 1.0 展示板。验收先用下面的通用框架。像素、配色、圆角、具体文案排版标为**设计后补全**，不要按规划文档里的 14px / 16px 圆角当作已经冻结的视觉，也不要编造 Figma 里没有的控件。

通用框架（设计稿到来之前就要满足，因为它们属于 A 层）：

- [ ] 单独的 `custom:` 类型，注册进 `window.customCards`，有编辑器、`getStubConfig`、`getGridOptions`、`getCardSize`。
- [ ] 一设备（或媒体库那一整组）一卡。缺的可选实体不留空按钮。
- [ ] 信息区打开更多信息；控件不冒泡。
- [ ] 关闭或空闲仍可操作；`unavailable` / `unknown` 才禁用写入并写明原因。
- [ ] 推荐列数用 3、6、9 或 12。规划文档里摄像卡写过「约 8 列」，重做时改成 6 或 9，8 不是验收条件。
- [ ] 类型专属的状态列表、入口表和推荐行列，在新设计稿确定后补进本节，再允许实现提审。

已知约束（来自现有规划，不是新发明的画面）：

| 类型 | 必须守住的范围 | 明确不做 |
| --- | --- | --- |
| 摄像 `vha-camera-card` | 只接受 `camera` 或带图的 `image`，以及多镜头列表。直播才显示 Live。点画面优先全屏，做不到再更多信息。换镜头只改卡片下标。默认没有抓拍 | 不接受 `switch` 加产品图。那是设备卡。不默认调用 `camera.snapshot` |
| 调控 `vha-control-card` | 一条独立滑杆：`input_number`、`number`，以及用户明确要拆出来的灯亮度和风扇百分比。松手写一次。点名称打开更多信息 | 不做气候目标温度，不做设备卡上的摆风开关。无电源开关 |
| 家电 `vha-appliance-card` | 一台程序类家电：可选的程序名、剩余时间、阶段、进度、电源、启动 / 暂停。只配时间时不出现假的启动按钮。洗衣机、烘干、洗碗、扫地用同一类型，靠配置换实体 | 不识别品牌。不替换顶栏原生徽章。第一版不在卡片里改程序清单 |
| 提醒 `vha-reminder-card` | 配置出来的告警行，加可选的底部用量洞察。锁和开关默认可拨，`binary_sensor` 默认无开关。没有昨天的数据就不显示对比百分比。空列表有一行「没有提醒」 | 不做欢迎语，不占 markdown 的位置。不编造百分比 |
| 媒体库 `vha-library-card` | 一整组媒体库：连接、扫描、版本、更新、数量、最近添加、继续观看、最后活动。字段由编辑器映射。有链接的条目打开链接，否则更多信息。缺哪块藏哪块 | 不把 `wbc_emby` 写死在代码里。不提供播放控制（那是媒体卡）。不替换分区标题和徽章。不拆成电影数卡、继续观看卡 |

规划文档里的建议网格（设计后要重算，且列数改为 3 的倍数）：调控约 6 列 2 行；家电约 6 列 3 行；提醒约 6 列、高度随条目；媒体库偏宽，接近整节。摄像不要用 8 列。

---

## 5. 怎么测

按顺序做。上一层没过，不进入下一层。

1. **对照 B 层。** 已设计的四类：第 4.3–4.6 节的能力和状态都能在预览里指出来。未设计的五类：只检查第 4.7 节的框架和已知约束，不验收尚未画出来的画面。
2. **GitHub Pages 虚拟实体预览。** 第 2.10 节。这一层不过，不合并。
3. **配置与网格。** 选卡面板、编辑器、YAML 往返、推荐尺寸、最小尺寸、编辑器窄栏折行。第 2.2–2.6 节。
4. **Home Assistant 试验视图。** 第 2.10 节的现场清单。没有这一层，不得写「卡片通过」。

浅色先过。深色只做第 2.7 节的底线，除非本轮声明支持深色。

---

## 6. 发布档位

不必等九张卡都做完。

### 可以合并

Pages 预览已通过第 5 节第 1–3 步。没有会导致误操作或白屏的问题。已知缺口写在审核记录里。

此时**不得**标「卡片通过」，也不得装进正在使用的 Home Assistant。

### 卡片通过

在「可以合并」之上，第 5 节第 4 步已在「VHA 试验」视图做完，审核记录写了日期和视图。

没有现场测试，不得使用这个结论。

### 试用版

满足「卡片通过」。试验视图上的安装和卸载走通。README 写明这是试用，以及测的是哪几张卡。可以留在试验视图。

### 正式小版本

满足「试用版」。仓库负责人已在真实设备上验收设计和操作，电脑和手机都看过。已知问题有清单，且没有明显误操作。

往正在使用的 Home Assistant 安装前，须由仓库负责人确认。

---

## 7. 审核记录

提审时复制到该卡的拉取请求里。

```md
### 审核记录

- 卡片：
- 版本 / 拉取请求：
- 审核日期：
- 结论：可以合并 / 卡片通过 / 试用版 / 正式小版本 / 未通过
- 现场测试：未做 / 已做（日期、试验视图名）
- 网格：推荐列×行、最小列×行；编辑器预览与仪表板实际宽度都看过：是 / 否

| 关卡 | 结果 | 说明 |
| --- | --- | --- |
| A. 平台 / 工程 | 通过 / 未通过 | |
| B. 交互与状态 | 通过 / 未通过 / 设计后补全 | 未设计类型只写框架 |
| Pages 虚拟实体预览 | 通过 / 未通过 | |
| Home Assistant 现场 | 通过 / 未做 | 未做则结论不能是「卡片通过」 |

未通过项与已知问题：
```

## 8. 设计稿更新时改哪里

只改第 4 节里受影响的类型，以及第 2.5 节表格里对应的推荐行数（列数规则不动）。第 2 节其余条款和第 3 节不因换肤删除。

同步这些地方里指向本文的说明：[文档索引](README.md)、[插件开发规划](plugin-development.md) 的共享约定、[设计规范 1.0](design-spec-1.0.md) 开头的状态说明。文件若改名，同一批链接一起改。
