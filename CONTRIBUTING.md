# Contributing to Portfolio Template

Thank you for your interest in contributing! This document provides guidelines for contributing to this Next.js portfolio template.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or discriminatory comments
- Personal attacks or derogatory language
- Publishing others' private information
- Any conduct that could be considered inappropriate

---

## Getting Started

### Prerequisites

- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- **Git**: 2.x or higher
- **Code Editor**: VS Code recommended

### Fork and Clone

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/ismail-portfolio.git
   cd ismail-portfolio
   ```

3. **Add upstream** remote:
   ```bash
   git remote add upstream https://github.com/ismail-kattakath/ismail-portfolio.git
   ```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 to view your changes.

---

## Development Workflow

### Branch Naming Convention

Use descriptive branch names following this pattern:

- `feat/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/what-changed` - Documentation updates
- `refactor/what-changed` - Code refactoring
- `test/what-added` - Test additions/updates
- `chore/what-changed` - Build, CI, or tooling changes

**Examples:**
```bash
git checkout -b feat/add-projects-section
git checkout -b fix/password-protection-session
git checkout -b docs/update-setup-guide
```

### Keep Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream main into your local main
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

### Making Changes

1. **Create a branch** from `main`
2. **Make your changes**
3. **Test thoroughly** (see [Testing Guidelines](#testing-guidelines))
4. **Commit with clear messages** (see [Commit Messages](#commit-messages))
5. **Push to your fork**
6. **Open a Pull Request**

---

## Coding Standards

### TypeScript

- **Strict mode**: All code must pass TypeScript strict checks
- **Type everything**: No `any` types unless absolutely necessary
- **Use interfaces** for object shapes
- **Export types** from `src/types/` directory

**Good:**
```typescript
interface Props {
  data: ResumeData;
  onSave: (data: ResumeData) => void;
}

export default function MyComponent({ data, onSave }: Props) {
  // Implementation
}
```

**Bad:**
```typescript
export default function MyComponent({ data, onSave }: any) {
  // Missing types!
}
```

### React Components

- **Functional components** only (no class components)
- **Use hooks** for state management
- **Props destructuring** in function signature
- **Default exports** for components

**Component Structure:**
```typescript
// 1. Imports
import React, { useState } from 'react';
import type { ResumeData } from '@/types';

// 2. Type definitions
interface Props {
  data: ResumeData;
}

// 3. Component
export default function MyComponent({ data }: Props) {
  // 4. Hooks
  const [state, setState] = useState<string>('');

  // 5. Handlers
  const handleClick = () => {
    setState('clicked');
  };

  // 6. Render
  return (
    <div>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}
```

### File Naming

- **Components**: `PascalCase.tsx` (e.g., `PersonalInformation.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `resumeAdapter.ts`)
- **Types**: `kebab-case.ts` (e.g., `json-resume.ts`)
- **Tests**: Same as file with `.test.tsx` suffix

### CSS/Styling

- **Use Tailwind CSS** utility classes
- **Avoid custom CSS** unless necessary
- **Responsive design**: Mobile-first approach
- **Dark mode**: Consider dark backgrounds (project theme)

**Good:**
```tsx
<div className="flex flex-col md:flex-row gap-4 p-6 bg-white/10 rounded-lg">
  <h2 className="text-2xl font-bold text-white">Title</h2>
</div>
```

**Bad:**
```tsx
<div style={{ display: 'flex', padding: '24px' }}>
  <h2 className="my-custom-title">Title</h2>
</div>
```

### Data Management

**CRITICAL**: Understand the data flow architecture

```
src/data/resume.json (Single Source of Truth)
    ↓
src/lib/resumeAdapter.ts
    ↓
Internal ResumeData
    ↓
UI Components
```

**Rules:**
- ✅ **DO**: Update `resume.json` for content changes
- ✅ **DO**: Use adapter functions for transformations
- ❌ **DON'T**: Edit display components for content
- ❌ **DON'T**: Access `resume.json` directly in components

