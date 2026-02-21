import { safeParseJson, extractToolOutput, runAgentStream } from '@/lib/ai/strands/experience-tailoring/utils'
import { Message, AgentStreamEvent } from '@strands-agents/sdk'

describe('experience-tailoring utils', () => {
  describe('safeParseJson', () => {
    let consoleSpy: jest.SpyInstance
    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    })
    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('should parse clean JSON', () => {
      expect(safeParseJson('{"a":1}', {})).toEqual({ a: 1 })
    })

    it('should parse markdown JSON', () => {
      expect(safeParseJson('```json\n{"a":1}\n```', {})).toEqual({ a: 1 })
    })

    it('should attempt regex match if direct parse fails', () => {
      expect(safeParseJson('Here is the json: {"a":1} okay?', {})).toEqual({ a: 1 })
    })

    it('should return fallback if all fails', () => {
      expect(safeParseJson('no json here', { fallback: true })).toEqual({ fallback: true })
    })

    it('should return fallback if regex match nested parse fails', () => {
      expect(safeParseJson('{"a":}', { fallback: true })).toEqual({ fallback: true })
    })
  })

  describe('extractToolOutput', () => {
    it('should return fallback and warn if tool not found', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const messages: Message[] = [
        { type: 'message', role: 'user', content: [{ type: 'textBlock', text: 'hi' }] } as any,
      ]
      expect(extractToolOutput(messages, 'missing', 'fallback')).toBe('fallback')
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should skip non-assistant messages', () => {
      const messages: any[] = [
        { type: 'message', role: 'assistant', content: [] }, // Something before
        { type: 'message', role: 'user', content: [{ type: 'toolUseBlock', name: 'test', input: { a: 1 } }] },
      ]
      expect(extractToolOutput(messages, 'test', 'fallback')).toBe('fallback')
    })
  })

  describe('runAgentStream', () => {
    it('should handle agentResult event immediately', async () => {
      const events: AgentStreamEvent[] = [
        {
          type: 'agentResult',
          toString: () => 'final result',
        } as any,
      ]

      async function* mockStream() {
        for (const e of events) yield e
      }

      const result = await runAgentStream(mockStream())
      expect(result).toBe('final result')
    })

    it('should concatenate text deltas', async () => {
      const events: AgentStreamEvent[] = [
        {
          type: 'modelContentBlockDeltaEvent',
          delta: { type: 'textDelta', text: 'Hello ' },
        } as any,
        {
          type: 'modelContentBlockDeltaEvent',
          delta: { type: 'textDelta', text: 'World' },
        } as any,
      ]

      async function* mockStream() {
        for (const e of events) yield e
      }

      const result = await runAgentStream(mockStream())
      expect(result).toBe('Hello World')
    })
  })
})
