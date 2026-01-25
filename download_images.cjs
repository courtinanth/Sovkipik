const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const contentDir = path.join(__dirname, 'src/content/blog');
const publicDir = path.join(__dirname, 'public/media/imported');

// Create directory
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            } else if (response.statusCode === 301 || response.statusCode === 302) {
                // Handle redirect
                downloadImage(response.headers.location, dest).then(resolve).catch(reject);
            } else {
                fs.unlink(dest, () => { });
                reject(new Error(`Server responded with ${response.statusCode}: ${url}`));
            }
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

function getExtension(url) {
    const ext = path.extname(url).split('?')[0];
    if (ext) return ext;
    return '.jpg'; // default
}

async function run() {
    const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
    console.log(`Scanning ${files.length} files for external images...`);

    let downloadCount = 0;

    for (const file of files) {
        const filePath = path.join(contentDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Regex to find markdown images: ![alt](url)
        // Only targeting sovkipik.com/wp-content URLs as identified
        // Also handling HTML <img> tags if any

        const regex = /!\[(.*?)\]\((https?:\/\/sovkipik\.com\/wp-content\/uploads\/[^)]+)\)/g;

        // We can't use replace directly with async download, so we find matches first
        const matches = [...content.matchAll(regex)];

        for (const match of matches) {
            const originalTag = match[0];
            const alt = match[1];
            const url = match[2];

            // Create a unique filename based on URL hash to avoid duplicates/collisions
            const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
            const ext = getExtension(url);
            const filename = `img-${hash}${ext}`;
            const localPath = path.join(publicDir, filename);
            const publicPath = `/media/imported/${filename}`;

            // Check if already downloaded
            if (!fs.existsSync(localPath)) {
                try {
                    console.log(`Downloading ${url}...`);
                    await downloadImage(url, localPath);
                    downloadCount++;
                } catch (e) {
                    console.error(`Failed to download ${url}: ${e.message}`);
                    continue; // Skip replacement if download failed
                }
            }

            // Replace in content
            // We use global replace ensuring we target the specific string
            content = content.replace(originalTag, `![${alt}](${publicPath})`);
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`Updated images in ${file}`);
        }
    }

    console.log(`Download complete. ${downloadCount} new images downloaded.`);
}

run();
