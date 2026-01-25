const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const contentDir = path.join(__dirname, 'src/content/blog');
const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));

console.log(`Scanning ${files.length} files...`);

files.forEach(file => {
    const filePath = path.join(contentDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract frontmatter
    const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---/);
    if (match) {
        const frontmatter = match[1];
        try {
            yaml.load(frontmatter);
            // console.log(`[OK] ${file}`);
        } catch (e) {
            console.error(`[ERROR] ${file}: YAML Parse Error`);
            console.error(e.message);
        }
    } else {
        console.error(`[ERROR] ${file}: No frontmatter found (or malformed)`);
        console.log('Start (JSON):', JSON.stringify(content.substring(0, 50)));
    }
});
