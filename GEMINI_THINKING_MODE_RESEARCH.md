# Gemini 2.5 Thinking Mode Research

## Summary

Gemini 2.5 models (Flash and Pro) **always use thinking mode** internally. This consumes a significant portion of the `maxOutputTokens` budget before generating actual content.

## Key Findings

### Token Consumption Pattern

| maxOutputTokens | Thoughts Tokens | Candidate Tokens | Result            |
| --------------- | --------------- | ---------------- | ----------------- |
| 100             | 99              | 0                | ❌ Empty response |
| 500             | 499             | 0                | ❌ Empty response |
| 1500            | ~900-1400       | ~50-200          | ✅ Valid content  |
| 2000            | ~900-1400       | ~130-200         | ✅ Good content   |
| 8192            | ~1200-1500      | ~180-250         | ✅ Best content   |

### Critical Insights

1. **Thinking is Always Active**: Even without explicitly enabling `includeThoughts`, Gemini 2.5 models use thinking mode internally
2. **Token Budget Split**: The `maxOutputTokens` budget is shared between:
   - `thoughtsTokenCount`: Internal reasoning (not visible to user by default)
   - `candidatesTokenCount`: Actual response content (what users see)
3. **Minimum Viable Tokens**: Need at least 1500-2000 `maxOutputTokens` to get meaningful content
4. **Empty Response Issue**: Low token limits (≤500) result in all tokens being consumed by thinking, leaving nothing for actual output

## Test Evidence

### Test 1: Short Prompt (Gemini 2.5 Flash, maxOutputTokens=2000)

**Input**: "Write a 2-sentence professional summary for a software engineer"

**Response**:

```
thoughtsTokenCount: 906
candidatesTokenCount: 138
totalTokenCount: 1065
Content: 770 characters ✅
```

### Test 2: Same Prompt (maxOutputTokens=500)

**Response**:

```
thoughtsTokenCount: 499
candidatesTokenCount: undefined
totalTokenCount: 520
Content: 0 characters ❌
finishReason: MAX_TOKENS
```

### Test 3: Summary Generation (UI Scenario, maxOutputTokens=1500)

**Input**: Full resume data + job description

**Flash Response**:

```
thoughtsTokenCount: 978
candidatesTokenCount: 56
totalTokenCount: 1191
Content: 323 characters ✅
```

**Pro Response**:

```
thoughtsTokenCount: 1415
candidatesTokenCount: 58
totalTokenCount: 1630
Content: 319 characters ✅
```

## Recommendations

### Current Implementation (✅ Already Applied)

- **Cover Letters**: `maxTokens: 2000` (was 800)
  - Allows ~1200 tokens for thinking
  - Leaves ~800 tokens for actual cover letter content

- **Summaries**: `maxTokens: 1500` (was 300)
  - Allows ~900-1000 tokens for thinking
  - Leaves ~500 tokens for summary content

### Error Handling

Already implemented in `gemini-client.ts`:

```typescript
if (!content) {
  const finishReason = data.candidates[0]?.finishReason
  if (finishReason === 'MAX_TOKENS') {
    throw new GeminiAPIError(
      'Response exceeded max tokens (likely due to thinking mode). Try increasing maxTokens or using a simpler prompt.',
      'max_tokens_exceeded'
    )
  }
}
```

## What NOT to Do

❌ **Don't explicitly enable `includeThoughts: true`** unless you want to show thinking summaries to users

- Thinking happens anyway, this just makes it visible
- Doesn't help with empty response issue
- Adds complexity without benefit

❌ **Don't use token limits < 1500** for Gemini 2.5

- Will likely result in empty responses
- Thinking mode will consume all available tokens

## What to Tell Users

When users encounter empty responses with Gemini 2.5:

1. **Root Cause**: "Gemini 2.5 uses internal reasoning that consumes tokens before generating visible output"
2. **Solution**: "The token limit has been increased to 1500-2000 to accommodate this"
3. **If Still Failing**: "Try simplifying your prompt or using a more specific job description"

## Future Considerations

### Potential Enhancements

1. **Expose Thinking (Optional)**:
   - Add UI toggle to show/hide thinking summaries
   - Use `includeThoughts: true` when enabled
   - Display thoughts in a collapsible section or modal

2. **Dynamic Token Adjustment**:
   - Start with lower token limit
   - If MAX_TOKENS with empty content, automatically retry with higher limit
   - Cap at reasonable maximum (e.g., 8192)

3. **Model-Specific Defaults**:
   - Gemini 2.5: 2000 tokens (thinking mode)
   - Gemini 1.5: 1000 tokens (no thinking mode)
   - OpenAI: 800 tokens (no thinking mode)

## References

- Test scripts: `test-max-output-tokens.mjs`, `test-ui-scenario.mjs`
- Implementation: `src/lib/ai/gemini-client.ts`
- Document generation: `src/lib/ai/gemini-documents.ts`

---

**Date**: 2025-11-28
**Researched by**: Claude Code
**Issue**: #41 - Native Gemini Support
