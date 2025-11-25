# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📖 Documentation Quick Links

**For fast project onboarding, see these comprehensive guides:**

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete technical architecture, data flow, component hierarchy, testing, deployment
- **[CLAUDE_CODE_GUIDE.md](./CLAUDE_CODE_GUIDE.md)** - Development guide specifically for Claude Code sessions with code examples and patterns
- **[QUICKSTART.md](./QUICKSTART.md)** - User setup guide for deploying and customizing the portfolio
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guidelines for contributing code, tests, and documentation
- **[docs/](./docs/)** - Feature-specific guides (password protection, AI generator, data setup)

**💡 Tip:** Before deep-diving into this file, check CLAUDE_CODE_GUIDE.md for quick development reference and common tasks.

---

## Project Overview

A modern, responsive portfolio website showcasing 15+ years of software engineering and AI/ML expertise. Built with Next.js 15.5.2, TypeScript, and Tailwind CSS, optimized for static generation and GitHub Pages deployment.

**Live Site**: https://ismail.kattakath.com

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production (static export to ./out)
npm run build

# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Start production server
npm start

# Run linter
npm run lint

# Deploy to GitHub Pages
npm run deploy

# Auto-deploy in background
npm run deploy-auto
```

## Architecture

### Single Source of Truth: JSON Resume Standard

The entire portfolio is driven by **`src/data/resume.json`**, which follows the [JSON Resume](https://jsonresume.org) v1.0.0 standard format. This serves as the canonical data source for:

- Personal information (name, email, phone, location)
- Work experience with achievements and technologies
- Skills organized by category
- Education and certifications
- Social media profiles (GitHub, LinkedIn, Website)
- Professional summary
- Calendar booking link

All other data files and metadata generation derive from this single source through a **data adapter pattern**, ensuring consistency across:
- Main portfolio homepage (`src/app/page.tsx`)
- Resume editor/preview (`src/app/resume/edit/page.tsx`)
- Cover letter editor (`src/app/cover-letter/edit/page.tsx`)
- SEO metadata (`src/config/metadata.ts`)
- OG image generation (`src/app/opengraph-image.tsx`)
- Portfolio data mappings (`src/lib/data/portfolio.ts`)
- JSON API endpoint (`src/app/resume.json/route.ts`)

**Important**: When updating personal information, skills, or experience, modify `src/data/resume.json` only. Changes automatically propagate throughout the site.

### Data Flow Architecture

```
src/data/resume.json (JSON Resume v1.0.0 Standard)
    ↓
src/lib/resumeAdapter.ts → convertFromJSONResume()
    ↓
Internal ResumeData format (TypeScript interfaces)
    ↓
    ├── src/lib/data/portfolio.ts → Transform to Portfolio types
    │   ↓
    │   └── Homepage sections (Hero, About, Skills, Experience, Contact, Projects)
    │
    ├── src/config/metadata.ts → Generate SEO metadata
    │
    ├── src/app/opengraph-image.tsx → Generate OpenGraph images
    │
    ├── src/app/resume/edit/page.tsx → Resume editor with live preview
    │
    ├── src/app/cover-letter/edit/page.tsx → Cover letter editor
    │
    ├── src/app/resume/page.tsx → Print-optimized resume view
    │
    └── src/app/resume.json/route.ts → JSON API endpoint
