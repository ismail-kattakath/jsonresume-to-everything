#!/usr/bin/env node

/**
 * Manual test of Gemini client logic (without TypeScript)
 */

const GEMINI_API_KEY = 'AIzaSyADCErIzzIqqQaI_s5b9kFucxY81lxiLoI'
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

// Simulate our Gemini client logic
class TestGeminiClient {
  constructor(config) {
    this.config = config
    this.baseURL = config.baseURL || GEMINI_BASE_URL
  }

  convertMessages(messages) {
    const systemMessages = messages.filter((m) => m.role === 'system')
    const conversationMessages = messages.filter((m) => m.role !== 'system')

    const systemInstruction =
      systemMessages.length > 0
        ? {
            parts: systemMessages.map((m) => ({ text: m.content })),
          }
        : undefined

    const contents = conversationMessages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

    return { contents, systemInstruction }
  }

  buildEndpoint(streaming = false) {
    const method = streaming ? 'streamGenerateContent' : 'generateContent'
    if (streaming) {
      return `${this.baseURL}/models/${this.config.model}:${method}?alt=sse&key=${this.config.apiKey}`
    }
    return `${this.baseURL}/models/${this.config.model}:${method}?key=${this.config.apiKey}`
  }

  async generateContent(request) {
    const { contents, systemInstruction } = this.convertMessages(request.messages)

    const geminiRequest = {
      contents,
      generationConfig: {
        temperature: request.temperature,
        topP: request.topP,
        maxOutputTokens: request.maxTokens,
      },
    }

    if (systemInstruction) {
      geminiRequest.systemInstruction = systemInstruction
    }

    const response = await fetch(this.buildEndpoint(false), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequest),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    // Extract content from first candidate
    const parts = data.candidates?.[0]?.content?.parts
    const content = parts?.map((p) => p.text).join('').trim() || ''

    if (!content) {
      // Check if it's due to max tokens in thinking mode
      const finishReason = data.candidates?.[0]?.finishReason
      if (finishReason === 'MAX_TOKENS') {
        throw new Error(
          'Response exceeded max tokens (likely due to thinking mode). Try increasing maxTokens or using a simpler prompt.'
        )
      }
      throw new Error('Gemini generated an empty response. Response: ' + JSON.stringify(data))
    }

    return {
      content,
      model: data.modelVersion || this.config.model,
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount,
            completionTokens: data.usageMetadata.candidatesTokenCount,
            totalTokens: data.usageMetadata.totalTokenCount,
          }
        : undefined,
    }
  }

  async testConnection() {
    try {
      await this.generateContent({
        messages: [{ role: 'user', content: 'Hi' }],
        temperature: 0.1,
        maxTokens: 100, // Gemini 2.5 needs more tokens for thinking mode
      })
      return true
    } catch (error) {
      console.error('Connection test failed:', error.message)
      return false
    }
  }
}

console.log('='.repeat(70))
console.log('Testing Gemini Client Implementation (Manual JS)')
console.log('='.repeat(70) + '\n')

const client = new TestGeminiClient({
  providerType: 'gemini',
  apiKey: GEMINI_API_KEY,
  model: 'gemini-2.5-flash', // Gemini models don't need models/ prefix in our client
})

console.log('🧪 Test 1: Connection Test...\n')
try {
  const result = await client.testConnection()
  console.log('Result:', result ? '✅ PASS' : '❌ FAIL\n')
} catch (error) {
  console.error('❌ FAIL:', error.message, '\n')
}

console.log('='.repeat(70) + '\n')

console.log('🧪 Test 2: Simple Generation...\n')
try {
  const response = await client.generateContent({
    messages: [
      { role: 'user', content: 'Say hello in exactly 2 words.' }
    ],
    temperature: 0.7,
    maxTokens: 500, // Increased for Gemini 2.5 thinking mode
  })

  console.log('✅ Response received!')
  console.log('Content:', JSON.stringify(response.content))
  console.log('Model:', response.model)
  if (response.usage) {
    console.log('Tokens:', response.usage)
  }
  console.log()
} catch (error) {
  console.error('❌ FAIL:', error.message)
  console.error()
}

console.log('='.repeat(70) + '\n')

console.log('🧪 Test 3: With System Instruction...\n')
try {
  const response = await client.generateContent({
    messages: [
      { role: 'system', content: 'You are a helpful assistant. Be concise.' },
      { role: 'user', content: 'What is 2+2?' }
    ],
    temperature: 0.5,
    maxTokens: 500,
  })

  console.log('✅ Response received!')
  console.log('Content:', JSON.stringify(response.content))
  console.log()
} catch (error) {
  console.error('❌ FAIL:', error.message)
  console.error()
}

console.log('='.repeat(70) + '\n')

console.log('🧪 Test 4: Longer Conversation...\n')
try {
  const response = await client.generateContent({
    messages: [
      { role: 'system', content: 'You are an expert software engineer. Be very concise.' },
      { role: 'user', content: 'What is TypeScript in one sentence?' },
      { role: 'assistant', content: 'TypeScript adds static typing to JavaScript.' },
      { role: 'user', content: 'One benefit?' }
    ],
    temperature: 0.5,
    maxTokens: 2000, // Increased significantly for thinking mode
  })

  console.log('✅ Response received!')
  console.log('Content:', JSON.stringify(response.content.substring(0, 100) + '...'))
  console.log('Length:', response.content.length, 'characters')
  console.log()
} catch (error) {
  console.error('❌ FAIL:', error.message)
  console.error()
}

console.log('='.repeat(70))
console.log('✅ All Gemini Tests Complete!')
console.log('='.repeat(70))
