# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

### Single Source of Truth Pattern

The entire portfolio is driven by **DefaultResumeData** (`src/components/resume-builder/utility/DefaultResumeData.jsx`), which serves as the canonical data source for:

- Personal information (name, email, phone, location)
- Work experience with achievements
- Skills organized by category
- Education and certifications
- Social media links (GitHub, LinkedIn, Website)
- Professional summary

All other data files and metadata generation derive from this single source, ensuring consistency across:
- Main portfolio homepage (`src/app/page.tsx`)
- Resume editor/preview (`src/app/resume/edit/page.tsx`)
- SEO metadata (`src/config/metadata.ts`)
- OG image generation (`src/app/opengraph-image.tsx`)
- Portfolio data mappings (`src/lib/data/portfolio.ts`)

**Important**: When updating personal information, skills, or experience, modify `DefaultResumeData.jsx` only. Changes automatically propagate throughout the site.

### Next.js App Router Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── page.tsx           # Homepage (main portfolio)
│   ├── layout.tsx         # Root layout with fonts & metadata
│   ├── opengraph-image.tsx # Dynamic OG image generation
│   ├── resume/            # Resume builder feature
│   │   ├── page.tsx       # View-only resume
│   │   ├── edit/          # Interactive resume editor
│   │   └── layout.tsx     # Resume-specific layout
│   ├── cover-letter/      # Cover letter builder
│   │   └── edit/
│   ├── book/              # Additional page
│   └── resume.json/       # JSON API endpoint for resume data
├── components/
│   ├── sections/          # Homepage sections (Hero, About, Skills, etc.)
│   ├── layout/            # Header, Footer, BackgroundImage
│   ├── ui/                # Reusable UI components
│   └── resume-builder/    # Resume editor components
│       ├── form/          # Form inputs for each resume section
│       ├── preview/       # Live preview components
│       ├── utility/       # DefaultResumeData.jsx (CRITICAL FILE)
│       ├── hero/          # Hero section for resume
│       └── meta/          # Metadata components
├── types/                 # TypeScript interfaces
│   └── portfolio.ts       # Core types (Experience, Skill, Project, etc.)
├── lib/
│   ├── data/              # Data transformation layer
│   │   └── portfolio.ts   # Maps DefaultResumeData to portfolio types
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
├── config/
│   └── metadata.ts        # SEO & metadata generation
└── utils/
    └── generateOgImage.tsx # OG image utilities
```

### Data Flow

1. **DefaultResumeData.jsx** → Source of truth for all personal/professional data
2. **portfolio.ts** → Transforms DefaultResumeData into typed interfaces
3. **metadata.ts** → Generates SEO metadata from DefaultResumeData
4. **Page components** → Consume transformed data for rendering

### Static Generation & GitHub Pages

- Configured for static export (`output: 'export'` in `next.config.ts`)
- Images are unoptimized for GitHub Pages compatibility
- Build output goes to `./out` directory
- `.nojekyll` file prevents Jekyll processing
- GitHub Actions workflow handles automated deployment

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
- `/resume/edit/` and `/cover-letter/edit/` (admin interfaces)
- `/resume.json/` (API endpoint)

**Important**: Don't create manual `src/app/sitemap.ts` or `src/app/robots.ts` files - next-sitemap handles everything automatically.

### TypeScript Configuration

- Path alias: `@/*` maps to `./src/*`
- Strict mode enabled
- Build errors ignored in production (`ignoreBuildErrors: true`)
- ESLint errors ignored during builds (`ignoreDuringBuilds: true`)

## Key Features

- **Resume Builder**: Interactive drag-and-drop editor at `/resume/edit`
- **Static Export**: GitHub Pages compatible static site generation
- **OG Image Generation**: Dynamic OpenGraph images using `@vercel/og`
- **Responsive Design**: Mobile-first with Tailwind CSS v4
- **Smooth Animations**: Framer Motion powered transitions
- **SEO Optimized**: Comprehensive metadata generation

## GitHub Pages Deployment

Deployment is handled by GitHub Actions (`.github/workflows/deploy.yml`):

1. Triggers on push to `main` branch
2. Installs dependencies
3. Builds static site with `npm run build` (includes automatic sitemap generation)
4. Uploads `./out` directory as Pages artifact
5. Deploys to GitHub Pages environment

Manual deployment: `npm run deploy` (uses `gh-pages` package)

## Tech Stack

- **Framework**: Next.js 15.5.2 (App Router, static export)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 with PostCSS
- **Animations**: Framer Motion 12.23.12
- **Icons**: Lucide React 0.542.0
- **Drag & Drop**: @hello-pangea/dnd 18.0.1
- **Image Processing**: Sharp 0.34.3
- **SEO**: next-sitemap (automatic sitemap/robots.txt generation)

## Important Notes

- **No src/pages directory**: This project uses Next.js 15 App Router exclusively
- **DefaultResumeData is JSX**: Despite being in `src/components/resume-builder/utility/`, it's a `.jsx` file, not `.ts`
- **Static site limitations**: No API routes in production (only at build time)
- **Deployment target**: Custom domain via CNAME (ismail.kattakath.com)
- **Resume printing**: Users can print the resume from `/resume` page using browser's print dialogue (Ctrl/Cmd+P)