```

### Data Adapter Pattern

The project uses a sophisticated adapter pattern to bridge JSON Resume standard with internal types:

1. **`resume.json`** - External standard format (jsonresume.org)
2. **`resumeAdapter.ts`** - Converts JSON Resume → Internal ResumeData format
3. **`jsonResume.ts`** - Converts Internal format → JSON Resume (for export)
4. **`jsonResumeSchema.ts`** - Validates JSON Resume format using AJV
5. **`portfolio.ts`** - Transforms Internal format → Portfolio display types

This pattern allows:
- Standard JSON Resume format for portability
- Internal type safety with TypeScript
- Bidirectional conversion (import/export)
- Schema validation
- Easy data migration

### Next.js App Router Structure

```
src/
├── app/                              # Next.js 15 App Router
│   ├── page.tsx                      # Homepage (Hero, About, Skills, Experience, Contact)
│   ├── layout.tsx                    # Root layout with fonts & metadata
│   ├── globals.css                   # Global styles
│   ├── opengraph-image.tsx          # Dynamic OG image generation
│   ├── twitter-image.tsx            # Twitter card image
│   ├── resume/
│   │   ├── page.tsx                 # Print-optimized resume (auto-triggers print)
│   │   ├── layout.tsx               # Resume-specific layout
│   │   └── edit/
│   │       ├── page.tsx             # Password-protected resume editor
│   │       └── __tests__/           # Integration tests (3 files)
│   ├── cover-letter/
│   │   └── edit/
│   │       ├── page.tsx             # Password-protected cover letter editor
│   │       └── __tests__/           # Integration tests (2 files)
│   ├── book/
│   │   ├── page.tsx                 # Calendar redirect (Google Calendar)
│   │   └── layout.tsx
│   ├── resume.json/
│   │   └── route.ts                 # JSON Resume API endpoint
│   └── test-env/                    # Test environment page
│
├── components/
│   ├── sections/                     # Homepage sections
│   │   ├── Hero.tsx                 # Main hero with contact info
│   │   ├── About.tsx                # Professional summary
│   │   ├── Skills.tsx               # Technical skills display
│   │   ├── Experience.tsx           # Work experience timeline
│   │   ├── Contact.tsx              # Contact section
│   │   └── Projects.tsx             # Featured projects
│   ├── layout/
│   │   ├── Header.tsx               # Site header/navigation
│   │   └── Footer.tsx               # Site footer
│   ├── auth/
│   │   ├── PasswordProtection.tsx   # Password protection wrapper
│   │   └── __tests__/               # Unit tests (62 tests)
│   ├── document-builder/            # Shared document builder components
│   │   ├── layout/                  # Layout components
│   │   ├── shared-forms/            # Reusable form components
│   │   │   ├── PersonalInformation.tsx
│   │   │   ├── SocialMedia.tsx
│   │   │   ├── LoadUnload.tsx       # Import/Export functionality
│   │   │   └── __tests__/           # Tests (2 files)
│   │   ├── shared-preview/          # Shared preview components
│   │   │   ├── ContactInfo.tsx
│   │   │   └── ProfileHeader.tsx
│   │   └── ui/
│   │       ├── PrintButton.tsx      # Print functionality
│   │       └── __tests__/           # Tests
│   ├── resume/
│   │   ├── forms/                   # Resume-specific forms
│   │   │   ├── WorkExperience.tsx
│   │   │   ├── Education.tsx
│   │   │   ├── Skill.tsx
│   │   │   ├── Language.tsx
│   │   │   ├── certification.tsx
│   │   │   ├── Summary.tsx
│   │   │   ├── Projects.tsx
│   │   │   └── __tests__/           # Tests (5 files)
│   │   └── preview/
│   │       ├── Preview.tsx          # Resume preview component
│   │       ├── Skills.tsx
│   │       └── __tests__/           # Tests
│   ├── cover-letter/
│   │   ├── forms/
│   │   │   ├── CoverLetterContent.tsx
│   │   │   └── __tests__/           # Tests
│   │   └── preview/
│   │       └── CoverLetterPreview.tsx
│   ├── ui/                          # Generic UI components
│   ├── BackgroundImage.tsx
│   └── Logo.tsx
│
├── data/
│   └── resume.json                  # SINGLE SOURCE OF TRUTH (JSON Resume v1.0.0)
│
├── types/                           # TypeScript type definitions
│   ├── json-resume.ts               # JSON Resume standard types
│   ├── resume.ts                    # Internal ResumeData types
│   ├── portfolio.ts                 # Portfolio display types
│   ├── cover-letter.ts              # Cover letter types
│   └── index.ts                     # Central export point
│
├── lib/
│   ├── resumeAdapter.ts             # JSON Resume → Internal format converter
│   ├── jsonResume.ts                # Internal → JSON Resume converter
│   ├── jsonResumeSchema.ts          # JSON Resume validator (AJV)
│   ├── data/
│   │   └── portfolio.ts             # Internal → Portfolio types transformer
│   ├── hooks/                       # Custom React hooks
│   ├── utils/                       # Utility functions
│   └── __tests__/                   # Library tests (test-utils.tsx)
│
├── config/
│   ├── metadata.ts                  # SEO & metadata generation
│   ├── site.ts                      # Site configuration
│   ├── navigation.ts                # Navigation config
│   ├── background.ts                # Background image config
│   ├── password.ts                  # Password hash config (optional, generated)
│   └── __tests__/                   # Config tests
│
└── utils/
    └── generateOgImage.tsx          # OG image utilities
