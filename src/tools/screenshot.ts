import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ScreenInfo, ServerConfig } from '../types.js';
import { captureScreen } from '../system/screenshot.js';
import { processScreenshot } from '../system/image.js';

export async function handleScreenshot(
  screenInfo: ScreenInfo,
  config: ServerConfig,
): Promise<CallToolResult> {
  const buffer = await captureScreen();
  const processed = await processScreenshot(buffer, screenInfo, config);

  return {
    content: [
      {
        type: 'image',
        data: processed.base64,
        mimeType: 'image/png',
      },
      {
        type: 'text',
        text: `Screenshot captured: ${processed.displayWidth}×${processed.displayHeight}px (with 10×10 coordinate grid overlay). Use relative coordinates (0.0-1.0) for click/zoomin_capture actions.`,
      },
      {
        type: 'text',
        text: `ScreenInfo: ${JSON.stringify(screenInfo)}`,
      },
    ],
  };
}
