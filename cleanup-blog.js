import fs from 'fs';
import path from 'path';

const blogDir = path.join(process.cwd(), 'src/content/blog');
const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));

const dateRegex = /^\d{1,2}\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}$/i;

files.forEach(file => {
    const filePath = path.join(blogDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Remove Logos from body
    // Regex to match "![...logo...](...)" or similar patterns
    // We'll be aggressive with "logo" in the alt text or filename if it looks like an image insertion in the body
    content = content.replace(/!\[.*logo.*\]\(.*\)/gi, '');
    content = content.replace(/!\[.*\]\(.*logo.*\)/gi, '');

    const lines = content.split('\n');
    let newLines = [];
    let inFrontmatter = false;
    let frontmatterCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('---')) {
            frontmatterCount++;
            newLines.push(lines[i]);
            continue;
        }

        if (frontmatterCount < 2) {
            newLines.push(lines[i]);
            continue;
        }

        // Body processing

        // 2. Remove Date lines (standalone dates)
        if (dateRegex.test(line)) {
            console.log(`[${file}] Removing date line: ${line}`);
            continue;
        }

        // 3. Remove "useless" intro phrases (simple heuristics based on observation)
        // Example: "Comment sauver un bébé hérisson" repeated as title immediately after frontmatter
        // We will check if the line is identical (or very close) to the title in frontmatter
        // But for now, let's stick to the specific "date + phrase" removal requested by user if we can ID it

        // 4. Format Summaries
        // If we see a list of links that looks like a TOC but isn't formatted as a list
        // Markdown lists start with *, -, or 1.
        // If we see lines starting with `[` and ending with `)` that are links, adjacent to each other
        if (line.startsWith('[') && line.includes('](') && line.endsWith(')')) {
            // It's a link. Check if previous line was also a link or if we are in a "TOC block"
            // To be safe, if it's just a link line, ensure it has a bullet point
            if (!line.startsWith('* ') && !line.startsWith('- ') && !line.match(/^\d+\./)) {
                console.log(`[${file}] Formatting potential TOC link: ${line.substring(0, 20)}...`);
                newLines.push(`* ${lines[i]}`); // Add bullet
                continue;
            }
        }

        newLines.push(lines[i]);
    }

    const newContent = newLines.join('\n');

    // 5. Remove extra blank lines created by removals
    const cleanedContent = newContent.replace(/\n{3,}/g, '\n\n');

    if (cleanedContent !== content) {
        fs.writeFileSync(filePath, cleanedContent, 'utf-8');
        console.log(`Updated ${file}`);
    }
});
