#!/usr/bin/env node

/**
 * Test script with actual resume data
 */

import { readFileSync } from 'fs';

const AI_CONFIG = {
  baseURL: 'http://localhost:1234',
  apiKey: 'NOKEY',
  model: 'local-model'
};

// Load actual resume data
const resumeJson = JSON.parse(readFileSync('./src/data/resume.json', 'utf-8'));

// Convert to internal format like the adapter does
const skills = (resumeJson.skills || []).map((skillGroup) => ({
  title: skillGroup.name || 'Skills',
  skills: (skillGroup.keywords || []).map((keyword) => ({
    text: keyword,
  })),
}));

console.log('Actual Skills Data:');
console.log(JSON.stringify(skills.slice(0, 2), null, 2)); // Just show first 2 groups
console.log('\nNumber of skill groups:', skills.length);
skills.forEach(group => {
  console.log(`- ${group.title}: ${group.skills.length} skills`);
});

// Build the actual prompt that would be sent
const jobDescription = 'Senior Full Stack Developer with Node.js, React, and AWS experience';

const skillsData = skills.map((group) => ({
  title: group.title,
  skills: group.skills.map((s) => s.text),
}));

const prompt = `You are an expert tech recruiter who optimizes resume skills sections for maximum ATS and recruiter relevance.

TARGET JOB DESCRIPTION:
${jobDescription}

CURRENT SKILLS DATA (JSON format):
${JSON.stringify(skillsData, null, 2)}

YOUR TASK:
Sort the skill groups and skills within each group by relevance to the target job description.

CRITICAL RULES:
1. DO NOT add, remove, or modify any skills or groups
2. Every skill MUST remain in its original group
3. Sort GROUPS so most job-relevant groups appear first
4. Sort SKILLS within each group so most job-relevant skills appear first
5. Use exact skill names as provided (case-sensitive)

SORTING STRATEGY:
- Identify key technologies, frameworks, and skills mentioned in the job description
- Prioritize groups containing those skills
- Within each group, prioritize skills explicitly mentioned or closely related to job requirements
- Skills not relevant to the job should be at the end, but NEVER removed

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
  console.log('\n' + '='.repeat(80));
  
  // Try parsing like the app does
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
    
    // Validate like parseSkillsSortResponse does
    console.log('\nValidation checks:');
    
    if (!parsed.groupOrder || !Array.isArray(parsed.groupOrder)) {
      console.log('❌ Invalid groupOrder');
      return;
    }
    console.log('✅ groupOrder is valid array');
    
    if (!parsed.skillOrder || typeof parsed.skillOrder !== 'object') {
      console.log('❌ Invalid skillOrder');
      return;
    }
    console.log('✅ skillOrder is valid object');
    
    const originalGroupTitles = new Set(skills.map((g) => g.title));
    const responseGroupTitles = new Set(parsed.groupOrder);
    
    console.log(`\nGroup count: original=${originalGroupTitles.size}, response=${responseGroupTitles.size}`);
    
    if (originalGroupTitles.size !== responseGroupTitles.size) {
      console.log('❌ Group count mismatch');
      console.log('Original groups:', Array.from(originalGroupTitles));
      console.log('Response groups:', Array.from(responseGroupTitles));
      return;
    }
    console.log('✅ Group count matches');
    
    for (const title of originalGroupTitles) {
      if (!responseGroupTitles.has(title)) {
        console.log(`❌ Missing group "${title}"`);
        return;
      }
    }
    console.log('✅ All groups present');
    
    // Validate skills within each group
    let allValid = true;
    for (const group of skills) {
      const originalSkillTexts = new Set(group.skills.map((s) => s.text));
      const responseSkillTexts = parsed.skillOrder[group.title];
      
      if (!responseSkillTexts || !Array.isArray(responseSkillTexts)) {
        console.log(`❌ Missing skill order for group "${group.title}"`);
        allValid = false;
        continue;
      }
      
      const responseSkillSet = new Set(responseSkillTexts);
      if (responseSkillSet.size !== responseSkillTexts.length) {
        console.log(`❌ Duplicate skills in group "${group.title}"`);
        allValid = false;
        continue;
      }
      
      if (originalSkillTexts.size !== responseSkillSet.size) {
        console.log(`❌ Skill count mismatch for "${group.title}": expected ${originalSkillTexts.size}, got ${responseSkillSet.size}`);
        console.log('  Original:', Array.from(originalSkillTexts));
        console.log('  Response:', responseSkillTexts);
        allValid = false;
        continue;
      }
      
      for (const skillText of originalSkillTexts) {
        if (!responseSkillSet.has(skillText)) {
          console.log(`❌ Missing skill "${skillText}" in group "${group.title}"`);
          allValid = false;
          break;
        }
      }
    }
    
    if (allValid) {
      console.log('\n✅ ALL VALIDATIONS PASSED - Response is valid!');
    } else {
      console.log('\n❌ VALIDATION FAILED');
    }
    
  } catch (err) {
    console.log('❌ Failed to parse JSON:', err.message);
  }
})
.catch(error => {
  console.error('❌ Request failed:', error.message);
});
