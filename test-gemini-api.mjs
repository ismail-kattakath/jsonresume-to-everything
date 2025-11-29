#!/usr/bin/env node

/**
 * Test script to verify Gemini API key works
 */

const GEMINI_API_KEY = 'AIzaSyADCErIzzIqqQaI_s5b9kFucxY81lxiLoI'
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'
const MODEL = 'gemini-2.5-flash'

async function testGeminiConnection() {
  console.log('🧪 Testing Gemini API Connection...\n')

  const endpoint = `${GEMINI_BASE_URL}/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`

  const requestBody = {
    contents: [
      {
        parts: [{ text: 'Say "Hello, I am Gemini!" in exactly 5 words.' }]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 20
    }
  }

  try {
    console.log('📡 Making request to Gemini API...')
    console.log('Endpoint:', endpoint.replace(GEMINI_API_KEY, 'API_KEY_HIDDEN'))

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('Status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', errorText)
      return false
    }

    const data = await response.json()
    console.log('\n✅ Response received!')
    console.log(JSON.stringify(data, null, 2))

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (content) {
      console.log('\n📝 Generated text:', content)
      console.log('✅ Gemini API key is working!\n')
      return true
    } else {
      console.error('❌ No content in response')
      return false
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    return false
  }
}

async function testGeminiStreaming() {
  console.log('🧪 Testing Gemini Streaming...\n')

  const endpoint = `${GEMINI_BASE_URL}/models/${MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`

  const requestBody = {
    contents: [
      {
        parts: [{ text: 'Count from 1 to 5, one number per line.' }]
      }
    ]
  }

  try {
    console.log('📡 Making streaming request to Gemini API...')

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('Status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Streaming Error:', errorText)
      return false
    }

    if (!response.body) {
      console.error('❌ No response body')
      return false
    }

    console.log('\n📥 Receiving streaming chunks...\n')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let chunkCount = 0
    let fullContent = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        console.log('\n✅ Stream complete')
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const jsonStr = trimmed.slice(6)
        try {
          const chunk = JSON.parse(jsonStr)
          const text = chunk.candidates?.[0]?.content?.parts
            ?.map(p => p.text)
            .join('') || ''

          if (text) {
            chunkCount++
            fullContent += text
            console.log(`Chunk ${chunkCount}:`, JSON.stringify(text))
          }
        } catch (e) {
          console.warn('Failed to parse chunk:', jsonStr)
        }
      }
    }

    console.log('\n📝 Full content:', fullContent)
    console.log(`✅ Received ${chunkCount} chunks`)
    console.log('✅ Gemini streaming is working!\n')
    return true
  } catch (error) {
    console.error('❌ Streaming failed:', error.message)
    return false
  }
}

// Run tests
console.log('='.repeat(60))
console.log('Testing Gemini API Key')
console.log('='.repeat(60) + '\n')

const connectionResult = await testGeminiConnection()
console.log('\n' + '='.repeat(60) + '\n')

const streamingResult = await testGeminiStreaming()
console.log('\n' + '='.repeat(60))
console.log('Test Results:')
console.log('='.repeat(60))
console.log('Connection Test:', connectionResult ? '✅ PASS' : '❌ FAIL')
console.log('Streaming Test:', streamingResult ? '✅ PASS' : '❌ FAIL')
console.log('='.repeat(60))

process.exit(connectionResult && streamingResult ? 0 : 1)
