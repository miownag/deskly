import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ScreenInfo } from '../types.js';
import { createExecutor, relativeToAbsolute } from '../system/executor.js';

export async function handleClick(
  x: number,
  y: number,
  button: 'left' | 'right' | 'double',
  screenInfo: ScreenInfo,
): Promise<CallToolResult> {
  const executor = createExecutor();
  const abs = relativeToAbsolute(x, y, screenInfo);
  executor.click(abs.x, abs.y, button);

  return {
    content: [
      {
        type: 'text',
        text: `Clicked ${button} at relative (${x.toFixed(2)}, ${y.toFixed(2)}) → absolute (${abs.x}, ${abs.y}). Driver: ${executor.driverType}.`,
      },
    ],
  };
}
