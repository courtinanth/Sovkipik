const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'src/content/blog');
const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));

console.log(`Scanning ${files.length} files...`);

files.forEach(file => {
    const filePath = path.join(contentDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;

    // 1. Remove trailing --- at end of file if it looks like an artifact
    // (A typical blog post ends with text, not ---)
    if (lines[lines.length - 1].trim() === '---') {
        // Check if this is the ONLY closing dash
        // If there are only 2 dashes in the file (start and this one), then it's definitely misplaced
        const dashCount = content.split(/^---$/m).length - 1; // approximate regex
        if (dashCount <= 2) {
            lines.pop();
            modified = true;
            console.log(`Removed trailing '---' from ${file}`);
        }
    }

    // 2. Ensure --- after "image: ..." or "## image: ..."
    for (let i = 0; i < Math.min(lines.length, 20); i++) {
        const line = lines[i].trim();
        if (line.startsWith('image:') || line.startsWith('## image:')) {
            // Clean up ## if present
            if (line.startsWith('## ')) {
                lines[i] = lines[i].replace('## ', '');
                modified = true;
            }

            // Check next valid line
            let nextLineIndex = i + 1;
            // Skip empty lines? Frontmatter usually doesn't have empty lines before closing ---
            if (lines[nextLineIndex] && lines[nextLineIndex].trim() === '') {
                // If next line is empty, maybe --- is after?
                // But usually standard is:
                // image: ...
                // ---
                // 
                // So if we see empty line, we should probably insert --- before it?
            }

            if (lines[nextLineIndex] !== undefined && lines[nextLineIndex].trim() !== '---') {
                console.log(`Inserting "---" after image in ${file} at line ${nextLineIndex}`);
                lines.splice(nextLineIndex, 0, '---');
                modified = true;
            } else if (lines[nextLineIndex] === undefined) {
                // End of file case
                lines.push('---');
                modified = true;
            }
            break; // Found the image, stop
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, lines.join('\n'));
        console.log(`Fixed ${file}`);
    }
});
