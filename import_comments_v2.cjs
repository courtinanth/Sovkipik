const fs = require('fs');
const https = require('https');
const path = require('path');

const APP_ID = '5097f362-1ff5-4bb3-96b0-ebcce841f5f1';
const CUSDIS_HOST = 'cusdis.com'; // or 'https://cusdis.com'
const XML_FILE = path.join(__dirname, 'wp_comments.xml');

// Mapping WP Post ID to Astro Slug
const POST_MAPPING = {
    '258': 'tique-herisson',
    '263': 'bebe-herisson-presentation-et-comment-sen-occuper',
    '239': 'soccuper-dun-herisson-sauvage',
    '162': 'hibernation-herisson',
    '222': 'signification-herisson-jardin',
    '232': 'predateurs-herisson',
    '323': 'sauver-les-herissons',
    '404': 'crottes-herissons',
    '413': 'que-mange-un-herisson'
};

function parseXML(xml) {
    // Very naive regex parser for this specific dump format
    const comments = [];
    // Split by <table name="wp_comments">
    const tables = xml.split('<table name="wp_comments">');
    // Skip header (part before first table)
    for (let i = 1; i < tables.length; i++) {
        const block = tables[i];
        const comment = {};

        // Extract fields
        const extract = (name) => {
            const regex = new RegExp(`<column name="${name}">(.*?)</column>`, 's');
            const match = block.match(regex);
            return match ? match[1] : '';
        };

        comment.id = extract('comment_ID');
        comment.post_id = extract('comment_post_ID');
        comment.author = extract('comment_author');
        comment.email = extract('comment_author_email');
        comment.content = extract('comment_content');
        comment.date = extract('comment_date');
        comment.parent = extract('comment_parent');

        // Simple html entity decode if needed, or keeping basic
        comments.push(comment);
    }
    return comments;
}

function postComment(comment) {
    return new Promise((resolve, reject) => {
        const slug = POST_MAPPING[comment.post_id];
        if (!slug) {
            console.log(`Skipping comment ${comment.id} (Post ID ${comment.post_id} not mapped)`);
            resolve();
            return;
        }

        // Check if content is valid
        if (!comment.content || !comment.author) {
            resolve();
            return;
        }

        const payload = JSON.stringify({
            appId: APP_ID,
            pageId: slug,
            pageTitle: slug, // Optional
            pageUrl: `https://sovkipik.netlify.app/blog/${slug}`,
            content: comment.content,
            nickname: comment.author,
            email: comment.email,
            createdAt: comment.date // Cusdis might overwrite this, but let's try
            // Cusdis Open API doesn't document 'createdAt' in POST body usually (it sets to now), 
            // but for import it's tricky. We might lose original dates.
        });

        const options = {
            hostname: CUSDIS_HOST,
            path: '/api/open/comments',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`Imported comment ${comment.id} for ${slug}`);
                } else {
                    console.error(`Failed ${comment.id}: ${res.statusCode} ${data}`);
                }
                setTimeout(resolve, 500); // Delay to be nice
            });
        });

        req.on('error', (e) => {
            console.error(`Error ${comment.id}: ${e.message}`);
            resolve();
        });

        req.write(payload);
        req.end();
    });
}

async function run() {
    console.log("Reading XML...");
    const xml = fs.readFileSync(XML_FILE, 'utf8');
    const comments = parseXML(xml);
    console.log(`Found ${comments.length} comments.`);

    // Sort by parent so parents exist before replies? 
    // Cusdis links replies by ID. Importing generic comments creates NEW IDs.
    // So parent-child links will be BROKEN unless we manually update `parentId` using the returned ID from the parent import.
    // This is complex. For now, flat structure is better than nothing.
    // Or we handle threading if possible. Cusdis POST returns the new ID?
    // Let's assume flat for now to fix the "missing" issue.

    for (const c of comments) {
        await postComment(c);
    }
    console.log("Done.");
}

run();
