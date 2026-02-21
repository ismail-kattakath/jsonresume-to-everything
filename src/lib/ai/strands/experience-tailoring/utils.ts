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
 */
export async function runAgentStream(
  stream: AsyncIterable<AgentStreamEvent>,
  onProgress?: StreamCallback,
  contextMessage: string = ''
): Promise<string> {
  let fullText = ''
  for await (const event of stream) {
    if (event.type === 'agentResult') {
      return event.toString().trim()
    }

    if (event.type === 'modelContentBlockStartEvent' && event.start?.type === 'toolUseStart') {
      onProgress?.({
        content: `${contextMessage ? contextMessage + ' ' : ''}[Executing tool: ${event.start.name}]`,
        done: false,
      })
    } else if (event.type === 'modelContentBlockDeltaEvent' && event.delta.type === 'textDelta') {
      fullText += event.delta.text
      if (fullText.trim().length > 0) {
        onProgress?.({ content: fullText, done: false })
      }
    }
  }
  return fullText
}
