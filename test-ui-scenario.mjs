#!/usr/bin/env node

/**
 * Test exact UI scenario for generating summary
 */

const GEMINI_API_KEY = 'AIzaSyADCErIzzIqqQaI_s5b9kFucxY81lxiLoI'
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

console.log('='.repeat(70))
console.log('Testing UI Scenario: Generate Summary with Gemini')
console.log('='.repeat(70) + '\n')

const systemMessage = 'You are an expert resume writer specializing in creating compelling professional summaries that highlight key achievements and align with job requirements.'

const userPrompt = `Based on the following resume data and job description, write a compelling 2-3 sentence professional summary that highlights the most relevant qualifications and achievements.

Resume Data:
Name: John Doe
Experience: Senior Software Engineer with 8 years of experience in full-stack development
Skills: JavaScript, TypeScript, React, Node.js, Python

Job Description:
Looking for a senior software engineer with strong frontend skills and leadership experience.

Instructions:
- Write in first person
- Be specific and achievement-focused
- Align with the job requirements
- Keep it concise (2-3 sentences)
- Do not include a greeting or sign-off`

const testConfigs = [
  { model: 'gemini-2.5-flash', maxOutputTokens: 1500 },
  { model: 'gemini-2.5-pro', maxOutputTokens: 1500 },
]

for (const config of testConfigs) {
  console.log(`\nTesting: ${config.model}`)
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
              parts: [{ text: userPrompt }],
            },
          ],
          systemInstruction: {
            parts: [{ text: systemMessage }],
          },
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
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

    // Extract information exactly like our code does
    const parts = data.candidates?.[0]?.content?.parts
    const content = parts?.map((p) => p.text).join('').trim() || ''
    const finishReason = data.candidates?.[0]?.finishReason
    const usage = data.usageMetadata

    console.log('\n📊 Response:')
    console.log('  Parts count:', parts?.length || 0)
    console.log('  Content length:', content.length, 'chars')
    console.log('  Content:\n')
    console.log(content)
    console.log('\n  Finish reason:', finishReason)

    if (usage) {
      console.log('\n📈 Usage:')
      console.log('  Prompt tokens:', usage.promptTokenCount)
      console.log('  Candidate tokens:', usage.candidatesTokenCount || 0)
      console.log('  Total tokens:', usage.totalTokenCount)
      if (usage.thoughtsTokenCount !== undefined) {
        console.log('  Thoughts tokens:', usage.thoughtsTokenCount)
      }
    }

    if (!content) {
      console.log('\n❌ EMPTY CONTENT - This is the bug!')
      if (finishReason === 'MAX_TOKENS') {
        console.log('   Reason: All tokens consumed by thinking')
      }
    } else {
      console.log('\n✅ SUCCESS')
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message)
  }

  // Rate limit protection
  console.log('\n⏱️  Waiting 20s for rate limit...')
  await new Promise(resolve => setTimeout(resolve, 20000))
}

console.log('\n' + '='.repeat(70))
console.log('Testing Complete')
console.log('='.repeat(70))
