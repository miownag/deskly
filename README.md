# Deskly

> Enable your AI agents to see and operate your computer.

**Deskly** is an [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that gives AI agents the ability to interact with your desktop — capture screenshots, click, type, scroll, and zoom into specific areas with intelligent coordinate grid overlays.

[中文文档](README_zh.md)

## Features

- 🖥️ **Screen Capture** — Full-screen screenshots with a 10×10 coordinate grid overlay
- 🔍 **Zoom In** — Capture zoomed regions for precise element targeting
- 🖱️ **Click** — Left, right, and double click at any screen position
- ⌨️ **Type** — Text input with full Unicode support (Chinese, emoji, etc.)
- 📜 **Scroll** — Scroll in any direction (up/down/left/right)
- 📐 **Smart Coordinates** — Relative (0.0–1.0) coordinate system, works on any resolution including Retina displays

## How It Works

```
AI Agent (Claude, etc.)
    ↕ MCP Protocol (stdio)
Deskly MCP Server
    ↕
Desktop (mouse / keyboard / screen)
```

1. AI takes a **screenshot** to see the screen with a coordinate grid
2. AI uses **zoomin_capture** to inspect a specific area more closely
3. AI performs actions: **click**, **type**, or **scroll**
4. Repeat — the AI can see the result and decide next steps

All coordinates use a **relative system (0.0–1.0)** where `(0, 0)` is the top-left and `(1, 1)` is the bottom-right corner. This works seamlessly across different screen resolutions and scale factors.

## Quick Start

### Use with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

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

### Use with Claude Code

```bash
claude mcp add deskly -- npx -y deskly-mcp
# or with env
ZOOM_PADDING=200 claude mcp add deskly -- npx -y deskly-mcp
```

### Build from source

```bash
git clone https://github.com/miownag/deskly.git
cd deskly
bun install
bun run build
```

## Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `screenshot` | Capture full screen with coordinate grid | — |
| `zoomin_capture` | Capture zoomed region at position | `x`, `y` (0.0–1.0) |
| `click` | Click at position | `x`, `y` (0.0–1.0), `button` (left/right/double) |
| `type` | Type text at cursor | `text` |
| `scroll` | Scroll the screen | `direction` (up/down/left/right), `amount` (1–20) |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ZOOM_PADDING` | `150` | Padding in pixels around the zoom region |

## Platform Support

- **macOS** — Full support (robotjs + cliclick fallback)
- **Linux** — Partial (robotjs)
- **Windows** — Partial (robotjs)

Desktop automation uses **robotjs** as the primary driver, with **cliclick** as a macOS-specific fallback.

## License

MIT
