import { Agent, SlidingWindowConversationManager } from '@strands-agents/sdk'
import { AgentConfig } from '@/lib/ai/strands/types'
import { createModel } from '@/lib/ai/strands/factory'
import { SYSTEM_PROMPTS } from '@/lib/ai/strands/experience-tailoring/prompts'
import { TelemetryHookProvider } from '@/lib/ai/strands/hooks/telemetry'
import {
  validateAchievementsTool,
  validateTechStackTool,
  validateDescriptionTool,
  finalizeKeywordExtractionTool,
  finalizeEnrichmentClassificationTool,
  finalizeTechStackAlignmentTool,
} from './tools'

/**
 * Creates a suite of agents for tailoring work experience to a job description
 */
export function createTailoringAgents(config: AgentConfig) {
  const model = createModel(config)
  const hooks = [new TelemetryHookProvider()]

  // We want to avoid overflowing context for multi-iteration processes like fact checking
  const getManager = () => new SlidingWindowConversationManager({ windowSize: 20 })

  return {
    analyzer: new Agent({
      model,
      systemPrompt: SYSTEM_PROMPTS.ANALYZER,
      printer: false,
      hooks,
      conversationManager: getManager(),
    }),
    descriptionWriter: new Agent({
      model,
      systemPrompt: SYSTEM_PROMPTS.DESCRIPTION_WRITER,
      printer: false,
      hooks,
      conversationManager: getManager(),
    }),
    keywordExtractor: new Agent({
      model,
      tools: [finalizeKeywordExtractionTool],
      systemPrompt: SYSTEM_PROMPTS.KEYWORD_EXTRACTOR,
      printer: false,
      hooks,
      conversationManager: getManager(),
    }),
    keywordEnrichmentClassifier: new Agent({
      model,
      tools: [finalizeEnrichmentClassificationTool],
      systemPrompt: SYSTEM_PROMPTS.ENRICHMENT_CLASSIFIER,
      printer: false,
      hooks,
      conversationManager: getManager(),
    }),
    achievementsOptimizer: new Agent({
      model,
      systemPrompt: SYSTEM_PROMPTS.ACHIEVEMENTS_OPTIMIZER,
      printer: false,
      hooks,
      conversationManager: getManager(),
    }),
    // Supplied with validateAchievementsTool so it can deterministically check
    // count/length structural issues in addition to LLM semantic judgment.
    achievementIntegrityAuditor: new Agent({
      model,
      tools: [validateAchievementsTool],
      systemPrompt: SYSTEM_PROMPTS.INTEGRITY_AUDITOR,
      printer: false,
      hooks,
      conversationManager: getManager(),
    }),
    techStackAligner: new Agent({
      model,
      tools: [finalizeTechStackAlignmentTool],
      systemPrompt: SYSTEM_PROMPTS.TECH_STACK_ALIGNER,
      printer: false,
      hooks,
      conversationManager: getManager(),
    }),
    // Supplied with validateTechStackTool to deterministically guard against hallucinated additions.
    techStackValidator: new Agent({
      model,
      tools: [validateTechStackTool],
      systemPrompt: SYSTEM_PROMPTS.TECH_STACK_VALIDATOR,
      printer: false,
      hooks,
      conversationManager: getManager(),
    }),
    // Supplied with validateDescriptionTool to anchor structural description quality checks.
    factChecker: new Agent({
      model,
      tools: [validateDescriptionTool],
      systemPrompt: SYSTEM_PROMPTS.FACT_CHECKER,
      printer: false,
      hooks,
      conversationManager: getManager(),
    }),
    relevanceEvaluator: new Agent({
      model,
      systemPrompt: SYSTEM_PROMPTS.RELEVANCE_EVALUATOR,
      printer: false,
      hooks,
      conversationManager: getManager(),
    }),
  }
}

/**
 * Type definition for work experience tailoring agents
 */
export type TailoringAgents = ReturnType<typeof createTailoringAgents>
