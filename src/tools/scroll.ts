import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { createExecutor } from '../system/executor.js';

export async function handleScroll(
  direction: 'up' | 'down' | 'left' | 'right',
  amount: number,
): Promise<CallToolResult> {
  const executor = createExecutor();
  executor.scroll(direction, amount);

  return {
    content: [
      {
        type: 'text',
        text: `Scrolled ${direction} by ${amount}. Driver: ${executor.driverType}.`,
      },
    ],
  };
}
