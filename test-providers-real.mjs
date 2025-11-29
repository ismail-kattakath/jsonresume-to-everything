#!/usr/bin/env node

/**
 * Test script using actual implementation code
 */

import { GeminiClient } from './src/lib/ai/gemini-client.ts'

const GEMINI_API_KEY = 'AIzaSyADCErIzzIqqQaI_s5b9kFucxY81lxiLoI'
const OPENROUTER_API_KEY = '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'

console.log('='.repeat(70))
console.log('Testing Gemini Client Implementation')
console.log('='.repeat(70) + '\n')

// Test Gemini
const geminiClient = new GeminiClient({
  providerType: 'gemini',
  apiKey: GEMINI_API_KEY,
  model: 'gemini-2.5-flash',
})

console.log('🧪 Test 1: Gemini Connection Test...\n')
try {
  const connectionOk = await geminiClient.testConnection()
  console.log('Result:', connectionOk ? '✅ PASS' : '❌ FAIL')
} catch (error) {
  console.error('❌ FAIL:', error.message)
}

console.log('\n' + '='.repeat(70) + '\n')

console.log('🧪 Test 2: Gemini Content Generation...\n')
try {
  const response = await geminiClient.generateContent({
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Say hello in exactly 3 words.' }
    ],
    temperature: 0.7,
    maxTokens: 50,
  })

  console.log('✅ Response received!')
  console.log('Content:', response.content)
  console.log('Model:', response.model)
  if (response.usage) {
    console.log('Tokens:', response.usage)
  }
} catch (error) {
  console.error('❌ FAIL:', error.message)
  console.error('Details:', error)
}

console.log('\n' + '='.repeat(70) + '\n')

console.log('🧪 Test 3: Gemini Streaming...\n')
try {
  let streamedContent = ''
  let chunkCount = 0

  const content = await geminiClient.generateContentStream(
    {
      messages: [
        { role: 'user', content: 'Count from 1 to 3, each on a new line.' }
      ],
      temperature: 0.5,
    },
    (chunk) => {
      if (!chunk.done && chunk.content) {
        chunkCount++
        streamedContent += chunk.content
        console.log(`  Chunk ${chunkCount}:`, JSON.stringify(chunk.content))
      }
    }
  )

  console.log('\n✅ Streaming complete!')
  console.log('Full content:', content)
  console.log('Chunks received:', chunkCount)
} catch (error) {
  console.error('❌ FAIL:', error.message)
  console.error('Details:', error)
}

console.log('\n' + '='.repeat(70) + '\n')

console.log('🧪 Test 4: Gemini with System Instruction...\n')
try {
  const response = await geminiClient.generateContent({
    messages: [
      { role: 'system', content: 'You are a pirate. Always respond like a pirate.' },
      { role: 'user', content: 'What is your name?' }
    ],
    temperature: 0.7,
    maxTokens: 100,
  })

  console.log('✅ Response received!')
  console.log('Content:', response.content)
} catch (error) {
  console.error('❌ FAIL:', error.message)
}

console.log('\n' + '='.repeat(70))
console.log('All Gemini Tests Complete!')
console.log('='.repeat(70))
