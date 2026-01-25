const https = require('https');

const data = JSON.stringify({
    appId: '5097f362-1ff5-4bb3-96b0-ebcce841f5f1',
    pageId: 'test-slug-manual',
    pageTitle: 'Test Page',
    content: 'Manual test comment 1',
    nickname: 'Tester'
});

const options = {
    hostname: 'cusdis.com',
    path: '/api/open/comments',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${body}`);
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.write(data);
req.end();