### Code Formatting

- **Prettier**: Auto-format on save (recommended VS Code extension)
- **ESLint**: Fix linting errors before committing
- **Line length**: Max 100 characters
- **Semicolons**: Always use
- **Quotes**: Single quotes for strings, double for JSX attributes

### Comments

- **Write self-documenting code** (clear names, simple logic)
- **Add comments** for complex algorithms or non-obvious behavior
- **JSDoc** for exported functions/types

**Good:**
```typescript
/**
 * Converts JSON Resume format to internal ResumeData format
 * @param jsonResume - Standard JSON Resume object
 * @returns Converted ResumeData for internal use
 */
export function convertFromJSONResume(jsonResume: JSONResume): ResumeData {
  // Implementation
}
```

---

## Testing Guidelines

### Test Requirements

- **All new features** must include tests
- **Bug fixes** should include regression tests
- **Tests must pass** before merging (enforced by CI)

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode (during development)
npm test:watch

# Run with coverage
npm test:coverage

# Run specific test file
npm test -- path/to/file.test.tsx
```

### Writing Tests

**Unit Test Example:**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent data={mockData} />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();

    render(<MyComponent data={mockData} onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      // Expected data
    }));
  });
});
```

**Test Location:**
- **Unit tests**: `src/components/**/__tests__/ComponentName.test.tsx`
- **Integration tests**: `src/app/*/__tests__/Feature.integration.test.tsx`
- **E2E tests**: `src/__tests__/feature-e2e.test.tsx`

### Test Coverage Goals

- **Minimum**: 80% coverage for new code
- **Critical paths**: 100% coverage (auth, data transformation)
- **Edge cases**: Test error handling, empty states, loading states

---

## Pull Request Process

### Before Submitting

**Checklist:**
- [ ] Code follows project conventions
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles (`npm run build`)
- [ ] ESLint has no errors (`npm run lint`)
- [ ] Documentation updated (if applicable)
- [ ] Changelog updated (for user-facing changes)
- [ ] Self-review completed

### PR Title Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation only
- style: Code style (formatting, no logic change)
- refactor: Code refactoring
- test: Adding/updating tests
- chore: Build, CI, or tooling changes
```

**Examples:**
```
feat(resume): add drag-and-drop for certifications
fix(auth): session expiry not clearing properly
docs(setup): clarify password generation steps
refactor(adapter): simplify JSON Resume conversion
test(cover-letter): add AI generation tests
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Changes Made
- List key changes
- One per line
- Be specific

## Testing
Describe how you tested these changes:
- Manual testing steps
- New/updated automated tests
- Edge cases covered

## Screenshots (if applicable)
Add screenshots to help reviewers understand UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No console errors/warnings
```

### Review Process

1. **Automated checks** run (tests, build, lint)
2. **Maintainer review** (usually within 2-3 days)
3. **Feedback addressed** (if any)
4. **Approval & merge**

### After Merge

- Delete your feature branch (local and remote)
- Update your fork's main branch
- Check the deployed site for your changes

---

## Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Build/CI

### Examples

**Good:**
```
feat(ai): add streaming support for cover letter generation

- Implement SSE (Server-Sent Events) streaming
- Add progress callback for real-time updates
- Update UI to show streaming responses
- Add error handling for stream interruptions

