var epsilon;
function mkeps() {
    epsilon = 1;
    while(1+epsilon>1) { epsilon *= 0.5; }
    epsilon *=2;
    my.epsilon = epsilon;
}
mkeps();

function size(x) {
    var ret = [];
    while(typeof x !== "number") {
        if(x instanceof Array) {
            ret.push(x.length);
            if(x.length === 0) { return ret; }
            x = x[0];
        }
        else { throw new Error("Malformed tensor (parameter must be a number or an array)"); }
    }
    return ret;
}
function checkTensor(x,s) {
    function z(x,k) {
        var i;
        if(k === s.length) {
            if(typeof x === "number") { return }
            else throw new Error("Malformed tensor (heterogeneous)");
        }
        if(!(x instanceof Array) || x.length !== s[k]) { throw new Error("Malformed tensor (mismatched sizes)"); }
        for(i=0;i<x.length;i++) {
            z(x[i],k+1);
        }
    }
    z(x,0);
}
function mkv(x) {
    var ret = [];
    function f(x) {
        if(typeof x === "number") { ret.push(x); return; }
        var i;
        for(i=0;i<x.length;i++) {
            f(x[i]);
        }
    }
    f(x);
    return ret;
}
var _digits=4, dig0 = 10000;
/**
     * Read and set the number of significant digits used by {@link numeric.prettyPrint}().
     *
     * If the optional parameter d is provided,
     * the new number of significant digits is set to d. If the optional
     * parameter d is omitted, the number
     * of significant digits is left unchanged.
     * 
     * @param {Number} [d] The optional number of digits
     * @returns The current number of significant digits.
     * @example
> numeric.digits(4)
4
> x = 3.14159265459
3.142
> numeric.digits(10)
10
> x
3.141592655
> numeric.digits(4)
4
> x
3.142
> numeric.digits()
4
     */
function digits(d) {
    if(typeof d === "number") { 
        if(d<1 || Math.round(d)!=d || d>100) { throw new Error("Number of digits must be an integer between 1 and 100."); }
        _digits = d; dig0 = Math.pow(10,d);
    }
    return _digits;
}
my.digits = digits;
function fmtnum(x) {
    var ret = x.toPrecision(_digits);
    if(x === Number(ret)) {
        ret = x.toString();
    }
    while(ret.length < _digits+6) { ret = ret+" "; }
    return ret;
}
function S(z) { if(!isS(z)) { throw new Error("Parameter must be scalar."); } return z;}
/**
     * Creates a vector of consecutive values
     * 
     * @example
> numeric.run(3)
t([0,1,2])
> numeric.run(1,3)
t([1,2])
> numeric.run(1,1)
t([])
> numeric.run(1,2,9)
t([1,3,5,7])
     */
function run() {
    var a,by,b;
    if(arguments.length === 1) { a=0; by=1; b=S(t(arguments[0])).x[0]; }
    else if(arguments.length === 2) { a=S(t(arguments[0])).x[0]; by=1; b=S(t(arguments[1])).x[0]; }
    else if(arguments.length === 3) { a=S(t(arguments[0])).x[0]; by=S(t(arguments[1])).x[0]; b=S(t(arguments[2])).x[0]; }
    else { throw new Error("Incorrect number of arguments"); }
    var foo = _run(a,by,b);
    return mkT([foo.length],foo);
}
my.run = run;

/**
     * Repeats a given number to create a tensor.
     *
     * @example
> numeric.rep(5)
t(5)
> numeric.rep(3,2)
t([2,2,2])
> numeric.rep(3,numeric.t(5,4))
t([5,5,5],[4,4,4])
> numeric.rep(3,3,1)
t([[1,1,1],[1,1,1],[1,1,1]])
     */
function rep() {
    var s = [], i, n=arguments.length-1, sz = 1, x=[],y;
    for(i=0;i<n;i++) { s[i] = S(t(arguments[i])).x[0]; sz*=s[i]; }
    var foo = S(t(arguments[n]));
    var bar = foo.x[0];
    for(i=0;i<sz;i++) { x[i] = bar; }
    if(typeof foo.y === "undefined") { return mkT(s,x); }
    y = [];
    bar = foo.y[0];
    for(i=0;i<sz;i++) { y[i] = bar; }
    return mkT(s,x,y);
}
my.rep = rep;

