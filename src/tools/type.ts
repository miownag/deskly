import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { createExecutor } from '../system/executor.js';

export async function handleType(
  text: string,
): Promise<CallToolResult> {
  const executor = createExecutor();
  executor.typeText(text);

  return {
    content: [
      {
        type: 'text',
        text: `Typed "${text.length > 50 ? text.slice(0, 50) + '...' : text}" (${text.length} chars). Driver: ${executor.driverType}.`,
      },
    ],
  };
}
