/**
 * Summary Agent using Strands Agents SDK
 *
 * Implements a multi-agent pattern for generating and validating
 * professional summaries with fabrication detection.
 *
 * @see https://github.com/strands-agents/sdk-typescript
 */

import { Agent } from '@strands-agents/sdk'
import { OpenAIModel } from '@strands-agents/sdk/openai'
import { tool } from '@strands-agents/sdk'
import { z } from 'zod'
import type { ResumeData } from '@/types'

/**
 * Configuration for the Summary Agent (BYOK - Bring Your Own Key)
 */
export interface SummaryAgentConfig {
  apiKey: string
  baseURL: string
  model: string
  temperature?: number
  maxTokens?: number
}

/**
 * Result from summary generation
 */
export interface SummaryResult {
  summary: string
  warnings: string[] // Technologies mentioned that aren't in resume (for human review)
  iterationsUsed: number
  isValid: boolean
}

/**
 * Creates a tool for validating skills in generated content
 * against the candidate's actual resume skills
 */
function createValidateSkillsTool(allowedSkills: string[]) {
  return tool({
    name: 'validate_skills',
    description:
      'Validates that a generated summary only mentions technologies from the allowed skills list. Returns warnings for any terms not found in allowed skills.',
    inputSchema: z.object({
      summary: z.string().describe('The generated summary text to validate'),
    }),
    callback: (input: { summary: string }) => {
      const result = validateSkillsInSummary(input.summary, allowedSkills)

      if (result.valid) {
        return JSON.stringify({
          valid: true,
          message:
            'Summary validated. All mentioned technologies are in the allowed skills list.',
          warnings: [],
        })
      }

      return JSON.stringify({
        valid: false,
        message: `Found ${result.warnings.length} term(s) not in allowed skills: ${result.warnings.join(', ')}. Consider removing or replacing these.`,
        warnings: result.warnings,
      })
    },
  })
}

/**
 * Creates the Summary Agent with BYOK configuration
 */
export function createSummaryAgent(
  config: SummaryAgentConfig,
  allowedSkills: string[]
): Agent {
  const model = new OpenAIModel({
    apiKey: config.apiKey,
    clientConfig: {
      baseURL: config.baseURL,
    },
    modelId: config.model,
    maxTokens: config.maxTokens ?? 300,
    temperature: config.temperature ?? 0.5,
  })

  const validateSkillsTool = createValidateSkillsTool(allowedSkills)

  return new Agent({
    model,
    tools: [validateSkillsTool],
    systemPrompt: `You are a professional resume writer. Your task is to generate concise, accurate professional summaries.

CRITICAL RULES:
1. ONLY use skills/technologies from the provided allowed skills list
2. NEVER mention technologies not in the allowed list, even if they appear in the job description
3. If you're unsure about a technology, use the validate_skills tool to check
4. After generating a summary, ALWAYS use validate_skills to verify before responding
5. If validation fails, regenerate without the flagged technologies

OUTPUT: Single paragraph, 400-550 characters, third-person voice.`,
  })
}

/**
 * Generates a validated summary using the multi-agent pattern
 */