function V(z) { if(!isV) { throw new Error("Parameter must be a vector"); } return z; }
/**
     * Creates a diagonal matrix
     * 
     * @example
> numeric.diag([1,2,3])
t([[1,0,0],
   [0,2,0],
   [0,0,3]])
> numeric.diag([[1,2,3,4],[5,6,7,8]],[0,2],5,8)
t([[1,0,5,0,0,0,0,0],
   [0,2,0,6,0,0,0,0],
   [0,0,3,0,7,0,0,0],
   [0,0,0,4,0,8,0,0],
   [0,0,0,0,0,0,0,0]])
     */
function diag(v,o,m,n) {
    v = t(v);
    if(!isM(v)) {
        if(!isV(v)) { throw new Error("v must be a vector or a matrix"); }
        if(typeof v.y === "undefined") { v = mkT([1,v.s[0]],v.x.slice(0)); }
        else { v = mkT([1,v.s[0]],v.x.slice(0),v.y.slice(0)); }
    }
    var p = v.s[0], q = v.s[1];
    if(typeof o === "undefined") {
        o = run(p);
    } else {
        o = t(o);
        if(isS(o)) { o = mkT([1],o.x); }
        if(!isV(o)) { throw new Error("o must be a vector"); }
    }
    if(o.s[0] !== p) { throw new Error("v and o must have matching dimensions"); }
    if(typeof m === "undefined") { m = q; } else { m = S(t(m)).x[0]; }
    if(typeof n === "undefined") { n = q; } else { n = S(t(n)).x[0]; }
    var i,j,k,o1,o2,i0,j0,x = v.x,y = v.y, ret;
    if(typeof y === "undefined") { ret = rep(m,n,0); }
    else { ret = rep(m,n,t(0,0)); }
    for(i=0;i<p;i++) {
        if(o.x[i]<0) { i0 = -o.x[i]; j0 = 0; }
        else { i0 = 0; j0 = o.x[i]; }
        k = Math.min(m - i0, n - j0, q);
        o1 = i0*n+j0;
        o2 = i*q;
        for(j=0;j<k;j++) {
            ret.x[o1] = x[o2];
            if(typeof y !== "undefined") { ret.y[o1] = y[o2]; }
            o1 += n+1;
            o2++;
        }
    }
    return ret;
}
my.diag = diag;

/*
 * FIXME: The functions T0$, T0set, T1$, ..., Tnset have evolved organically. They were
 * meant to be high performance, special-case optimized functions that would quickly access
 * entries of tensors but because of all the "indirections", they are now fairly slow. They should
 * be rewritten for efficiency.
 */
function _run(a,by,b) {
    var k,ret=[];
    for(k=a;k<b;k+=by) { ret.push(k); }
    return ret;
}

