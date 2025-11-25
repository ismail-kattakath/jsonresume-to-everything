# ESLint Gradual Improvement Plan

## Current Status

**Last Updated:** 2025-01-25

### Violations Summary

| Rule                                       | Count | Status     | Priority |
| ------------------------------------------ | ----- | ---------- | -------- |
| `@typescript-eslint/no-explicit-any`       | 72    | ⚠️ Warning | High     |
| `@typescript-eslint/no-unused-vars`        | 32    | ⚠️ Warning | Medium   |
| `@typescript-eslint/no-unused-expressions` | 3     | ❌ Error   | Critical |
| `@typescript-eslint/no-require-imports`    | 0     | ✅ Fixed   | -        |
| `react/no-unescaped-entities`              | 0     | ✅ Fixed   | -        |

**Total Warnings:** 104
**Total Errors:** 3 (blocking commits)

---

## Completed Phases

### ✅ Phase 0: Critical Rules Enforcement (Completed)

**Commits:**

- `f1802b6` - Enforced `no-require-imports`
- `b1760b2` - Enforced `react/no-unescaped-entities`
- `e2e3c4e` - Enforced `no-unused-expressions`

**Results:**

- All `require()` calls converted to ES6 imports
- All unescaped JSX entities properly escaped
- Zero critical violations remaining

---

## Pending Phases

### Phase 1: Fix Unused Expressions (URGENT - Currently Blocking)

**Priority:** 🔴 Critical
**Estimated Effort:** 15 minutes
**Files Affected:** 3

**Violations:**

```
./src/app/resume/edit/__tests__/CompleteWorkflow.integration.test.tsx
  Line 17: Expected an assignment or function call and instead saw an expression

./src/app/resume/edit/__tests__/FormPreviewSync.integration.test.tsx
  Line 24: Expected an assignment or function call and instead saw an expression

./src/app/resume/edit/__tests__/JSONResumeImport.integration.test.tsx
  Line 17: Expected an assignment or function call and instead saw an expression
```

**Action Items:**

1. Review test files for unused expressions (likely debugging statements)
2. Remove or convert to proper assignments
3. Verify tests still pass
4. Commit: "fix: remove unused expressions in test files"

**Success Criteria:**

- Zero `no-unused-expressions` errors
- All tests passing

---

### Phase 2: Clean Up Unused Variables in Tests

**Priority:** 🟡 Medium
**Estimated Effort:** 2-3 hours
**Files Affected:** 12 test files

**Categories:**

1. **Unused Test Imports** (8 occurrences)
   - `within`, `axe`, `waitFor`, `render`
   - Action: Remove unused imports

2. **Unused Test Variables** (7 occurrences)
   - `container`, `container2`, `skillElements`
   - Action: Remove or use variables

3. **Unused Mock Data** (3 occurrences)
   - `sampleJSONResume`, `createMockResumeData`
   - Action: Remove if truly unused, or use in tests

**Breakdown by File:**

```
src/__tests__/password-protection-e2e.test.tsx          1 unused
src/app/resume/edit/__tests__/*.test.tsx                6 unused
src/components/auth/__tests__/*.test.tsx                2 unused
src/components/*/__tests__/*.test.tsx                   4 unused
```

**Action Plan:**

1. Start with test files (safest to modify)
2. Remove obvious unused imports first
3. Investigate and fix or remove unused variables
4. Run full test suite after each file
5. Commit after each file or logical group

**Success Criteria:**

- Zero `no-unused-vars` warnings in test files
- Test coverage maintained at 89%+

---

### Phase 3: Clean Up Unused Variables in Source Code

**Priority:** 🟡 Medium
**Estimated Effort:** 1-2 hours
**Files Affected:** 11 source files

**Categories:**

1. **Unused Component Props** (1 occurrence)
   - `src/components/document-builder/shared-forms/PersonalInformation.tsx` - `setResumeData`
   - Action: Remove if unused, or implement functionality

