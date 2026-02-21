import type { Message, ToolUseBlock, AgentStreamEvent } from '@strands-agents/sdk'
import { StreamCallback } from '@/types/openai'

/**
 * Safely parses a JSON string from an agent response, handling markdown formatting
 * like ````json ... ```` blocks.
 *
 * @param rawText The raw response from the agent
 * @param fallback The fallback value to return if parsing fails
 * @returns The parsed object or the fallback value
 */
export function safeParseJson<T>(rawText: string, fallback: T): T {
  try {
    const jsonStr = rawText
      .trim()
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/g, '')
      .trim()
    return JSON.parse(jsonStr) as T
  } catch (error) {
    console.error('JSON parse error:', error, rawText)
    // Attempt fallback regex match for objects
    const match = rawText.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0]) as T
      } catch {
        return fallback
      }
    }
  }
  return fallback
}

/**
 * Extracts the input JSON object passed to a specific tool from the agent's message history.
 * It searches backwards to find the last invocation of `toolName`.
 *
 * @param messages The agent's message history array
 * @param toolName The name of the tool to extract
 * @param fallback Fallback value if tool was never called or is malformed
 */
export function extractToolOutput<T>(messages: Message[], toolName: string, fallback: T): T {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    if (!msg || msg.role !== 'assistant') continue

    for (const block of msg.content) {
      if (block.type === 'toolUseBlock' && block.name === toolName) {
        return (block as ToolUseBlock).input as T
      }
    }
  }

  console.warn(`Tool ${toolName} was not found in agent history`)
  return fallback
}

/**
 * Consumes an agent stream and converts TextDelta and ToolUse events into
 * standard onProgress UI strings. Returns the final concatenated string.
 *
 * @param stream The AsyncIterable stream from the agent
 * @param onProgress UI callback for progress updates
 * @param contextMessage Prefix to show in the UI (e.g. "Fact Checking")
 * @param options.silentText If true, suppresses TextDelta events (useful for tool-only agents)
 */
export async function runAgentStream(
  stream: AsyncIterable<AgentStreamEvent>,
  onProgress?: StreamCallback,
  contextMessage: string = '',
  options: { silentText?: boolean } = {}
): Promise<string> {
  let fullText = ''
  let buffer = ''
  const BUFFER_THRESHOLD = 40

  const emitProgress = (content: string) => {
    if (options.silentText) return

    // Scrub noise: avoid showing raw JSON or markdown fences in toasts
    const scrubbed = content
      .replace(/```\w*/g, '')
      .replace(/[{}|[\]"']/g, '')
      .trim()

    if (scrubbed.length > 0) {
      onProgress?.({
        content: `${contextMessage ? contextMessage + ': ' : ''}${scrubbed}`,
        done: false,
      })
    }
  }

  for await (const event of stream) {
    if (event.type === 'agentResult') {
      if (buffer.trim().length > 0) {
        emitProgress(buffer)
      }
      return event.toString().trim()
    }

    if (event.type === 'modelContentBlockStartEvent' && event.start?.type === 'toolUseStart') {
      if (buffer.trim().length > 0) {
        emitProgress(buffer)
        buffer = ''
      }
      onProgress?.({
        content: `${contextMessage ? contextMessage + ' ' : ''}[Executing tool: ${event.start.name}]`,
        done: false,
      })
    } else if (event.type === 'modelContentBlockDeltaEvent' && event.delta.type === 'textDelta') {
      const deltaText = event.delta.text
      fullText += deltaText
      buffer += deltaText

      if (buffer.includes('\n') || buffer.length >= BUFFER_THRESHOLD) {
        if (buffer.trim().length > 0) {
          emitProgress(buffer)
        }
        buffer = ''
      }
    }
  }

  if (buffer.trim().length > 0) {
    emitProgress(buffer)
  }

  return fullText
}
