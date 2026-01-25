const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'src/content/blog');
const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));

console.log(`Scanning ${files.length} files...`);

files.forEach(file => {
    const filePath = path.join(contentDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Fix Headers (Underlines to ##)
    // Matches:
    // Text
    // ----
    // Becomes:
    // ## Text
    content = content.replace(/^(.+)\r?\n[-=]+\r?$/gm, (match, title) => {
        // Avoid replacing frontmatter delimeters
        if (title.trim() === '') return match;
        return `## ${title.trim()}`;
    });

    // 2. Fix Absolute Links
    // https://sovkipik.com/slug/ -> /blog/slug/
    // https://sovkipik.com/wp-content/... -> handled later by image downloader, but let's fix page links

    // Replace internal links
    content = content.replace(/https?:\/\/sovkipik\.com\/([a-z0-9-]+)\/?/g, (match, slug) => {
        if (slug.startsWith('wp-content')) return match; // Skip images for now
        if (slug === 'contact') return '/contact';
        if (slug === 'a-propos-de-sovkipik') return '/about';
        return `/blog/${slug}`;
    });

    // 3. Remove "Close" and "Menu" remnants from scraped content (optional, based on my observations of the files)
    content = content.replace(/\[\r?\n\r?\n\*   \[Accueil\].+?Fermer/gs, '');
    content = content.replace(/Menu\r?\n\r?\n\*   \[Conditions.+?close/gs, '');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed formatting/links in ${file}`);
    }
});
