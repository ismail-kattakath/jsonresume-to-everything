/**
 * Centralized Tooltip Content Configuration
 * All tooltip text for the Resume Builder
 */

export const tooltips = {
  // Navigation & Top-level Actions
  navigation: {
    modeSwitcher:
      'Switch between editing your Resume or Cover Letter - both share personal information',
    printButton: 'Download as PDF or print your document (opens print dialog)',
    atsCheck: 'Analyze your resume for Applicant Tracking System compatibility',
    logout: 'End your session and return to the login screen',
  },

  // Section Headers
  sections: {
    importExport:
      'Upload existing JSON Resume data or download your current resume/cover letter',
    aiSettings:
      'Configure OpenAI-compatible API for AI-powered content generation',
    personalInfo:
      'Your name, contact details, and professional summary - shared across all documents',
    socialMedia:
      'Add links to LinkedIn, GitHub, Portfolio, and other professional profiles',
    summary:
      'A brief professional overview highlighting your key strengths and experience',
    education: 'Your degrees, certifications, and academic achievements',
    workExperience:
      'Your employment history with responsibilities and achievements',
    skills: 'Organize your technical and professional skills into categories',
    additionalInfo:
      'Certifications, languages, projects, and other relevant information',
    coverLetterContent:
      'Write a compelling cover letter tailored to your target job',
  },

  // AI Settings Form
  aiSettings: {
    apiUrl:
      'URL of your OpenAI-compatible API endpoint (e.g., http://localhost:1234 for local LLMs)',
    apiKey:
      'Your API key for authentication - stored locally in your browser only',
    model:
      'The AI model to use (e.g., gpt-4o-mini, llama-3, mistral) - must be available on your API',
    jobDescription:
      'Paste the full job posting - AI uses this to tailor your content to the role',
    rememberCredentials:
      'Save API credentials in browser localStorage for future sessions',
    testConnection: 'Verify that your API credentials and model are working',
    validStatus: 'Connection successful - AI generation is ready to use',
    invalidStatus:
      'Connection failed - check your API URL, key, and model name',
    testingStatus: 'Testing connection to your AI API endpoint...',
  },

  // Import/Export
  importExport: {
    uploadButton: 'Upload a JSON Resume file to instantly populate all fields',
    downloadResume:
      'Download your resume data in JSON Resume format (compatible with many tools)',
    downloadCoverLetter:
      'Download your cover letter with personal info in JSON format',
    fileFormat:
      'Use standard JSON Resume format (jsonresume.org) for maximum compatibility',
  },

  // Personal Information
  personalInfo: {
    profilePicture:
      'Upload a professional headshot (appears on resume preview)',
    name: 'Your full name as it should appear on your resume',
    position:
      'Your current or target job title (e.g., "Senior Software Engineer")',
    email: "Professional email address - ensure it's active and monitored",
    phone:
      'Phone number with country code if applying internationally (e.g., +1-555-123-4567)',
    website: 'Personal portfolio or professional website URL',
    city: 'City and state/province (full address not needed for privacy)',
  },

  // Social Media
  socialMedia: {
    addProfile: 'Add another social media profile to your resume',
    platform: 'Choose the platform type (e.g., LinkedIn, GitHub, Portfolio)',
    url: 'Full URL to your profile page (e.g., https://linkedin.com/in/yourname)',
    removeProfile: 'Remove this social media profile from your resume',
  },

  // Summary
  summary: {
    textarea:
      'Write 2-4 sentences highlighting your experience, skills, and career goals',
    aiGenerate:
      'Let AI write a tailored summary based on your resume and the job description',
    characterCount: 'Aim for 250-400 characters for optimal readability',
  },

  // Education
  education: {
    addEntry: 'Add another degree, certification, or educational credential',
    institution: 'Name of the university, college, or educational institution',
    degree:
      'Your degree type and major (e.g., "Bachelor of Science in Computer Science")',
    startDate: 'When you started this program (YYYY-MM format)',
    endDate:
      'When you graduated or expect to graduate (leave empty if currently enrolled)',
    gpa: 'Your cumulative GPA (optional - only include if 3.5 or higher)',
    courses:
      'Relevant coursework that demonstrates skills for your target role',
    removeEntry: 'Delete this education entry from your resume',
  },

  // Work Experience
  workExperience: {
    addEntry: 'Add another job or professional experience',
    company: 'Name of the company or organization',
    position: 'Your job title at this company',
    startDate: 'When you started this role (YYYY-MM format)',
    endDate: 'When you left this role (leave empty if currently employed here)',
    summary:
      'Brief description of your role and responsibilities (1-2 sentences)',
    keyAchievements:
      'Specific accomplishments with measurable impact (use action verbs and metrics)',
    technologies: 'Key technologies, tools, or skills used in this role',
    addAchievement: 'Add another achievement for this position',
    removeAchievement: 'Delete this achievement',
    dragHandle: 'Drag to reorder this achievement - most impressive first',
    toggleTechnologies:
      'Show or hide technologies section for this work experience',
    removeEntry: 'Delete this work experience from your resume',
  },

  // Skills
  skills: {
    addGroup:
      'Create a new skill category (e.g., "Frontend", "Backend", "DevOps")',
    groupName: 'Name for this skill group (keep it short and descriptive)',
    addSkill: 'Add a skill to this group',
    skillName: 'Name of the technology, tool, or skill',
    highlightSkill:
      'Bold this skill to emphasize proficiency or relevance to the job',
    removeSkill: 'Remove this skill from the group',
    renameGroup: 'Click to rename this skill category',
    deleteGroup: 'Delete this entire skill group and all skills within it',
    dragGroup: 'Drag to reorder skill groups - put most relevant first',
    dragSkill: 'Drag to reorder skills within this group',
    expandCollapse: 'Show or hide skills in this group',
  },

  // Additional Info (Certifications, Languages, Projects)
  certifications: {
    addEntry: 'Add a professional certification or credential',
    name: 'Name of the certification (e.g., "AWS Certified Solutions Architect")',
    issuer: 'Organization that issued the certification',
    date: 'Date you received this certification',
    url: 'Link to credential verification page (optional)',
    removeEntry: 'Remove this certification from your resume',
  },

  languages: {
    addEntry: 'Add a language you can speak or write',
    language: 'Name of the language (e.g., "Spanish", "Mandarin")',
    proficiency:
      'Your skill level: Native, Fluent, Advanced, Intermediate, or Basic',
    removeEntry: 'Remove this language from your resume',
  },

  projects: {
    addEntry: 'Add a personal project, open source contribution, or side work',
    name: 'Name of the project',
    description:
      'Brief explanation of what the project does and your role (2-3 sentences)',
    achievements:
      'Key technical achievements or impact metrics (downloads, stars, users)',
    technologies: 'Technologies and tools used in this project',
    url: 'Link to live demo, GitHub repo, or project page',
    removeEntry: 'Remove this project from your resume',
  },

  // Cover Letter
  coverLetter: {
    content:
      "Write a compelling letter explaining why you're a great fit for this specific role",
    aiGenerate:
      'Let AI draft a tailored cover letter based on your resume and the job description',
    paragraphGuidance:
      "Aim for 3-4 paragraphs: (1) Introduction, (2-3) Why you're qualified, (4) Call to action",
  },

  // AI Generation
  aiGeneration: {
    generateButton:
      'Use AI to generate content - requires valid AI Settings configuration',
    regenerateButton: 'Generate new content with AI (replaces current text)',
    jobDescriptionRequired:
      'Enter a job description in AI Settings to enable AI generation',
    streaming:
      'AI is generating content in real-time - you can stop at any time',
    stopGeneration: 'Stop AI generation and keep the content generated so far',
  },

  // Drag and Drop
  dragDrop: {
    handle: 'Drag this handle to reorder items - most important first',
    dropzone: 'Drop items here to reorder - release to place in new position',
  },

  // General Actions
  actions: {
    add: 'Add a new entry',
    edit: 'Edit this entry',
    delete: 'Delete this entry permanently',
    save: 'Save changes to this entry',
    cancel: 'Cancel editing and discard changes',
    expand: 'Expand section to view and edit content',
    collapse: 'Collapse section to save space',
  },
} as const

// Type export for TypeScript autocomplete
export type TooltipContent = typeof tooltips
