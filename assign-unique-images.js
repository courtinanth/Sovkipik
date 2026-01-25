import fs from 'fs';
import path from 'path';

const blogDir = path.join(process.cwd(), 'src/content/blog');
const mediaDir = path.join(process.cwd(), 'public/media');

const posts = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
let availableImages = fs.readdirSync(mediaDir).filter(file =>
    /\.(jpg|jpeg|png|webp)$/i.test(file) &&
    !file.includes('logo') &&
    !file.includes('icon') &&
    !file.includes('favicon')
);

// Shuffle array helper
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

shuffle(availableImages);

posts.forEach((post, index) => {
    if (availableImages.length === 0) {
        console.warn('Ran out of unique images!');
        return;
    }

    const postPath = path.join(blogDir, post);
    let content = fs.readFileSync(postPath, 'utf-8');

    // Pick unique image
    const image = availableImages.pop();
    const imagePath = `/media/${image}`; // Assuming public/media is root for web

    // Update frontmatter
    if (content.match(/image:\s*".*"/)) {
        content = content.replace(/image:\s*".*"/, `image: "${imagePath}"`);
    } else {
        // Add image if missing (after title usually)
        content = content.replace(/(title:.*)/, `$1\nimage: "${imagePath}"`);
    }

    fs.writeFileSync(postPath, content, 'utf-8');
    console.log(`Assigned ${image} to ${post}`);
});
