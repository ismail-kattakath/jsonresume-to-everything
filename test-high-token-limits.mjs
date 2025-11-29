#!/usr/bin/env node

/**
 * Test Gemini API with high token limits (4096, 8192)
 */

const GEMINI_API_KEY = 'AIzaSyADCErIzzIqqQaI_s5b9kFucxY81lxiLoI'
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

console.log('='.repeat(70))
console.log('Testing Gemini with High Token Limits')
console.log('='.repeat(70) + '\n')

const testConfigs = [
  { model: 'gemini-2.5-flash', maxOutputTokens: 4096, description: 'Summary test' },
  { model: 'gemini-2.5-flash', maxOutputTokens: 8192, description: 'Cover letter test' },
  { model: 'gemini-2.5-pro', maxOutputTokens: 4096, description: 'Summary test' },
  { model: 'gemini-2.5-pro', maxOutputTokens: 8192, description: 'Cover letter test' },
]

const prompt = `Based on the following resume data and job description, write a compelling professional cover letter that highlights the most relevant qualifications and achievements.

Resume Data:
Name: John Doe
Title: Senior Software Engineer
Experience: 8 years of full-stack development
Skills: JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, PostgreSQL
Achievements:
- Led development of microservices platform serving 1M+ users
- Reduced API response time by 60% through optimization
- Mentored 5 junior developers

Job Description:
We are seeking a Senior Full-Stack Engineer to join our growing team. You will be responsible for architecting and building scalable web applications, leading technical initiatives, and mentoring junior developers. Strong experience with modern JavaScript frameworks, cloud infrastructure, and database design required.

Instructions:
- Write a professional cover letter (300-400 words)
- Highlight relevant achievements with specific metrics
- Demonstrate enthusiasm for the role
- Include proper business letter formatting`

for (const config of testConfigs) {
  console.log(`\nTesting: ${config.model} with maxOutputTokens=${config.maxOutputTokens}`)
  console.log(`Use case: ${config.description}`)
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

    const parts = data.candidates?.[0]?.content?.parts
    const content = parts?.map((p) => p.text).join('').trim() || ''
    const finishReason = data.candidates?.[0]?.finishReason
    const usage = data.usageMetadata

    console.log('\n📊 Response:')
    console.log('  Content length:', content.length, 'chars')
    console.log('  Content words:', content.split(/\s+/).length, 'words')
    console.log('  Finish reason:', finishReason)

    if (usage) {
      console.log('\n📈 Token Usage:')
      console.log('  Prompt tokens:', usage.promptTokenCount)
      console.log('  Candidate tokens:', usage.candidatesTokenCount || 0)
      console.log('  Thoughts tokens:', usage.thoughtsTokenCount || 0)
      console.log('  Total tokens:', usage.totalTokenCount)
      console.log('  Tokens remaining:', config.maxOutputTokens - (usage.thoughtsTokenCount || 0) - (usage.candidatesTokenCount || 0))
    }

    if (finishReason === 'MAX_TOKENS') {
      console.log('\n⚠️  WARNING: Hit MAX_TOKENS - response may be truncated!')
    } else if (finishReason === 'STOP') {
      console.log('\n✅ SUCCESS - Complete response received')
    }

    // Show first 200 chars
    console.log('\n📝 Content preview:')
    console.log(content.substring(0, 200) + '...')
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
