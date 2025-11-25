# Quick Start Guide

> **For:** End users who want to use this portfolio template
> **Time:** 10-15 minutes to fully customize
> **Skill Level:** Basic (can edit JSON files)

## What You Get

✅ Professional portfolio website with 5 sections (Hero, About, Skills, Experience, Contact)
✅ Interactive resume builder with drag-and-drop
✅ AI-powered cover letter generator
✅ Automatic deployment to GitHub Pages
✅ SEO-optimized with auto-generated sitemap
✅ Mobile-responsive design
✅ Optional password protection for edit pages

**Live Demo:** https://ismail.kattakath.com

---

## 3-Step Setup

### Step 1: Fork & Deploy (2 minutes)

1. **Fork this repository** on GitHub
2. **Go to Settings → Pages**
3. **Source:** Select "GitHub Actions"
4. **Done!** Your site will be live at:
   ```
   https://YOUR-USERNAME.github.io/ismail-portfolio/
   ```

**Note:** First deployment takes 3-5 minutes

---

### Step 2: Customize Your Data (10 minutes)

**Edit ONE file:** `src/data/resume.json`

This file follows the [JSON Resume](https://jsonresume.org) standard and controls your ENTIRE portfolio.

#### A. Personal Information

```json
{
  "basics": {
    "name": "Your Name",
    "label": "Your Professional Title",
    "email": "your.email@example.com",
    "phone": "+1 (123) 456-7890",
    "url": "https://yourwebsite.com",
    "summary": "Your professional summary (2-3 sentences)",
    "location": {
      "city": "Your City",
      "region": "State/Province",
      "countryCode": "US"
    },
    "profiles": [
      {
        "network": "LinkedIn",
        "url": "https://linkedin.com/in/yourusername"
      },
      {
        "network": "Github",
        "url": "https://github.com/yourusername"
      }
    ]
  }
}
```

#### B. Work Experience

```json
{
  "work": [
    {
      "name": "Company Name",
      "position": "Your Job Title",
      "url": "https://company.com",
      "startDate": "2020-01-15",
      "endDate": "",  // Empty string = Present
      "summary": "Brief description of the company/role",
      "highlights": [
        "Achievement 1 with metrics (e.g., reduced costs by 25%)",
        "Achievement 2 with impact",
        "Achievement 3 with results"
      ],
      "keywords": [
        "Technology 1",
        "Technology 2",
        "Technology 3"
      ]
    }
  ]
}
```

**Date Format:** `YYYY-MM-DD` (e.g., `"2020-01-15"`)
**Current Job:** Use empty string for `endDate`

#### C. Skills

```json
{
  "skills": [
    {
      "name": "Category Name",
      "keywords": [
        "Skill 1",
        "Skill 2",
        "Skill 3"
      ]
    },
    {
      "name": "Another Category",
      "keywords": ["Skill A", "Skill B"]
    }
  ]
}
```

**Examples:**
- "Frontend Development" → ["React", "Next.js", "TypeScript"]
- "Cloud Services" → ["AWS", "Google Cloud", "Azure"]

#### D. Education

```json
{
  "education": [
    {
      "institution": "University Name",
      "url": "https://university.edu",
      "area": "Your Major",
      "studyType": "Bachelor's Degree",
      "startDate": "2015-09-01",
      "endDate": "2019-05-01"
    }
  ]
}
```

#### E. Optional Fields

```json
{
  "certificates": [
    {
      "name": "Certification Name",
      "date": "2023-06-15",
      "issuer": "Issuing Organization",
      "url": "https://credential-url.com"
    }
  ],
  "languages": [
    {
      "language": "English",
      "fluency": "Native speaker"
    }
  ]
}
```

**Complete Example:** See `src/data/resume.json` for full structure

---

### Step 3: Push Changes (1 minute)

```bash
git add src/data/resume.json
git commit -m "Customize portfolio data"
git push origin main
```

**Result:** GitHub Actions automatically:
1. Runs tests
2. Builds your site
3. Deploys to GitHub Pages
4. Generates sitemap

**View Progress:** Go to "Actions" tab on GitHub

---

## Advanced Features

### Password Protection (Optional)

**By default:** Edit pages (`/resume/edit`, `/cover-letter/edit`) are **publicly accessible**

**To enable password protection:**

1. **Generate password hash:**
   ```bash
   node scripts/generate-password-hash.js "your-password"
   ```

2. **Add to GitHub Secrets:**
   - Go to **Settings → Secrets → Actions**
   - Click **New repository secret**
   - Name: `NEXT_PUBLIC_EDIT_PASSWORD_HASH`
   - Value: `$2b$10$...` (the hash from step 1)

3. **Redeploy:** Push any change or manually trigger workflow

**Security Note:** Client-side protection, suitable for personal portfolios

---

### Custom Domain

**Want** `portfolio.yourdomain.com` **instead of** `username.github.io/repo`?

1. **Add CNAME file to project root:**
   ```bash
   echo "portfolio.yourdomain.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

2. **Configure DNS** (with your domain provider):
   ```
   Type: CNAME
   Host: portfolio (or @)
   Value: YOUR-USERNAME.github.io
   TTL: 3600
   ```

3. **Update GitHub Settings:**
   - Settings → Pages → Custom domain
   - Enter: `portfolio.yourdomain.com`
   - Check "Enforce HTTPS"

**Propagation time:** 5-30 minutes

---

### AI Cover Letter Generator

**Feature:** Generate tailored cover letters using AI (OpenAI, Claude, local models)

**Setup:**

1. **Get API Key:**
   - OpenAI: https://platform.openai.com/api-keys
   - OpenRouter: https://openrouter.ai (supports Claude, Gemini, etc.)
   - Local: Run Ollama/vLLM locally

2. **Access Cover Letter Editor:**
   ```
   https://YOUR-SITE.com/cover-letter/edit
   ```

3. **Click "Generate with AI"**
   - Enter API URL (e.g., `https://api.openai.com`)
   - Enter API Key
   - Enter Model Name (e.g., `gpt-4o-mini`)
   - Paste Job Description
   - Click Generate

**Privacy:** API credentials stored locally (browser only, never on server)

**Compatible APIs:**
- OpenAI (`https://api.openai.com`)
- OpenRouter (`https://openrouter.ai/api`)
- Ollama (`http://localhost:11434`)
- vLLM (`http://localhost:8000`)
- Any OpenAI-compatible server

---

## Local Development

**Want to test changes locally before deploying?**

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/ismail-portfolio.git
cd ismail-portfolio

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Open:** http://localhost:3000

**Hot reload:** Changes to `src/data/resume.json` update automatically

---

## Common Customizations

### Change Colors

**File:** `src/app/globals.css`

```css
@theme {
  --color-primary: #your-color;
  --color-secondary: #your-color;
  --color-accent: #your-color;
}
```

### Add Calendar Booking Link

**File:** `src/data/resume.json`

```json
{
  "basics": {
    "calendar": "https://calendar.app.google/your-link"
  }
}
```

**Result:** "Book a Call" button on homepage

### Modify Homepage Sections

**Files:**
- `src/components/sections/Hero.tsx` - Hero section
- `src/components/sections/About.tsx` - About section
- `src/components/sections/Skills.tsx` - Skills display
- `src/components/sections/Experience.tsx` - Work timeline
- `src/components/sections/Contact.tsx` - Contact form

**Note:** Editing React components requires development knowledge

---

## Troubleshooting

### 1. Site Not Loading

**Check:**
- GitHub Pages enabled? (Settings → Pages → Source: GitHub Actions)
- Deployment successful? (Actions tab → latest workflow should be ✅)
- DNS propagated? (if using custom domain, wait 30 minutes)

**Fix:**
```bash
# Trigger manual deployment
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

### 2. Changes Not Showing

**Cause:** Browser cache

**Fix:**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache
- Wait 2-3 minutes for deployment

### 3. Invalid JSON Error

**Symptom:** Build fails with JSON parse error

**Cause:** Syntax error in `resume.json`

**Fix:**
```bash
# Validate JSON locally
cat src/data/resume.json | python -m json.tool

# Or online: https://jsonlint.com
```

**Common mistakes:**
- Missing comma between fields
- Trailing comma before closing `}`
- Unescaped quotes in strings (use `\"`)

