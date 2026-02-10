import { Agent } from '@strands-agents/sdk'
import { StreamCallback } from '@/types/openai'
import { AgentConfig } from './types'
import { createModel } from './factory'

/**
 * A multi-agent graph flow that sorts a tech stack based on JD relevance.
 * 
 * @param technologies - The list of technologies to sort
 * @param jobDescription - The target job description
 * @param config - Provider configuration
 * @param onProgress - Optional callback for streaming updates
 * @returns Sorted list of technologies
 */
export async function sortTechStackGraph(
    technologies: string[],
    jobDescription: string,
    config: AgentConfig,
    onProgress?: StreamCallback
): Promise<string[]> {
    const model = createModel(config)

    // Agent 1: The optimizer (Brain)
    const optimizer = new Agent({
        model,
        systemPrompt:
            'You are a Tech Stack Optimization Expert (The Brain). ' +
            'Your task is to analyze a job description and determine the most relevant order for a list of technologies. ' +
            'RULES:\n' +
            '1. Prioritize technologies explicitly mentioned in the JD.\n' +
            '2. Secondary priority to technologies strongly related to the JD requirements.\n' +
            '3. PRESERVE ALL: Never suggest removing any provided technology.\n' +
            'OUTPUT: A clean markdown report with the optimized order. list the technologies one by one with a brief reason.',
        printer: false,
    })

    // Agent 2: The Scribe (Formatter)
    const scribe = new Agent({
        model,
        systemPrompt:
            'You are a Data Architect (The Scribe). ' +
            'Your ONLY task is to convert a tech stack analysis report into a STRICT JSON array of strings. ' +
            'RULES:\n' +
            '1. Use EXACTLY the technologies provided in the analysis.\n' +
            '2. Output EXCLUSIVELY valid JSON array of strings. No preamble, no markdown code blocks.\n' +
            'TARGET FORMAT:\n' +
            '["tech1", "tech2", "tech3", ...]',
        printer: false,
    })

    // Agent 3: The Editor (Validator)
    const editor = new Agent({
        model,
        systemPrompt:
            'You are a Data Validator (The Editor). ' +
            'Verify the generated tech stack JSON against the original data.\n' +
            'CRITERIA:\n' +
            '1. Valid JSON array of strings?\n' +
            '2. ALL original technologies present? (No loss of data).\n' +
            '3. No extra items added that weren\'t in the original list?\n' +
            'If perfect, respond "APPROVED". Otherwise, respond "CRITIQUE: <reasons>".',
        printer: false,
    })

    if (onProgress) onProgress({ content: '🧠 Analyzing tech stack relevance to JD...\n', done: false })

    // 1. ANALYZE
    const analysis = await optimizer.invoke(
        `JOB DESCRIPTION:\n${jobDescription}\n\nCURRENT TECH STACK:\n${technologies.join(', ')}`
    )
    const analysisText = analysis.toString().trim()

    if (onProgress) onProgress({ content: '📝 Formatting result as data...\n', done: false })

    let lastAttemptedJson = ''
    let lastCritique = ''

    // 2 & 3: ITERATIVE FORMATTING & VALIDATION (Max 3 attempts)
    for (let attempt = 1; attempt <= 3; attempt++) {
        const formattingPrompt = lastCritique
            ? `Original Tech Stack: ${technologies.join(', ')}\nAnalysis:\n${analysisText}\n\nPREVIOUS ERROR: ${lastCritique}\n\nFix the JSON format and ensure ALL original technologies are included:`
            : `Original Tech Stack: ${technologies.join(', ')}\nAnalysis:\n${analysisText}\n\nConvert this to a JSON array of strings:`

        const rawJson = await scribe.invoke(formattingPrompt)
        lastAttemptedJson = rawJson.toString().trim()

        // Clean markdown code blocks if present
        const cleanJson = lastAttemptedJson.replace(/```json/g, '').replace(/```/g, '').trim()

        if (onProgress) onProgress({ content: `🔍 Validating data integrity (Attempt ${attempt}/3)...\n`, done: false })

        const validation = await editor.invoke(
            `ORIGINAL DATA: ${JSON.stringify(technologies)}\nGENERATED JSON: ${cleanJson}`
        )
        const validationText = validation.toString().trim()

        if (validationText.startsWith('APPROVED')) {
            if (onProgress) onProgress({ content: '✨ Tech stack sorted successfully.\n', done: true })
            return JSON.parse(cleanJson)
        }

        lastCritique = validationText
        if (onProgress) onProgress({ content: `🛠️ ${validationText}\n`, done: false })
    }

    // Final fallback: try to parse whatever we have, or return original
    try {
        const cleanJson = lastAttemptedJson.replace(/```json/g, '').replace(/```/g, '').trim()
        const result = JSON.parse(cleanJson)
        if (onProgress) onProgress({ content: '⚠️ Used fallback version (validation partially failed).\n', done: true })
        return Array.isArray(result) ? result : technologies
    } catch (e) {
        if (onProgress) onProgress({ content: '❌ Failed to generate valid sort order. Keeping original.\n', done: true })
        return technologies
    }
}