var T1set = function() {
    if(arguments.length !== 2) { throw new Error("Vectors need exactly one index"); }
    var bar = t(arguments[1]);
    var x0 = bar.x, i,j, y0 = bar.y, x1 = this.x, y1 = this.y, n = x1.length ;
    var foo = (arguments[0] === null)?run(n):t(arguments[0]), k=foo.x;
    if(foo.s[0] === 0) { return this; }
    if(!samev(foo.s,bar.s)) { throw new Error("set: indexing and value tensors must be of the same size"); }
    for(i=0;i<k.length;i++) {
        j = k[i];
        if(j<0 || j>=n) { throw new Error("Index out of bounds"); }
        x1[j] = x0[i];
    }
    if(typeof y0 === "undefined") {
        if(typeof y1 !== "undefined") {
            for(i=0;i<k.length;i++) {
                j = k[i];
                if(j<0 || j>=n) { throw new Error("Index out of bounds"); }
                y1[j] = 0;
            }
        }
    } else {
        if(typeof y1 === "undefined") {
            this.y = [];
            y1 = this.y;
            for(i=0;i<n;i++) { y1[i] = 0; }
        }
        for(i=0;i<k.length;i++) {
            j = k[i];
            if(j<0 || j>=n) { throw new Error("Index out of bounds"); }
            y1[j] = y0[i];
        }
    }
    return this;
}
var T2$ = function(z,args) {
    if(args.length === 3) { return T2set.call(z,args[0],args[1],args[2]); }
    if(args.length !== 2) { throw new Error("Matrices need exactly two indexes"); }
    var m = z.s[0], n = z.s[1], j, k, foo, s=[];
    if(args[0] === null) { j = _run(0,1,m); s.push(m); }
    else { 
        foo = t(args[0]);
        j = foo.x;
        if(!isS(foo)) { 
            s.push(j.length);
        }
    }
    if(args[1] === null) { k = _run(0,1,n); s.push(n); }
    else { 
        foo = t(args[1]);
        k = foo.x;
        if(!isS(foo)) { 
            s.push(k.length);
        }
    }
    function f(z) {
        var p,q,a,b,ret=[],offset;
        for(p=0;p<j.length;p++) {
            a = j[p];
            if(a<0 || a>= m) { throw new Error("Index out of bounds"); }
            offset = a*n;
            for(q=0;q<k.length;q++) {
                b = k[q];
                if(b<0 || b>= n) { throw new Error("Index out of bounds"); }
                ret.push(z[offset+b]);
            }
        }
        return ret;
    }
    if(typeof z.y === "undefined") { return mkT(s,f(z.x)); }
    return mkT(s,f(z.x),f(z.y));
}
var T2set = function() {
    if(arguments.length!==3) { throw new Error("Matrices need exactly two indexes"); }        
    var m = this.s[0], n = this.s[1];
    var is0 = (arguments[0]===null)?run(m):t(arguments[0]),
        js0 = (arguments[1]===null)?run(n):t(arguments[1]),
        vs = t(arguments[2]);
    var is = is0.x;
    var js = js0.x;
    var p = is.length, q = js.length, s=[];

    if(!isS(is0)) { 
        if(is0.s[0] === 0) { return this; }
        if(!isV(is0)) { throw new Error("set: index must be scalar or vector"); } 
        s.push(p);
    }
    if(!isS(js0)) { 
        if(js0.s[0] === 0) { return this; }
        if(!isV(js0)) { throw new Error("set: index must be scalar or vector"); }
        s.push(q);
    }
    if(!samev(s,vs.s)) { throw new Error("set: indexing and value tensors must be of matching sizes"); }
    var vx = vs.x, x = this.x;
    var i,j, off1, off2, count;
    count = 0;
    for(i=0;i<p;i++) {
        off1 = is[i]*n;
        for(j=0;j<q;j++) {
            x[off1+js[j]] = vx[count];
            count++;
        }
    }
    count=0;
    if(typeof vs.y !== "undefined") {
        if(typeof this.y === "undefined") { this.y = mka(x.length,0); }
        var y = this.y, vy = vs.y;
        for(i=0;i<p;i++) {
            off1 = is[i]*n;
            for(j=0;j<q;j++) {
                y[off1+js[j]] = vy[count];
                count++;
            }
        }
    } else if(typeof this.y !== "undefined") {
        var y = this.y;
        for(i=0;i<p;i++) {
            off1 = is[i]*n;
            off2 = i*q;
            for(j=0;j<q;j++) {
                y[off1+js[j]] = 0;
            }
        }
    }
    return this;
}
var Tn$ = function(z,args) {
    if(args.length === z.s.length+1) { return Tnset.apply(z,args); }
    if(args.length!==z.s.length) { throw new Error("Incorrect number of indices"); }
    var s=[],k=[],i,muls=[],m0=1,s0 = z.s, foo;
    for(i=args.length-1;i>=0;i--) {
        if(args[i] === "null") { k[i] = _run(0,1,s0[i]); s.push(k[i].length); }
        else { 
            foo = t(args[i]);
            k[i] = foo.x;
            if(!isS(foo)) { s.push(k[i].length); }
        }
        muls[i] = m0;
        m0 *= z.s[i];
    }
    function f(z) {
        var ret=[];
        function g(i,offset) {
            if(i === k.length) {
                ret.push(z[offset]);
                return;
            }
            var foo = k[i],j,l;
            for(j=0;j<foo.length;j++) {
                l = foo[j];
                if(l<0 || l>= s0[i]) { throw new Error("Index out of bounds"); }
                g(i+1,offset+l*muls[i]);
            }
        }
        g(0,0);
        return ret;
    }
    if(typeof z.y === "undefined") { return mkT(s,f(z.x)); }
    return mkT(s,f(z.x),f(z.y));
}
var Tnset = function() {
    var is = [], k, s=[], s0 = this.s, n=s0.length, muls=[], mul=1, foo, an;
    if(arguments.length !== n+1) { throw new Error("set: Incorrect number of indices"); }
    for(k=0;k<n;k++) {
        if(arguments[k] === null) {
            is[k] = _run(0,1,s0[k]);
        } else {
            foo = t(arguments[k]);
            is[k] = foo.x;
            if(!isS(foo)) {
                if(!isV(foo)) { throw new Error("set: Index must be a vector or a scalar"); }
                s.push(foo.x.length);
            }
        }
    }
    an = t(arguments[n]);
    if(!samev(s,an.s)) { throw new Error("set: indexing and size of values has to match"); }
    for(k=n-1;k>=0;k--) {
        muls[k] = mul;
        mul *= s0[k];            
    }
    function g(z,h) {
        var count = 0;
        function f(k,offset) {
            if(k===n) {
                z[offset] = h(count);
                count++;
                return;
            }
            var i,foo = is[k], bar;
            for(i=0;i<is[k].length;i++) {
                bar = foo[i];
                if(bar < 0 || bar > s0[k]) {
                    throw new Error("set: Index out of bounds");
                }
                f(k+1,offset+muls[k]*is[k][i]);
            }
        }
        f(0,0);
    }
    foo = an.x;
    g(this.x,function (i) { return foo[i]; });
    if(typeof an.y === "undefined") {
        if(typeof this.y !== "undefined") {
            g(this.x,function (i) { return 0; });
        }
    } else {
        if(typeof this.y === "undefined") { this.y = mka(this.x.length); }
        foo = an.y;
        g(this.y,function(i) { return foo[i]; });
    }
    return this;
}
function mkT(s,x,y) {
    var ret;
    function mk$($) { 
        function Tensor() { return $(Tensor,arguments); }
        return Tensor;
    }
    if(s.length === 0) { 
        return (function () {
            function Tensor(z) {
                if(typeof z === "undefined") { return Tensor; }
                if(typeof z === "number") { z = [z]; }
                if(z instanceof Array) {
                    Tensor.x = z;
                    if(typeof Tensor.y !== "undefined") { delete Tensor.y; }
                    return Tensor;
                }
                Tensor.x = z.x;
                if(typeof Tensor.y === "undefined") {
                    if(typeof z.y === "undefined") { return Tensor; }
                    Tensor.y = z.y;
                    return Tensor;
                }
                if(typeof z.y === "undefined") { delete Tensor.y; }
                Tensor.y = z.y;
                return Tensor;
            }
            Tensor.s = s;
            Tensor.x = x;
            if(typeof y !== "undefined") { Tensor.y = y; }
            return Tensor;
        }());
    }
    else if(s.length === 1) { 
        return (function () {
            function Tensor(z,w) {
                if(typeof w !== "undefined") { return T1set.call(Tensor,z,w); }
                var s,k,n = Tensor.s[0], foo;
                if(z === null) { k = _run(0,1,n); s = [n]; }
                else {
                    foo = t(z);
                    k = foo.x;
                    if(!isS(foo)) { s=[k.length]; }
                    else { s = []; }
                }
                function f(z) {
                    var i,j,ret=[];
                    for(i=0;i<k.length;i++) {
                        j = k[i];
                        if(j<0 || j>= n) { throw new Error("Index out of bounds"); }
                        ret.push(z[j]);
                    }
                    return ret;
                }
                if(typeof Tensor.y === "undefined") { return mkT(s,f(Tensor.x)); }
                return mkT(s,f(Tensor.x),f(Tensor.y));
            }
            Tensor.s = s;
            Tensor.x = x;
            if(typeof y !== "undefined") { Tensor.y = y; }
            return Tensor;
        }());
    }
    else if(s.length === 2) { ret = mk$(T2$); }
    else { ret = mk$(Tn$); }
    ret.s = s;
    ret.x = x;
    if(typeof y !== "undefined") { ret.y = y; }
    return ret;
}

