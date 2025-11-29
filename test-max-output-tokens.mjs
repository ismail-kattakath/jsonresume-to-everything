#!/usr/bin/env node

/**
 * Research max_output_tokens behavior in Gemini API
 * Testing different values to understand the issue
 */

const GEMINI_API_KEY = 'AIzaSyADCErIzzIqqQaI_s5b9kFucxY81lxiLoI'
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

console.log('='.repeat(70))
console.log('Testing maxOutputTokens Behavior in Gemini API')
console.log('='.repeat(70) + '\n')

const testConfigs = [
  { model: 'gemini-2.5-flash', maxOutputTokens: 100 },
  { model: 'gemini-2.5-flash', maxOutputTokens: 500 },
  { model: 'gemini-2.5-flash', maxOutputTokens: 2000 },
  { model: 'gemini-2.5-flash', maxOutputTokens: 8192 },
  { model: 'gemini-2.5-pro', maxOutputTokens: 100 },
  { model: 'gemini-2.5-pro', maxOutputTokens: 500 },
  { model: 'gemini-2.5-pro', maxOutputTokens: 2000 },
  { model: 'gemini-2.5-pro', maxOutputTokens: 8192 },
]

const prompt = 'Write a professional 2-sentence summary for a senior software engineer with 8 years of experience.'

for (const config of testConfigs) {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`Testing: ${config.model} with maxOutputTokens=${config.maxOutputTokens}`)
  console.log('='.repeat(70))

  try {
    const response = await fetch(
      `${GEMINI_BASE_URL}/models/${config.model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: config.maxOutputTokens,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ FAIL:', response.status, response.statusText)
      console.error('Error:', errorText)
      continue
    }

    const data = await response.json()

    // Extract information
    const parts = data.candidates?.[0]?.content?.parts
    const content = parts?.map((p) => p.text).join('').trim() || ''
    const finishReason = data.candidates?.[0]?.finishReason
    const usage = data.usageMetadata

    console.log('\n📊 Response:')
    console.log('  Content length:', content.length, 'chars')
    console.log('  Content preview:', content.substring(0, 100) + (content.length > 100 ? '...' : ''))
    console.log('  Finish reason:', finishReason)

    if (usage) {
      console.log('\n📈 Usage Metadata:')
      console.log('  Prompt tokens:', usage.promptTokenCount)
      console.log('  Candidate tokens:', usage.candidatesTokenCount)
      console.log('  Total tokens:', usage.totalTokenCount)
      if (usage.thoughtsTokenCount !== undefined) {
        console.log('  Thoughts tokens:', usage.thoughtsTokenCount)
      }
    }

    console.log('\n✅ SUCCESS')
  } catch (error) {
    console.error('❌ ERROR:', error.message)
  }
}

console.log('\n' + '='.repeat(70))
console.log('Testing Complete')
console.log('='.repeat(70))
