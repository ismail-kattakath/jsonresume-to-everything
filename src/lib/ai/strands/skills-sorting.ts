import { Agent } from '@strands-agents/sdk'
import { StreamCallback } from '@/types/openai'
import { SkillGroup } from '@/types'
import { AgentConfig } from './types'
import { createModel } from './factory'

export interface SkillsSortResult {
    sortedSkills: string[]
    missingSkills?: string[]
}

/**
 * A multi-agent graph flow that sorts resume skills based on job description relevance.
 * Also identifies and adds relevant missing skills.
 *
 * @param skills - The current skill groups
 * @param jobDescription - The target job description
 * @param config - Provider configuration from AISettings
 * @param onProgress - Optional callback for streaming updates
 * @returns The sorted and enhanced SkillsSortResult
 */
export async function sortSkillsGraph(
    skills: SkillGroup[],
    jobDescription: string,
    config: AgentConfig,
    onProgress?: StreamCallback
): Promise<SkillsSortResult> {
    const model = createModel(config)

    const skillsData = skills.map((group) => ({
        title: group.title,
        skills: (group.skills || []).map((s) => s.text),
    }))

    // Agent 1: The Brain - Analyzes and optimizes (Output: Markdown Report)
    const brain = new Agent({
        model,
        systemPrompt:
            'You are a Skill Sorting Expert (The Brain). ' +
            'Your task is to analyze a job description and determine the most relevant order for resume skills. ' +
            'RULES:\n' +
            '1. Determine the best order for skill groups based on JD relevance.\n' +
            '2. Determine the best order for skills within each group.\n' +
            '3. IDENTIFY MISSING TECH: Find technologies in the JD that are not in the current list.\n' +
            '4. PRESERVE ALL: Never suggest removing an existing skill.\n' +
            'OUTPUT: A clean markdown report with the optimized structure. No JSON yet.',
        printer: false,
    })

    // Agent 2: The Scribe - Converts analysis to JSON (Output: JSON)
    const scribe = new Agent({
        model,
        systemPrompt:
            'You are a Data Architect (The Scribe). ' +
            'Your ONLY task is to convert a skill analysis report and original data into a STRICT JSON format. ' +
            'RULES:\n' +
            '1. Use the optimized order and new skills provided in the analysis.\n' +
            '2. Ensure ALL original groups and skills are included.\n' +
            '3. Output EXCLUSIVELY valid JSON. No preamble, no markdown code blocks.\n' +
            'TARGET FORMAT:\n' +
            '{\n' +
            '  "groupOrder": ["Group 1", "Group 2", ...],\n' +
            '  "skillOrder": {\n' +
            '    "Group 1": ["skillA", "skillB", ...],\n' +
            '    "Group 2": ["skillC", "skillD", ...]\n' +
            '  }\n' +
            '}',
        printer: false,
    })

    // Agent 3: The Editor - Validates data integrity (Output: APPROVED or CRITIQUE)
    const editor = new Agent({
        model,
        systemPrompt:
            'You are a Data Validator (The Editor). ' +
            'Verify the generated skill JSON against the original data.\n' +
            'CRITERIA:\n' +
            '1. Valid JSON syntax?\n' +
            '2. ALL ${skillsData.length} original groups present?\n' +
            '3. NO original skills lost?\n' +
            '4. Proper camelCase or standard tech naming?\n' +
            'If perfect, respond "APPROVED". Otherwise, respond "CRITIQUE: <reasons>".',
        printer: false,
    })

    let iteration = 0
    const maxIterations = 2
    let lastAnalysis = ''
    let lastAttemptedJson = ''
    let lastCritique = ''

    onProgress?.({ content: 'Analyzing skill relevance...', done: false })

    // STAGE 1: Analysis
    const analysisResult = await brain.invoke(`JOB DESCRIPTION:\n${jobDescription}\n\nCURRENT SKILLS:\n${JSON.stringify(skillsData)}`)
    lastAnalysis = analysisResult.toString().trim()

    onProgress?.({ content: 'Sorting and optimizing skills...', done: false })

    // STAGE 2 & 3: Iterative Scribing and Editing
    while (iteration <= maxIterations) {
        iteration++

        const scribePrompt = iteration === 1
            ? `Original Data:\n${JSON.stringify(skillsData)}\n\nOptimization Analysis:\n${lastAnalysis}`
            : `Data review failed. Fix the JSON based on these critiques:\n${lastCritique}\n\nKeep the original optimized structure from the analysis.`

        const scribeResult = await scribe.invoke(scribePrompt)
        const rawJson = scribeResult.toString().trim()
        const cleanedJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim()
        lastAttemptedJson = cleanedJson

        onProgress?.({ content: 'Validating sort results...', done: false })

        const review = await editor.invoke(`Original Data:\n${JSON.stringify(skillsData)}\n\nGenerated JSON:\n${cleanedJson}`)
        const reviewText = review.toString().trim()

        if (reviewText.startsWith('APPROVED')) {
            try {
                const finalJson = JSON.parse(cleanedJson) as SkillsSortResult
                onProgress?.({ content: 'Skills sorted!', done: true })
                return finalJson
            } catch (e) {
                lastCritique = `CRITIQUE: Error parsing JSON: ${e instanceof Error ? e.message : 'Unknown error'}`
            }
        } else {
            // Internal critique - don't show to user, just use for next iteration
            lastCritique = reviewText
        }
    }

    // Final fallback
    try {
        const fallback = JSON.parse(lastAttemptedJson.replace(/```json/g, '').replace(/```/g, '').trim())
        onProgress?.({ content: 'Skills sorted!', done: true })
        return fallback as SkillsSortResult
    } catch (e) {
        throw new Error('Failed to generate a valid skill sorting result after multiple attempts.')
    }
}
