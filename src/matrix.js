/*
<pre>
> 1
1 
</pre>
 */

numeric.precision = 4;

function fmtnum(x) {
    if(x === 0) { return '0'; }
    if(isNaN(x)) { return 'NaN'; }
    if(x<0) { return '-'+fmtnum(-x); }
    if(isFinite(x)) {
        var scale = Math.floor(Math.log(x) / Math.log(10));
        var normalized = x / Math.pow(10,scale);
        var basic = normalized.toPrecision(numeric.precision);
        return basic+'e'+scale.toString();
    }
    return 'Infinity';
}

numeric.prettyPrint = function(x) {
    var ret = [];
    function foo(x) {
        var k;
        if(typeof x === "undefined") { ret.push(""); return false; }
        if(typeof x === "string") { ret.push('"'+x+'"'); return false; }
        if(typeof x === "boolean") { ret.push(x.toString()); return false; }
        if(typeof x === "number") { 
            var a = fmtnum(x);
            var b = x.toPrecision(numeric.precision);
            var c = x.toString();
            if(b.length < a.length) a = b;
            if(c.length < a.length) a = c;
            ret.push(Array(numeric.precision+8-a.length).join(' ')+a);
            return false;
        }
        if(typeof x === null) { ret.push("null"); return false; }
        if(typeof x === "function") { ret.push(x.toString().replace(/&/g,'&amp;').replace(/>/g,'&gt;').replace(/</g,'&lt;').replace(/"/g,'&quot;')); return true; }
        if(x instanceof Array) {
            var flag = false;
            ret.push('[');
            for(k=0;k<x.length;k++) { if(k>0) { ret.push(','); if(flag) ret.push('\n '); } flag = foo(x[k]); }
            ret.push(']');
            return true;
        }
        ret.push('{');
        var flag = false;
        for(k in x) { if(flag) ret.push(',\n'); flag = true; if(x.hasOwnProperty(k)) { ret.push(k); ret.push(': \n'); foo(x[k]); } }
        ret.push('}');
        return true;
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
            if(s1[1] !== s2[0]) { throw new Error('numeric: matrix and vector sizes must match in dot()'); }
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
            if(s1[0] !== s2[0]) { throw new Error('numeric: matrix and vector sizes must match in dot()'); }
            p = s1[0]; q = s2[1];
            for(j=0;j<q;j++) {
                foo = this[0]*x[0][j];
                for(i=1;i<p;i++) { foo += this[i]*x[i][j]; }
                ret[j] = foo;
            }
            return ret;
        }
        if(s2.length === 1) {
            if(s1[0] !== s2[0]) { throw new Error('numeric: vector sizes must match in dot()'); }            
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
> Array.rep([3],5)
[5,5,5]
> Array.rep([2,3],0)
[[0,0,0],[0,0,0]]
 */
Array.__proto__.rep = function(s,v) {
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
> Array.identity(2)
[[1,0],[0,1]]
 */
Array.__proto__.identity = function(n) {
    var ret = Array.rep([n,n],0);
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
    var n = s[0], ret = Array.identity(n),i,j,k,A = this.nclone(),Aj,Ai,Ij,Ii,alpha,temp;
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

/**
 * @example
> [[1,2],[3,4]].det();
-2
> [[6,8,4,2,8,5],[3,5,2,4,9,2],[7,6,8,3,4,5],[5,5,2,8,1,6],[3,2,2,4,2,2],[8,3,2,2,4,1]].det();
-1404
 */
Array.prototype.det = function() {
    var s = this.dim();
    if(s.length !== 2 || s[0] !== s[1]) { throw new Error('numeric: det() only works on square matrices'); }
    var n = s[0], ret = 1,i,j,k,A = this.nclone(),Aj,Ai,alpha,temp;
    for(j=0;j<n-1;j++) {
        k=j;
        for(i=j+1;i<n;i++) { if(Math.abs(A[i][j]) > Math.abs(A[k][j])) { k = i; } }
        if(k !== j) {
            temp = A[k]; A[k] = A[j]; A[j] = temp;
            ret *= -1;
        }
        Aj = A[j];
        for(i=j+1;i<n;i++) {
            Ai = A[i];
            alpha = Ai[j]/Aj[j];
            for(k=j+1;k<n;k++) { Ai[k] -= Aj[k]*alpha; }
        }
        if(Aj[j] === 0) { return 0; }
        ret *= Aj[j];
    }
    return ret*A[j][j];
}

Array.prototype.binaryOp = function(op,y) {
    var x = this, s1 = x.dim(), s2 = y.dim();
    if(!s1.same(s2)) { throw new Error('numeric: binaryOp() only works on Arrays of the same shapes'); }
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
Array.prototype.exp = function() {}

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

Array.__proto__.random = function(s) {
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
    if(typeof im === "undefined") { this.im = Array.rep(re.dim(),0); }
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

Array.prototype.nmapreduce = function(f,g,g0) {
    var s = this.dim();
    function foo(k,x) {
        if(k === s.length-1) return f(x);
        var z = g0, i, n = s[k];
        for(i=0;i<n;i++) { z = g(g0,foo(k+1,x[i])); if(z.stop) break; }
        return z;
    }
    return foo(0,this).result;
}

/**
 * @example
> [0,0].any()
false
> [[0,0],[0,1]].any()
true
 */
Array.prototype.any = function() {
    return this.nmapreduce(function(x){ 
        var i, n=x.length;
        for(i=0;i<n;i++) { if(x[i]) return { stop: true, result: true}; }
        return { stop: false, result: false};
    }, function(g0,g1) { 
        return { stop: g0.stop || g1.stop, result: g0.result || g1.result }
    }, { stop: false, result: false });
}

/**
 * @example
> [1,0].all()
false
> [[1,1],[1,1]].all()
true
 */
Array.prototype.all = function() {
    return this.nmapreduce(function(x){ 
        var i, n=x.length;
        for(i=0;i<n;i++) { if(!x[i]) return { stop: true, result: false}; }
        return { stop: false, result: true};
    }, function(g0,g1) { 
        return { stop: g0.stop || g1.stop, result: g0.result && g1.result }
    }, { stop: false, result: true });
}

Array.prototype.norm2Squared = function() {
    return this.nmapreduce(function(x){ 
        var i, n=x.length, accum = x[0]*x[0];
        for(i=1;i<n;i++) { accum += x[i]*x[i]; }
        return { stop: false, result: accum };
    }, function(g0,g1) { 
        return { stop: false, result: g0.result + g1.result }
    }, { stop: false, result: 0 });
}

/**
 * @example
> [1,2].norm2()
2.236
 */
Array.prototype.norm2 = function() { return Math.sqrt(this.norm2Squared()); }

/**
 * @example
> [[1,2,3,4,5],[6,7,8,9,10],[11,12,13,14,15],[16,17,18,19,20]].getBlock([1,2],[2,4]);
[[8 ,9 ,10],
 [13,14,15]] 
 */
Array.prototype.getBlock = function(from,to) {
    var s = this.dim();
    function foo(x,k) {
        var i,a = from[k], ret = [], n = to[k]-a;
        if(k === s.length-1) {
            for(i=0;i<=n;i++) { ret[i] = x[i+a]; }
            return ret;
        }
        for(i=0;i<=n;i++) { ret[i] = foo(x[i+a],k+1); }
        return ret;
    }
    return foo(this,0);
}

/**
 * @example
> [[1,2,3,4,5],[6,7,8,9,10],[11,12,13,14,15],[16,17,18,19,20]].setBlock([1,2],[2,4],[[21,22,23],[24,25,26]]);
[[ 1, 2, 3, 4, 5],
 [ 6, 7,21,22,23],
 [11,12,24,25,26],
 [16,17,18,19,20]]
 */
Array.prototype.setBlock = function(from,to,B) {
    var s = this.dim();
    function foo(x,y,k) {
        var i,a = from[k], ret = [], n = to[k]-a;
        if(k === s.length-1) { for(i=0;i<=n;i++) { x[i+a] = y[i]; } }
        for(i=0;i<=n;i++) { foo(x[i+a],y[i],k+1); }
    }
    foo(this,B,0);
    return this;
}

/**
 * @example
> [1,2].tensor([3,4,5])
[[3,4,5],
 [6,8,10]]
 */
Array.prototype.tensor = function(y) {
    var s1 = this.dim(), s2 = y.dim();
    if(s1.length !== 1 || s2.length !== 1) {
        throw new Error('numeric: tensor product is only defined for vectors');
    }
    var A = [], Ai, m = s1[0], n = s2[0], i,j,xi;
    for(i=0;i<m;i++) {
        Ai = [];
        xi = this[i];
        for(j=0;j<n;j++) { Ai[j] = xi * y[j]; }
        A[i] = Ai;
    }
    return A;
}

function house(x) {
    var v = x.nclone();
    var alpha = x[0]/Math.abs(x[0])*x.norm2();
    v[0] += alpha;
    var foo = v.norm2();
    var i,n=v.length;
    for(i=0;i<n;i++) v[i] /= foo;
    return v;
}

/**
 * @example
> A = [[1,2,3],[4,5,6],[7,3,5]]; QH = A.toUpperHessenberg();
{ H: [[         1,-3.597,-0.2481],
      [    -8.062, 8.877, 0.7846],
      [-8.882e-16, 3.785, 1.123]],
  Q: [[1,      0,      0],
      [0,-0.4961,-0.8682],
      [0,-0.8682, 0.4961]] }
> QH.H.sub(QH.Q.dot(A.dot(QH.Q.transpose()))).norm2()<1e15;
true
> A = [[6,8,4,2,8,5],[3,5,2,4,9,2],[7,6,8,3,4,5],[5,5,2,8,1,6],[3,2,2,4,2,2],[8,3,2,2,4,1]]; QH = A.toUpperHessenberg(); QH.H.sub(QH.Q.dot(A.dot(QH.Q.transpose()))).norm2()<1e15;
true
 */
Array.prototype.toUpperHessenberg = function () {
    var s = this.dim();
    if(s.length !== 2 || s[0] !== s[1]) { throw new Error('numeric: toUpperHessenberg() only works on square matrices'); }
    var m = s[0], i,j,k,x,v,A = this.nclone(),B,C,Ai,Ci,Q = Array.identity(m),Qi;
    for(j=0;j<m-2;j++) {
        x = [];
        for(i=j+1;i<m;i++) { x[i-j-1] = A[i][j]; }
        v = house(x);
        B = A.getBlock([j+1,j],[m-1,m-1]);
        C = v.tensor(v.dot(B));
        for(i=j+1;i<m;i++) { Ai = A[i]; Ci = C[i-j-1]; for(k=j;k<m;k++) Ai[k] -= 2*Ci[k-j]; }
        B = A.getBlock([0,j+1],[m-1,m-1]);
        C = B.dot(v).tensor(v);
        for(i=0;i<m;i++) { Ai = A[i]; Ci = C[i]; for(k=j+1;k<m;k++) Ai[k] -= 2*Ci[k-j-1]; }
        B = [];
        for(i=j+1;i<m;i++) B[i-j-1] = Q[i];
        C = v.tensor(v.dot(B));
        for(i=j+1;i<m;i++) { Qi = Q[i]; Ci = C[i-j-1]; for(k=0;k<m;k++) Qi[k] -= 2*Ci[k]; }
    }
    return {H:A, Q:Q};
}

/**
 * @example
> [1,2,3].mulScalar(4)
[4,8,12]
 */
Array.prototype.mulScalar = function(alpha) {
    return this.nforeach(function(x) {
        var i,ret=[],n=x.length;
        for(i=0;i<n;i++) ret[i] = alpha*x[i];
        return ret;
    });
}

/**
 * @example
> [1,2,3].addScalar(4)
[5,6,7]
 */
Array.prototype.addScalar = function(alpha) {
    return this.nforeach(function(x) {
        var i,ret=[],n=x.length;
        for(i=0;i<n;i++) ret[i] = alpha+x[i];
        return ret;
    });
}

/**
 * @example
> A = [[1,2,3],[4,5,6],[7,1,2]]; QH = A.toUpperHessenberg(); F = QH.H.QRFrancis(); Q = F.Q.dot(QH.Q); Q.dot(A.dot(Q.transpose()));
hi
 */
Array.prototype.QRFrancis = function(maxiter) {
    if(typeof maxiter === "undefined") { maxiter = 10000; }
    var H = this.nclone(), s = H.dim(),m=s[0],x,v,a,b,c,d,det,tr, Hloc, Q = Array.identity(m), Qi, Hi, B, C, Ci,i,j,k,iter;
    if(m<3) { return {Q:Q, B:[ [0,m-1] ]}; }
    var epsilon = 3e-16;
    for(iter=0;iter<maxiter;iter++) {
        for(j=0;j<m-1;j++) {
            if(Math.abs(H[j+1][j]) < epsilon*(Math.abs(H[j][j])+Math.abs(H[j+1][j+1]))) {
                var QH1 = H.getBlock([0,0],[j,j]).QRFrancis(maxiter);
                var QH2 = H.getBlock([j+1,j+1],[m-1,m-1]).QRFrancis(maxiter);
                B = [];
                for(i=0;i<=j;i++) { B[i] = Q[i]; }
                C = QH1.Q.dot(B);
                for(i=0;i<=j;i++) { Q[i] = C[i]; }
                B = [];
                for(i=j+1;i<m;i++) { B[i-j-1] = Q[i]; }
                C = QH2.Q.dot(B);
                for(i=j+1;i<m;i++) { Q[i] = C[i-j-1]; }
                return {Q:Q,B:QH1.B.concat(QH2.B.addScalar(j+1))};
            }
        }
        a = H[m-2][m-2]; b = H[m-2][m-1];
        c = H[m-1][m-2]; d = H[m-1][m-1];
        tr = a+d;
        det = (a*d-b*c);
        Hloc = H.getBlock([0,0], [2,2]);
        if(tr*tr>=4*det) {
            var s1,s2;
            s1 = 0.5*(tr+Math.sqrt(tr*tr-4*det));
            s2 = 0.5*(tr-Math.sqrt(tr*tr-4*det));
            if(Math.abs(s1-d) < Math.abs(s2-d)) { s2 = s1; }
            Hloc[0][0] -= s2;
            Hloc[1][1] -= s2;
            Hloc[2][2] -= s2;
        } else { Hloc = Hloc.dot(Hloc).sub(Hloc.mulScalar(tr)).add(Array.identity(3).mulScalar(det)); }
        x = [Hloc[0][0],Hloc[1][0],Hloc[2][0]];
        v = house(x);
        B = [H[0],H[1],H[2]];
        C = v.tensor(v.dot(B));
        for(i=0;i<3;i++) { Hi = H[i]; Ci = C[i]; for(k=0;k<m;k++) Hi[k] -= 2*Ci[k]; }
        B = H.getBlock([0,0],[m-1,2]);
        C = B.dot(v).tensor(v);
        for(i=0;i<m;i++) { Hi = H[i]; Ci = C[i]; for(k=0;k<3;k++) Hi[k] -= 2*Ci[k]; }
        B = [Q[0],Q[1],Q[2]];
        C = v.tensor(v.dot(B));
        for(i=0;i<3;i++) { Qi = Q[i]; Ci = C[i]; for(k=0;k<m;k++) Qi[k] -= 2*Ci[k]; }
        var J;
        for(j=0;j<m-2;j++) {
            x = [];
            J = Math.min(m-1,j+3);
            for(i=j+1;i<=J;i++) { x[i-j-1] = H[i][j]; }
            v = house(x);
            B = H.getBlock([j+1,j],[J,m-1]);
            C = v.tensor(v.dot(B));
            for(i=j+1;i<=J;i++) { Hi = H[i]; Ci = C[i-j-1]; for(k=j;k<m;k++) Hi[k] -= 2*Ci[k-j]; }
            B = H.getBlock([0,j+1],[m-1,J]);
            C = B.dot(v).tensor(v);
            for(i=0;i<m;i++) { Hi = H[i]; Ci = C[i]; for(k=j+1;k<=J;k++) Hi[k] -= 2*Ci[k-j-1]; }
            B = [];
            for(i=j+1;i<=J;i++) B[i-j-1] = Q[i];
            C = v.tensor(v.dot(B));
            for(i=j+1;i<=J;i++) { Qi = Q[i]; Ci = C[i-j-1]; for(k=0;k<m;k++) Qi[k] -= 2*Ci[k]; }
        }
    }
    throw new Error('numeric: eigenvalue iteration does not converge -- increase maxiter?');
}