```

### Type System

The project uses a robust TypeScript type system with clear separation:

```typescript
// External standard (jsonresume.org)
types/json-resume.ts
  - JSONResume, JSONResumeBasics, JSONResumeWork, etc.

// Internal application types
types/resume.ts
  - ResumeData, WorkExperience, Education, SkillGroup, etc.

// Display/UI types
types/portfolio.ts
  - Experience, Skill, Project, ContactInfo

// Feature-specific types
types/cover-letter.ts
  - CoverLetterData
```

### Static Generation & GitHub Pages

- Configured for static export (`output: 'export'` in `next.config.ts`)
- Images are unoptimized for GitHub Pages compatibility
- Build output goes to `./out` directory
- `.nojekyll` file prevents Jekyll processing
- GitHub Actions workflow handles automated deployment
- Custom domain: `ismail.kattakath.com` (via CNAME)

### SEO & Sitemap Generation

SEO files are **automatically generated** using the `next-sitemap` package:

- **next-sitemap.config.js** → Configuration for sitemap and robots.txt generation
- Runs automatically via `postbuild` script after every build
- Auto-discovers all routes - **zero manual maintenance**
- Outputs to `out/` directory for static export
- Automatically excludes edit pages, API endpoints, and image routes

**Sitemap includes:**
- Homepage (priority: 1.0, monthly updates)
- Resume page (priority: 0.8, monthly updates)
- Book page (priority: 0.5, yearly updates)

**Robots.txt blocks:**
- `/resume/edit/` and `/cover-letter/edit/` (password-protected admin interfaces)
- `/cover-letter/edit/` (password-protected admin interface)
- `/resume.json/` (API endpoint)

**Important**: Don't create manual `src/app/sitemap.ts` or `src/app/robots.ts` files - next-sitemap handles everything automatically.

### TypeScript Configuration

- Path alias: `@/*` maps to `./src/*`
- Strict mode enabled
- Build errors ignored in production (`ignoreBuildErrors: true`)
- ESLint errors ignored during builds (`ignoreDuringBuilds: true`)

## Key Features

### Password Protection System

**Fully implemented** password protection for edit pages using bcrypt hashing:

- **Location**: `/resume/edit` and `/cover-letter/edit`
- **Component**: `src/components/auth/PasswordProtection.tsx`
- **Configuration**: `src/config/password.ts` + `.env.local`
- **Security Features**:
  - bcrypt password hashing (cost factor: 10)
  - 24-hour session duration in sessionStorage
  - Show/hide password toggle
  - Error handling for authentication failures
  - Environment variable support for production
  - Shared session across protected pages
  - Automatic session cleanup on logout
- **Test Coverage**: 503 comprehensive tests (100% pass rate)
  - 21 unit tests for password config (3 skipped - browser environment edge cases)
  - 62 unit tests for PasswordProtection component (1 skipped - impossible scenario)
  - 24 integration tests for resume edit page
  - 21 integration tests for cover letter edit page
  - 17 end-to-end workflow tests
  - Plus extensive tests for forms, UI components, and data adapters
  - 4 tests skipped by design (browser-specific edge cases + impossible state)

See `docs/PASSWORD_PROTECTION_SETUP.md` for complete setup instructions.

### Resume Builder

Interactive resume editor with live preview:

- **Location**: `/resume/edit` (password-protected)
- **Features**:
  - Live preview panel
  - Drag-and-drop support (@hello-pangea/dnd)
  - Form sections: Personal Info, Work Experience, Education, Skills, Languages, Certifications, Summary
  - Save/Load functionality (localStorage)
  - JSON Resume import/export
  - Print functionality
- **Data Format**: JSON Resume v1.0.0 standard
- **Preview**: `/resume` (auto-triggers browser print dialog)

### Cover Letter Generator

Interactive cover letter editor with AI generation:

- **Location**: `/cover-letter/edit` (password-protected)
- **Features**:
  - **AI-Powered Generation**: "Generate with AI" button creates tailored cover letters using OpenAI-compatible APIs
  - Reuses personal information from resume.json
  - Custom content editor
  - Live preview panel
  - Save/Load functionality (localStorage)
  - Print functionality
- **AI Integration**: Client-side AI generation using OpenAI API or compatible servers (requires API key, see `docs/AI_COVER_LETTER_GENERATOR.md`)

### Calendar Booking Integration

- **Location**: `/book` page
- **Functionality**: Redirects to Google Calendar booking link
- **Data Source**: `resume.json` → `basics.calendar` field
- **Current Link**: https://calendar.app.google/djSRHAdTuSEanoea7

### Static Export & OG Image Generation

- Dynamic OpenGraph images using `@vercel/og`
- Twitter card images
- Responsive images for social media sharing
- Generated from resume.json data

### Print Functionality

- `/resume` page **automatically triggers** browser print dialog on load
- PrintButton component for manual printing from edit pages
- Print-optimized CSS for clean output
- Supports Ctrl/Cmd+P for manual printing

## Testing

### Test Organization

The project has comprehensive test coverage across three layers:

**Unit Tests** (Component/Function level):
- `src/config/__tests__/` - Password configuration tests (21 tests)
- `src/components/auth/__tests__/` - PasswordProtection component (62 tests)
- `src/components/document-builder/` - Form and UI components (3 test files)
- `src/components/resume/` - Resume forms and preview (6 test files)
- `src/components/cover-letter/` - Cover letter components (1 test file)
- `src/lib/__tests__/` - Data adapters and utilities

**Integration Tests** (Page level):
- `src/app/resume/edit/__tests__/` - Resume editor workflows (4 test files)
- `src/app/cover-letter/edit/__tests__/` - Cover letter workflows (1 test file)

**End-to-End Tests** (User journeys):
- `src/__tests__/password-protection-e2e.test.tsx` - Complete auth workflows (17 tests)

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage report
npm test:coverage

# Run specific test suites
npm test -- --testPathPatterns="password"
npm test -- --testPathPatterns="resume"
npm test -- --testPathPatterns="cover-letter"
```

### Test Framework

- **Framework**: Jest 30.2.0
- **React Testing**: @testing-library/react 16.3.0
- **Accessibility Testing**: jest-axe 10.0.0
- **Mocking**: jest-mock for bcrypt, sessionStorage, etc.

See `docs/PASSWORD_PROTECTION_TESTS.md` for detailed test documentation.

## GitHub Pages Deployment

Deployment is handled by GitHub Actions (`.github/workflows/deploy.yml`):

1. **Triggers**: Push to `main` branch or pull request
2. **Test Step**: Runs full test suite (**deployment fails if ANY tests fail** - strict enforcement)
3. **Build Step**: `npm run build` (includes automatic sitemap generation via postbuild)
4. **Upload**: `./out` directory as Pages artifact
5. **Deploy**: Deploys to GitHub Pages environment (main branch only)

**Important**: The workflow has `continue-on-error: false` for the test step, ensuring no deployments occur with failing tests. All 499 actionable tests must pass (4 tests are intentionally skipped for browser-specific edge cases).

**Manual deployment**:
```bash
npm run deploy          # Build and deploy using gh-pages
npm run deploy-auto     # Background deployment with logging
```

## Data Management

### How to Update Portfolio Data

**Primary Method**: Edit `src/data/resume.json` following JSON Resume v1.0.0 standard.

**Structure**:
```json
{
  "$schema": "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
  "basics": {
    "name": "Your Name",
    "label": "Your Title",
    "email": "email@example.com",
    "phone": "+1 (123) 456-7890",
    "url": "https://yourwebsite.com",
    "calendar": "https://calendar.app.google/...",
    "summary": "Your professional summary...",
    "location": { "city": "City", "region": "State", ... },
    "profiles": [
      { "network": "LinkedIn", "url": "https://linkedin.com/in/..." },
      { "network": "Github", "url": "https://github.com/..." }
    ]
  },
  "work": [...],
  "education": [...],
  "skills": [...],
  "languages": [...],
  "certificates": [...]
}
```

**Data Propagation**:
Changes to `resume.json` automatically update:
- Homepage sections (all content)
- Resume editor (all forms)
- Cover letter editor (personal info)
- SEO metadata (title, description)
- OpenGraph images
- JSON API endpoint

**Validation**: The project includes JSON Resume schema validation using AJV. Invalid data will cause build errors.

See `docs/DEFAULT_DATA_SETUP.md` for comprehensive customization guide.

## Configuration Files

### Root Level

- **package.json** - Dependencies & npm scripts
- **next.config.ts** - Next.js configuration (static export)
- **tsconfig.json** - TypeScript configuration (strict mode, path aliases)
- **jest.config.js** - Test framework configuration
- **jest.setup.js** - Test environment setup
- **eslint.config.mjs** - ESLint rules
- **postcss.config.mjs** - PostCSS/Tailwind CSS
- **next-sitemap.config.js** - SEO sitemap generation
- **.env.example** - Environment variable template
- **.env.local** - Local environment variables (not committed)
- **CNAME** - Custom domain configuration
- **.nojekyll** - Disable GitHub Pages Jekyll processing

### Environment Variables

Create `.env.local` in project root:

```bash
# Password Protection (bcrypt hash)
NEXT_PUBLIC_PASSWORD_HASH="$2b$10$..." # Generate using scripts/generate-password-hash.js

# Add to GitHub Secrets for production:
# Settings → Secrets → Actions → New repository secret
# Name: NEXT_PUBLIC_PASSWORD_HASH
# Value: your bcrypt hash
```

Generate password hash:
```bash
node scripts/generate-password-hash.js
```

## Tech Stack

### Core

- **Framework**: Next.js 15.5.2 (App Router, static export)
- **React**: 19.1.0
- **TypeScript**: 5
- **Styling**: Tailwind CSS v4 with PostCSS

### Libraries

- **Animations**: framer-motion 12.23.12
- **Icons**: lucide-react 0.542.0, react-icons 5.2.1
- **Drag & Drop**: @hello-pangea/dnd 18.0.1
- **Validation**: ajv 8.17.1, ajv-formats 3.0.1 (JSON Resume schema)
- **Authentication**: bcryptjs 3.0.3
- **Notifications**: sonner 2.0.7 (toast notifications)
- **Image Processing**: sharp 0.34.3
- **Utilities**: clsx 2.1.1, tailwind-merge 3.3.1

### Dev Dependencies

- **Testing**: jest 30.2.0, @testing-library/react 16.3.0, jest-axe 10.0.0
- **SEO**: next-sitemap 4.2.3
- **Deployment**: gh-pages 6.3.0
- **OG Images**: @vercel/og 0.8.1

## Important Notes

- **No src/pages directory**: This project uses Next.js 15 App Router exclusively
- **JSON Resume Standard**: Data follows jsonresume.org v1.0.0 specification
- **Adapter Pattern**: Bidirectional conversion between JSON Resume and internal types
- **Static site limitations**: API routes only work at build time (not runtime)
- **Resume auto-print**: `/resume` page automatically triggers print dialog on load
- **Password protection**: Edit pages require authentication via bcrypt-hashed passwords
- **Test-driven deployment**: GitHub Actions runs tests before deployment

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[docs/README.md](./docs/README.md)** - Documentation index and quick links
- **[docs/DEFAULT_DATA_SETUP.md](./docs/DEFAULT_DATA_SETUP.md)** - How to customize resume.json data
- **[docs/PASSWORD_PROTECTION_SETUP.md](./docs/PASSWORD_PROTECTION_SETUP.md)** - Password setup guide
- **[docs/PASSWORD_PROTECTION_TESTS.md](./docs/PASSWORD_PROTECTION_TESTS.md)** - Test documentation (125 tests)

## Development Workflow

1. **Update data**: Edit `src/data/resume.json`
2. **Test locally**: `npm run dev` → http://localhost:3000
3. **Run tests**: `npm test`
4. **Build**: `npm run build` (generates static site + sitemap)
5. **Deploy**: Push to main branch (GitHub Actions handles deployment)

## Tool Usage & Intelligence Maximization

### Core Tools - Use These Extensively

Claude Code has access to powerful tools that should be leveraged for maximum efficiency and intelligence:

#### **File Operations**
- **Read**: Use for reading ANY file. Can handle images (PNG, JPG), PDFs, Jupyter notebooks (.ipynb), and all text files
- **Write**: Create new files (prefer Edit for existing files)
- **Edit**: Make precise changes to existing files using exact string replacement
- **Glob**: Find files by pattern (e.g., `**/*.test.tsx`, `src/components/**/*.ts`)
- **Grep**: Search file contents with regex support. Use for finding code patterns, TODOs, function definitions
  - Supports context lines (-A, -B, -C), case insensitive (-i), line numbers (-n)
  - Use `output_mode: "content"` to see matching lines
  - Use `output_mode: "files_with_matches"` to just get file paths

#### **Code Search & Exploration**
- **Task tool with Explore agent**: Use for exploring codebases, finding patterns, answering "how does X work?" questions
  - Specify thoroughness: "quick", "medium", or "very thorough"
  - Example: "Find all API endpoints" or "How does authentication work?"
- **Grep + Glob combination**: Use both in parallel for comprehensive searches
  - Glob to find candidate files
  - Grep to search within those files

#### **Testing & Background Processes**
- **Bash**: Run terminal commands (git, npm, docker, etc.)
  - Use `run_in_background: true` for long-running processes
  - Chain commands with `&&` for sequential operations
  - Run independent commands in parallel with multiple Bash calls in one message
- **BashOutput**: Monitor output from background processes
- **KillShell**: Terminate background processes when done

#### **Task Planning & Tracking**
- **TodoWrite**: ALWAYS use for multi-step tasks (3+ steps) or non-trivial work
  - Track progress, demonstrate thoroughness
  - Mark todos as in_progress BEFORE starting work
  - Mark completed IMMEDIATELY after finishing (don't batch)
  - Only ONE task should be in_progress at a time
  - Provide both "content" (imperative) and "activeForm" (present continuous) for each task

#### **User Interaction**
- **AskUserQuestion**: Ask questions during execution for clarification, preferences, implementation choices
  - Support single or multiple selection
  - Use when requirements are ambiguous or multiple approaches are valid

#### **Web Access** (Use When Available)
- **WebFetch**: Fetch and analyze web content (converted HTML to markdown)
- **WebSearch**: Search the web for current information beyond knowledge cutoff
  - Use for latest documentation, recent changes, current events
  - Support domain filtering (allowed_domains, blocked_domains)

#### **MCP Resources** (If Configured)
- **ListMcpResourcesTool**: List resources from configured MCP servers
- **ReadMcpResourceTool**: Read specific resources from MCP servers
- **Note**: MCP tools start with `mcp__` prefix when available

### Best Practices for Tool Usage

1. **Parallel Operations**: Call multiple independent tools in a single message
   ```
   Example: Read 3 different files in parallel, not sequentially
   Example: Run git status, git diff, and git log simultaneously
   ```

2. **Avoid Redundant Commands**:
   - DON'T use bash for: find (use Glob), grep (use Grep), cat (use Read), echo for communication
   - DO use specialized tools: they're faster, more reliable, and better integrated

3. **Plan Before Execute**:
   - For complex tasks, use Task tool with Plan agent first
   - Create TodoWrite list to track multi-step operations
   - Ask questions early (AskUserQuestion) rather than making assumptions

4. **Background Processes**:
   - Use `run_in_background: true` for dev servers, long builds, watching processes
   - Monitor with BashOutput periodically
   - Clean up with KillShell when done

5. **Search Strategy**:
   - Start with Glob for file patterns
   - Use Grep for content search
   - Use Task/Explore agent for open-ended exploration
   - Run searches in parallel when possible

6. **Git Operations**:
   - Run multiple git commands in parallel: `git status`, `git diff`, `git log`
   - Use single bash command with `&&` for dependent operations: `git add . && git commit -m "..." && git push`
   - NEVER skip hooks (--no-verify) unless explicitly requested
   - NEVER force push to main/master without explicit user request

7. **Testing Workflow**:
   - Run tests in parallel with code exploration
   - Use background mode for watch mode: `npm test:watch`
   - Check BashOutput periodically for test results

### Tool Selection Decision Tree

```
Question: "What files contain X?"
→ Use Grep with output_mode: "files_with_matches"