2. **Unused Imports** (2 occurrences)
   - `src/components/document-builder/shared-forms/SocialMedia.tsx` - `MdCancel`
   - Action: Remove or use in UI

3. **Unused Function Variables** (7 occurrences)
   - Form components: `removeEducation`, `removeSkill`, `removeSocialMedia`
   - Action: Remove if feature incomplete, or implement

4. **Unused Handler Variables** (3 occurrences)
   - `response`, `error`, `parseError` in async handlers
   - Action: Add error logging or remove

5. **Unused Data Variables** (1 occurrence)
   - `src/config/metadata.ts` - `skills`
   - Action: Remove if unused in metadata generation

**Breakdown by Category:**

```
Form Components (unused remove functions)               4 files
Error Handlers (unused error variables)                 3 files
Component Imports (unused icons)                        2 files
Utilities (unused data)                                 2 files
```

**Action Plan:**

1. Start with simple unused imports
2. Decide on incomplete features (remove or implement)
3. Add error logging where appropriate
4. Remove truly unused variables
5. Test affected components manually
6. Commit by category

**Success Criteria:**

- Zero `no-unused-vars` warnings in source files
- No functionality broken
- All tests passing

---

### Phase 4: Replace `any` Types in Test Files

**Priority:** 🟢 Low (Quality Improvement)
**Estimated Effort:** 4-6 hours
**Files Affected:** 8 test files

**Total Occurrences:** 44

**Breakdown:**

```
src/config/__tests__/password.test.ts                    36 any types
src/components/resume/preview/__tests__/Preview.test.tsx  6 any types
src/components/document-builder/shared-forms/__tests__/  2 any types
```

**Categories:**

1. **Global Type Casting** (36 in password.test.ts)
   - `(global as any).window`
   - Action: Create proper test types or use `unknown` with type guards

2. **Mock Data Types** (6 in Preview.test.tsx)
   - Partial mocks of `ResumeData`
   - Action: Use `Partial<ResumeData>` or create test fixtures

3. **Event Handlers** (2 occurrences)
   - Mock event handlers in component tests
   - Action: Type with proper `React.ChangeEvent<HTMLTextAreaElement>`

**Action Plan:**

1. Create test utility types (`src/lib/__tests__/test-types.ts`)
2. Replace `global as any` with `global as TestGlobal`
3. Replace mock data with `Partial<T>` or test fixtures
4. Type event handlers properly
5. Commit by test file after verification

**Success Criteria:**

- Zero `any` types in test files
- All tests passing
- Test code more maintainable

---

### Phase 5: Replace `any` Types in Source Code

**Priority:** 🟢 Low (Quality Improvement)
**Estimated Effort:** 6-8 hours
**Files Affected:** 7 source files

**Total Occurrences:** 28

**Breakdown by File:**

```
src/lib/jsonResume.ts                                    7 any types
src/app/resume/edit/page.tsx                             7 any types
src/app/cover-letter/edit/page.tsx                       4 any types
src/config/password.ts                                   2 any types
src/lib/jsonResumeSchema.ts                              1 any type
src/lib/resumeAdapter.ts                                 1 any type
src/components/sections/Skills.tsx                       1 any type
```

**Categories:**

1. **JSON Schema Validation** (8 occurrences in jsonResume.ts, jsonResumeSchema.ts)
   - AJV validation errors and schema definitions
   - Action: Import AJV types, use `ValidateFunction`, `ErrorObject`

2. **Editor Page Event Handlers** (11 occurrences in edit pages)
   - File upload, drag & drop, change handlers
   - Action: Type with proper `React.ChangeEvent`, `React.DragEvent`

3. **Type Adapters** (2 occurrences in adapters)
   - JSON parsing and transformation
   - Action: Use `unknown` with type guards or proper JSON types

4. **Config/Utility** (3 occurrences)
   - Window object, icon maps
   - Action: Create proper type definitions

**Action Plan:**

1. **Week 1: JSON Schema & Validation**
   - Install `@types/ajv` if needed
   - Type all schema-related code
   - Test validation still works

