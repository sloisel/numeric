var _send = (typeof workerPostMessage !== 'undefined')?workerPostMessage:postMessage;
var _myeval = eval;
var _flag = 0;
var workshop = (typeof workshop === "undefined")?{}:workshop;
workshop.plot = function(p,o,s) {
    _send(JSON.stringify({k:workshop.current.k,n:workshop.current.n,p:p,o:o,s:s}));
}
workshop.html = function(o) {
    _send(JSON.stringify({k:workshop.current.k,n:workshop.current.n,o:o}));
}

var console;
if(!console) console = {};
console.log = function() {
    var k,n=arguments.length;
    var _x = workshop.current;
    if(_x) {
        for(k=0;k<n;k++) {
            if(k>0) _send(JSON.stringify({k:_x.k,n:_x.n,o:' '}));
            _send(JSON.stringify({k:_x.k,n:_x.n,o:numeric.prettyPrint(arguments[k])}));
        }
    }
    _send(JSON.stringify({k:_x.k,n:_x.n,o:'\n'}));
}

_onmessage = function(event) {
    var _ans, _foo, _x = JSON.parse(event.data);
    if(typeof _x.imports !== "undefined") {
        for(_foo=0;_foo<_x.imports.length;_foo++) { importScripts(_x.imports[_foo]); }
        return;
    }
    try {
        workshop.current = {k:_x.k, n:_x.n};
        _ans = _myeval(_x.e);
        if(typeof(_ans) !== "undefined") { _foo = numeric.prettyPrint(_ans,true); }
        else { _foo = ""; }
        workshop.current = undefined;
    } catch(e) {
        _ans = undefined;
        _foo = e.name+': '+e.message;
        if(typeof e.stack !== "undefined" && typeof e.stack.toString !== "undefined")
        { _foo += "\n\n"+e.stack.toString(); }
    }
    _foo = _foo.replace(/&/g,'&amp;').replace(/>/g,'&gt;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
    _send(JSON.stringify({k:_x.k,n:_x.n,o:_foo}));
}
if(typeof _retarded === "undefined") { onmessage = _onmessage; }