/**
 * Converts a tensor into arrays.
 * 
 * @example
> numeric.toArray(numeric.rep(2,3,5))
[ [ 5,5,5 ],
  [ 5,5,5 ] ]
 * @param v
 * @returns
 */
function toArray(v) {
    v = R(t(v));
    if(isS(v)) { return v.x[0]; }
    var count = 0;
    function f(k) {
        if(k === v.s.length) { return v.x[count++]; }
        var i,ret = [];
        for(i=0;i<v.s[k];i++) {
            ret[i] = f(k+1);
        }
        return ret;
    }
    return f(0);
}
my.toArray = toArray;

function set() {
    var x = t(arguments[0]);
    if(x.s.length + 2 !== arguments.length) { throw new Error("set: incorrect number of indices"); }
    if(x.s.length === 0) { return x(arguments[1]); }
    else if(x.s.length === 1) { return x(arguments[1],arguments[2]); }
    else if(x.s.length === 2) { return T2set.call(x,arguments[1],arguments[2],arguments[3]); }
    else { return Tnset.apply(x,Array.prototype.slice.call(arguments,1)); }
}
my.set = set;

/**
 * Checks whether x is a tensor.
 * @example
> numeric.isT(1)
false
> numeric.isT(numeric.t(0))
true
     */
function isT() {};
if(typeof set.name === "undefined") {
    /** @ignore */ isT = function(x) { return x instanceof Function && x.s instanceof Array; }
} else {
    /** @ignore */ isT = function(x) { return x.name === "Tensor"; }
}
my.isT = isT;
/**
     * Checks whether x is an order 0 tensor (a scalar).
     * @example
> numeric.isS(1)
false
> numeric.isS(numeric.t(1))
true
> numeric.isS(numeric.t([1,2]))
false
> foo = numeric.t(1); numeric.set(foo,numeric.t(2,1)); foo
t(2,1)
     */