export async function generateValidatedSummary(
  config: SummaryAgentConfig,
  resumeData: ResumeData,
  jobDescription: string,
  _onProgress?: (chunk: string) => void // TODO: Implement streaming
): Promise<SummaryResult> {
  // Extract all skills from resume
  const allowedSkills =
    resumeData.skills?.flatMap((group) => group.skills.map((s) => s.text)) || []

  // Calculate years of experience
  const workExp = resumeData.workExperience
  const lastJob = workExp?.[workExp.length - 1]
  const firstJobYear = lastJob?.startYear
    ? new Date(lastJob.startYear).getFullYear()
    : null
  const yearsExperience = firstJobYear
    ? new Date().getFullYear() - firstJobYear
    : null

  // Extract key achievements with metrics
  const topAchievements =
    workExp
      ?.slice(0, 3)
      .flatMap((exp) =>
        exp.keyAchievements
          ?.filter((a) => /\d+%|\d+ (hours?|minutes?|users?)/.test(a.text))
          .slice(0, 2)
          .map((a) => `• ${a.text}`)
      )
      .filter(Boolean)
      .slice(0, 4)
      .join('\n') || 'No achievements provided'

  const currentRole = workExp?.[0]
    ? `${workExp[0].position} at ${workExp[0].organization}`
    : resumeData.position

  // Create the agent
  const agent = createSummaryAgent(config, allowedSkills)

  const prompt = `Generate a professional summary for this candidate targeting the job below.

CANDIDATE:
- Name: ${resumeData.name}
- Experience: ${yearsExperience ? `${yearsExperience}+` : 'extensive'} years
- Current: ${currentRole}

KEY ACHIEVEMENTS:
${topAchievements}

ALLOWED SKILLS (ONLY use these):
${allowedSkills.join(', ')}

TARGET JOB:
${jobDescription.slice(0, 1000)}

After generating, use the validate_skills tool to verify, then provide the final summary.`

  try {
    const response = await agent.invoke(prompt)

    // Extract the summary from the response using toString()
    // Strip leading/trailing quotes that some models add
    const responseText = response
      .toString()
      .replace(/^["']|["']$/g, '')
      .trim()

    // Check for fabrications in final output using a simple validation function
    const validationResult = validateSkillsInSummary(
      responseText,
      allowedSkills
    )

    return {
      summary: responseText,
      warnings: validationResult.warnings,
      iterationsUsed: 1, // TODO: Track actual iterations
      isValid: validationResult.valid,
    }
  } catch (error) {
    console.error('Summary agent error:', error)
    throw error
  }
}

/**
 * Extracts technology/skill mentions from text using common patterns
 */
function extractTechMentions(text: string): string[] {
  // Match capitalized words, acronyms, and common tech patterns
  const patterns = [
    /\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\b/g, // Capitalized words (e.g., "AWS Bedrock")
    /\b[A-Z]{2,}\b/g, // Acronyms (e.g., "AWS", "GCP", "RAG")
    /\b[a-z]+\.[a-z]+\b/gi, // Dotted names (e.g., "Node.js", "Next.js")
    /\b[a-z]+-[a-z]+\b/gi, // Hyphenated (e.g., "micro-services")
  ]

  const mentions = new Set<string>()
  for (const pattern of patterns) {
    const matches = text.match(pattern) || []
    matches.forEach((m) => mentions.add(m.toLowerCase()))
  }

  return Array.from(mentions)
}

/**
 * Validates skills in a summary against allowed skills list
 * Uses dynamic comparison - no hardcoded blocklist
 */
function validateSkillsInSummary(
  summary: string,
  allowedSkills: string[]
): { valid: boolean; fabrications: string[]; warnings: string[] } {
  // Normalize allowed skills for comparison
  const normalizedAllowed = new Set<string>()
  for (const skill of allowedSkills) {
    // Add the full skill and individual words
    normalizedAllowed.add(skill.toLowerCase().trim())
    skill
      .toLowerCase()
      .split(/[\s,/()]+/)
      .filter((w) => w.length > 2)
      .forEach((w) => normalizedAllowed.add(w))
  }

  // Extract tech mentions from summary
  const mentions = extractTechMentions(summary)

  // Common words to ignore (not technologies)
  const ignoreWords = new Set([
    'the',
    'and',
    'for',
    'with',
    'years',
    'experience',
    'senior',
    'lead',
    'principal',
    'engineer',
    'developer',
    'building',
    'systems',
    'solutions',
    'production',
    'infrastructure',
    'scalable',
    'distributed',
    'expertise',
    'proven',
    'track',
    'record',
  ])

  const warnings: string[] = []

  // Check each mention against allowed skills
  for (const mention of mentions) {
    if (ignoreWords.has(mention)) continue
    if (mention.length < 3) continue

    // Check if this mention or any part of it is in allowed skills
    const isAllowed =
      normalizedAllowed.has(mention) ||
      Array.from(normalizedAllowed).some(
        (allowed) => allowed.includes(mention) || mention.includes(allowed)
      )

    if (!isAllowed) {
      warnings.push(mention)
    }
  }

  return {
    valid: warnings.length === 0,
    fabrications: [], // We can't definitively say something is fabricated
    warnings, // These are potential issues for human review
  }
}

/**
 * Checks if the Strands SDK is available in the current environment
 */
export function isStrandsSdkAvailable(): boolean {
  try {
    // Check if the SDK modules are loadable
    return typeof Agent === 'function' && typeof OpenAIModel === 'function'
  } catch {
    return false
  }
}
