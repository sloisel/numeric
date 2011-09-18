var fs = require('fs');
var crypto = require('crypto');

var f = fs.readFileSync(process.argv[2]).toString();
try {
    var foo = JSON.parse(f);
    var bar = crypto.createHash('sha256').update(f).digest('hex');
    console.log(bar);
} catch(e) {}

