var console = { 
    log: function() { 
        var k; 
        for(k=0;k<arguments.length;k++) { 
            if(k>0) { write(' '); } 
            write(arguments[k]); } 
        write('\n');
        if(typeof system !== "undefined") { system.stdout.flush(); }
    }
};
function XMLHttpRequest() {
    this.response = "";
    if(typeof system !== "undefined") {
        this.open = function(get,url) { this.responseText = new Stream(url).readFile(); }
    } else {
        this.open = function(get,url) { this.responseText = read(url); }
    }
    this.send = function() {}
}
var foo;
if(typeof system !== "undefined") { foo = new Stream('./documentation.html').readFile(); }
else { foo = read('./documentation.html'); }
var baz;
if(typeof system !== "undefined") { baz = new Stream('./src/numeric.js').readFile(); }
else { baz = read('./src/numeric.js'); }
var ver = baz.match(/numeric.version[ =]*"([0-9.]*)".*/)[1]
var bar = foo.match(/<pre>[\s\S]*?(?=<\/pre>)/g).join('\n').replace(/<pre>/g,'').split('\n> ')
var baz = [];
var k,k0=0;
for(k=0;k<bar.length;k++) {
    var j = bar[k].indexOf('\n');
    if(j>0) { baz[k0] = [bar[k].substring(0,j),bar[k].substring(j+1)]; k0++; }
}

load('./lib/numeric-'+ver+'.js');
if(typeof numeric === "undefined") { throw new Error("Could not load numeric.js"); }
var unit_pass = 0, unit_fail = 0;
var a,b,msg;
var k1 = 0;
var workshop = {};
for(k=0;k<k0;k++) {
    k1++;
    bar = '';
    try {
        workshop.html = function(x) { bar += x; }
        foo = numeric.prettyPrint(eval(baz[k][0].replace(/&lt;/g,'<').replace(/&gt;/g,'>')));
        foo = bar+foo;
    } catch(e) { foo = e.toString(); }
    a = foo.replace(/\s/g,'');
    b = baz[k][1].replace(/\s/g,'');
    if(a===b) {
        msg = k1+" PASS "+baz[k][0]+"==>"+a+"==="+b;
        unit_pass++;
    } else {
        msg = k1+" FAIL "+baz[k][0]+"==>"+a+"!=="+b;
        unit_fail++;
    }
    console.log(msg);
}
console.log('unit2: '+k1+' tests, '+unit_pass+' pass and '+unit_fail+' fail.');
