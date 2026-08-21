# 可视化任务地图正则编辑器

入口：

- `index.html`：木桌线索簿地图编辑器。
- `plugin-preview.html`：从 Status Atelier 当前插件预览进入编辑器。

这不是固定地图截图，也不是共用一套结构的换色模板。参考图中的地点照片被实现为独立画布对象，每个对象均可：

- 点击选中并用鼠标或手机指针拖动。
- 双击第一张照片，再双击第二张照片连接红线；双击已选起点可取消。
- 键盘方向键仍可作为不显示在界面上的位置调整方式。
- 新增前选择黄铜图钉、旧纸胶带、银色纸夹或案卷拼贴款式；新地点自动寻找空位，不会一直叠在中央。
- 自行输入地点名称、可选短介绍和 http / https 图片 URL。
- 设定当前位置、已走过、可前往、已阻断、未探明状态。
- 调整旋转、大小与层级。
- 从画布工具栏快速复制、删除地点，并支持撤销删除。

画布底图使用用户参考素材清理出的木桌线索簿 WebP，不再由 CSS 模拟桌面与纸张。草稿写入浏览器本机存储。点击“生成正则”会将底图转成 data URI 内嵌进可导入 JSON；最终 `replaceString` 是可离线携带素材的 fenced HTML 完整文档，只包含成品地图、可选短介绍与返回动作，不包含属性面板、拖动提示、删除按钮或模板名称工具栏。

## 正则输入数据契约

正则匹配：

```text
<quest_map>{JSON}</quest_map>
```

动态 JSON 可包含：

```json
{
  "currentId": "place-2",
  "objective": "可选的任务摘要",
  "statuses": {
    "place-1": "completed",
    "place-2": "current",
    "place-3": "available"
  },
  "places": [
    {
      "id": "place-3",
      "name": "AI 更新后的地点名",
      "imageUrl": "https://example.com/place.jpg",
      "intro": "可选的一句地点介绍",
      "frameStyle": "clip"
    }
  ]
}
```

正则只负责把已经存在于 `<quest_map>` 中的数据渲染成状态栏，不会写世界书、推进剧情或把玩家点击反向发送给 AI。点击成品地点只打开可选短介绍；真正的当前位置仍由 `currentId` 或 `statuses` 数据决定。动态数据可以覆盖已有地点，也可以追加带坐标的新地点。图片在成品运行时再次限制为 http / https；无法加载时保留照片框，不执行 URL 中的代码。

## 验证边界

- Node 语法、JSON 解析与最终 HTML 外壳属于静态 / 生成物检查。
- 本地浏览器可以验证编辑器的点击、拖动、删除、URL 和返回行为。
- 本目录仍是独立原型，没有接入主干 `index.js`、`rule-generator.js` 或 `settings.html`。
- 未在 SillyTavern / TauriTavern / TavernHelper 实机中导入前，不能宣称实机通过。
