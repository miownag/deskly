## 中文文档

> 让你的 AI Agent 能够看到并操作你的电脑。

**Deskly** 是一个 [MCP（模型上下文协议）](https://modelcontextprotocol.io/) 服务器，赋予 AI 代理与桌面交互的能力 —— 截屏、点击、打字、滚动，以及放大查看特定区域（带智能坐标网格）。

### 功能特性

- 🖥️ **屏幕截图** —— 全屏截图，附带 10×10 坐标网格
- 🔍 **区域放大** —— 放大捕获特定区域，精确定位元素
- 🖱️ **鼠标点击** —— 支持左键、右键和双击
- ⌨️ **文字输入** —— 完整 Unicode 支持（中文、Emoji 等）
- 📜 **屏幕滚动** —— 支持上下左右四个方向
- 📐 **智能坐标** —— 相对坐标系统（0.0–1.0），适配任何分辨率，包括 Retina 屏幕

### 工作原理

1. AI 通过 **截图** 查看屏幕，图片上覆盖坐标网格
2. AI 使用 **区域放大** 查看感兴趣的区域细节
3. AI 执行操作：**点击**、**打字** 或 **滚动**
4. 循环往复 —— AI 可以查看操作结果并决定下一步

所有坐标使用 **相对坐标系（0.0–1.0）**，其中 `(0, 0)` 为左上角，`(1, 1)` 为右下角。

### 快速开始

#### 配合 Claude Desktop 使用

在 Claude Desktop 配置文件中添加（`~/Library/Application Support/Claude/claude_desktop_config.json`）：

```json
{
  "mcpServers": {
    "deskly": {
      "command": "npx",
      "args": ["-y", "deskly-mcp"],
      "env": {
        "ZOOM_PADDING": "200"
      }
    }
  }
}
```

#### 配合 Claude Code 使用

```bash
claude mcp add deskly -- npx -y deskly-mcp
# 或带环境变量
ZOOM_PADDING=200 claude mcp add deskly -- npx -y deskly-mcp
```

#### 从源码构建

```bash
git clone https://github.com/miownag/deskly.git
cd deskly
bun install
bun run build
```

### 工具列表

| 工具 | 说明 | 参数 |
|------|------|------|
| `screenshot` | 全屏截图（带坐标网格） | 无 |
| `zoomin_capture` | 放大截取指定位置区域 | `x`, `y`（0.0–1.0） |
| `click` | 在指定位置点击 | `x`, `y`（0.0–1.0），`button`（left/right/double） |
| `type` | 在光标处输入文字 | `text` |
| `scroll` | 滚动屏幕 | `direction`（up/down/left/right），`amount`（1–20） |

### 许可证

MIT
