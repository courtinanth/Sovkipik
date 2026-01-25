import fs from 'node:fs';
import path from 'node:path';

const jsonPath = 'blog-content.json';
const outputDir = 'src/content/blog';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Read the JSON file
const rawData = fs.readFileSync(jsonPath, 'utf-8');
const posts = JSON.parse(rawData);

console.log(`Found ${posts.length} posts to import.`);

posts.forEach((post, index) => {
    try {
        const { URL, Title, Markdown } = post;

        // 1. Extract Slug from URL
        // Example: https://sovkipik.com/hibernation-herisson/ -> hibernation-herisson
        let slug = URL.split('/').filter(Boolean).pop();
        if (!slug) {
            console.error(`Could not extract slug for post: ${Title}`);
            return;
        }

        // 2. Extract Date from Markdown content
        // Pattern: Published Time: 2025-12-30T18:30:20+01:00
        const dateMatch = Markdown.match(/Published Time:\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2})/);
        let date = new Date().toISOString(); // Default to now if not found
        if (dateMatch) {
            date = dateMatch[1];
        }

        // 3. Clean up Markdown Content
        // Remove the header part "URL Source: ... Markdown Content:"
        const contentStartMarker = "Markdown Content:";
        let cleanContent = Markdown;
        const markerIndex = Markdown.indexOf(contentStartMarker);

        if (markerIndex !== -1) {
            cleanContent = Markdown.substring(markerIndex + contentStartMarker.length).trim();
        }

        // 4. Construct Markdown file content
        const fileContent = `---
title: "${Title.replace(/"/g, '\\"')}"
date: ${date}
excerpt: ""
category: "Général"
---

${cleanContent}
`;

        // 5. Write to file
        const filePath = path.join(outputDir, `${slug}.md`);
        fs.writeFileSync(filePath, fileContent);
        console.log(`✅ Imported: ${slug}`);

    } catch (err) {
        console.error(`❌ Failed to import post ${index + 1}:`, err);
    }
});

console.log('Import finished!');