function isS(x) { return (isT(x) && x.s.length === 0); } //return x.__proto__ === T0; }
my.isS = isS;
/**
     * Checks whether x is an order 1 tensor (a vector)
     * @example
> numeric.isV(numeric.t(1))
false
> numeric.isV(numeric.t([1,2]))
true
     */
function isV(x) { return isT(x) && x.s.length === 1; } //return x.__proto__ === T1; }
my.isV = isV;
/**
     * Checks whether x is an order 2 tensor (a matrix)
     * @example
> numeric.isM(numeric.t(1))
false
> numeric.isM(numeric.t([1,2]))
false
> numeric.isM(numeric.t([[1,2],[3,4]]))
true
     */
function isM(x) { return isT(x) && x.s.length === 2; } //return x.__proto__ === T2; }
my.isM = isM;

/**
     * Create a real or complex tensor.
     * 
     * @example
> numeric.t(0)
t(0)
> numeric.t([0,1])
t([0,1])
> numeric.t([[0,1],[2,3]])
t([[0,1],
   [2,3]])
> numeric.t(0,1)
t(0,1)
> numeric.t("hello")
Error: Malformed tensor (parameter must be a number or an array)
> numeric.t([[1,2],[3,4]],[3,4])
Error: The real and imaginary parts must be tensors of the same dimensions
> numeric.t(1)()
t(1)
> numeric.t(1,2)()
t(1,2)
> numeric.t([3,4])(0)
t(3)
> numeric.t([3,4],[5,6])(1)
t(4,6)
> numeric.t([[1,2],[3,4]])(0,1)
t(2)
> numeric.t([[1,2,3],[4,5,6],[7,8,9]])([0,1],[1,2])
t([[2,3],[5,6]])
> numeric.t([[[1,2],[3,4]],[[5,6],[7,8]]])(1,1,1)
t(8)
     */
function t(x,y) {
    if(isT(x)) { return x; }
    var sx = size(x), sy = (typeof y === "undefined")?undefined:size(y),i;
    checkTensor(x,sx);
    if(typeof y !== "undefined") {
        checkTensor(y,sy);
        if(!samev(sx,sy)) { throw new Error("The real and imaginary parts must be tensors of the same dimensions");} 
    }
    if(typeof y !== "undefined") { return mkT(sx,mkv(x),mkv(y)); }
    else { return mkT(sx,mkv(x)); }
}
my.t = t;

var i = t(0,1);
my.i = i;

/**
     * Deep copy of a tensor
     * 
     * @example
> numeric.copy(numeric.t(0))
t(0)
> var foo = numeric.t([1,2],[3,4]), bar = numeric.copy(foo); bar.s[0]=0; bar.x[0]=0; bar.y[0]=0; foo
t([1,2],
  [3,4])
     */
function copy(x) {
    x = t(x);
    if(typeof x.y === "undefined") { return mkT(x.s.slice(0),x.x.slice(0)); }
    return mkT(x.s.slice(0),x.x.slice(0),x.y.slice(0));
}
my.copy = copy;

function mkf(x) {
    var foo;
    if(x.length === 1) {
        foo = x[0];
        return function(i) { return foo; }
    }
    return function(i) { return x[i]; }
}
function mka(n,v) {
    var ret = [],i;
    for(i=0;i<n;i++) { ret[i] = v; }
    return ret;
}

