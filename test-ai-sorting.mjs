#!/usr/bin/env node

/**
 * Test script to check AI responses for Skills and Achievements sorting
 */

const AI_CONFIG = {
  baseURL: 'http://localhost:1234',
  apiKey: 'NOKEY',
  model: 'local-model'
};

async function testAIRequest(prompt, description) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${description}`);
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

  try {
    const response = await fetch(`${AI_CONFIG.baseURL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('\nRAW RESPONSE:');
    console.log(content);
    console.log('\nRESPONSE LENGTH:', content.length);
    console.log('STARTS WITH:', content.substring(0, 50));
    console.log('ENDS WITH:', content.substring(content.length - 50));
    
    // Try to parse it
    console.log('\nPARSING ATTEMPT:');
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
      console.log('Removed ```json prefix');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
      console.log('Removed ``` prefix');
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
      console.log('Removed ``` suffix');
    }
    cleaned = cleaned.trim();
    
    try {
      const parsed = JSON.parse(cleaned);
      console.log('✅ Successfully parsed JSON:');
      console.log(JSON.stringify(parsed, null, 2));
    } catch (err) {
      console.log('❌ Failed to parse JSON:', err.message);
      console.log('Cleaned string was:', cleaned);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Test Skills Sorting
const skillsPrompt = `You are an expert tech recruiter who optimizes resume skills sections for maximum ATS and recruiter relevance.

TARGET JOB DESCRIPTION:
Senior Full Stack Developer position requiring Node.js, React, and AWS experience

CURRENT SKILLS DATA (JSON format):
[
  {
    "title": "Backend & APIs",
    "skills": ["Node.js", "Express", "RESTful APIs", "GraphQL"]
  },
  {
    "title": "Frontend",
    "skills": ["React", "Vue.js", "Angular"]
  }
]

YOUR TASK:
Sort the skill groups and skills within each group by relevance to the target job description.

CRITICAL RULES:
1. DO NOT add, remove, or modify any skills or groups
2. Every skill MUST remain in its original group
3. Sort GROUPS so most job-relevant groups appear first
4. Sort SKILLS within each group so most job-relevant skills appear first
5. Use exact skill names as provided (case-sensitive)

OUTPUT FORMAT (JSON only, no explanation):
{
  "groupOrder": ["Group Title 1", "Group Title 2", ...],
  "skillOrder": {
    "Group Title 1": ["skill1", "skill2", ...],
    "Group Title 2": ["skill1", "skill2", ...],
    ...
  }
}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, no code blocks.`;

// Test Achievements Sorting
const achievementsPrompt = `You are an expert tech recruiter who optimizes resume achievements for maximum ATS and recruiter relevance.

TARGET JOB DESCRIPTION:
Senior Full Stack Developer position requiring Node.js, React, and AWS experience

WORK EXPERIENCE CONTEXT:
Position: Software Engineer
Organization: Tech Company

CURRENT ACHIEVEMENTS (in current order):
1. Built microservices using Node.js and Express
2. Developed frontend using Angular
3. Migrated infrastructure to AWS
4. Implemented CI/CD pipelines

YOUR TASK:
Sort these achievements by relevance to the target job description.

CRITICAL RULES:
1. DO NOT add, remove, or modify any achievements
2. Use EXACT achievement text as provided (character-for-character match required)
3. Sort so most job-relevant achievements appear first
4. Achievements not relevant to the job should be at the end, but NEVER removed

OUTPUT FORMAT (JSON only, no explanation):
{
  "achievementOrder": [
    "exact text of most relevant achievement",
    "exact text of second most relevant achievement",
    ...
  ]
}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, no code blocks. Use EXACT text from the achievements provided.`;

// Run tests
(async () => {
  await testAIRequest(skillsPrompt, 'Skills Sorting');
  await testAIRequest(achievementsPrompt, 'Achievements Sorting');
})();
