# Default Data Setup Guide

This guide explains how to customize your portfolio data using the **JSON Resume standard**.

## 📋 Table of Contents

- [Overview](#overview)
- [Single Source of Truth](#single-source-of-truth)
- [JSON Resume Standard](#json-resume-standard)
- [Data Structure](#data-structure)
- [Customization Guide](#customization-guide)
- [Data Propagation](#data-propagation)
- [Testing Your Changes](#testing-your-changes)
- [Common Customizations](#common-customizations)
- [Validation](#validation)
- [Troubleshooting](#troubleshooting)

## Overview

The entire portfolio website is driven by a **single source of truth**: `src/data/resume.json`, which follows the [JSON Resume](https://jsonresume.org) v1.0.0 standard format. This ensures consistency across:

- Homepage portfolio sections
- Resume builder/editor
- Cover letter generator
- SEO metadata
- OpenGraph images
- JSON API endpoint (`/resume.json`)

## Single Source of Truth

### Location

```
src/data/resume.json
```

### Why It's Important

✅ **Standard format** - Compatible with the open-source JSON Resume ecosystem
✅ **One place to update** - Change your data once, it updates everywhere
✅ **Consistency guaranteed** - No duplicate or conflicting information
✅ **Easy maintenance** - Simple to keep your portfolio up-to-date
✅ **Type safety** - Schema validation ensures data integrity
✅ **Portability** - Export/import across different resume tools

### What It Powers

```
src/data/resume.json (JSON Resume v1.0.0)
    ↓
src/lib/resumeAdapter.ts (Converts to internal format)
    ↓
    ├── Homepage (/)
    │   ├── Hero section
    │   ├── About section
    │   ├── Skills section
    │   ├── Experience section
    │   └── Contact section
    │
    ├── Resume Pages
    │   ├── /resume (print view)
    │   └── /resume/builder (password-protected editor)
    │
    ├── Cover Letter Pages
    │   └── /cover-letter/edit (password-protected editor)
    │
    ├── SEO & Metadata
    │   ├── Meta tags (src/config/metadata.ts)
    │   ├── OpenGraph images (src/app/opengraph-image.tsx)
    │   └── Sitemap (auto-generated)
    │
    └── API Endpoints
        └── /resume.json (public JSON endpoint)
```

## JSON Resume Standard

This project uses the **[JSON Resume](https://jsonresume.org) v1.0.0 standard** - an open-source initiative to create a JSON-based standard for resumes.

### Benefits

- **Interoperability**: Works with other JSON Resume tools and themes
- **Version control friendly**: Plain JSON format works well with git
- **Validation**: Schema validation ensures data correctness
- **Ecosystem**: Compatible with jsonresume.org tools and services

### Schema Reference

The full schema is available at:

```
https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json
```

## Data Structure

The `resume.json` file follows this structure:

```json
{
  "$schema": "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
  "basics": {
    "name": "Your Name",
    "label": "Your Professional Title",
    "image": "",
    "email": "email@example.com",
    "phone": "+1 (123) 456-7890",
    "url": "https://yourwebsite.com",
    "calendar": "https://calendar.app.google/...",
    "summary": "Your professional summary...",
    "location": {
      "address": "Street Address",
      "postalCode": "12345",
      "city": "City",
      "countryCode": "US",
      "region": "State"
    },
    "profiles": [
      {
        "network": "GitHub",
        "username": "yourusername",
        "url": "https://github.com/yourusername"
      },
      {
        "network": "LinkedIn",
        "username": "yourusername",
        "url": "https://linkedin.com/in/yourusername"
      }
    ]
  },
  "work": [
    {
      "name": "Company Name",
      "position": "Job Title",
      "location": "City, State",
      "url": "https://company.com",
      "startDate": "2020-01-01",
      "endDate": "2023-12-31",
      "summary": "Brief role description",
      "highlights": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "url": "https://university.edu",
      "area": "Computer Science",
      "studyType": "Bachelor of Science",
      "startDate": "2015-09-01",
      "endDate": "2019-05-31",
      "score": "3.8",
      "courses": []
    }
  ],
  "skills": [
    {
      "name": "Programming Languages",
      "level": "Expert",
      "keywords": ["JavaScript", "TypeScript", "Python"]
    }
  ],
  "languages": [
    {
      "language": "English",
      "fluency": "Native speaker"
    }
  ],
  "certificates": [
    {
      "name": "AWS Certified Solutions Architect",
      "date": "2023-06-01",
      "issuer": "Amazon Web Services",
      "url": "https://verify-link.com"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Project description",
      "highlights": ["Feature 1", "Feature 2"],
      "keywords": ["React", "Node.js"],
      "startDate": "2022-01-01",
      "endDate": "2023-01-01",
      "url": "https://project.com",
      "roles": ["Developer"]
    }
  ]
}
```

## Customization Guide

### Step 1: Open the File

```bash
# Open with your editor
code src/data/resume.json

# Or use any text editor
open src/data/resume.json
```

### Step 2: Update Personal Information (`basics`)

```json
{
  "basics": {
    "name": "John Doe",
    "label": "Full Stack Developer | Tech Lead",
    "email": "john.doe@example.com",
    "phone": "+1 (555) 123-4567",
    "url": "https://johndoe.com",
    "calendar": "https://calendar.app.google/your-booking-link",
    "summary": "Your professional summary here...",
    "location": {
      "address": "123 Main St",
      "postalCode": "12345",
      "city": "San Francisco",
      "countryCode": "US",
      "region": "CA"
    }
  }
}
```

**Fields:**

- `name` - Your full name (used in headers, metadata)
- `label` - Professional title/tagline (shown on homepage hero)
- `email` - Primary contact email
- `phone` - Contact phone number (formatted as you prefer)
- `url` - Your personal website/portfolio URL
- `calendar` - **Custom field** for calendar booking link (Google Calendar, Calendly, etc.)
- `summary` - Professional summary (2-3 paragraphs, used in About section and SEO)

### Step 3: Update Social Profiles

```json
{
  "basics": {
    "profiles": [
      {
        "network": "GitHub",
        "username": "johndoe",
        "url": "https://github.com/johndoe"
      },
      {
        "network": "LinkedIn",
        "username": "johndoe",
        "url": "https://linkedin.com/in/johndoe"
      },
      {
        "network": "Twitter",
        "username": "johndoe",
        "url": "https://twitter.com/johndoe"
      }
    ]
  }
}
```

**Supported Networks:**

- GitHub
- LinkedIn
- Twitter
- Website (use `url` field in `basics` instead)

### Step 4: Update Work Experience (`work`)

```json
{
  "work": [
    {
      "name": "Current Company Inc.",
      "position": "Senior Software Engineer",
      "location": "Remote",
      "url": "https://company.com",
      "startDate": "2022-01-01",
      "endDate": "",
      "summary": "Leading development of cloud-native microservices platform",
      "highlights": [
        "Led migration to Kubernetes, reducing infrastructure costs by 40%",
        "Mentored team of 5 engineers, improving code quality metrics by 30%",
        "Implemented CI/CD pipeline reducing deployment time from 2h to 15min"
      ]
    },
    {
      "name": "Previous Company LLC",
      "position": "Software Engineer",
      "location": "San Francisco, CA",
      "url": "https://previous-company.com",
      "startDate": "2019-06-01",
      "endDate": "2021-12-31",
      "summary": "Full-stack development on SaaS platform",
      "highlights": [
        "Built RESTful API serving 1M+ daily requests",
        "Reduced database query time by 60% through optimization"
      ]
    }
  ]
}
```

**Tips:**

- List jobs in **reverse chronological order** (most recent first)
- Use **empty string** for `endDate` if currently employed
- Use **ISO date format** (YYYY-MM-DD) for dates
- Include **3-5 highlights** per role with metrics
- Start highlights with **action verbs**

### Step 5: Update Education

```json
{
  "education": [
    {
      "institution": "Stanford University",
      "url": "https://stanford.edu",
      "area": "Computer Science",
      "studyType": "Bachelor of Science",
      "startDate": "2015-09-01",
      "endDate": "2019-05-31",
      "score": "3.8",
      "courses": ["CS106A - Programming Methodology", "CS221 - Artificial Intelligence"]
    }
  ]
}
```

**Fields:**

- `institution` - School/university name
- `area` - Field of study (e.g., "Computer Science")
- `studyType` - Degree type (e.g., "Bachelor of Science", "Master of Science")
- `score` - GPA (optional, format as you prefer)
- `courses` - Notable courses (optional)

### Step 6: Update Skills

```json
{
  "skills": [
    {
      "name": "Programming Languages",
      "level": "Expert",
      "keywords": ["JavaScript", "TypeScript", "Python", "Go"]
    },
    {
      "name": "Frontend Development",
      "level": "Expert",
      "keywords": ["React", "Next.js", "Vue.js", "Tailwind CSS"]
    },
    {
      "name": "Backend Development",
      "level": "Advanced",
      "keywords": ["Node.js", "Express", "PostgreSQL", "MongoDB"]
    },
    {
      "name": "DevOps & Cloud",
      "level": "Advanced",
      "keywords": ["AWS", "Docker", "Kubernetes", "CI/CD"]
    }
  ]
}
```

**Skill Organization:**

- Group skills by **category** (name field)
- Use **level** to indicate proficiency: "Beginner", "Intermediate", "Advanced", "Expert", "Master"
- List skills in **keywords** array
- Order skills within each category by proficiency

### Step 7: Update Languages

```json
{
  "languages": [
    {
      "language": "English",
      "fluency": "Native speaker"
    },
    {
      "language": "Spanish",
      "fluency": "Professional working proficiency"
    },
    {
      "language": "French",
      "fluency": "Limited working proficiency"
    }
  ]
}
```

**Fluency Levels:**

- Native speaker
- Full professional proficiency
- Professional working proficiency
- Limited working proficiency
- Elementary proficiency

### Step 8: Update Certifications

```json
{
  "certificates": [
    {
      "name": "AWS Certified Solutions Architect - Professional",
      "date": "2023-06-01",
      "issuer": "Amazon Web Services",
      "url": "https://www.credly.com/badges/..."
    },
    {
      "name": "Certified Kubernetes Administrator",
      "date": "2022-03-15",
      "issuer": "Cloud Native Computing Foundation",
      "url": "https://verify-link.com"
    }
  ]
}
```

### Step 9: Update Projects (Optional)

```json
{
  "projects": [
    {
      "name": "E-commerce Platform",
      "description": "Full-stack e-commerce platform built with React and Node.js",
      "highlights": [
        "Serves 100K+ monthly active users",
        "99.9% uptime SLA",
        "Payment processing integration with Stripe"
      ],
      "keywords": ["React", "Node.js", "PostgreSQL", "AWS"],
      "startDate": "2022-01-01",
      "endDate": "2023-01-01",
      "url": "https://demo.example.com",
      "roles": ["Lead Developer", "Architect"]
    }
  ]
}
```

### Step 10: Save and Test

After making changes:

```bash
# If dev server is running, changes will hot-reload automatically
# If not, restart:
npm run dev

# Open in browser
open http://localhost:3000
```

## Data Propagation

After updating `resume.json`, your changes automatically propagate through the data adapter pattern:

### Data Flow

```
resume.json (JSON Resume format)
    ↓
resumeAdapter.ts (convertFromJSONResume)
    ↓
Internal ResumeData format
    ↓
    ├── Homepage sections (via portfolio.ts)
    ├── Resume editor/preview
    ├── Cover letter editor
    ├── SEO metadata
    ├── OpenGraph images
    └── /resume.json API endpoint
```

### Where Changes Appear

1. **Homepage (`/`)**
   - Hero: name, label, contact info
   - About: summary
   - Skills: all skill categories
   - Experience: work history
   - Contact: email, phone, social links

2. **Resume Pages**
   - `/resume` - Print-optimized resume view
   - `/resume/builder` - Interactive editor (password-protected)

3. **Cover Letter**
   - `/cover-letter/edit` - Personal info auto-populated

4. **SEO & Social**
   - Page title: Uses your name
   - Meta description: Uses your summary
   - OpenGraph images: Displays name and label
   - Twitter cards

5. **API**
   - `/resume.json` - Returns JSON Resume format

## Testing Your Changes

### Visual Testing

```bash
# Start dev server
npm run dev

# Check these pages:
# 1. Homepage - http://localhost:3000
# 2. Resume view - http://localhost:3000/resume
# 3. Resume editor - http://localhost:3000/resume/builder
# 4. Cover letter - http://localhost:3000/cover-letter/edit
# 5. JSON API - http://localhost:3000/resume.json
```

### Validation Testing

```bash
# Run build to check for TypeScript errors
npm run build

# Run tests
npm test

# Test specific components
npm test -- --testPathPattern="resume"
```

### Data Validation Checklist

- [ ] All required fields are filled
- [ ] Email format is valid
- [ ] Phone number is properly formatted
- [ ] URLs are valid and start with `https://`
- [ ] Dates use ISO format (YYYY-MM-DD)
- [ ] Work experience is in reverse chronological order
- [ ] No typos or grammatical errors
- [ ] Social media links are working
- [ ] JSON is valid (no syntax errors)

## Common Customizations

### Adding Calendar Booking Link

The `calendar` field in `basics` is a **custom extension** to JSON Resume:

```json
{
  "basics": {
    "calendar": "https://calendar.app.google/your-link"
  }
}
```

This appears on:

- Homepage contact section
- `/book` page (redirects to calendar)

**Supported services:**

- Google Calendar
- Calendly
- Cal.com
- Any booking URL

### Highlighting Current Position

Use an **empty string** for `endDate`:

```json
{
  "work": [
    {
      "name": "Current Company",
      "position": "Senior Engineer",
      "startDate": "2022-01-01",
      "endDate": ""
    }
  ]
}
```

The UI will display "Present" or "Current".

### Organizing Skills by Category

Group related skills together:

```json
{
  "skills": [
    {
      "name": "Frontend",
      "keywords": ["React", "Vue", "Angular"]
    },
    {
      "name": "Backend",
      "keywords": ["Node.js", "Python", "Java"]
    },
    {
      "name": "Database",
      "keywords": ["PostgreSQL", "MongoDB", "Redis"]
    }
  ]
}
```

### Date Formatting

Use **ISO 8601 format** (YYYY-MM-DD):

```json
"startDate": "2020-01-15"
"endDate": "2023-12-31"
```

The UI will format dates appropriately for display.

## Validation

The project includes JSON Resume schema validation using **AJV**.

### Manual Validation

You can validate your resume.json using:

```bash
# Build the project (includes validation)
npm run build
```

### Schema Validation Errors

Common errors and fixes:

**Missing required field:**

```
Error: "basics.name" is required
Fix: Add "name" field to "basics" object
```

**Invalid date format:**

```
Error: "work[0].startDate" must match format "date"
Fix: Use ISO format: "2020-01-01"
```

**Invalid email:**

```
Error: "basics.email" must match format "email"
Fix: Ensure valid email: "user@domain.com"
```

## Troubleshooting

### Changes Not Appearing?

**1. Hard reload browser:**

```
Mac: Cmd + Shift + R
Windows: Ctrl + Shift + R
```

**2. Restart dev server:**

```bash
# Kill server (Ctrl+C)
rm -rf .next
npm run dev
```

**3. Check for JSON syntax errors:**

```bash
# Validate JSON
cat src/data/resume.json | python3 -m json.tool
```

### JSON Syntax Errors

**Missing comma:**

```json
// ❌ Wrong
{
  "name": "John"
  "email": "john@example.com"
}

// ✅ Correct
{
  "name": "John",
  "email": "john@example.com"
}
```

**Trailing comma:**

```json
// ❌ Wrong (JSON doesn't allow trailing commas)
{
  "skills": ["JavaScript", "Python",]
}

// ✅ Correct
{
  "skills": ["JavaScript", "Python"]
}
```

**Unescaped quotes:**

```json
// ❌ Wrong
{
  "summary": "I'm a developer"
}

// ✅ Correct
{
  "summary": "I'm a developer"
}
```

### Build Errors

```bash
# Check for TypeScript errors
npm run build

# Check for lint errors
npm run lint
```

Common issues:

- Invalid JSON syntax
- Missing required fields
- Incorrect data types
- Invalid date formats

## Best Practices

### ✅ DO

- Follow JSON Resume v1.0.0 standard
- Use ISO date format (YYYY-MM-DD)
- Validate JSON syntax before committing
- Keep summary under 200 words
- Use metrics in work highlights
- Proofread all content
- Test changes locally before deploying
- Commit to version control
- Update data regularly (quarterly review)

### ❌ DON'T

- Don't add trailing commas in JSON
- Don't include sensitive information (SSN, etc.)
- Don't use inconsistent date formats
- Don't list every technology you've touched
- Don't make summary too long
- Don't forget to test after changes
- Don't hardcode data in multiple files
- Don't skip schema validation

## External Tools

Your `resume.json` is compatible with:

- **[JSON Resume](https://jsonresume.org)** - Official registry and tools
- **[Resume CLI](https://github.com/jsonresume/resume-cli)** - Command-line tool
- **[JSON Resume Themes](https://jsonresume.org/themes/)** - Various theme options
- **[Resumed](https://resumed.io)** - Visual resume builder

## Need Help?

- **JSON Resume Docs**: https://jsonresume.org/schema/
- **Schema Reference**: https://github.com/jsonresume/resume-schema
- **Project Docs**: [docs/README.md](./README.md)
- **TypeScript Types**: `src/types/json-resume.ts`
- **Adapter Logic**: `src/lib/resumeAdapter.ts`

---

**Last Updated**: November 2024
**JSON Resume Version**: v1.0.0
**Maintained by**: Ismail Kattakath
