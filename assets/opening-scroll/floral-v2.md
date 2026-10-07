# 花笺参考改版 v2

2026-10-06，内置 image_gen 生成。参考用户 P2 的水彩花枝与浅金边框、P3 的暖白纸面与淡墨植物；没有裁取参考图。透明花枝压缩为 640px WebP（109268 字节），纸面 768×1152 WebP（26026 字节）。独立 URL 引用，素材不嵌入角色卡。花枝保持比例，外框随文字高度伸展；纸面仅顶部淡入，不拉伸整张背景。

## 花枝提示词

Use case: stylized-concept. Asset type: transparent botanical corner ornament for a Chinese literary stationery UI. Create original delicate watercolor and gongbi illustration on a genuinely TRANSPARENT background. Square canvas 1024x1024. Composition: an airy L-shaped branch of pale blush peach blossoms occupies the TOP LEFT corner, with 3 beautiful open five-petal flowers, little pink buds, fine brown twigs and soft sage leaves. A slender willow sprig trails gently along the top to the right, a few leaves and buds descend the left edge. Most illustration lies in top 35% and left 25%, leaving lower right two thirds transparent for text. Fully show flower edges, keep a little transparent margin. Reference mood: Chinese spring floral stationery with gauzy watercolor edges, pale peach petals, muted jade willow leaves, tiny ochre stamens, natural varied organic composition. Integrate extremely pale warm-gray ink washes behind the botanical shapes, soft paper-like translucent brushwork. Elegant and restrained, detailed botanical painting, not vector, not cartoon, not photorealistic. NO text, NO border, NO gold frame, NO scroll rollers, NO ribbon, NO repeated brocade, NO checkerboard drawn into image, NO solid background. Flowers gently colored and readable, subtle ink details.

## 淡墨纸面提示词

Use case: stylized-concept. Asset type: subtle paper background for a Chinese reading interface, portrait 1024x1536. Warm ivory to light warm-gray handmade xuan paper, very light fine fiber texture. Faint pale taupe Chinese ink painting impressions: wispy pine needles and branch silhouettes only across the top and upper left edges, delicate wild reeds only at the bottom edge. All motifs extremely low contrast like aged ink rubbed into paper, soft airy feathered edges. The center 75 percent is almost blank ivory, reserved for readable dark UI text. Palette warm ivory #f7f4ec with extremely faint warm gray taupe brushwork, NO green cast, NO yellow gold wallpaper. Flat paper scan, evenly lit. No calligraphy, no characters, no text, no frame, no border, no flowers, no scroll roller, no pattern repeats, no vignette, no strong shading. Quiet Chinese poetry paper, tactile but light.

## 接入

共用源 opening-scroll-style.js，默认配色 opening-home-catalog.js；预览和正式导出均采用。保留已有编辑、简介和开场白入口。旧卷杆与织锦不再引用，原素材保留。

