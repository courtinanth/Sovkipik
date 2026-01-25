const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'src/content/blog');
const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));

console.log(`Scanning ${files.length} files...`);

files.forEach(file => {
    const filePath = path.join(contentDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Look for the specific broken pattern: 
    // Starts with ---
    // Contains "author: ..."
    // Followed by "## image: ..."
    // And NO "---" after that "## image" line immediately

    // We can simply find "## image: " and replace it if it's in the first 20 lines

    const lines = content.split('\n');
    let modified = false;
    let hasClosingDash = false;

    // Check if we already have a closing dash
    // We start searching from line 1
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
            hasClosingDash = true;
            break;
        }
    }

    // Attempt fix
    for (let i = 0; i < Math.min(lines.length, 20); i++) {
        if (lines[i].startsWith('## image:')) {
            // Found the broken line
            console.log(`Fixing broken image line in ${file} at line ${i + 1}`);

            // Remove '## '
            lines[i] = lines[i].replace('## ', '');

            // Ensure next line is '---'
            if (lines[i + 1] && lines[i + 1].trim() !== '---') {
                // Insert '---'
                lines.splice(i + 1, 0, '---');
                console.log(`Inserted missing '---' in ${file}`);
            } else if (!lines[i + 1]) {
                // End of file?
                lines.push('---');
            }

            modified = true;
            break; // Stop after fixing the header image
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, lines.join('\n'));
        console.log(`Saved ${file}`);
    } else {
        // If not modified, double check if we are missing closing ---
        // Some files might not have ## image but still miss --- ?
        // Based on previous analysis, the ## image was the culprit replacing ---
    }
});
