# 可调整开场白样本

作者：九一。样本更新：2026-09-12。

| 样本 | 预览入口 |
| --- | --- |
| 星芒云笺 | [打开](../opening-star-atlas-preview.html) |
| 月下百合 | [打开](../opening-lily-moon-preview.html) |
| 樱色夜刊／今夜开场 | [打开](../opening-sakura-noir-preview.html) |
| 循月而行 | [打开](../opening-lunar-orbit-preview.html) |
| 花间来信 | [打开](../opening-floral-letter-preview.html) |

从仓库根目录启动静态 HTTP 服务，再在浏览器打开对应 HTML。GitHub 文件页只显示源代码。

编辑器支持内容调整、本地草稿、预览和问候语字段导出。花间来信更新了白金花卉装饰、紧凑排版，并支持宋体、楷体、黑体、仿宋、圆体、隶书；字体按设备已安装字体及回退字体显示。用户配图可留空，花间来信的页首装饰使用仓库托管图片。

导出包含 first_mes 和 alternate_greetings，不是完整角色卡。页面采用 fenced HTML 和完整 body，页内返回通过 TavernHelper 读取实际 swipes 并定位本款主页。

从插件 0.11.22 起，这五款已接入主页外观选择。更新并刷新插件后，选择外观并重新应用到角色即可使用。独立预览编辑器仍保留，用于设计试排。生产版保留真实额外问候语和世界书绑定；返回按钮由启用中的插件显示。本地浏览器模拟、五款导出结构与脚本语法检查通过，已有八项相关测试通过。尚未完成 SillyTavern / TauriTavern 真机验收。
