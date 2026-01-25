const fs = require('fs');
const xml2js = require('xml2js');
const https = require('https');

const APP_ID = '5097f362-1ff5-4bb3-96b0-ebcce841f5f1';
const CUSDIS_HOST = 'cusdis.com';
const inputFile = 'disqus_import.xml';

// Helper to post to Cusdis
function postComment(comment) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            appId: APP_ID,
            pageId: comment.pageId,
            pageTitle: comment.pageTitle,
            pageUrl: comment.pageUrl,
            content: comment.content,
            email: comment.email,
            nickname: comment.author,
            parentId: comment.parentId || null
        });

        const options = {
            hostname: CUSDIS_HOST,
            path: '/api/open/comments',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(body));
                    } else {
                        console.error(`Status ${res.statusCode}: ${body}`);
                        resolve({ error: body }); // Don't reject, just log
                    }
                } catch (e) {
                    resolve({ error: body });
                }
            });
        });

        req.on('error', (e) => {
            console.error('Request Error:', e);
            resolve({ error: e.message });
        });
        req.write(data);
        req.end();
    });
}

async function run() {
    try {
        console.log('Reading ' + inputFile);
        if (!fs.existsSync(inputFile)) {
            throw new Error(`File ${inputFile} not found`);
        }
        const xml = fs.readFileSync(inputFile, 'utf8');

        console.log('Parsing XML...');
        const result = await new Promise((resolve, reject) =>
            xml2js.parseString(xml, (err, res) => err ? reject(err) : resolve(res))
        );

        console.log('XML Parsed.');

        const threads = {};
        if (result.disqus && result.disqus.thread) {
            result.disqus.thread.forEach(t => {
                // Handle optional keys carefully
                const id = t.id ? t.id[0] : null;
                if (!id) return;

                threads[id] = {
                    id: id,
                    title: t.title ? t.title[0] : id,
                    link: t.link ? t.link[0] : ''
                };
            });
        }

        console.log(`Found ${Object.keys(threads).length} threads.`);

        if (!result.disqus || !result.disqus.post) {
            console.log('No comments found in XML.');
            return;
        }

        // Sort posts
        const posts = result.disqus.post.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt[0]) : new Date();
            const dateB = b.createdAt ? new Date(b.createdAt[0]) : new Date();
            return dateA - dateB;
        });

        console.log(`Found ${posts.length} comments to migrate...`);

        const idMap = {};

        for (const p of posts) {
            try {
                // Access dsq:id attribute - xml2js puts attributes in $
                // The key might be 'dsq:id' or similar. console.log to debug if needed.
                const threadObj = p.thread[0];
                const threadAttr = threadObj.$ || {};
                const threadId = threadAttr['dsq:id']; // This is what we stored in previous script

                // Wait! In disqus_import.xml I wrote: <thread dsq:id="tique-herisson"/>
                // BUT the thread definition is <id>tique-herisson</id>
                // In post: <thread dsq:id="tique-herisson"/>

                // My logic in previous script: 
                // threads[t.$.id]
                // BUT <thread> in disqus export usually has <id> element, not id attribute on thread tag
                // Let's re-read disqus_import.xml structure I generated.
                // <thread><id>tique-herisson</id>...</thread>
                // <post>...<thread dsq:id="tique-herisson"/>...</post>

                // So threads keys should be t.id[0]

                const thread = threads[threadId];

                if (!thread) {
                    console.warn(`Thread not found for post ${p.id[0]} (threadId: ${threadId}), skipping`);
                    // Fallback: try to find thread by checking if threadId is a key in threads
                    // Debug:
                    // console.log('Available threads:', Object.keys(threads));
                    continue;
                }

                const createdAt = p.createdAt ? p.createdAt[0] : new Date().toISOString();
                const originalDate = new Date(createdAt).toLocaleDateString('fr-FR');
                const message = p.message ? p.message[0] : '';

                const content = `${message}\n\n_(Posté le ${originalDate})_`;

                const authorObj = p.author ? p.author[0] : {};
                const authorEmail = authorObj.email ? authorObj.email[0] : 'anon@example.com';
                const authorName = authorObj.name ? authorObj.name[0] : 'Anonymous';

                let parentId = null;
                if (p.parent && p.parent[0] && p.parent[0].$) {
                    const parentDsqId = p.parent[0].$['dsq:id'];
                    parentId = idMap[parentDsqId];
                    if (!parentId) {
                        // Maybe parent wasn't migrated yet or failed?
                        // If parent is missing, treat as top level or log warning
                        // console.warn('Parent not found yet for', p.id[0]);
                    }
                }

                const payload = {
                    pageId: thread.id,
                    pageTitle: thread.title,
                    pageUrl: thread.link,
                    content: content,
                    email: authorEmail,
                    author: authorName,
                    parentId: parentId
                };

                console.log(`Migrating comment ${p.id[0]} by ${payload.author}...`);

                const res = await postComment(payload);
                const newId = res.data ? res.data.id : res.id;

                if (newId) {
                    idMap[p.id[0]] = newId;
                    console.log(`Success! New ID: ${newId}`);
                } else {
                    console.error('Warning: No ID returned', res);
                }

                await new Promise(r => setTimeout(r, 500)); // 500ms delay
            } catch (innerEx) {
                console.error('Error processing post:', innerEx);
            }
        }

        console.log('Migration complete!');
    } catch (e) {
        console.error('Fatal Error:', e);
    }
}

run();
