import fs from 'fs';
import path from 'path';

const blogDir = path.join(process.cwd(), 'src/content/blog');
const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));

const dateRegex = /^\d{1,2}\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}$/i;

files.forEach(file => {
    const filePath = path.join(blogDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let newLines = [];
    let inFrontmatter = false;
    let frontmatterCount = 0;
    let keepLine = true;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('---')) {
            frontmatterCount++;
            newLines.push(lines[i]);
            if (frontmatterCount === 2) {
                // End of frontmatter
                // Scan the next few lines for Title or Date
                // We'll process the body lines separately after this loop? 
                // No, let's just continue
            }
            continue;
        }

        if (frontmatterCount < 2) {
            newLines.push(lines[i]);
            continue;
        }

        // Body content
        // If line is empty, keep it? 
        if (line === '') {
            newLines.push(lines[i]);
            continue;
        }

        // Check if line looks like a date
        if (dateRegex.test(line)) {
            console.log(`Removing date line in ${file}: ${line}`);
            continue; // Skip this line
        }

        // Check if line looks like the title (fuzzy match?)
        // The user complained about the "phrase with date below".
        // In the screenshot: "Comment sauver un bébé hérisson" -> This is a subtitle or title.
        // It matches the usage in the markdown file.
        // Let's rely on the date removal mostly. The user explicitly asked to remove the date.
        // "tu as une phrase avec en dessous la date, tu peux suppriemr cela" -> "phrase with date below, remove THAT".
        // It likely refers to the "date line" and possibly the "phrase" (title/subtitle) above it?
        // But the user said "supprimer cela" (remove that) singular.

        // Let's remove ONLY the date first. If the "phrase" is a subtitle that makes sense, we keep it?
        // Wait, "tu as une phrase avec en dessous la date" -> "you have a phrase with the date below it".
        // "tu peux supprimer cela" -> "you can remove that".
        // "Cela" might refer to the combination or just the date.
        // Given the screenshot showing a duplicate title "Comment sauver un bébé hérisson" which is slightly different from the meta title "Bébé hérisson...".
        // And then the date. 
        // I will remove the date. The "phrase" might be a useful H1/H2 header. 
        // If it's a duplicate title repeating the H1, it's redundant.
        // But let's start with the date which is definitely wrong (metadata is already shown).

        newLines.push(lines[i]);
    }

    const newContent = newLines.join('\n');
    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
    }
});
