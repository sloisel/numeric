_console = { 
    log: function() { 
        var k; 
        for(k=0;k<arguments.length;k++) { 
            if(k>0) { write(' '); } 
            write(arguments[k]); } 
        write('\n');
        if(typeof system !== 'undefined') { system.stdout.flush(); }
    }
};
if(typeof console === "undefined") console = _console;
var myread;
if(typeof system !== "undefined") {
    myread = (function(x) { return new Stream(x).readFile(); });
} else if(typeof read !== "undefined") {
    myread = read;
} else {
    var _fs = require('fs');
    myread = (function(x) { return _fs.readFileSync(x,'utf8') });
    console.log(process.cwd());
}
function XMLHttpRequest() {
    this.response = "";
    this.open = (function(get,url) { this.responseText = myread(url); });
    this.send = (function() {});
}
if(typeof _fs !== "undefined") global.XMLHttpRequest = XMLHttpRequest;
var _foo = myread('./documentation.html');
var _baz = myread('./src/numeric.js');
var _ver = _baz.match(/numeric.version[ =]*"([0-9.]*)".*/)[1];
var _bar = _foo.match(/<pre>[\s\S]*?(?=<\/pre>)/g);
//.join('\n').replace(/<pre>/g,'').split('\nIN> ');
_baz = [];

var _numfile = './lib/numeric-'+_ver+'.js';
var numeric;
if(typeof _fs === "undefined") load(_numfile);
else { numeric = require('../'+_numfile); }
if(typeof numeric === "undefined") { throw new Error("Could not load numeric.js"); }
var _unit_pass = 0, _unit_fail = 0;
var _k1 = 0;
var workshop = {};
var _global = this;
function runner(_bar) {
    var _k,k0=0;
    var _a,_b,_msg;
    var _tmp = {};
    for(_k in _global) _tmp[_k] = true;
    for(_k=0;_k<_bar.length;_k++) {
	var _j = _bar[_k].indexOf('\nOUT>');
	if(_j>0) { _baz[k0] = [_bar[_k].substring(0,_j),_bar[_k].substring(_j+5)]; k0++; }
    }
    for(_k=0;_k<k0;_k++) {
	_k1++;
	_bar = '';
	try {
	    workshop.html = function(x) { _bar += x; }
	    _foo = numeric.prettyPrint(eval(_baz[_k][0].replace(/&lt;/g,'<').replace(/&gt;/g,'>')));
	    _foo = _bar+_foo;
	} catch(_e) { _foo = _e.toString(); }
	_a = _foo.replace(/\s/g,'');
	_b = _baz[_k][1].replace(/\s/g,'');
	if(_a===_b) {
	    _msg = _k1+" PASS "+_baz[_k][0].replace(/\s/g,'')+"==>"+_a+"==="+_b;
	    _unit_pass++;
	} else {
	    _msg = _k1+" FAIL "+_baz[_k][0].replace(/\s/g,'')+"==>"+_a+"!=="+_b;
	    _unit_fail++;
	}
	console.log(_msg);
    }
    for(_k in _global) if(!_tmp[_k]) eval('delete '+_k);
}
var _j;
for(_j=0;_j<_bar.length;_j++) {
    runner(_bar[_j].replace(/<pre>/g,'').split('\nIN> '));
}
console.log('unit2: '+_k1+' tests, '+_unit_pass+' pass and '+_unit_fail+' fail.');
