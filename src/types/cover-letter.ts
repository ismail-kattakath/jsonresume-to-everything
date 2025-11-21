/**
 * Cover Letter Data Types
 * Cover letter uses the same base structure as resume but with additional content field
 */

import { ResumeData } from './resume';

/**
 * Cover letter data extends resume data with a content field
 * Most resume-specific fields are hidden/empty in cover letters
 */
export interface CoverLetterData extends ResumeData {
  content: string;
}