/**
 * The vec function returns a vector representation of a tensor.
 * 
 * @example
> numeric.vec([[1,2],[3,4]])
t([1,2,3,4])
 */
function vec(v) {
    v = t(v);
    if(typeof v.y === "undefined") { return mkT([v.x.length],v.x); }
    return mkT([v.x.length],v.x,v.y);
}
my.vec = vec;

/**
     * Reshapes a tensor.
     * 
     * @example
> numeric.reshape([[1,2],[3,4]],[4])
t([1,2,3,4])
> numeric.reshape(numeric.t([1,2],[3,4]),[2,1])
t([[1],[2]],[[3],[4]])
     */
function reshape(v,s) {
    v = t(v);
    s = V(t(s));
    var m = 1, i;
    for(i=0;i<s.x.length;i++) { m *= s.x[i]; }
    if(m !== v.x.length) { throw new Error("reshaped tensor must have the same number of entries as the input tensor"); }
    if(typeof v.y === "undefined") { return mkT(s.x,v.x); }
    return mkT(s.x,v.x,v.y);
}
my.reshape = reshape;

function M(z) { if(!isM(z)) { throw new Error("Parameter must be a matrix"); } return z;}

/**
 * Sums all the entries
 * 
 * @example
> numeric.sum([1,2,3]);
t(6)
> numeric.sum(numeric.t([1,2],[3,4]))
t(3,7)
 * @param v
 * @returns
 */
function sum(v) {
    v = t(v);
    var i, x0=v.x, x1=0, n=v.s[0];
    for(i=0;i<n;i++) x1 += x0[i];
    if(typeof v.y === "undefined") { return mkT([],[x1]); }
    var y0=v.y, y1=0;
    for(i=0;i<n;i++) y1 += y0[i];
    return mkT([],[x1],[y1]);
}
my.sum = sum;

/**
 * Multiplies all the entries
 * 
 * @example
> numeric.prod([1,2,3]);
t(6)
> numeric.prod(numeric.t([1,2],[3,4]))
t(-10,10)
 * @param v
 * @returns
 */
function prod(v) {
    v = t(v);
    var i, x0=v.x, x1=1, n=v.s[0];
    if(typeof v.y === "undefined") { 
        for(i=0;i<n;i++) x1 *= x0[i];
        return mkT([],[x1]);
    }
    var y0=v.y, y1=0, foo;
    for(i=0;i<n;i++) {
        foo = x1*x0[i] - y1*y0[i];
        y1 = x1*y0[i] + y1*x0[i];
        x1 = foo;
    }
    return mkT([],[x1],[y1]);
}
my.prod = prod;

/**
     * The imaginary part of x.
     * 
     * @example
> numeric.imag(1) 
t(0)
> numeric.imag(numeric.t(2,3))
t(3)
> numeric.imag(numeric.t([2,3],[4,5]))
t([4,5])
     */
function imag(x) {
    x = t(x);
    if(typeof x.y === "undefined") {
        return mkT(x.s,mka(x.x.length,0));
    }
    return mkT(x.s,x.y);
}
my.imag = imag;

/**
     * The root-mean-square norm of v.
     * 
     * @example
> numeric.norm2([3,4])
t(5)
> numeric.norm2(numeric.t(3,4))
t(5)
> numeric.norm2([[1,2],[3,4]])
t(5.477)
     */
function norm2(v) {
    v = t(v);
    var ret=0;
    var i, n=v.x.length, foo = v.x;
    for(i=0;i<n;i++) { ret += foo[i]*foo[i]; }
    if(typeof v.y === "undefined") { return t(Math.sqrt(ret)); }
    foo = v.y;
    for(i=0;i<n;i++) { ret += foo[i]*foo[i]; }
    return t(Math.sqrt(ret));
}
my.norm2 = norm2;

function house(x) {
    x = t(x);
    var foo = abs(x(0)), alpha;
    if(foo.x[0] === 0) { alpha = 1; }
    else { alpha = mul(div(conj(x(0)),foo),norm2(x)); }
    var v = copy(x);
    set(v,0,add(v(0),alpha));
    foo = norm2(v);
    if(foo.x[0] === 0) { foo = 1; }
    v = div(v,foo);
    var w = dot(conj(x),v);
    if(abs(w).x[0] === 0) { w = t(0); }
    else { w = add(div(w,conj(w)),1); }
    return [v,w];
}