### 4. Resume Editor Not Loading

**Cause:** JavaScript disabled or ad blocker

**Fix:**
- Enable JavaScript in browser
- Disable ad blocker for your site
- Try different browser (Chrome, Firefox, Safari)

### 5. Password Protection Not Working

**Check:**
- `NEXT_PUBLIC_EDIT_PASSWORD_HASH` set in GitHub Secrets?
- Redeploy after adding secret
- Clear browser cache

**Generate new hash:**
```bash
node scripts/generate-password-hash.js "new-password"
```

---

## Getting Help

### Documentation

- **Full Guide:** `docs/DEFAULT_DATA_SETUP.md` (detailed customization)
- **Architecture:** `ARCHITECTURE.md` (technical reference)
- **Password Setup:** `docs/PASSWORD_PROTECTION_SETUP.md`
- **AI Features:** `docs/AI_CONTENT_GENERATOR.md`
- **Tests:** Run `npm test` to see current test results

### Support Channels

- **GitHub Issues:** Report bugs or request features
- **GitHub Discussions:** Ask questions, share ideas
- **Email:** (if repository owner provides contact)

### Example Sites

- **Original:** https://ismail.kattakath.com
- *Add yours by submitting a PR!*

---

## Next Steps

After basic setup:

- [ ] Customize `resume.json` with your information
- [ ] Test locally with `npm run dev`
- [ ] Push changes and verify deployment
- [ ] (Optional) Set up password protection
- [ ] (Optional) Configure custom domain
- [ ] (Optional) Customize colors/styling
- [ ] (Optional) Enable AI cover letter generator

---

## Feature Overview

### What Works Out of the Box

✅ **Homepage**
- Hero section with name, title, contact buttons
- Professional summary
- Skills organized by category
- Work experience timeline
- Contact information

✅ **Resume Builder** (`/resume/edit`)
- Interactive form with live preview
- Drag-and-drop section reordering
- Import/export JSON Resume
- Print functionality
- Auto-save to localStorage

✅ **Cover Letter Editor** (`/cover-letter/edit`)
- Personal info auto-populated from resume
- AI-powered generation (requires API key)
- Live preview
- Print functionality

✅ **Print-Optimized Resume** (`/resume`)
- Auto-triggers browser print dialog
- Clean print layout
- Keyboard shortcut (Ctrl/Cmd+P)

✅ **Calendar Booking** (`/book`)
- Redirects to your booking link
- Configurable in resume.json

✅ **SEO & Performance**
- Auto-generated sitemap
- Robots.txt
- OpenGraph images
- Meta tags
- Static site (fast loading)

### What Requires Configuration

⚙️ **Password Protection** - Requires hash generation + GitHub Secret
⚙️ **AI Features** - Requires OpenAI API key (or compatible service)
⚙️ **Custom Domain** - Requires DNS configuration
⚙️ **Styling** - Edit CSS files for color/layout changes

---

**Ready to start?** Fork the repo and edit `src/data/resume.json` 🚀

**Questions?** Check `docs/` folder or open a GitHub Issue
