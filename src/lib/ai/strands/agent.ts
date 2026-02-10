/**
 * Strands Agent implementation for in-browser use.
 *
 * This module provides functions to run Strands agents directly in the browser
 * using OpenAI-compatible endpoints configured by the user.
 */

import { Agent } from '@strands-agents/sdk'
import { OpenAIModel } from '@strands-agents/sdk/openai'
import { StreamCallback } from '@/types/openai'

/**
 * Interface for agent configuration pulled from AISettings
 */
interface AgentConfig {
  apiUrl: string
  apiKey: string
  model: string
}

/**
 * Analyzes and improves a job description using a Strands agent.
 *
 * @param jobDescription - The raw job description text
 * @param config - Provider configuration from AISettings
 * @param onProgress - Optional callback for streaming updates
 * @returns The improved job description text
 */
export async function analyzeJobDescription(
  jobDescription: string,
  config: AgentConfig,
  onProgress?: StreamCallback
): Promise<string> {
  // 1. Initialize the OpenAI-compatible model
  const model = new OpenAIModel({
    modelId: config.model,
    // The Strands/OpenAI SDK requires a non-empty API key even for local endpoints.
    // If it's empty, we provide a placeholder.
    apiKey: config.apiKey || 'not-needed',
    clientConfig: {
      baseURL: config.apiUrl,
      dangerouslyAllowBrowser: true, // Required for in-browser SDK usage
    },
  })

  // 2. Create the agent with a specific persona for JD analysis
  const agent = new Agent({
    model,
    systemPrompt:
      'You are a professional recruiting assistant and expert resume tailor. ' +
      'Your task is to analyze the provided job description and improve its clarity, ' +
      'structure, and keywords without losing its original meaning. ' +
      'Format it cleanly with clear sections for Responsibilities, Requirements, and Skills. ' +
      'Only return the improved job description text, no preamble or explanation.',
    printer: false, // We handle output manually via stream/invoke
  })

  if (onProgress) {
    let fullResponse = ''
    // 3. Stream the response for immediate feedback
    for await (const event of agent.stream(jobDescription)) {
      if (
        event.type === 'modelContentBlockDeltaEvent' &&
        'text' in event.delta &&
        typeof event.delta.text === 'string'
      ) {
        fullResponse += event.delta.text
        onProgress({ content: event.delta.text, done: false })
      }
    }
    onProgress({ content: '', done: true })
    return fullResponse
  } else {
    // 4. Simple invocation for non-streaming use cases
    const result = await agent.invoke(jobDescription)

    // Extracts and concatenates all text content from the last message
    return result.toString()
  }
}

/**
 * A multi-agent graph flow that refines a job description through iterative feedback.
 * Uses a Refiner agent and a Reviewer agent.
 *
 * @param jobDescription - The raw job description text
 * @param config - Provider configuration from AISettings
 * @param onProgress - Optional callback for streaming updates and status messages
 * @returns The finalized, refined job description text
 */
export async function analyzeJobDescriptionGraph(
  jobDescription: string,
  config: AgentConfig,
  onProgress?: StreamCallback
): Promise<string> {
  const model = new OpenAIModel({
    modelId: config.model,
    apiKey: config.apiKey || 'not-needed',
    clientConfig: {
      baseURL: config.apiUrl,
      dangerouslyAllowBrowser: true,
    },
  })

  const refiner = new Agent({
    model,
    systemPrompt:
      'You are a Professional JD Refiner. ' +
      'Your goal is to extract and reformat a raw job description into a strict, clean format. ' +
      'RULES:\n' +
      '- NO complex markdown (NO bold, NO italics, NO sub-headers). Use ONLY `#` for titles and `-` for unordered lists.\n' +
      '- Extract or determine the following sections exactly:\n' +
      '  # position-title\n' +
      '  (The job title)\n\n' +
      '  # core-responsibilities\n' +
      '  (Short and crisp list, MAXIMUM 5 items, no repetition)\n\n' +
      '  # desired-qualifications\n' +
      '  (Short and crisp list, MAXIMUM 5 items, no repetition)\n\n' +
      '  # required-skills\n' +
      '  (Technology/tool name list ONLY, e.g., Next.js, Linux, GCP, CI/CD. No full sentences, no extra words. NO maximum limit).\n' +
      'Return ONLY the improved job description text following this structure.',
    printer: false,
  })

  const reviewer = new Agent({
    model,
    systemPrompt:
      'You are a JD Quality Critic. ' +
      'Your task is to strictly review a job description against these criteria:\n' +
      '1. Only `#` and `-` markdown used? (Reject bold/italics).\n' +
      '2. Exactly 4 sections: position-title, core-responsibilities, desired-qualifications, required-skills?\n' +
      '3. Core-responsibilities and Desired-qualifications have <= 5 items?\n' +
      '4. Required-skills is a list of tech names only?\n' +
      'If perfect, start with "APPROVED". Otherwise, list critiques starting with "CRITIQUE:".',
    printer: false,
  })

  let currentJD = jobDescription
  let iteration = 0
  const maxIterations = 2 // 1 initial refine + up to 2 review/refine loops

  if (onProgress)
    onProgress({
      content: '🚀 Starting Multi-Agent Refinement...\n',
      done: false,
    })

  while (iteration <= maxIterations) {
    iteration++

    // Node: Refine
    if (onProgress)
      onProgress({
        content: `\n[Agent: Refiner] (Iteration ${iteration}) Improving JD...\n`,
        done: false,
      })

    const refinePrompt =
      iteration === 1
        ? `Original Job Description:\n\n${currentJD}`
        : `Please refine the JD again based on these critiques:\n\n${currentJD}`

    const refineResult = await refiner.invoke(refinePrompt)
    currentJD = refineResult.toString().trim()

    if (onProgress) {
      // Stream the current version so user sees progress
      onProgress({
        content: `\n--- Refined Version ---\n${currentJD}\n-----------------------\n`,
        done: false,
      })
    }

    // Node: Review
    if (onProgress)
      onProgress({
        content: `\n[Agent: Reviewer] Analyzing quality...\n`,
        done: false,
      })

    const reviewResult = await reviewer.invoke(
      `Review this Job Description:\n\n${currentJD}`
    )
    const reviewText = reviewResult.toString().trim()

    if (reviewText.startsWith('APPROVED')) {
      if (onProgress)
        onProgress({
          content: `\n✅ Approved by Reviewer after ${iteration} iteration(s).\n`,
          done: false,
        })
      break
    } else {
      if (onProgress)
        onProgress({ content: `\n❌ Feedback: ${reviewText}\n`, done: false })
      // Append critiques to guide the next refinement
      currentJD = `Refined JD:\n${currentJD}\n\nCritiques from Reviewer:\n${reviewText}`
    }

    if (iteration > maxIterations) {
      if (onProgress)
        onProgress({
          content: `\n⚠️ Reached max iterations (${maxIterations}). Finalizing.\n`,
          done: false,
        })
    }
  }

  // Strip the internal wrapping if any
  const finalJD = (
    currentJD
      .replace('Refined JD:\n', '')
      .split('\n\nCritiques from Reviewer:')[0] || ''
  ).trim()

  if (onProgress) onProgress({ content: '', done: true })
  return finalJD
}