Closes #123
```

**Bad:**
```
update stuff
```

### Best Practices

- **First line**: 50 characters max, imperative mood ("add" not "added")
- **Body**: Wrap at 72 characters, explain *what* and *why* (not *how*)
- **Footer**: Reference issues/PRs

---

## Documentation

### When to Update Docs

- **New features**: Add to relevant documentation
- **API changes**: Update type documentation
- **Breaking changes**: Clearly document migration path
- **Bug fixes**: Update troubleshooting if applicable

### Documentation Files

| File | Purpose | Update When |
|------|---------|-------------|
| `README.md` | Project overview, quick start | Major features, setup changes |
| `ARCHITECTURE.md` | Technical deep-dive | Architecture changes |
| `QUICKSTART.md` | User setup guide | User-facing changes |
| `CLAUDE_CODE_GUIDE.md` | Development guide | Development workflows |
| `docs/*.md` | Feature-specific docs | Relevant feature changes |
| `CHANGELOG.md` | Version history | User-facing changes |

### Documentation Standards

- **Clear headings**: Use proper markdown hierarchy
- **Code examples**: Include working examples
- **Screenshots**: Add for UI changes
- **Links**: Link to related documentation
- **Keep updated**: Don't let docs drift from code

---

## Issue Reporting

### Before Creating an Issue

1. **Search existing issues** (open and closed)
2. **Check documentation** (especially troubleshooting sections)
3. **Try latest version** (`git pull`, `npm install`)
4. **Reproduce in clean environment** (fresh clone)

### Bug Report Template

```markdown
**Describe the bug**
Clear, concise description of the bug.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS 13.0, Windows 11]
- Browser: [e.g., Chrome 120, Safari 17]
- Node version: [e.g., 20.10.0]
- npm version: [e.g., 10.2.3]

**Additional context**
Any other relevant information.
```

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem.

**Describe the solution you'd like**
Clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Mockups, examples, or references.
```

---

## Project-Specific Guidelines

### Data Flow Rules

**Always follow the data flow:**

1. **Content changes** → Edit `src/data/resume.json`
2. **Type changes** → Update `src/types/`
3. **Transformation logic** → Update `src/lib/resumeAdapter.ts`
4. **UI changes** → Update components

**Never skip steps or modify data in components!**

### Password Protection

**If modifying auth:**
- Update tests in `src/components/auth/__tests__/`
- Update integration tests
- Update `docs/PASSWORD_PROTECTION_SETUP.md`
- Test both enabled and disabled states

### AI Features

**If modifying AI integration:**
- Test with multiple providers (OpenAI, local)
- Update `docs/AI_COVER_LETTER_GENERATOR.md`
- Consider streaming vs non-streaming modes
- Test error handling (network, API errors)

### Static Export

**Remember:**
- No server-side runtime
- All API calls happen at build time
- Images must be unoptimized
- Test with `npm run build` before PR

---

## Quick Reference

### Common Tasks

**Add new homepage section:**
1. Add data to `resume.json`
2. Create component in `src/components/sections/`
3. Import in `src/app/page.tsx`
4. Add tests
5. Update documentation

**Fix bug:**
1. Create issue (if not exists)
2. Write failing test
3. Fix the bug
4. Verify test passes
5. Submit PR

**Update dependencies:**
1. Check for breaking changes
2. Update `package.json`
3. Run `npm install`
4. Run full test suite
5. Test build

### Helpful Commands

```bash
# Development
npm run dev                    # Start dev server
npm test:watch                 # Run tests in watch mode

# Quality checks
npm run lint                   # Check linting
npm run build                  # Check build works
npm test                       # Run all tests
npx tsc --noEmit              # Check types

# Cleanup
rm -rf node_modules .next out  # Clean build artifacts
npm install                    # Reinstall dependencies
```

---

## Need Help?

- **Documentation**: Check [docs/](./docs/) folder
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Quick Start**: See [QUICKSTART.md](./QUICKSTART.md)
- **Development**: See [CLAUDE.md](./CLAUDE.md)
- **Issues**: https://github.com/ismail-kattakath/ismail-portfolio/issues
- **Discussions**: https://github.com/ismail-kattakath/ismail-portfolio/discussions

---

## Recognition

Contributors will be acknowledged in:
- GitHub contributors page
- CHANGELOG.md for significant contributions
- Special thanks in README.md for major features

Thank you for contributing! 🎉
