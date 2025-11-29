#!/usr/bin/env node

/**
 * Test OpenRouter with Gemini models (OpenAI-compatible format)
 */

const OPENROUTER_API_KEY = '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'
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

console.log('='.repeat(70))
console.log('Testing OpenRouter with Gemini Models')
console.log('='.repeat(70) + '\n')

// Test 1: List models
console.log('🧪 Test 1: List Available Models...\n')
try {
  const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/ismail-kattakath/jsonresume-to-everything',
      'X-Title': 'JSON Resume to Everything',
    },
  })

  if (!response.ok) {
    console.error('❌ FAIL:', response.status, response.statusText)
  } else {
    const data = await response.json()
    const geminiModels = data.data.filter(m => m.id.includes('gemini'))
    console.log('✅ Found', geminiModels.length, 'Gemini models on OpenRouter:')
    geminiModels.slice(0, 5).forEach(m => {
      console.log('  -', m.id)
    })
    console.log()
  }
} catch (error) {
  console.error('❌ FAIL:', error.message, '\n')
}

console.log('='.repeat(70) + '\n')

// Test 2: Generate content with Gemini via OpenRouter
console.log('🧪 Test 2: Generate Content with Gemini Model...\n')
try {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/ismail-kattakath/jsonresume-to-everything',
      'X-Title': 'JSON Resume to Everything',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-preview-09-2025',
      messages: [
        { role: 'user', content: 'Say hello in exactly 2 words.' }
      ],
      temperature: 0.7,
      max_tokens: 100,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ FAIL:', response.status, response.statusText)
    console.error('Error:', errorText, '\n')
  } else {
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    console.log('✅ Response received!')
    console.log('Content:', JSON.stringify(content))
    console.log('Model:', data.model)
    if (data.usage) {
      console.log('Tokens:', data.usage)
    }
    console.log()
  }
} catch (error) {
  console.error('❌ FAIL:', error.message, '\n')
}

console.log('='.repeat(70) + '\n')

// Test 3: Streaming
console.log('🧪 Test 3: Streaming with Gemini Model...\n')
try {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/ismail-kattakath/jsonresume-to-everything',
      'X-Title': 'JSON Resume to Everything',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-preview-09-2025',
      messages: [
        { role: 'user', content: 'Count from 1 to 3.' }
      ],
      stream: true,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ FAIL:', response.status, response.statusText)
    console.error('Error:', errorText, '\n')
  } else {
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let chunkCount = 0
    let fullContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue

        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6)
          try {
            const chunk = JSON.parse(jsonStr)
            const delta = chunk.choices?.[0]?.delta?.content

            if (delta) {
              chunkCount++
              fullContent += delta
              console.log(`  Chunk ${chunkCount}:`, JSON.stringify(delta))
            }
          } catch (e) {
            console.warn('Failed to parse chunk:', jsonStr)
          }
        }
      }
    }

    console.log('\n✅ Streaming complete!')
    console.log('Full content:', fullContent)
    console.log('Chunks received:', chunkCount)
    console.log()
  }
} catch (error) {
  console.error('❌ FAIL:', error.message, '\n')
}

console.log('='.repeat(70))
console.log('✅ All OpenRouter Tests Complete!')
console.log('='.repeat(70))
