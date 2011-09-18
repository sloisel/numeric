"use strict";
var fs = require('fs');
var foo = fs.readFileSync('../lib/numeric.js').toString();
var bar = foo.match(/(@example[\s\S]*?(?=\n[\s]*\*))|(<pre>[\s\S]*?(?=<\/pre>))/g).join('\n').replace(/(@example)|(<pre>)/g,'').split('\n> ')
var baz = [];
var k,k0=0;
for(k=0;k<bar.length;k++) {
    var j = bar[k].indexOf('\n');
    if(j>0) { baz[k0] = [bar[k].substring(0,j),bar[k].substring(j+1)]; k0++; }
}

var numeric = require('../lib/numeric.js');
//var unit1 = numeric.test();
//var unit_pass = unit1.unit_pass, unit_fail = unit1.unit_fail;
var unit_pass = 0, unit_fail = 0;
var a,b,msg;
var k1 = 0;
for(k=0;k<k0;k++) {
    k1++;
    try {
        foo = numeric.prettyPrint(eval(baz[k][0]));
        if(typeof(foo) == "undefined") foo="undefined";
    } catch(e) { foo = e.toString(); }
    a = foo.replace(/\s/g,'');
    b = baz[k][1].replace(/\s/g,'');//.replace(/NaN/g,'null').replace(/-Infinity/g,'null').replace(/Infinity/g,'null');
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
