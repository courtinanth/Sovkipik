import fs from 'fs';
import path from 'path';

const blogDir = path.join(process.cwd(), 'src/content/blog');
const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));

console.log("File | Title");
files.forEach(file => {
    const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    const match = content.match(/title:\s*"(.*)"/);
    if (match) {
        console.log(`${file} | ${match[1]}`);
    }
});
