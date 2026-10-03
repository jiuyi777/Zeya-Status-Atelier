# 无头像状态栏正式源文件

42 · 像素梦游、43 · 地球失眠、44 · 慢一刻。作者：九一。

这里的 HTML/CSS/动效脚本是编译源。人物内容由当前状态区块填充，模板中的演示人物不进入生成结果。`runtime.js` 管理人物、字段、折叠与高度，`tabs.js` 管理分类，时钟和地球各自管理动效。

修改后运行 `npm run build:portrait-free`，生成仓库根目录的 `status-portrait-free-templates.js`；`npm test` 会检查源文件和生成物是否同步。插件预览与正则导出共用 `status-portrait-free.js`，不读取 `design-drafts`。

所有界面代码直接进入正则，字体和装饰素材通过固定版本的公开 GitHub HTTPS 链接加载。素材不重复写入角色卡；网络不可用时使用系统字体、底色和静态降级。像素字体与装饰的完整效果需要能访问 GitHub 素材。

慢一刻读取打开页面设备的本地时间和时区，三针与数字时间同步。每秒重新校准，暂停时保留读数，继续、后台返回及折叠恢复时重新校时。剧情时间继续独立显示，不修改聊天剧情。

## 素材来源与处理

- `dream-room-pixel.webp`、`rose-halftone.webp`：九一工作流中通过 imagegen 生成的原创装饰，发布版使用无损 WebP，保留原尺寸与像素。
- `earth-atmos-2048.jpg`：地理纹理，来源 https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg 。用于 Canvas 球面投影和黑白抖动。
- `earth-apollo17.jpg`：NASA / Apollo 17，1972 年 Blue Marble 公有领域影像，来源 https://commons.wikimedia.org/wiki/File:The_Earth_seen_from_Apollo_17.jpg 。用于静态降级。
- `NotoSansSC.woff2`：Noto Sans SC，SIL OFL，见 `fonts/OFL.txt`。FontTools 4.66.1 压缩并保留 GB2312 常用汉字、拉丁字符、中文标点和全角符号，保留可变字重；其他字形由系统字体补充。
- `Unifont.woff2`：GNU Unifont 18.0.01，https://unifoundry.com/pub/unifont/unifont-18.0.01/font-builds/unifont-18.0.01.otf ，只转换容器为 WOFF2，字形不修改，许可见 `fonts/Unifont-LICENSE.txt`。
- `PirataOne-Regular.woff2`：Pirata One，SIL OFL，只转换容器为 WOFF2，许可见 `fonts/PirataOne-OFL.txt`。

本轮资料路线：sillytavern-extension-dev；TavernWeave snapshot 2026-08-18，A0、D5、E5。目标是将已有三款接入选择、预览、世界书规则和导出，再发布；保留原有角色数据、开场白与安装流程。代码与导出检查、桌面浏览器的手机宽度检查分别记录，真实 ST/TT 手机验收仍需用户设备。
