const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'src/content/blog');
const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));

console.log(`Scanning ${files.length} files for frontmatter repair...`);

files.forEach(file => {
    const filePath = path.join(contentDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Pattern: 
    // ^## image: "..."
    // This was created by replacing `image: "..."\n---` with `## image: "..."`

    // We want to turn:
    // ## image: "/path/to/img.png"
    // Back into:
    // image: "/path/to/img.png"
    // ---

    // Only match if it's near the start of the file (to avoid false positives in body)
    // Frontmatter usually ends within the first 20 lines.

    // We can just regex replace globally if we are confident "## image:" is rare in body.
    // Given the context, it's safe enough, or we can check if we are unclosed.

    if (content.startsWith('---') && !content.match(/---\r?\n\r?$/m) && !content.slice(3).includes('---')) {
        // Matches start with ---, but no second --- found (simple check)
        // Actually, let's just target the specific known bug pattern.

        const brokenPattern = /^(## image: ".*?")$/m;
        const match = content.match(brokenPattern);

        if (match) {
            const fixedLine = match[1].replace(/^## /, '') + '\n---';
            content = content.replace(brokenPattern, fixedLine);
            fs.writeFileSync(filePath, content);
            console.log(`Repaired frontmatter in ${file}`);
        } else {
            console.warn(`Could not find broken pattern in potentially broken file: ${file}`);
        }
    } else {
        // Double check: if it HAS a second ---, maybe it wasn't broken?
        // Or maybe my simple check above is flawed. 
        // Let's just run the replacement blindly on the pattern `^## image: "..."` if it looks like it's missing a --- 

        // Actually, safer strategy:
        // Find `## image: "..."`.
        // If the file DOES NOT have a second `---` (closing frontmatter), then apply fix.

        const countDashes = (content.match(/^---$/gm) || []).length;
        if (countDashes < 2) {
            const brokenPattern = /^(## image: ".*?")$/m;
            if (brokenPattern.test(content)) {
                content = content.replace(brokenPattern, (m) => m.replace(/^## /, '') + '\n---');
                fs.writeFileSync(filePath, content);
                console.log(`Repaired frontmatter in ${file}`);
            }
        }
    }
});
