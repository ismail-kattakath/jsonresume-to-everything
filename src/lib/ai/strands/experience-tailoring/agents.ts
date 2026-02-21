import { Agent } from '@strands-agents/sdk'
import { AgentConfig } from '@/lib/ai/strands/types'
import { createModel } from '@/lib/ai/strands/factory'
import { SYSTEM_PROMPTS } from '@/lib/ai/strands/experience-tailoring/prompts'
import {
    validateAchievementsTool,
    validateTechStackTool,
    validateDescriptionTool,
} from './tools'

export function createTailoringAgents(config: AgentConfig) {
    const model = createModel(config)

    return {
        analyzer: new Agent({
            model,
            systemPrompt: SYSTEM_PROMPTS.ANALYZER,
            printer: false,
        }),
        descriptionWriter: new Agent({
            model,
            systemPrompt: SYSTEM_PROMPTS.DESCRIPTION_WRITER,
            printer: false,
        }),
        keywordExtractor: new Agent({
            model,
            systemPrompt: SYSTEM_PROMPTS.KEYWORD_EXTRACTOR,
            printer: false,
        }),
        keywordEnrichmentClassifier: new Agent({
            model,
            systemPrompt: SYSTEM_PROMPTS.ENRICHMENT_CLASSIFIER,
            printer: false,
        }),
        achievementsOptimizer: new Agent({
            model,
            systemPrompt: SYSTEM_PROMPTS.ACHIEVEMENTS_OPTIMIZER,
            printer: false,
        }),
        // Supplied with validateAchievementsTool so it can deterministically check
        // count/length structural issues in addition to LLM semantic judgment.
        achievementIntegrityAuditor: new Agent({
            model,
            tools: [validateAchievementsTool],
            systemPrompt: SYSTEM_PROMPTS.INTEGRITY_AUDITOR,
            printer: false,
        }),
        techStackAligner: new Agent({
            model,
            systemPrompt: SYSTEM_PROMPTS.TECH_STACK_ALIGNER,
            printer: false,
        }),
        // Supplied with validateTechStackTool to deterministically guard against hallucinated additions.
        techStackValidator: new Agent({
            model,
            tools: [validateTechStackTool],
            systemPrompt: SYSTEM_PROMPTS.TECH_STACK_VALIDATOR,
            printer: false,
        }),
        // Supplied with validateDescriptionTool to anchor structural description quality checks.
        factChecker: new Agent({
            model,
            tools: [validateDescriptionTool],
            systemPrompt: SYSTEM_PROMPTS.FACT_CHECKER,
            printer: false,
        }),
        relevanceEvaluator: new Agent({
            model,
            systemPrompt: SYSTEM_PROMPTS.RELEVANCE_EVALUATOR,
            printer: false,
        }),
    }
}

export type TailoringAgents = ReturnType<typeof createTailoringAgents>
