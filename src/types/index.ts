/**
 * Central type definitions export
 * Import types from this file throughout the application
 */

// JSON Resume types (external standard format)
export type {
  JSONResume,
  JSONResumeBasics,
  JSONResumeProfile,
  JSONResumeWork,
  JSONResumeEducation,
  JSONResumeSkill,
  JSONResumeLanguage,
  JSONResumeCertificate,
  JSONResumeProject,
  JSONResumeAward,
  JSONResumeVolunteer,
  JSONResumePublication,
  JSONResumeReference,
  JSONResumeInterest,
} from './json-resume';

// Internal resume data types
export type {
  ResumeData,
  SocialMediaLink,
  WorkExperience,
  Education,
  Skill,
  SkillGroup,
  Project,
  Certification,
} from './resume';

// Cover letter types
export type { CoverLetterData } from './cover-letter';
