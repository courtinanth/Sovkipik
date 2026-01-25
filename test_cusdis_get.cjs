const https = require('https');

const APP_ID = '5097f362-1ff5-4bb3-96b0-ebcce841f5f1';
const CUSDIS_HOST = 'cusdis.com';
const PAGE_ID = 'tique-herisson'; // One where we know comments exist

const options = {
    hostname: CUSDIS_HOST,
    path: `/api/open/comments?appId=${APP_ID}&pageId=${PAGE_ID}&limit=100`, // Guessing params
    method: 'GET'
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
            try {
                const json = JSON.parse(body);
                console.log(`Fetched ${json.data ? json.data.length : json.length} comments.`);
                console.log(JSON.stringify(json, null, 2).substring(0, 500) + '...');
            } catch (e) {
                console.log('Body is not JSON:', body);
            }
        } else {
            console.log('Error Body:', body);
        }
    });
});
req.on('error', console.error);
req.end();
