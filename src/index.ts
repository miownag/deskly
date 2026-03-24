#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import type { ScreenInfo, ServerConfig } from './types.js';
import { detectScreenInfo } from './system/screenshot.js';
import { createExecutor } from './system/executor.js';
import { handleScreenshot } from './tools/screenshot.js';
import { handleZoominCapture } from './tools/zoomin-capture.js';
import { handleClick } from './tools/click.js';
import { handleType } from './tools/type.js';
import { handleScroll } from './tools/scroll.js';

// --- Config from env ---
const config: ServerConfig = {
  zoomPadding: parseInt(process.env.ZOOM_PADDING ?? '150', 10),
};

// --- Lazy-initialized singletons ---
let screenInfoCache: ScreenInfo | null = null;

async function getScreenInfo(): Promise<ScreenInfo> {
  if (screenInfoCache) return screenInfoCache;
  const executor = createExecutor();
  screenInfoCache = await detectScreenInfo(() => executor.getScreenSize());
  return screenInfoCache;
}

// --- MCP Server ---
const server = new McpServer({
  name: 'deskly-mcp',
  version: '0.1.0',
});

// Tool: screenshot
server.registerTool(
  'screenshot',
  {
    title: 'Screenshot',
    description:
      'Capture the current screen and return it as a PNG image with a 10×10 coordinate grid overlay. Grid labels are relative coordinates (0-1) for use with click and zoomin_capture.',
    annotations: {
      readOnlyHint: true,
    },
  },
  async () => {
    const screenInfo = await getScreenInfo();
    return handleScreenshot(screenInfo, config);
  },
);

// Tool: zoomin_capture
server.registerTool(
  'zoomin_capture',
  {
    title: 'Zoom In Capture',
    description:
      'Capture a zoomed-in region of the screen centered at the given relative coordinates (0.0-1.0). Returns an enlarged image with absolute coordinate grid labels for precise targeting.',
    inputSchema: {
      x: z.number().min(0).max(1).describe('Relative X coordinate (0.0-1.0, left to right)'),
      y: z.number().min(0).max(1).describe('Relative Y coordinate (0.0-1.0, top to bottom)'),
    },
    annotations: {
      readOnlyHint: true,
    },
  },
  async ({ x, y }) => {
    const screenInfo = await getScreenInfo();
    return handleZoominCapture(x, y, screenInfo, config);
  },
);

// Tool: click
server.registerTool(
  'click',
  {
    title: 'Click',
    description:
      'Perform a mouse click at the given relative coordinates (0.0-1.0). Supports left, right, and double click.',
    inputSchema: {
      x: z.number().min(0).max(1).describe('Relative X coordinate (0.0-1.0, left to right)'),
      y: z.number().min(0).max(1).describe('Relative Y coordinate (0.0-1.0, top to bottom)'),
      button: z
        .enum(['left', 'right', 'double'])
        .default('left')
        .describe('Mouse button: left (default), right, or double-click'),
    },
  },
  async ({ x, y, button }) => {
    const screenInfo = await getScreenInfo();
    return handleClick(x, y, button, screenInfo);
  },
);

// Tool: type
server.registerTool(
  'type',
  {
    title: 'Type Text',
    description:
      'Type text at the current cursor position. Supports ASCII and non-ASCII characters (e.g. Chinese) via clipboard paste.',
    inputSchema: {
      text: z.string().describe('The text to type'),
    },
  },
  async ({ text }) => {
    return handleType(text);
  },
);

// Tool: scroll
server.registerTool(
  'scroll',
  {
    title: 'Scroll',
    description:
      'Scroll the screen in the specified direction.',
    inputSchema: {
      direction: z
        .enum(['up', 'down', 'left', 'right'])
        .describe('Scroll direction'),
      amount: z
        .number()
        .int()
        .min(1)
        .max(20)
        .default(3)
        .describe('Scroll amount (1-20, default 3)'),
    },
  },
  async ({ direction, amount }) => {
    return handleScroll(direction, amount);
  },
);

// --- Start ---
const transport = new StdioServerTransport();
await server.connect(transport);