2. **Week 2: Editor Pages**
   - Type all event handlers in edit pages
   - Test file upload and drag & drop
   - Ensure functionality preserved

3. **Week 3: Adapters & Utilities**
   - Type remaining adapter code
   - Create proper type definitions for utilities
   - Full regression test

**Success Criteria:**

- Zero `any` types in source code
- All functionality preserved
- Type safety improved throughout codebase

---

### Phase 6: Final Cleanup & Rule Enforcement

**Priority:** 🟢 Low
**Estimated Effort:** 1 hour
**Prerequisites:** Phases 1-5 complete

**Action Items:**

1. Run full lint check: `npm run lint`
2. Verify zero warnings and zero errors
3. Update ESLint config to enforce all rules as errors:
   ```js
   {
     rules: {
       '@typescript-eslint/no-explicit-any': 'error',
       '@typescript-eslint/no-unused-vars': 'error',
       '@typescript-eslint/no-require-imports': 'error',
       '@typescript-eslint/no-unused-expressions': 'error',
       'react/no-unescaped-entities': 'error',
     },
   }
   ```
4. Run tests: `npm test`
5. Build project: `npm run build`
6. Commit: "chore: enforce all ESLint rules as errors"
7. Update this document status to "✅ Complete"

**Success Criteria:**

- Zero ESLint violations
- All tests passing (500+ tests, 100% pass rate)
- Build succeeds
- Git hooks enforce all rules strictly

---

## Timeline

### Immediate (This Week)

- [ ] **Phase 1:** Fix unused expressions (URGENT - blocks commits)

### Short Term (Next 2 Weeks)

- [ ] **Phase 2:** Clean up unused variables in tests
- [ ] **Phase 3:** Clean up unused variables in source

### Medium Term (Next 4-6 Weeks)

- [ ] **Phase 4:** Replace `any` in test files
- [ ] **Phase 5:** Replace `any` in source files (in stages)

### Long Term (6+ Weeks)

- [ ] **Phase 6:** Final cleanup and strict enforcement

---

## Development Guidelines During Improvement

### DO's ✅

- Fix violations as you touch files (opportunistic cleanup)
- Add proper types to new code immediately
- Run `npm run lint` before committing
- Write tests for any behavior changes
- Commit small, atomic changes
- Update this document as phases complete

### DON'Ts ❌

- Don't introduce new `any` types
- Don't introduce new unused variables
- Don't skip tests when fixing violations
- Don't make large refactors without planning
- Don't bypass git hooks
- Don't commit with warnings (aim for zero)

---

## Tracking Progress

Update this section after each phase:

```markdown
## Progress Log

### 2025-01-25

- ✅ Phase 0 Complete: Critical rules enforced
- 📊 Baseline established: 72 `any` types, 32 unused vars, 3 unused expressions
- 📝 Created improvement plan document
```

---

## Resources

### Useful Commands

```bash
# Check violations by type
npm run lint 2>&1 | grep "no-explicit-any" | wc -l
npm run lint 2>&1 | grep "no-unused-vars" | wc -l

# Fix auto-fixable issues
npx eslint --fix src/**/*.{ts,tsx}

# Test specific file
npm test -- src/path/to/file.test.tsx

# Build and verify
npm run build && npm test
```

### TypeScript Resources

- [TypeScript Handbook - Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [AJV TypeScript Usage](https://ajv.js.org/guide/typescript.html)

---

## Questions & Decisions

### Why keep `any` as warning initially?

- 72 occurrences is too many to fix in one go
- Risk of breaking functionality with hasty type fixes
- Gradual approach allows testing at each step

### Why prioritize test files?

- Safer to modify (won't affect production)
- Good practice for typing patterns
- Builds confidence before touching source

### When to enforce as errors?

- Only after ALL violations are fixed
- After full test suite passes
- After production build succeeds
- When team is confident in changes

---

**Last Updated:** 2025-01-25
**Next Review:** After Phase 1 completion
