const https = require('https');

const url = 'https://germansikho.pages.dev/vocabulary.json';

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            if (jsonData.length > 0) {
                console.log('KEYS:');
                Object.keys(jsonData[0]).forEach(key => console.log(key));
            } else {
                console.log('Empty data');
            }
        } catch (e) {
            console.error(e.message);
        }
    });

}).on('error', (err) => {
    console.error('Error: ' + err.message);
});
