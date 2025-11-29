#!/usr/bin/env node

/**
 * Test achievements sorting with real data
 */

import { readFileSync } from 'fs';

const AI_CONFIG = {
  baseURL: 'http://localhost:1234',
  apiKey: 'NOKEY',
  model: 'local-model'
};

// Load actual resume data
const resumeJson = JSON.parse(readFileSync('./src/data/resume.json', 'utf-8'));

// Get achievements from first work experience
const firstJob = resumeJson.work[0];
const achievements = (firstJob.highlights || []).map(text => ({ text }));

console.log('Work Experience:');
console.log('Position:', firstJob.position);
console.log('Organization:', firstJob.name);
console.log('\nAchievements:');
achievements.forEach((a, i) => {
  console.log(`${i + 1}. ${a.text}`);
});

const jobDescription = 'Senior Full Stack Developer with Node.js, React, and AWS experience';
const achievementTexts = achievements.map((a) => a.text);

const prompt = `You are an expert tech recruiter who optimizes resume achievements for maximum ATS and recruiter relevance.

TARGET JOB DESCRIPTION:
${jobDescription}

WORK EXPERIENCE CONTEXT:
Position: ${firstJob.position}
Organization: ${firstJob.name}

CURRENT ACHIEVEMENTS (in current order):
${achievementTexts.map((text, i) => `${i + 1}. ${text}`).join('\n')}

YOUR TASK:
Sort these achievements by relevance to the target job description.

CRITICAL RULES:
1. DO NOT add, remove, or modify any achievements
2. Use EXACT achievement text as provided (character-for-character match required)
3. Sort so most job-relevant achievements appear first
4. Achievements not relevant to the job should be at the end, but NEVER removed

SORTING STRATEGY:
- Identify key responsibilities, technologies, and outcomes mentioned in the job description
- Prioritize achievements that demonstrate these skills or experiences
- Consider quantified results that align with job requirements
- Soft skills mentioned in job description should boost related achievements

OUTPUT FORMAT (JSON only, no explanation):
{
  "achievementOrder": [
    "exact text of most relevant achievement",
    "exact text of second most relevant achievement",
    ...
  ]
}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, no code blocks. Use EXACT text from the achievements provided.`;

console.log('\n' + '='.repeat(80));
console.log('Sending request to AI server...');
console.log('='.repeat(80));

const request = {
  model: AI_CONFIG.model,
  messages: [
    {
      role: 'system',
      content: 'You are a JSON-only response bot. You return valid JSON without any explanation, markdown, or code blocks.'
    },
    {
      role: 'user',
      content: prompt
    }
  ],
  temperature: 0.3,
  max_tokens: 2000,
  top_p: 0.9
};

fetch(`${AI_CONFIG.baseURL}/v1/chat/completions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AI_CONFIG.apiKey}`
  },
  body: JSON.stringify(request)
})
.then(response => response.json())
.then(data => {
  const content = data.choices[0].message.content;
  
  console.log('\nRAW AI RESPONSE:');
  console.log(content);
  console.log('\nRESPONSE LENGTH:', content.length);
  console.log('\n' + '='.repeat(80));
  
  // Try parsing
  let cleaned = content.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();
  
  try {
    const parsed = JSON.parse(cleaned);
    console.log('✅ Successfully parsed JSON');
    console.log(JSON.stringify(parsed, null, 2));
    
    // Validate
    const originalTexts = new Set(achievementTexts);
    const responseTexts = new Set(parsed.achievementOrder || []);
    
    console.log('\nValidation:');
    console.log('Original count:', originalTexts.size);
    console.log('Response count:', responseTexts.size);
    
    if (originalTexts.size !== responseTexts.size) {
      console.log('❌ Count mismatch');
      console.log('Original:', Array.from(originalTexts));
      console.log('Response:', Array.from(responseTexts));
    } else {
      console.log('✅ Count matches');
      
      // Check each achievement
      for (const text of originalTexts) {
        if (!responseTexts.has(text)) {
          console.log(`❌ Missing: "${text}"`);
        }
      }
      console.log('✅ All achievements present');
    }
    
  } catch (err) {
    console.log('❌ Failed to parse JSON:', err.message);
    console.log('Cleaned string:', cleaned);
  }
})
.catch(error => {
  console.error('❌ Request failed:', error.message);
});
