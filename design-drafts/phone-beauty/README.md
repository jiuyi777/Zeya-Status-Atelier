# 小手机美化独立原型

本目录保留独立设计原型，并提供由当前 Status Atelier 生成器现场生成的真实导出预览。它不会被插件运行时加载，也不等于 SillyTavern / TauriTavern 实机验收。

## 原型

- 贝壳折叠机：上屏内容，下半部四个实体 APP 键。
- 透明轨道机：圆形桌面与轨道 APP，页面侧滑进入。
- 贴纸滑盖机：拼贴主屏与滑出快捷键盘。

视觉语言参考粉色千禧电子玩具、透明电子宠物机、卡片相机和全键盘手机；只吸收外壳、材质与实体控制布局，不复刻品牌标识。

三款共用真实手机模板的 APP 和字段 ID：`Personal`、`Memo`、`Wechat`、`Shop`，以及 `current_location`、`current_time`、`current_weather`、`favor`、`desire`、`cloth`、`thought` 等字段。

## 预览

直接打开 `index.html`，或在本目录启动静态服务器后访问页面。顶部 DIY 面板可替换壁纸 URL、头像 URL、四个 APP 图标 URL，调整壁纸取景、头像缩放、外壳主色和动效开关。

打开 `integrated-preview.html` 可查看当前 `rule-generator.js` 的四款真实导出结果（经典原款 + 三款新造型），APP 切换和返回都运行最终导出脚本。

可用 `?preview=clamshell&open=Personal`、`?preview=orbit&open=Wechat` 一类查询参数直达某台手机与某个 APP 页面，便于逐款评审。

## 验证边界

- `node --check prototype.js`：只检查脚本语法。
- `node contract-check.mjs`：只检查本原型的结构和契约标记。
- 本地浏览器：可检查页面构图、切换、返回、URL 素材和响应式行为。
- ST / TT 与手机实机：尚未验证，不能由本地导出预览替代。