function shift(a,b,c,d) {
    var disc = mul(sqrt(add(mul(sub(a,d),sub(a,d)),mul(b,c,4))),0.5),
        rp = mul(add(a,d),0.5),
        z1 = add(rp,disc), z2 = sub(rp,disc);
    if(abs(sub(z1,d)) < abs(sub(z2,d))) { return z1; }
    return z2;
}

function qrstep(x,q) {
    var i,j, m=x.s[0], n=x.s[1], s, foo;
    var idx;
    i = 0;
    idx = run(i,n);
    foo = x(idx,i);
    set(foo,i,sub(foo(i),shift(x(m-2,n-2),x(m-2,n-1),x(m-1,n-2),x(m-1,n-1))));
    foo = house(foo);
    var v = foo[0], w = foo[1];
    set(x,idx,null,sub(x(idx,null),mul(w,tensor(v,dot(conj(v),x(idx,null))))));
    set(x,null,idx,sub(x(null,idx),mul(conj(w),tensor(dot(x(null,idx),v),conj(v)))));
    set(q,idx,null,sub(q(idx,null),mul(w,tensor(v,dot(conj(v),q(idx,null))))));
    for(i=0;i<n-2;i++) {
        for(s=m;s>0;s--) { if(!same(x(s-1,i),t(0))) { break; } }
        idx = run(i+1,s);
        
        foo = house(x(idx,i));
        v = foo[0]; w = foo[1];
        if(w!==0) {
            set(x,idx,null,sub(x(idx,null),mul(w,tensor(v,dot(conj(v),x(idx,null))))));
            set(x,null,idx,sub(x(null,idx),mul(conj(w),tensor(dot(x(null,idx),v),conj(v)))));
            set(q,idx,null,sub(q(idx,null),mul(w,tensor(v,dot(conj(v),q(idx,null))))));
            idx = run(i+2,m);
            set(x,idx,i,rep(m-i-2,0));
        }
    }
    return [x,q];
}
/**
     * Concatenate vectors
     * 
     * @example
> numeric.cat([1,2],[3,4])
t([1,2,3,4])
> numeric.cat(numeric.t([1,2],[3,4]),numeric.t([5,6],[7,8]))
t([1,2,5,6],[3,4,7,8])
     */
function cat() {
    var i, j, x = [], y, foo, fx,fy,count;

    count = 0;
    for(i=0;i<arguments.length;i++) {
        foo = V(t(arguments[i]));
        fx = foo.x;
        if(typeof foo.y === "undefined") {
            if(typeof y === "undefined") {
                for(j=0;j<fx.length;j++) {
                    x[count] = fx[j];
                    count++;
                } 
            } else {
                for(j=0;j<fx.length;j++) {
                    x[count] = fx[j];
                    y[count] = 0;
                    count++;
                }
            }
        } else {
            if(typeof y === "undefined") {
                y = [];
                for(j=0;j<x.length;j++) { y[j] = 0; }
            }
            fy = foo.y;
            for(j=0;j<fx.length;j++) {
                x[count] = fx[j];
                y[count] = fy[j];
                count++;
            }
        }
    }
    if(typeof y === "undefined") { return mkT([count],x); }
    return mkT([count],x,y);
}
my.cat = cat;

function getDiag(z) {
    z = M(t(z));
    var m = z.s[0], n = z.s[1], p = Math.min(m,n), i, cursor=0, x = [], y, zx = z.x, zy = z.y;
    if(typeof zy === "undefined") {
        for(i=0;i<p;i++) {
            x[i] = zx[cursor];
            cursor += n+1;
        }
        return mkT([p],x);
    }
    y = [];
    for(i=0;i<p;i++) {
        x[i] = zx[cursor];
        y[i] = zy[cursor];
        cursor += n+1;
    }
    return mkT([p],x,y);
}
my.getDiag = getDiag;

/**
     * Returns a random tensor of the given size
     * 
<pre >
> numeric.random(3)
t([0.4634,0.5045,0.9151])
> numeric.random(2,3)
t([[0.1842,0.6654,0.2150],[0.7031,0.5135,0.6912]])
> numeric.random()
t(0.8617)
</pre>
     */
function random() {
    var s = Array.prototype.slice.apply(arguments,[0]);
    var i,n = 1;
    for(i=0;i<s.length;i++) { n*=s[i]; }
    var x = [];
    for(i=0;i<n;i++) { x[i] = Math.random(); }
    return mkT(s,x);
}
my.random = random;

