const fs = require('fs');
const path = './service-account.json'; // Path to your original JSON

const jsonRaw = fs.readFileSync(path, 'utf8');
// Parse and then stringify - this escapes quotes and newlines properly
const escapedJson = JSON.stringify(JSON.parse(jsonRaw));

console.log(escapedJson);
