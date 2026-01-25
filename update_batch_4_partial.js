import fs from 'fs';
import path from 'path';

const blogDir = path.join(process.cwd(), 'src/content/blog');
const destDir = path.join(process.cwd(), 'public/media/generated');

const updates = {
    'que-mange-un-herisson.md': 'C:/Users/court/.gemini/antigravity/brain/4a116140-e2c3-4b21-abb3-8612dea1884e/que_mange_herisson_1769247720945.png',
    'sauver-les-herissons.md': 'C:/Users/court/.gemini/antigravity/brain/4a116140-e2c3-4b21-abb3-8612dea1884e/sauver_les_herissons_1769247735639.png'
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
