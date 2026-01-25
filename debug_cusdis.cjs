const https = require('https');

const APP_ID = '5097f362-1ff5-4bb3-96b0-ebcce841f5f1';
const HOST = 'cusdis.com';

const options = {
    hostname: HOST,
    path: `/api/open/comments?appId=${APP_ID}&limit=50`,
    method: 'GET',
};

console.log(`Fetching from ${HOST}...`);

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        let json;
        try {
            json = JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse JSON. Data length:', data.length);
            console.log('Start of data:', data.substring(0, 100));
            return;
        }

        const list = json.data && json.data.data ? json.data.data : [];
        console.log(`Fetched ${list.length} comments.`);

        if (list.length > 0) {
            console.log("First comment check:");
            console.log("ID:", list[0].id);
            console.log("PageId:", list[0].pageId);
            console.log("Content:", list[0].content.substring(0, 50));
            console.log("Keys:", Object.keys(list[0]));
        }

        // Check if ANY comment has a pageId
        const withId = list.filter(c => c.pageId);
        console.log(`Comments with valid pageId: ${withId.length}`);

        const pages = {};
        list.forEach(c => {
            const pid = c.pageId;
            if (!pages[pid]) pages[pid] = 0;
            pages[pid]++;
        });

        console.log("\n--- PAGE IDs found in Cusdis ---");
        Object.keys(pages).forEach(pid => {
            console.log(`ID: "${pid}"  (Count: ${pages[pid]})`);
            // Find a comment with this PID and print content
            const sample = list.find(c => c.pageId == (pid === 'undefined' ? undefined : pid)); // strict check might be tricky if "undefined" string
            // Actually just filter list
            const samples = list.filter(c => String(c.pageId) === pid).slice(0, 3);
            samples.forEach(s => {
                console.log(`   - Content: "${s.content.substring(0, 60)}..." (by ${s.by_nickname})`);
            });
        });
        console.log("--------------------------------");
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
