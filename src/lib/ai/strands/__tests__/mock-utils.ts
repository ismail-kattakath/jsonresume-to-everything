import { AgentStreamEvent } from '@strands-agents/sdk'

/**
 * Creates an AsyncIterable that mimics an Agent Stream.
 * Yields a start event, a delta with text, and an agent result.
 */
export async function* createMockStream(text: string, toolName?: string): AsyncIterable<AgentStreamEvent> {
  // 1. Yield model content block start
  if (toolName) {
    yield {
      type: 'modelContentBlockStartEvent',
      contentBlockIndex: 0,
      start: {
        type: 'toolUseStart',
        name: toolName,
        toolUseId: 'test-id',
        input: '',
      } as any,
    } as any
  } else {
    yield {
      type: 'modelContentBlockStartEvent',
      contentBlockIndex: 0,
      start: {
        type: 'textStart',
        text: '',
      } as any,
    } as any
  }

  // 2. Yield text delta if no toolName (assuming text response)
  if (!toolName) {
    yield {
      type: 'modelContentBlockDeltaEvent',
      contentBlockIndex: 0,
      delta: {
        type: 'textDelta',
        text: text,
      },
    } as any
  }

  // 3. Yield agent result
  yield {
    type: 'agentResult',
    toString: () => text,
  } as any
}
