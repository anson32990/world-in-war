# 🌍 World in War - 世界战争地图

一个基于 Vue 3 的交互式世界地图网站，用于展示全球正在发生的武装冲突。

## 功能特点

- 🗺️ **交互式地图** - 使用 SVG 展示全球冲突分布
- 📅 **时间轴浏览** - 滑动查看不同日期的冲突状态
- 📊 **冲突详情** - 点击地图上的国家查看详细信息
- 📱 **响应式设计** - 支持各种设备访问

## 技术栈

- **前端框架**: Vue 3 + Vite
- **UI 组件库**: Element Plus

## 项目结构

```
world-in-war/
├── src/
│   ├── components/
│   │   ├── WorldMap.vue      # 世界地图组件 (SVG)
│   │   └── Timeline.vue      # 时间轴组件
│   ├── data/
│   │   └── conflicts.json    # 冲突数据
│   ├── stores/
│   │   └── conflictStore.js  # Pinia 状态管理
│   ├── App.vue               # 主应用组件
│   └── main.js               # 入口文件
├── public/
│   └── world-map.svg         # 世界地图 SVG
├── dist/                     # 构建输出目录
├── index.html
├── package.json
└── vite.config.js
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 数据更新

编辑 `src/data/conflicts.json` 文件来更新冲突数据：

```json
{
  "conflicts": [
    {
      "id": "conflict-id",
      "name": "冲突名称",
      "countries": ["国家代码"],
      "startDate": "YYYY-MM-DD",
      "endDate": null,
      "status": "active",
      "intensity": "high",
      "description": "冲突描述",
      "casualties": {
        "military": "军人伤亡",
        "civilian": "平民伤亡",
        "displaced": "流离失所"
      }
    }
  ]
}
```

## 部署

1. 构建命令：`npm run build`
2. 输出目录：`dist`
3. 将 `dist` 目录内容部署到 Web 服务器

## 地图数据来源

世界地图 SVG 来自 [MapSVG](https://mapsvg.com/maps/geo-calibrated/world.svg)

## 许可证

MIT

---

**数据声明**: 本项目数据来源于公开资料，仅供参考，不代表任何政治立场。
