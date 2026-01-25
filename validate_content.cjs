const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'src/content/blog');
const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));

console.log(`Scanning ${files.length} files...`);

let hasError = false;

files.forEach(file => {
    const filePath = path.join(contentDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Check start
    if (!content.trim().startsWith('---')) {
        console.error(`[ERROR] ${file}: Does not start with ---`);
        hasError = true;
    }

    // Check end of frontmatter
    // We expect a second ---
    const parts = content.split('---');
    if (parts.length < 3) {
        console.error(`[ERROR] ${file}: Seems to miss closing ---`);
        console.log('Snippet:', content.substring(0, 100));
        hasError = true;
    } else {
        // Maybe check valid yaml?
        // simple check for required fields like title:
        const frontmatter = parts[1];
        if (!frontmatter.includes('title:')) {
            console.error(`[ERROR] ${file}: Missing title in frontmatter`);
            hasError = true;
        }
        if (!frontmatter.includes('date:')) {
            console.error(`[ERROR] ${file}: Missing date in frontmatter`);
            hasError = true;
        }

        // Check for broken image line
        if (frontmatter.includes('## image:')) {
            console.error(`[ERROR] ${file}: Contains '## image:' inside frontmatter!`);
            hasError = true;
        }
    }
});

if (!hasError) {
    console.log('All files look structurally valid.');
}
