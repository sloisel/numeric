/*
<pre>
> 1
1 
</pre>
 */

numeric.precision = 4;

numeric.prettyPrint = function(x) {
    var ret = [];
    function foo(x) {
        var k;
        if(typeof x === "undefined") { ret.push(""); return false; }
        if(typeof x === "string") { ret.push('"'+x+'"'); return false; }
        if(typeof x === "boolean") { ret.push(x.toString()); return false; }
        if(typeof x === "number") { 
            var a = x.toPrecision(numeric.precision);
            var b = x.toString();
            var bar;
            if(b.length <= a.length) bar = b;
            else bar = a;
            ret.push(Array(numeric.precision+6-bar.length).join(' '));
            ret.push(bar);
            return false;
        }
        if(typeof x === null) { ret.push("null"); return false; }
        if(typeof x === "function") { ret.push(x.toString().replace(/&/g,'&amp;').replace(/>/g,'&gt;').replace(/</g,'&lt;').replace(/"/g,'&quot;')); }
        if(x instanceof Array) {
            var flag = false;
            ret.push('[');
            for(k=0;k<x.length;k++) { if(k>0) { ret.push(','); if(flag) ret.push('\n '); } flag = foo(x[k]); }
            ret.push(']');
            return true;
        }
        for(k in x) { if(x.hasOwnProperty(k)) { ret.push(k); ret.push(': '); foo(x[k]); } }
        return false;
    }
    foo(x);
    return ret.join('');
}

/**
 * @example
> [1,2].dim()
[2]
> [[1,2,3],[4,5,6]].dim()
[2,3]
> x = [[1,2,3],[4,5,6]]
[[1,2,3],[4,5,6]]
 */
Array.prototype.dim = function() {
    var ret = [this.length];
    if(typeof this[0] === 'object') { if(typeof this[0].dim !== 'undefined') ret = ret.concat(this[0].dim()); }
    return ret;
}

/**
 * @example
> [1,2].same([1,2])
true
> [1,2].same([1,2,3])
false
> [1,2].same([[1],[2]])
false
 * @param x
 * @returns {Boolean}
 */
Array.prototype.same = function(x) {
    var i,n;
    if(!(x instanceof Array)) { return false; }
    n = this.length;
    if(n !== x.length) { return false; }
    for(i=0;i<n;i++) {
        if(typeof this[i] === "number") { if(this[i] !== x[i]) return false; }
        else if(!this[i].same(x[i])) { return false; }
    }
    return true;
}

/**
 * @example
> [1,2].dot([3,4])
11
> [1,2].dot([[3,4],[5,6]])
[13,16]
> [[1,2],[3,4]].dot([5,6])
[17,39]
> [[1,2],[3,4]].dot([[5,6],[7,8]])
[[19,22],[43,50]]
 * @param x
 * @returns
 */
Array.prototype.dot = function(x) {
    var s1 = this.dim();
    var s2 = x.dim();
    var i,j,k,p,q,r,ret = [],foo,bar,woo,woz;
    if(s1.length === 2) {
        if(s2.length === 2) {
            if(s1[1] !== s2[0]) { throw new Error('numeric: matrix sizes mismatch in dot()'); }
            p = s1[0]; q = s1[1]; r = s2[1];
            // If the matrices are large, it is best to transpose x first.
            if(q > 10) {
                woo = x.transpose();
                for(i=0;i<p;i++) {
                    ret[i] = [];
                    bar = this[i];
                    for(k=0;k<r;k++) {
                        woz = woo[k];
                        foo = bar[0]*woz[0];
                        for(j=1;j<q;j++) { foo += bar[j]*woz[j]; }
                        ret[i][k] = foo;
                    }
                }
                return ret;
            }
            // If the matrices are small, don't transpose first
            for(i=0;i<p;i++) {
                ret[i] = [];
                bar = this[i];
                for(k=0;k<r;k++) {
                    foo = bar[0]*x[0][k];
                    for(j=1;j<q;j++) { foo += bar[j]*x[j][k]; }
                    ret[i][k] = foo;
                }
            }
            return ret;
        }
        if(s2.length === 1) {
            if(s1[1] !== s2[0]) { throw new error('numeric: matrix and vector sizes must match in dot()'); }
            p = s1[0]; q = s1[1];
            for(i=0;i<p;i++) {
                bar = this[i];
                foo = bar[0]*x[0];
                for(j=1;j<q;j++) { foo += bar[j]*x[j]; }
                ret[i] = foo;
            }
            return ret;
        }
    } else if(s1.length === 1) {
        if(s2.length === 2) {
            if(s1[0] !== s2[0]) { throw new error('numeric: matrix and vector sizes must match in dot()'); }
            p = s1[0]; q = s2[1];
            for(j=0;j<q;j++) {
                foo = this[0]*x[0][j];
                for(i=1;i<p;i++) { foo += this[i]*x[i][j]; }
                ret[j] = foo;
            }
            return ret;
        }
        if(s2.length === 1) {
            if(s1[0] !== s2[0]) { throw new error('numeric: vector sizes must match in dot()'); }            
            foo = this[0]*x[0];
            p = s1[0];
            for(i=1;i<p;i++) { foo += this[i]*x[i]; }
            return foo;
        }
        throw new Error("numeric: function dot() only operates on vectors and matrices");
    }
}

/**
 * @example
> numeric.rep([3],5)
[5,5,5]
> numeric.rep([2,3],0)
[[0,0,0],[0,0,0]]
 */
numeric.rep = function(s,v) {
    function foo(k) {
        var i,ret;
        if(k === s.length) { return v; }
        ret = [];
        for(i=0;i<s[k];i++) { ret[i] = foo(k+1); }
        return ret;
    }
    return foo(0);
}

/**
 * @example
> numeric.identity(2)
[[1,0],[0,1]]
 */
numeric.identity = function(n) {
    var ret = numeric.rep([n,n],0);
    var i;
    for(i=0;i<n;i++) ret[i][i] = 1;
    return ret;
}

Array.prototype.nclone = function() {
    var ret = [];
    var i;
    for(i=0;i<this.length;i++) {
        if(typeof this[i] === 'object') ret[i] = this[i].nclone();
        else ret[i] = this[i];
    }
    return ret;
}

/**
 * @example
> [[1,2],[3,4]].inv()
[[-2.000,1.000],[1.500,-0.5000]]
> x = [[1,2,3,4],[1,3,1,7],[3,1,2,0],[-3,-3,1,9]]; x.dot(x.inv());
[[1.000     , 0        ,0    ,0         ],
 [-1.110e-16, 1        ,0    ,-1.110e-16],
 [1.110e-16 ,-1.110e-16,1    ,-8.674e-17],
 [-1.110e-16,0,-1.110e-16    ,1.000     ]]
 * @returns
 */
Array.prototype.inv = function() {
    var s = this.dim();
    if(s.length !== 2 || s[0] !== s[1]) { throw new Error('numeric: inv() only works on square matrices'); }
    var n = s[0], ret = numeric.identity(n),i,j,k,A = this.nclone(),Aj,Ai,Ij,Ii,alpha,temp;
    for(j=0;j<n-1;j++) {
        k=j;
        for(i=j+1;i<n;i++) { if(Math.abs(A[i][j]) > Math.abs(A[k][j])) { k = i; } }
        temp = A[k]; A[k] = A[j]; A[j] = temp;
        temp = ret[k]; ret[k] = ret[j]; ret[j] = temp;
        Aj = A[j];
        Ij = ret[j];
        for(i=j+1;i<n;i++) {
            Ai = A[i];
            Ii = ret[i];
            alpha = Ai[j]/Aj[j];
            for(k=j+1;k<n;k++) { Ai[k] -= Aj[k]*alpha; }
            for(k=0;k<n;k++) { Ii[k] -= Ij[k]*alpha; }
        }
    }
    for(j=1;j<n;j++) {
        Aj = A[j];
        Ij = ret[j];
        for(i=0;i<j;i++) {
            Ai = A[i];
            Ii = ret[i];
            alpha = Ai[j]/Aj[j];
            for(k=j+1;k<n;k++) { Ai[k] -= Aj[k]*alpha; }
            for(k=0;k<n;k++) { Ii[k] -= Ij[k]*alpha; }
        }
    }
    for(i=0;i<n;i++) {
        alpha = A[i][i];
        Ii = ret[i];
        for(j=0;j<n;j++) { Ii[j] /= alpha; }
    }
    return ret;
}

Array.prototype.binaryOp = function(op,y) {
    var x = this, s1 = x.dim(), s2 = y.dim();
    if(!s1.same(s2)) { throw new error('numeric: binaryOp() only works on Arrays of the same shapes'); }
    function foo(x,y,k) {
        if(k === s1.length-1) { return op(x,y); }
        var i,n=s1[k],ret=[];
        for(i=0;i<n;i++) ret[i] = foo(x[i],y[i],k+1);
        return ret;
    }
    return foo(x,y,0);
}

/**
 * @example
> [1,2].add([3,4])
[4,6]
> [[1,2],[3,4]].add([[5,6],[7,8]])
[[6,8],[10,12]]
 */
Array.prototype.add = function(y) {
    return this.binaryOp(function(x,y) {
        var ret = [], i, n = x.length;
        for(i=0;i<n;i++) ret[i] = x[i] + y[i];
        return ret;
    }, y);
}
/**
 * @example
> [1,2].sub([3,4])
[-2,-2]
 */
Array.prototype.sub = function(y) {
    return this.binaryOp(function(x,y) {
        var ret = [], i, n = x.length;
        for(i=0;i<n;i++) ret[i] = x[i] - y[i];
        return ret;
    }, y);
}
/**
 * @example
> [1,2].mul([3,4])
[3,8]
 */
Array.prototype.mul = function(y) {
    return this.binaryOp(function(x,y) {
        var ret = [], i, n = x.length;
        for(i=0;i<n;i++) ret[i] = x[i] * y[i];
        return ret;
    }, y);
}
/**
 * @example
> [1,2].div([3,4])
[0.3333,0.5]
 */
Array.prototype.div = function(y) {
    return this.binaryOp(function(x,y) {
        var ret = [], i, n = x.length;
        for(i=0;i<n;i++) ret[i] = x[i] / y[i];
        return ret;
    }, y);
}

Array.prototype.nforeach = function(f) {
    var s = this.dim();
    function foo(x,k) {
        if(k === s.length-1) { return f(x); }
        var i,ret=[],n=s[k];
        for(i=0;i<n;i++) { ret[i] = foo(x[i],k+1); }
        return ret;
    }
    return foo(this,0);
}

/**
 * @example
> [1,2].exp();
[2.718,7.389]
> [[1,2],[3,4]].exp()
[[2.718,7.389],[20.09,54.60]]
> [-2,3].abs()
[2,3]
> [0.1,0.2].acos()
[1.471,1.369]
> [0.1,0.2].asin()
[0.1002,0.2014]
> [1,2].atan()
[0.7854,1.107]
> [-2.2,3.3].ceil()
[-2,4]
> [-2.2,3.3].floor()
[-3,3]
> [1,2].log()
[0,0.6931]
> [-2.2,3.3].round()
[-2,3]
> [1,2].sin()
[0.8415,0.9093]
> [1,2].sqrt()
[1,1.414]
> [1,2].tan()
[1.557,-2.185]
 */
Array.prototype.exp = function() {
    return this.nforeach(function(x) {
        var i,ret=[],n=x.length;
        for(i=0;i<n;i++) ret[i] = Math.exp(x[i]);
        return ret;
    });
}

var funs = ['abs','acos','asin','atan','ceil','cos','exp','floor','log','round','sin','sqrt','tan'];
var k;
for(k=0;k<funs.length;k++) { Array.prototype[funs[k]] = new Function(
         'return this.nforeach(function(x) {'
        +'    var i,ret=[],n=x.length, fun = Math.'+funs[k]+';'
        +'    for(i=0;i<n;i++) ret[i] = fun(x[i]);'
        +'    return ret;'
        +'});'); }

/**
 * @example
> [[1,2,3],[4,5,6]].transpose()
[[1,4],[2,5],[3,6]]
> [[1,2,3,4,5,6,7,8,9,10,11,12]].transpose()
[[1],[2],[3],[4],[5],[6],[7],[8],[9],[10],[11],[12]]
 * @returns
 */
Array.prototype.transpose = function() {
    var s = this.dim();
    if(s.length !== 2) { throw new Error('numeric: transpose() can only be used on matrices'); }
    var i,j,m = s[0],n = s[1], ret=[],Ai;
    for(j=0;j<n;j++) ret[j] = [];
    for(i=0;i<m;i++) {
        Ai = this[i];
        for(j=0;j<n;j++) {
            ret[j][i] = Ai[j];
        }
    }
    return ret;
}

numeric.random = function(s) {
    function foo(k) {
        var ret = [];
        var i,n=s[k];
        if(k === s.length-1) {
            for(i=0;i<n;i++) ret[i] = Math.random();
            return ret;
        }
        for(i=0;i<n;i++) ret[i] = foo(k+1);
        return ret;
    }
    return foo(0);
}

numeric.CArray = function(re,im) {
    this.re = re;
    if(typeof im === "undefined") { this.im = numeric.rep(re.dim(),0); }
    else { this.im = im; }
}

numeric.CArray.prototype.dim = function() { return this.re.dim(); }

/**
 * @example
> [[1,2],[3,4]].isSymmetric()
false
> [[1,2],[2,3]].isSymmetric()
true
 */
Array.prototype.isSymmetric = function() {
    var s = this.dim();
    if(s.length !== 2 || s[0] !== s[1]) { throw new Error('numeric: isSymmetric() can only be called on square Arrays'); }
    var xi, m=s[0],i,j;
    for(i=0;i<m;i++) {
        xi = this[i];
        for(j=i+1;j<m;j++) { if(xi[j] !== this[j][i]) return false; }
    }
    return true;
}

