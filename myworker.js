var _send = (typeof workerPostMessage !== 'undefined')?workerPostMessage:postMessage;
var _myeval = eval;
var _flag = 0;
_onmessage = function(event) {
    var ans, foo, x = JSON.parse(event.data);
    if(typeof x.imports !== "undefined") {
        for(foo=0;foo<x.imports.length;foo++) { importScripts(x.imports[foo]); }
        return;
    }
    try {
        ans = _myeval(x.e);
        current = -1;
        if(typeof(ans) !== "undefined") { foo = numeric.prettyPrint(ans,true); }
        else { foo = ""; }
    } catch(e) {
        ans = undefined;
        foo = e.name+': '+e.message;
        if(typeof e.stack !== "undefined" && typeof e.stack.toString !== "undefined")
        { foo += "\n\n"+e.stack.toString(); }
        foo = foo.replace(/&/g,'&amp;').replace(/>/g,'&gt;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
    }
    _send(JSON.stringify({k:x.k,n:x.n,o:foo}));
}
if(typeof _retarded === "undefined") { onmessage = _onmessage; }
