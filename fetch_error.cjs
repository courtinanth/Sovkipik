const http = require('http');

http.get('http://localhost:4334/this-page-does-not-exist', (res) => {
    console.log(`Status: ${res.statusCode}`);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('--- ERROR BODY START ---');
        console.log(data); // The body will contain the stack trace in HTML
        console.log('--- ERROR BODY END ---');
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
