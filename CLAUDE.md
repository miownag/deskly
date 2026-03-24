# Deskly MCP Server

## Project Overview

Deskly is an MCP (Model Context Protocol) server that enables AI agents to see and operate your computer. It provides desktop automation capabilities through a standardized protocol interface.

- **Name:** deskly-mcp
- **Version:** 0.1.0
- **Language:** TypeScript
- **Runtime:** Node.js (built with Bun)
- **License:** MIT

## Architecture

```
src/
├── index.ts                  # MCP server entry point, tool registration
├── types.ts                  # TypeScript interfaces (ScreenInfo, ProcessedImage, etc.)
├── screenshot-desktop.d.ts   # Type declarations for screenshot-desktop
├── tools/                    # MCP tool handlers
│   ├── screenshot.ts         # Full screen capture with 10×10 grid overlay
│   ├── zoomin-capture.ts     # Zoomed region capture with absolute coordinate grid
│   ├── click.ts              # Mouse click (left/right/double)
│   ├── type.ts               # Keyboard text input (ASCII + Unicode via clipboard)
│   └── scroll.ts             # Screen scrolling (up/down/left/right)
└── system/                   # Core system modules
    ├── executor.ts           # Desktop automation drivers (robotjs primary, cliclick fallback)
    ├── screenshot.ts         # Screen capture & resolution detection
    └── image.ts              # Image processing, grid SVG overlay generation
```

## Key Concepts

### Coordinate System

All AI-facing coordinates use **relative values (0.0–1.0)**:
- `(0, 0)` = top-left corner
- `(1, 1)` = bottom-right corner
- Automatically converted to absolute screen pixels internally
- Handles Retina/HiDPI displays via `scaleFactor = captureWidth / logicalWidth`

### Dual Driver Architecture

```
createExecutor()
  ├── robotjs (primary) — cross-platform native bindings
  └── cliclick (fallback) — macOS CLI tool + AppleScript
```

Selection is automatic: tries robotjs first, falls back to cliclick on failure.

### Image Processing Pipeline

1. Capture raw PNG via `screenshot-desktop`
2. Resize from capture resolution to logical resolution (Retina handling)
3. Generate SVG grid overlay with coordinate labels
4. Composite overlay onto image via `sharp`
5. Encode to base64 PNG

### Grid Overlay

- **Full screen:** 10×10 grid, labels 0–9, red with 35% opacity, 16px bold font
- **Zoomed view:** 10×10 grid, labels show absolute relative coordinates (2 decimals), 65% opacity, 10px font

## Tools (5 total)

| Tool | Description | Key Params |
|------|------------|------------|
| `screenshot` | Full screen capture with grid overlay | None |
| `zoomin_capture` | Zoomed region capture at (x, y) | `x`, `y` (0.0–1.0) |
| `click` | Mouse click at relative position | `x`, `y`, `button` (left/right/double) |
| `type` | Type text at cursor (Unicode via pbcopy+Cmd+V) | `text` |
| `scroll` | Scroll in direction | `direction`, `amount` (1–20) |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@modelcontextprotocol/sdk` | MCP server framework (stdio transport) |
| `robotjs` | Desktop automation (mouse/keyboard) |
| `screenshot-desktop` | Screen capture |
| `sharp` | Image processing & SVG compositing |
| `zod` | Input schema validation |

## Build & Run

```bash
# Install dependencies
bun install

# Build
bun run build
# → dist/index.js (executable)

# Run as MCP server (stdio)
node dist/index.js
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ZOOM_PADDING` | `150` | Padding (px) around zoom region |

## Development Guidelines

- All tool handlers in `src/tools/` follow a consistent pattern: Zod schema → handler function → MCP response
- ScreenInfo and Executor are lazily cached singletons
- Non-ASCII text input uses clipboard paste (`pbcopy` + `Cmd+V`)
- Screenshot and zoomin_capture are marked `readOnlyHint: true`
- Platform target is primarily macOS
