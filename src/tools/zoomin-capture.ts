import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ScreenInfo, ServerConfig } from '../types.js';
import { captureScreen } from '../system/screenshot.js';
import { cropAndEnlarge } from '../system/image.js';

export async function handleZoominCapture(
  x: number,
  y: number,
  screenInfo: ScreenInfo,
  config: ServerConfig,
): Promise<CallToolResult> {
  const buffer = await captureScreen();
  const result = await cropAndEnlarge(buffer, screenInfo, config, x, y);
  const { cropBounds } = result;

  return {
    content: [
      {
        type: 'image',
        data: result.image.base64,
        mimeType: 'image/png',
      },
      {
        type: 'text',
        text: `Zoomed capture at (${x.toFixed(2)}, ${y.toFixed(2)}): ${result.image.displayWidth}×${result.image.displayHeight}px. Crop bounds: left=${cropBounds.left}, top=${cropBounds.top}, size=${cropBounds.width}×${cropBounds.height}. Grid labels show absolute relative coordinates for precise clicking.`,
      },
    ],
  };
}
