import fs from 'fs';
import path from 'path';

const blogDir = path.join(process.cwd(), 'src/content/blog');
const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));

const themes = {
    baby: '/media/blog_cover_baby.png',
    food: '/media/blog_cover_food.png',
    winter: '/media/blog_cover_winter.png',
    health: '/media/blog_cover_health.png',
    garden: '/media/blog_cover_garden.png',
    default: '/media/blog_default_cover.png'
};

const keywords = {
    baby: ['bébé', 'crotte', 'naissance', 'choupisson'],
    food: ['mange', 'alimentation', 'nourrir', 'eau', 'lait'],
    winter: ['hiver', 'hibernation', 'froid', 'automne'],
    health: ['malade', 'santé', 'puces', 'tiques', 'dent', 'soin', 'urgence', 'blessé', 'vétérinaire', 'parasite'],
    garden: ['jardin', 'abri', 'maison', 'cabane', 'signification', 'chat', 'prédateur']
};

files.forEach(file => {
    const filePath = path.join(blogDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Extract title
    const titleMatch = content.match(/title:\s*"(.*)"/);
    const title = titleMatch ? titleMatch[1].toLowerCase() : '';

    let selectedImage = themes.default;

    // Assign based on keywords
    for (const [theme, words] of Object.entries(keywords)) {
        if (words.some(word => title.includes(word))) {
            selectedImage = themes[theme];
            break;
        }
    }

    // Fallback logic for variety if still default
    // e.g. alternate garden/default/health
    if (selectedImage === themes.default) {
        // Just pick one randomly or stick with default "Forest"
        // Let's stick with default forest which is generic enough
    }

    console.log(`Assigning ${selectedImage} to ${file} (Title: ${title})`);

    // Replace existing image line
    if (content.includes('image:')) {
        content = content.replace(/image:.*(\r\n|\n|\r)/, `image: "${selectedImage}"\n`);
    } else {
        content = content.replace(/(author:.*)(\r\n|\n|\r)/, `$1\nimage: "${selectedImage}"\n`);
    }

    fs.writeFileSync(filePath, content, 'utf-8');
});
