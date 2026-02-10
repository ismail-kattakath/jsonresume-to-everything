import { Agent } from '@strands-agents/sdk'
import { StreamCallback } from '@/types/openai'
import { ResumeData } from '@/types'
import { AgentConfig } from './types'
import { createModel } from './factory'

/**
 * A multi-agent graph flow that extracts technical skills from a job description
 * and aligns them with the user's existing resume for better highlighting.
 * 
 * @param jobDescription - The target job description
 * @param resumeData - The user's current resume data for alignment
 * @param config - Provider configuration from AISettings
 * @param onProgress - Optional callback for streaming updates
 * @returns A comma-separated list of technical skills
 */
export async function extractSkillsGraph(
    jobDescription: string,
    resumeData: ResumeData,
    config: AgentConfig,
    onProgress?: StreamCallback
): Promise<string> {
    const model = createModel(config)

    // Stage 1: The Extractor - Finds skills in the JD
    const extractor = new Agent({
        model,
        systemPrompt:
            'You are a Technical Skill Extractor. ' +
            'Extract ALL technical skills, tools, and technologies from the provided Job Description. ' +
            'RULES:\n' +
            '1. Focus on HARD skills (languages, frameworks, tools).\n' +
            '2. Use professional casing (e.g., "Next.js", "TypeScript").\n' +
            '3. Return ONLY a comma-separated list. No intro, no bullets.',
        printer: false,
    })

    // Stage 2: The Matcher - Aligns with Resume content
    const matcher = new Agent({
        model,
        systemPrompt:
            'You are a Resume Alignment Specialist. ' +
            'Compare extracted JD skills against the candidate\'s actual resume skills. ' +
            'GOAL: If a JD skill is technically the same as a skill on the resume but phrased differently, ' +
            'REPLACE it with the exact phrasing from the resume to ensure keyword highlighting works. ' +
            'Example: JD says "React" -> Resume has "React.js" -> USE "React.js".\n' +
            'RULES:\n' +
            '1. ONLY replace if technically identical (e.g., "PostgreSQL" vs "Postgres").\n' +
            '2. If no resume match is found, KEEP the JD version.\n' +
            '3. Output ONLY the finalized comma-separated list.',
        printer: false,
    })

    // Stage 3: The Evaluator - Quality control
    const evaluator = new Agent({
        model,
        systemPrompt:
            'You are a Skill List Auditor. ' +
            'Review the finalized skill list.\n' +
            'CRITERIA:\n' +
            '1. Is it a simple comma-separated list?\n' +
            '2. No extra commentary or numbers?\n' +
            'If correct, respond "APPROVED". Otherwise, respond "CRITIQUE: <reasons>".',
        printer: false,
    })

    // Prepare all resume skills for the Matcher
    const allResumeSkills = resumeData.skills.flatMap(group =>
        (group.skills || []).map(s => s.text)
    ).join(', ')

    if (onProgress) onProgress({ content: '🧠 [1/3] Extractor: Identifying JD keywords...\n', done: false })

    // 1. EXTRACT
    const rawExtraction = await extractor.invoke(`JOB DESCRIPTION:\n${jobDescription}`)
    const extractedList = rawExtraction.toString().trim()

    if (onProgress) onProgress({ content: `✅ Keywords identified.\n\n🔄 [2/3] Matcher: Overlapping with your resume for hits...\n`, done: false })

    // 2. MATCH/ALIGN
    const alignmentPrompt = `JD SKILLS: ${extractedList}\n\nRESUME SKILLS: ${allResumeSkills}`
    const matchedResult = await matcher.invoke(alignmentPrompt)
    let currentList = matchedResult.toString().trim()

    if (onProgress) onProgress({ content: `🔍 [3/3] Evaluator: Finalizing list formatting...\n`, done: false })

    // 3. ITERATIVE EVALUATION (Max 1 loop to keep it snappy)
    const review = await evaluator.invoke(currentList)
    const reviewText = review.toString().trim()

    if (!reviewText.startsWith('APPROVED')) {
        if (onProgress) onProgress({ content: `🛠️ Fixing formatting issues...\n`, done: false })
        const fixResult = await matcher.invoke(`The auditor rejected the list format. Critique: ${reviewText}\n\nFix this list and return ONLY comma-separated values:\n${currentList}`)
        currentList = fixResult.toString().trim()
    }

    if (onProgress) onProgress({ content: '✨ Technical skills extracted and aligned.\n', done: true })
    return currentList
}