Question: "Show me the implementation of X"
→ Use Grep with output_mode: "content" OR Read if you know the file

Question: "How does feature X work?"
→ Use Task tool with Explore agent (medium thoroughness)

Task: "Add feature X"
→ Use TodoWrite to plan, then execute with Read/Edit/Write

Task: "Run tests and fix failures"
→ Use Bash to run tests, TodoWrite to track fixes, Read/Edit to fix code

Task: "Search web for latest docs"
→ Use WebSearch (if available) or WebFetch

Need clarification?
→ Use AskUserQuestion before proceeding
```

### Memory & Context Management

- **File Reading**: Always Read files before editing to understand context
- **Comprehensive Search**: Use parallel Grep/Glob to gather complete information
- **Task Tracking**: TodoWrite provides persistent memory across conversation
- **Background Monitoring**: BashOutput gives awareness of long-running processes
- **Web Access**: WebSearch/WebFetch extends knowledge beyond training data

### When to Use Task Tool (Specialized Agents)

- **Explore agent**: "Find all error handlers", "How is authentication implemented?"
- **Plan agent**: Complex feature planning before implementation
- **General-purpose agent**: Multi-step autonomous tasks requiring multiple tool calls
- **claude-code-guide agent**: Questions about Claude Code features, SDK, or usage

**Remember**: Using the right tool for the job makes Claude Code more intelligent, efficient, and aware!

## Security

- Password hashing using bcrypt (cost factor: 10)
- Session management via sessionStorage (24-hour expiry)
- Protected edit pages (/resume/edit, /cover-letter/edit)
- Environment variables for sensitive configuration
- No plain-text passwords stored anywhere
- Robots.txt blocks admin interfaces from search engines
