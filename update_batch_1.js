import fs from 'fs';
import path from 'path';

const blogDir = path.join(process.cwd(), 'src/content/blog');
const destDir = path.join(process.cwd(), 'public/media/generated');

// Map of MD filename -> Source Image Path
const updates = {
    'abri-pour-herisson-avec-et-sans-bricolage.md': 'C:/Users/court/.gemini/antigravity/brain/4a116140-e2c3-4b21-abb3-8612dea1884e/abri_herisson_bricolage_1769247443580.png',
    'adopter-un-herisson.md': 'C:/Users/court/.gemini/antigravity/brain/4a116140-e2c3-4b21-abb3-8612dea1884e/adopter_herisson_1769247461317.png',
    'age-et-sexe-herisson.md': 'C:/Users/court/.gemini/antigravity/brain/4a116140-e2c3-4b21-abb3-8612dea1884e/age_sexe_herisson_1769247475227.png',
    'associations-herissons.md': 'C:/Users/court/.gemini/antigravity/brain/4a116140-e2c3-4b21-abb3-8612dea1884e/associations_herisson_1769247488813.png',
    'bebe-herisson-presentation-et-comment-sen-occuper.md': 'C:/Users/court/.gemini/antigravity/brain/4a116140-e2c3-4b21-abb3-8612dea1884e/bebe_herisson_1769247502586.png'
};

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

Object.entries(updates).forEach(([mdFile, srcPath]) => {
    if (fs.existsSync(srcPath)) {
        const ext = path.extname(srcPath);
        const newFilename = mdFile.replace('.md', ext);
        const destPath = path.join(destDir, newFilename);

        // Copy file
        fs.copyFileSync(srcPath, destPath);

        // Update Markdown
        const mdPath = path.join(blogDir, mdFile);
        let content = fs.readFileSync(mdPath, 'utf-8');
        const publicPath = `/media/generated/${newFilename}`;

        if (content.includes('image:')) {
            content = content.replace(/image:.*(\r\n|\n|\r)/, `image: "${publicPath}"\n`);
        } else {
            content = content.replace(/(title:.*)/, `$1\nimage: "${publicPath}"`);
        }

        fs.writeFileSync(mdPath, content, 'utf-8');
        console.log(`Updated ${mdFile}`);
    } else {
        console.error(`Source not found: ${srcPath}`);
    }
});
