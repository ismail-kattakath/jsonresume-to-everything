import { Agent, tool } from '@strands-agents/sdk'
import { z } from 'zod'
import { StreamCallback } from '@/types/openai'
import { ResumeData } from '@/types'
import { AgentConfig } from './types'
import { createModel } from './factory'

/**
 * Multi-agent graph flow for generating a high-quality professional summary.
 * Uses a "Semantic Pillar" strategy based on a high-quality benchmark example.
 */
export async function generateSummaryGraph(
  resumeData: ResumeData,
  jobDescription: string,
  config: AgentConfig,
  onProgress?: StreamCallback
): Promise<string> {
  const model = createModel(config)

  // 1. DYNAMIC YEARS OF EXPERIENCE CALCULATION
  const workExp = resumeData.workExperience || []
  const lastJob = workExp[workExp.length - 1]
  const firstJobYear = lastJob?.startYear ? new Date(lastJob.startYear).getFullYear() : null
  const yearsExperience = firstJobYear ? new Date().getFullYear() - firstJobYear : null
  const experienceString = yearsExperience ? `${yearsExperience}+ years` : 'extensive experience'

  // Extract all skills from resume for validation tool and context
  const allowedSkills = resumeData.skills?.flatMap((group) => group.skills.map((s) => s.text)) || []

  /**
   * Tool: Validates skills in summary against allowed list
   */
  const validateSkillsTool = tool({
    name: 'validate_skills',
    description: 'Checks if summary contains any technologies NOT in the allowed skills list.',
    inputSchema: z.object({
      summary: z.string().describe('The generated summary text'),
    }),
    callback: (input: { summary: string }) => {
      const result = validateSkillsInSummary(input.summary, allowedSkills)
      return JSON.stringify(result)
    },
  })

  // Agent 1: The Analyst - Identifies Semantic Pillars and Power Clusters
  const analyst = new Agent({
    model,
    systemPrompt:
      "You are a Resume Strategy Analyst. Your task is to extract high-level semantic pillars and specific technology clusters from a candidate's work history.\n\n" +
      'RULES:\n' +
      '1. IDENTIFY PILLARS: Group the candidate\'s achievements into 3 distinct "Semantic Pillars" (e.g., Cloud-Native Infrastructure, Security & IAM, AI/ML Workflows).\n' +
      '2. POWER CLUSTERS: For each pillar, identify the highly specific technology sets from the ALLOWED SKILLS list (e.g., if the pillar is Security, a cluster might be "OAuth 2.0, PKCE, and SAML 2.0").\n' +
      '3. JD OFFSET: Bias the selection of these pillars towards what is most relevant in the provided Job Description.\n' +
      'OUTPUT: A structured brief including: Target Role, Pillars (with achievements), and Power Clusters.',
    printer: false,
  })

  // Agent 2: The Writer - Drafts the 4-sentence summary
  const writer = new Agent({
    model,
    systemPrompt:
      "You are a Master Professional Resume Writer. Your task is to synthesize a candidate's profile into a sophisticated 4-sentence summary.\n\n" +
      'BENCHMARK FORMAT (Follow this structure strictly):\n' +
      'Sentence 1: [Seniority/Role] with [Years] of [Core Domain Summary].\n' +
      'Sentence 2: "Specializing in [Pillar 1], [Pillar 2], and [Pillar 3]."\n' +
      'Sentence 3: "Proven track record in [Methodology/Depth 1], [Depth 2], and [Depth 3]."\n' +
      'Sentence 4: "Expert-level implementation of [Tech Cluster 1] and [Tech Cluster 2], with a focus on [Linking Tech to Business Impact]."\n\n' +
      'GOLD STANDARD EXAMPLE:\n' +
      'Senior engineer with 15+ years of full stack web development experience, specializing in cloud-native distributed systems, enterprise IAM, and AI/ML workflows. Proven track record in architecting scalable Microservices, Serverless functions, and Event-driven systems. Expert-level implementation of SSO/Auth protocols and production-grade AI systems, including RAG pipelines and autonomous agents, focusing on delivering secure, intelligent systems that align technical innovation with business impact.\n\n' +
      'STRICT RULES:\n' +
      '1. EXACTLY 4 sentences.\n' +
      '2. Third-person voice only.\n' +
      '3. MUST use the specific Pillars and Power Clusters provided by the Analyst.\n' +
      '4. FABRICATION: ONLY use skills from the provided allowed list.\n' +
      'OUTPUT: The summary text only.',
    printer: false,
  })

  // Agent 3: The Reviewer - Audits for structure and quality
  const reviewer = new Agent({
    model,
    tools: [validateSkillsTool],
    systemPrompt:
      'You are a Resume Quality Auditor. Verify the generated summary against the 4-sentence Semantic Pillar structure.\n\n' +
      'CRITERIA:\n' +
      '1. COUNT: Exactly 4 sentences?\n' +
      '2. SENTENCE 1: Role/Seniority + Years + Domain?\n' +
      '3. SENTENCE 2: Specializing in pillars?\n' +
      '4. SENTENCE 3: Proven track record in depth/methodologies?\n' +
      '5. SENTENCE 4: Tech clusters + Focus on business impact?\n' +
      '6. SKILLS: Use validate_skills to ensure no invented technologies.\n' +
      'If perfect, respond "APPROVED". Otherwise, respond "CRITIQUE: <specific issues>".',
    printer: false,
  })

  if (onProgress)
    onProgress({
      content: 'Identifying job-relevant metrics and skills...\n',
      done: false,
    })

  const analystPrompt = `JOB DESCRIPTION:\n${jobDescription}\n\nCANDIDATE WORK HISTORY:\n${JSON.stringify(workExp)}\n\nALLOWED SKILLS:\n${allowedSkills.join(', ')}`
  const analysisResult = await analyst.invoke(analystPrompt)
  const analysisBrief = analysisResult.toString().trim()

  if (onProgress)
    onProgress({
      content: 'Drafting your professional summary...\n',
      done: false,
    })

  let iteration = 0
  const maxIterations = 2
  let currentSummary = ''
  let lastCritique = ''

  while (iteration <= maxIterations) {
    iteration++

    const writerPrompt =
      iteration === 1
        ? `Analysis Brief:\n${analysisBrief}\n\nAllowed Skills:\n${allowedSkills.join(', ')}\n\nCandidate Experience: ${experienceString}`
        : `The summary failed audit. Fix it based on this critique:\n${lastCritique}\n\nSummary Attempt:\n${currentSummary}\n\nAllowed Skills:\n${allowedSkills.join(', ')}\n\nCandidate Experience: ${experienceString}`

    const writerResult = await writer.invoke(writerPrompt)
    currentSummary = writerResult
      .toString()
      .replace(/^["']|["']$/g, '')
      .trim()

    if (onProgress)
      onProgress({
        content: 'Auditing summary for structure and alignment...',
        done: false,
      })

    const reviewPrompt = `Summary to review:\n${currentSummary}\n\nVerify against the 4-sentence structure using the validate_skills tool.`
    const reviewResult = await reviewer.invoke(reviewPrompt)
    const reviewText = reviewResult.toString().trim()

    if (reviewText.startsWith('APPROVED')) {
      if (onProgress)
        onProgress({
          content: 'Expert summary generated and verified.',
          done: true,
        })
      return currentSummary
    } else {
      lastCritique = reviewText
      if (onProgress)
        onProgress({
          content: `Audit failed: ${reviewText.slice(0, 50)}...`,
          done: false,
        })
    }
  }

  if (onProgress)
    onProgress({
      content: 'Generated with minor validation warnings.',
      done: true,
    })
  return currentSummary
}

/**
 * Validates that all skills mentioned in the summary exist in the allowed skills list.
 *
 * @param summary - The generated summary text
 * @param allowedSkills - List of valid technology names
 * @returns Object with validation status and list of violating mentions
 */
function validateSkillsInSummary(summary: string, allowedSkills: string[]) {
  const normalizedAllowed = new Set(allowedSkills.map((s) => s.toLowerCase().trim()))

  const mentions = new Set<string>()
  const patterns = [
    /\b[A-Z][a-zA-Z0-9]+\b/g, // Match single capitalized words
    /\b[A-Z]{2,}\b/g, // Match acronyms
    /\b[a-zA-Z0-9]+\.[a-zA-Z0-9]+\b/g, // Match domains/technical names
  ]

  for (const pattern of patterns) {
    const matches = summary.match(pattern) || []
    matches.forEach((m) => mentions.add(m.toLowerCase()))
  }

  const ignoreList = new Set([
    'the',
    'and',
    'for',
    'with',
    'years',
    'experience',
    'senior',
    'lead',
    'engineer',
    'developer',
    'systems',
    'solutions',
    'scalable',
    'building',
    'expert',
    'specializing',
    'architecting',
    'architected',
    'focusing',
    'align',
    'innovation',
    'impact',
    'production',
  ])
  const violations: string[] = []

  mentions.forEach((mention) => {
    if (mention.length < 3 || ignoreList.has(mention)) return

    const isAllowed = Array.from(normalizedAllowed).some(
      (allowed) => allowed === mention || allowed.includes(mention) || mention.includes(allowed)
    )

    if (!isAllowed) violations.push(mention)
  })

  return {
    valid: violations.length === 0,
    violations,
  }
}
