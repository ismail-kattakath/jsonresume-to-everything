import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Simplified Markdown Exporter Logic for the script.
 * Re-implementing the essential parts of markdown-exporter.ts to avoid TS import issues in the sync script.
 */
function convertToMarkdown(data) {
    const lines = [];
    const horizontalLine = '-'.repeat(80);

    // Header
    lines.push(`# ${data.name.toUpperCase()}`);
    lines.push(`## ${data.position}`);
    lines.push('');

    // Contact Information
    if (data.email) lines.push(`- Email: [${data.email}](mailto:${data.email})`);
    if (data.contactInformation) lines.push(`- Phone: ${data.contactInformation}`);
    if (data.address) lines.push(`- Address: ${data.address}`);

    // Social Media Links
    if (data.socialMedia && data.socialMedia.length > 0) {
        data.socialMedia.forEach((social) => {
            if (social.socialMedia && social.link) {
                lines.push(`- ${social.socialMedia}: [${social.link}](${social.link})`);
            }
        });
    }
    lines.push('');
    lines.push(horizontalLine);

    // Professional Summary
    if (data.summary) {
        lines.push(`## SUMMARY`);
        lines.push('');
        lines.push(data.summary);
        lines.push('');
        lines.push(horizontalLine);
    }

    // Skills
    if (data.skills && data.skills.length > 0) {
        lines.push(`## SKILLS`);
        lines.push('');
        data.skills.forEach((skillGroup) => {
            const skillTexts = skillGroup.skills.map((skill) => skill.text);
            lines.push(`- ${skillGroup.title}: ${skillTexts.join(', ')}`);
        });
        lines.push('');
        lines.push(horizontalLine);
    }

    // Work Experience
    if (data.workExperience && data.workExperience.length > 0) {
        lines.push(`## EXPERIENCE`);
        lines.push('');
        data.workExperience.forEach((job, index) => {
            if (index > 0) lines.push('');
            lines.push(`### ${job.position} @ ${job.organization}`);
            lines.push(`${job.startYear} - ${job.endYear === 'Present' ? 'Present' : job.endYear}`);
            lines.push(``);
            if (job.description) {
                lines.push(job.description);
            }
            if (job.keyAchievements && job.keyAchievements.length > 0) {
                job.keyAchievements.forEach((achievement) => {
                    lines.push(`- ${achievement.text}`);
                });
            }
        });
        lines.push('');
        lines.push(horizontalLine);
    }

    return lines.join('\n');
}

/**
 * Resume Adapter Logic (Simplified)
 */
function adaptResumeData(jsonResume) {
    const basics = jsonResume.basics || {};

    return {
        name: basics.name || '',
        position: basics.label || '',
        email: basics.email || '',
        contactInformation: basics.phone || '',
        address: basics.location ? `${basics.location.address || ''} ${basics.location.city || ''} ${basics.location.region || ''} ${basics.location.postalCode || ''}`.trim() : '',
        summary: basics.summary || '',
        socialMedia: (basics.profiles || []).map(p => ({
            socialMedia: p.network,
            link: p.url
        })),
        skills: (jsonResume.skills || []).map(s => ({
            title: s.name,
            skills: (s.keywords || []).map(k => ({ text: k }))
        })),
        workExperience: (jsonResume.work || []).map(w => ({
            position: w.position,
            organization: w.name,
            startYear: w.startDate ? w.startDate.split('-')[0] : '',
            endYear: w.endDate ? w.endDate.split('-')[0] : 'Present',
            description: w.summary,
            keyAchievements: (w.highlights || []).map(h => ({ text: h }))
        }))
    };
}

async function syncResumeMarkdown() {
    const gistUrl = process.env['RESUME_GIST_URL'];
    const mdGistId = process.env['RESUME_MD_GIST'];
    const githubToken = process.env['GH_TOKEN'];

    if (!gistUrl) {
        console.error('RESUME_GIST_URL is not defined.');
        process.exit(1);
    }

    if (!mdGistId) {
        console.warn('RESUME_MD_GIST is not defined. Skipping Gist update.');
        return;
    }

    console.log(`Fetching resume from ${gistUrl}...`);
    try {
        const response = await fetch(gistUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch resume: ${response.statusText}`);
        }

        const resumeDataJson = await response.json();
        const internalData = adaptResumeData(resumeDataJson);
        const markdown = convertToMarkdown(internalData);

        if (!githubToken) {
            console.warn('GH_TOKEN is not defined. Printing Markdown to console instead of updating Gist.');
            console.log('--- GENERATED MARKDOWN (Snippet) ---');
            console.log(markdown.substring(0, 500) + '...');
            console.log('------------------------------------');
            return;
        }

        console.log(`Updating Gist ${mdGistId}...`);

        const updateResponse = await fetch(`https://api.github.com/gists/${mdGistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'AI-JSONResume-Sync-Script'
            },
            body: JSON.stringify({
                files: {
                    'resume.md': {
                        content: markdown
                    }
                }
            })
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(`Failed to update Gist: ${updateResponse.statusText} - ${JSON.stringify(errorData)}`);
        }

        console.log('Successfully updated Gist with latest Markdown resume.');
    } catch (error) {
        console.error('Error syncing resume markdown:', error.message);
        process.exit(1);
    }
}

syncResumeMarkdown();
