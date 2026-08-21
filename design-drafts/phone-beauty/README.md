# 小手机美化独立原型

本目录保留独立设计原型，并提供由当前 Status Atelier 生成器现场生成的真实导出预览。它不会被插件运行时加载，也不等于 SillyTavern / TauriTavern 实机验收。

## 当前真实导出款式

- 01 横向掌机：中央大状态屏与可触屏的实体按键区；X 打开个人、Y 打开微信、主页 B 打开购物、A 打开日记，页面内 B 返回主页。
- 02 粉色相机机：粉色厚机身、大横屏和右侧圆形拨盘。
- 03 银白挂饰机：银白薄机身、右侧快捷键与可替换挂饰。

视觉语言参考粉色千禧掌机与卡片相机；只吸收外壳、材质与实体控制布局，不复刻品牌标识。目录中的 `index.html` 继续保留早期三款探索稿，`integrated-preview.html` 展示当前插件真实导出。

三款共用真实手机模板的 APP 和字段 ID：`Personal`、`Memo`、`Wechat`、`Shop`，以及 `current_location`、`current_time`、`current_weather`、`favor`、`desire`、`cloth`、`thought` 等字段。`Memo` 继续作为稳定数据 ID，界面与 AI 填写要求统一显示为“日记”。横向掌机的四枚桌面图标拥有独立坐标，可逐枚拖动；雪花位于图标后方；日记合并为一篇连续正文并支持直接输入。

## 预览

直接打开 `index.html` 可回看早期探索稿。当前插件顶部 DIY 面板可替换壁纸 URL、头像 URL、挂饰 URL、APP 图标 URL，选择显示的 APP 数量，并调整壁纸取景、头像缩放、外壳主色和动效开关。横向掌机预览中的单枚图标拖动会写回插件设置。

打开 `integrated-preview.html` 可查看当前 `rule-generator.js` 的四款真实导出结果（经典原款 + 三款新造型），APP 切换和返回都运行最终导出脚本。

可用 `?preview=clamshell&open=Personal`、`?preview=clamshell&open=Memo`、`?preview=orbit&open=Wechat` 一类查询参数直达某台手机与某个页面。追加 `&return=1` 会先进入页面再调用真实返回键，便于检查主页状态是否完整恢复。

## 验证边界

- `node --check prototype.js`：只检查脚本语法。
- `node contract-check.mjs`：只检查本原型的结构和契约标记。
- 本地浏览器：可检查页面构图、切换、返回、URL 素材和响应式行为。
- ST / TT 与手机实机：尚未验证，不能由本地导出预览替代。
