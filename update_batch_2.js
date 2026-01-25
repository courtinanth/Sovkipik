import fs from 'fs';
import path from 'path';

const blogDir = path.join(process.cwd(), 'src/content/blog');
const destDir = path.join(process.cwd(), 'public/media/generated');

const updates = {
    'centres-soins-herissons.md': 'C:/Users/court/.gemini/antigravity/brain/4a116140-e2c3-4b21-abb3-8612dea1884e/centres_soins_herisson_1769247542020.png',
    'crottes-herissons.md': 'C:/Users/court/.gemini/antigravity/brain/4a116140-e2c3-4b21-abb3-8612dea1884e/crottes_herisson_1769247555919.png',
    'dents-herisson.md': 'C:/Users/court/.gemini/antigravity/brain/4a116140-e2c3-4b21-abb3-8612dea1884e/dents_herisson_1769247568834.png',
    'detecter-un-herisson-malade.md': 'C:/Users/court/.gemini/antigravity/brain/4a116140-e2c3-4b21-abb3-8612dea1884e/herisson_malade_1769247584490.png',
    'herisson-sans-pique.md': 'C:/Users/court/.gemini/antigravity/brain/4a116140-e2c3-4b21-abb3-8612dea1884e/herisson_sans_pique_1769247599933.png'
};

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

Object.entries(updates).forEach(([mdFile, srcPath]) => {
    if (fs.existsSync(srcPath)) {
        const ext = path.extname(srcPath);
        const newFilename = mdFile.replace('.md', ext);
        const destPath = path.join(destDir, newFilename);

        fs.copyFileSync(srcPath, destPath);

        const mdPath = path.join(blogDir, mdFile);
        let content = fs.readFileSync(mdPath, 'utf-8');
        const publicPath = `/media/generated/${newFilename}`;

        if (content.match(/^image:/m)) {
            content = content.replace(/^image:.*$/m, `image: "${publicPath}"`);
        } else {
            content = content.replace(/(title:.*)/, `$1\nimage: "${publicPath}"`);
        }

        fs.writeFileSync(mdPath, content, 'utf-8');
        console.log(`Updated ${mdFile}`);
    } else {
        console.error(`Source not found: ${srcPath}`);
    }
});
