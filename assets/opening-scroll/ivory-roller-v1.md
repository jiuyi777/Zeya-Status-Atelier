# 古风卷轴卷杆

2026-10-06，内置 image_gen 生成。参考用户给出的卷轴形态，生成独立卷杆，纸面使用 CSS，自适应内容高度。原图 exec-492d7d29-2095-4d1d-9a30-3b6a237be743.png，RGBA 2172 × 724。WebP 压缩为 1280 × 427，28554 字节。透明留白通过 CSS 背景窗口展示，不把整个卷轴图纵向拉伸。

## 提示词

Use case: stylized-concept. Asset type: one production UI decorative horizontal roller for a Chinese hanging scroll webpage, transparent PNG. Generate ONE straight horizontal antique Chinese scroll roller, spanning 90% canvas width, very wide panoramic aspect ratio about 3:1. The actual object is slender: length about 12 times its diameter, placed in the vertical center, with generous transparent space above and below. Pale honey-brown polished bamboo wood end caps at both ends, slender elegant ivory silk-wrapped wooden cylinder in the middle, delicate understated antique gold narrow bands close to ends. Light cream paper attachment along the lower edge only, at most a few millimeters deep; no large sheet. Traditional Chinese refined stationery, softly hand-painted illustration with subtle realistic cylindrical highlights and muted paper/silk grain. Warm neutral palette ivory and restrained golden tan, NO green, NO blue, NO black dominant areas. Orthographic straight frontal view, perfectly horizontal, subtle dimensionality with no perspective foreshortening. Both end caps clearly visible, completely within frame. Actual alpha transparent background, not checkerboard. No writing, no text, no logo, no frame, no flowers, no clouds, no curled loose parchment, no full scroll sheet, no landscape. It will be used twice as top and bottom rollers with web-rendered content between, so the roller must be a clean separate object with uniform straight attachment edge.

## 检查

修改进入 opening-scroll-style.js 与正式生成器，预览和外观目录共用。46 项相关检查通过。手机宽度 279px 下无横向溢出；长文将页面从 954px 延长到 1140px，卷杆保持 279.333 × 19.948px；入口显示预览选择反馈。尚未推送 GitHub。