/**
     * Returns the lower triangular portion of a matrix.
     * 
     * @example
> numeric.lower([[1,2,3,4],[4,5,6,7],[7,8,9,3]])
t([[1,0,0,0],
   [4,5,0,0],
   [7,8,9,0]])
> numeric.lower([[1,2,3,4],[4,5,6,7],[7,8,9,3]],-1)
t([[0,0,0,0],
   [4,0,0,0],
   [7,8,0,0]])
     */
function lower(A,k) {
    A = M(t(A));
    var i,j, m = A.s[0], n = A.s[1], ret = rep(m,n,0);
    if(typeof k === "undefined") { k = 0; }
    for(i=0;i<m;i++) {
        for(j=0;j<=Math.min(i+k,n-1);j++) {
            set(ret,i,j,A(i,j));
        }
    }
    return ret;
}
my.lower = lower;
/**
     * Returns the lower triangular portion of a matrix.
     * 
     * @example
> numeric.upper([[1,2,3,4],[4,5,6,7],[7,8,9,3]])
t([[1,2,3,4],
   [0,5,6,7],
   [0,0,9,3]])
> numeric.upper([[1,2,3,4],[4,5,6,7],[7,8,9,3]],-1)
t([[1,2,3,4],
   [4,5,6,7],
   [0,8,9,3]])
     */
function upper(A,k) {
    A = M(t(A));
    var i,j, m = A.s[0], n = A.s[1], ret = rep(m,n,0);
    if(typeof k === "undefined") { k = 0; }
    for(i=0;i<m;i++) {
        for(j=Math.max(i+k,0);j<n;j++) {
            set(ret,i,j,A(i,j));
        }
    }
    return ret;
}
my.upper = upper;

/**
     * Sorts a vector.
     * 
     * @example
> numeric.sortVector([3,1,4,2,7])
t([1,2,3,4,7])
     */
function sortVector(z) {
    z = V(t(z));
    var o = [], i, x = z.x, y = z.y;
    for(i=0;i<z.x.length;i++) { o[i] = i; }
    o.sort(typeof z.y === "undefined"?
            function (a,b) { return x[a] - x[b]; }:
            function (a,b) { if(x[a] > x[b]) return 1; if(x[a] < x[b]) return -1; return y[a]-y[b]; });
    return z(o);
}
my.sortVector = sortVector;

/**
 * Assembles a block tensor
 * 
 * @example
> numeric.block([2,3],[[1,2],[3,4]],[[5],[5.5]],[[6,7,8],[9,10,11]],[[12,13]],[[14]],[[15,16,17]])
t([[1, 2, 5,  6, 7, 8 ],
   [3, 4, 5.5,9, 10,11],
   [12,13,14, 15,16,17]])
 * @returns {Array}
 */
function block() {
    var z = arguments;
    var n = z.length;
    var s = V(R(t(z[0])));
    var params = [];
    var count = 1;
    var sx = s.x;
    var sizes = [],idx = [], total = [];
    var muls = [];
    var i,j, foo, ret, count = 1;
    function f(k) {
        if(k === sx.length) {
            params[k] = z[count];
            ret.apply(this,params);
            count++;
            return;
        }
        var i;
        for(i=0;i<sx[k];i++) {
            params[k] = idx[k][i];
            f(k+1);
        }
    }
    if(prod(s).x[0] !== n-1) { throw new Error("block: number of blocks must match the size"); }
    for(i=1;i<z.length;i++) { 
        z[i] = t(z[i]);
        if(z[i].s.length !== z[1].s.length) {
            throw new Error("block: all blocks must have the same tensor order");
        }
    }
    muls[sx.length-1] = 1; 
    for(i=sx.length-1;i>0;i--) {
        muls[i-1] = muls[i] * sx[i];
    }
    for(i=0;i<sx.length;i++) {
        sizes[i] = [];
        idx[i] = [];
        foo = 0;
        for(j=0;j<sx[i];j++) {
            sizes[i][j] = z[1+j*muls[i]].s[i];
            idx[i][j] = run(foo,foo+sizes[i][j]);
            foo += sizes[i][j];
        }
        total[i] = foo;
    }
    total[i] = 0;
    ret = rep.apply(this,total);
    f(0);
    return ret;
}
my.block = block;
