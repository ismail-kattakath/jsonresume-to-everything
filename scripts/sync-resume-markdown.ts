import { convertResumeToMarkdown } from '../src/lib/exporters/markdown-exporter';
import { convertFromJSONResume } from '../src/lib/resume-adapter';

async function syncResumeMarkdown() {
    const gistUrl = process.env['RESUME_JSON_GIST'];
    const mdGistId = process.env['RESUME_MD_GIST'];
    const githubToken = process.env['GH_TOKEN'];

    if (!gistUrl) {
        console.error('RESUME_JSON_GIST is not defined.');
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

        // Use the actual project logic to adapt and convert
        const internalResumeData = convertFromJSONResume(resumeDataJson);
        const markdown = convertResumeToMarkdown(internalResumeData);

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
        if (error instanceof Error) {
            console.error('Error syncing resume markdown:', error.message);
        } else {
            console.error('An unknown error occurred during sync');
        }
        process.exit(1);
    }
}

syncResumeMarkdown();
