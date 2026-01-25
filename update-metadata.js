import fs from 'fs';
import path from 'path';

const blogDir = path.join(process.cwd(), 'src/content/blog');
const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));

files.forEach(file => {
    const filePath = path.join(blogDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Update Author
    // Check if author exists
    if (content.includes('author:')) {
        content = content.replace(/author:.*(\r\n|\n|\r)/, 'author: "Anthony COURTIN"\n');
    } else {
        // Add author after category
        content = content.replace(/(category:.*)(\r\n|\n|\r)/, '$1\nauthor: "Anthony COURTIN"\n');
    }

    // Update Image
    // Check if image exists
    if (content.includes('image:')) {
        // If image exists but is empty or default, maybe update it? 
        // User said "ajoute une photo... car il y en a pas actuellement".
        // If there is no image key, add it.
    } else {
        // Add image after author
        content = content.replace(/(author:.*)(\r\n|\n|\r)/, '$1\nimage: "/media/blog_default_cover.png"\n');
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated metadata for ${file}`);
});
