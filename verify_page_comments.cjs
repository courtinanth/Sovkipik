const https = require('https');

const APP_ID = '5097f362-1ff5-4bb3-96b0-ebcce841f5f1';
const HOST = 'cusdis.com';
const PAGE_ID = 'bebe-herisson-presentation-et-comment-sen-occuper';

const options = {
    hostname: HOST,
    path: `/api/open/comments?appId=${APP_ID}&pageId=${PAGE_ID}&limit=100`,
    method: 'GET',
};

console.log(`Fetching comments for pageId: ${PAGE_ID}...`);

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const comments = json.data && json.data.data ? json.data.data : [];
            console.log(`Found ${comments.length} comments for "${PAGE_ID}".`);
            if (comments.length > 0) {
                console.log(`Sample content: ${comments[0].content}`);
            }
        } catch (e) {
            console.error(e);
            console.log(data);
        }
    });
});

req.on('error', console.error);
req.end();
