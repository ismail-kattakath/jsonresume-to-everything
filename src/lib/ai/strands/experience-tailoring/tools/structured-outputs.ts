import { tool } from '@strands-agents/sdk'
import { z } from 'zod'

/**
 * Force the Keyword Extractor to output structured json.
 */
export const finalizeKeywordExtractionTool = tool({
  name: 'finalize_keyword_extraction',
  description: 'Call this tool to finalize your keyword extraction analysis.',
  inputSchema: z.object({
    missingKeywords: z.array(z.string()).describe('Keywords in JD but missing from achievements'),
    criticalKeywords: z.array(z.string()).describe('Must-have keywords mapped from JD'),
    niceToHaveKeywords: z.array(z.string()).describe('Optional keywords mapped from JD'),
  }),
  callback: (input) => JSON.stringify(input),
})

/**
 * Force the Enrichment Classifier to output structured json.
 */
export const finalizeEnrichmentClassificationTool = tool({
  name: 'finalize_enrichment_classification',
  description: 'Call this tool to output the enrichment map classification.',
  inputSchema: z.object({
    enrichmentMap: z
      .record(z.string(), z.array(z.string()))
      .describe('Map of achievement index string to array of approved keywords'),
    rationale: z.string().describe('Brief justification for these decisions'),
  }),
  callback: (input) => JSON.stringify(input),
})

/**
 * Force the Tech Stack Aligner to output structured json.
 */
export const finalizeTechStackAlignmentTool = tool({
  name: 'finalize_tech_stack_alignment',
  description: 'Call this tool to output the aligned tech stack.',
  inputSchema: z.object({
    techStack: z.array(z.string()).describe('The fully aligned tech stack'),
    rationale: z.string().describe('Brief explanation of changes'),
  }),
  callback: (input) => JSON.stringify(input),
})
