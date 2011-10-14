/**
     * Dot or matrix product between scalars, vectors and matrices.
     * 
     * @example
> numeric.dot(2,3)
t(6)
> numeric.dot([2,3],4)
t([8,12])
> numeric.dot([1,2],[3,4])
t(11)
> numeric.dot([1,2],[[3,4],[5,6]])
t([13,16])
> numeric.dot([[3,4],[5,6]],[1,2])
t([11,17])
> numeric.dot(numeric.t([[1,2],[3,4]],[[5,6],[7,8]]),[[9,10],[11,12]])
t([[31,34],[71,78]],[[111,122],[151,166]])
     */
function dot(a,b) {
    a = t(a); b = t(b);
    if(isS(a) || isS(b)) return mul(a,b);
    var i,j,m=a.s[0],x,y, ia, ib, ax, ay, bx, by;
    if(isV(a)) {
        if(isV(b)) {
            ax = a.x;
            bx = b.x;
            x=0;
            if(typeof a.y  !== "undefined" || typeof b.y !== "undefined") {
                if(typeof a.y === "undefined") { /** @ignore */ ia = function(i) { return 0; } }
                else { ay = a.y; ia = function(i) { return ay[i]; } }
                if(typeof b.y === "undefined") { /** @ignore */ ib = function(i) { return 0; } }
                else { by = b.y; ib = function(i) { return by[i]; } }
                y=0;
                for(i=0;i<m;i++) {
                    x += a.x[i]*bx[i]-ia(i)*ib(i);
                    y += ia(i)*bx[i]+ax[i]*ib(i);
                }
                return t(x,y);
            }
            for(i=0;i<m;i++) { x+=a.x[i]*b.x[i]; }
            return t(x);
        }
        M(b);
        if(m !== b.s[0]) { throw new Error("Sizes of vector a and matrix b have to match"); }
        var foo, n = b.s[1];
        x = [];
        if(typeof(b.y) === "undefined" && typeof a.y === "undefined") {
            for(i=0;i<n;i++) {
                foo = dot(a,b(null,i));
                x[i] = foo.x[0];
            }
            return mkT([n],x);
        }
        y = [];
        for(i=0;i<n;i++) {
            foo = dot(a,b(null,i));
            x[i] = foo.x[0];
            y[i] = foo.y[0];
        }
        return mkT([n],x,y);
    }
    M(a);
    var n;
    if(isV(b)) {
        n = b.s[0];
        if(n !== a.s[1]) { throw new Error("Sizes of matrix a and vector b have to match"); }
        var foo;
        x = [];
        if(typeof(b.y) === "undefined" && typeof a.y === "undefined") {
            for(i=0;i<m;i++) {
                foo = dot(a(i,null),b);
                x[i] = foo.x[0];
            }
            return mkT([m],x);
        }
        y = [];
        for(i=0;i<m;i++) {
            foo = dot(a(i,null),b);
            x[i] = foo.x[0];
            y[i] = foo.y[0];
        }
        return mkT([m],x,y);        
    }
    M(b);
    var o = a.s[1];
    if(o !== b.s[0]) { throw new Error("Sizes of matrices a and b have to match"); }
    n = b.s[1];
    x = [];
    if(typeof a.y === "undefined" && typeof b.y === "undefined") {
        for(i=0;i<m;i++) {
            for(j=0;j<n;j++) { x.push(dot(a(i,null),b(null,j)).x[0]); }
        }
        return mkT([m,n],x);
    }
    y = [];
    for(i=0;i<m;i++) {
        for(j=0;j<n;j++) { 
            foo = dot(a(i,null),b(null,j));
            x.push(foo.x[0]);
            y.push(foo.y[0]);
        }
    }
    return mkT([m,n],x,y);
}
my.dot = dot;

//jsdoc bug above here

/**
     * Solve a lower triangular system.
     * 
     * @example
> numeric.Lsolve([[2,0],[3,4]],[2,11])
t([1,2])
> numeric.Lsolve(numeric.t([[1]],[[2]]),[3])
t([0.6],[-1.2])
     */
function Lsolve(L,b) {
    L = M(t(L)); b = V(t(b));
    var n = L.s[0];
    if(n !== L.s[1]) { throw new Error("Lsolve: L must be square"); }
    if(n !== b.s[0]) { throw new Error("Lsolve: L and b must have matching sizes"); }
    var i,j,ret = copy(b),foo;
    for(i=0;i<n;i++) { set(ret,i,div(sub(ret(i),dot(L(i,run(0,i)),ret(run(0,i)))),L(i,i))); }
    return ret;
}
my.Lsolve = Lsolve;
/**
     * Solve an upper triangular system.
     * 
     * @example
> numeric.Usolve([[2,3],[0,4]],[8,8])
t([1,2])
     */
function Usolve(U,b) {
    U = M(t(U)); b = V(t(b));
    var n = U.s[0];
    if(n !== U.s[1]) { throw new Error("Usolve: U must be square"); }
    if(n !== b.s[0]) { throw new Error("Usolve: U and b must have matching sizes"); }
    var i,j,ret = copy(b),foo;
    for(i=n-1;i>=0;i--) { set(ret,i,div(sub(ret(i),dot(U(i,run(i+1,n)),ret(run(i+1,n)))),U(i,i))); }
    return ret;
}
my.Usolve = Usolve;

/**
     * Computes the LUP decomposition of a matrix.
     * 
     * @example
> numeric.LUP([[1,2],[3,4]])
{L:t([[1,0],[0.3333,1]]),U:t([[3,4],[0,0.6667]]),P:t([1,0])}
> A=numeric.t([[2,4,4,4,2,3],[1,3,2,5,1,1],[1,3,3,1,4,3],[3,5,0,3,2,3],[2,1,0,2,3,4],[2,4,3,0,1,2,]]); Z=numeric.LUP(A); numeric.sub(A(Z.P,null),numeric.dot(Z.L,Z.U));
t([[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,1.110e-16,0]])
> numeric.LUP(numeric.t([[1,2],[3,4]],[[5,6],[7,8]]))
{L:t([[1,0],[0.6552,1]],[[0,0],[0.1379,0]]),U:t([[3,4],[0,0.4828]],[[7,8],[0,0.2069]]),P:t([1,0])}
> numeric.LUP([[1,2,3],[0,4,5],[0,0,6]]);
{L:t([[1,0,0],[0,1,0],[0,0,1]]),U:t([[1,2,3],[0,4,5],[0,0,6]]),P:t([0,1,2])}
     */
function LUP(A) {
    var U = copy(M(t(A)));
    var n = U.s[0], i, j, k, nk, nj;
    if(n!==U.s[1]) { throw new Error("LUP only works on square matrices"); }
    var L = rep(n,n,0), P = run(n), foo,idx;
    for(i=0;i<n;i++) {
        k = i;
        nk = abs(U(k,k)).x[0];
        for(j=k+1;j<n;j++) {
            nj = abs(U(j,i)).x[0];
            if(nj > nk) { k=j; nk = nj; }
        }
        foo = U(k,null); set(U,k,null,U(i,null)); set(U,i,null,foo);
        foo = L(k,null); set(L,k,null,L(i,null)); set(L,i,null,foo);
        foo = P(k); set(P,k,P(i)); set(P,i,foo);
        set(L,i,i,1);
        for(j=i+1;j<n;j++) {
            foo = div(U(j,i),U(i,i));
            set(L,j,i,foo);
            set(U,j,i,0);
            idx = run(i+1,n);
            set(U,j,idx,sub(U(j,idx),mul(foo,U(i,idx))));
        }
    }
    return {L:L, U:U, P:P};
}
my.LUP = LUP;

/**
     * Determinant of a matrix.
     * 
     * @example
> numeric.det([[1,2],[3,4]])
t(-2)
     */
function det(A) {
    var Z = LUP(A), U = Z.U, P = Z.P.x, n = P.length, i,j,k ,d = 1, flags = [];
    for(i=0;i<n;i++) {
        if(flags[i] === undefined) {
            flags[i] = 1;
            j = i;
            k = P[j];
            while(k !== j) { flags[k] = 1; k = P[k]; d *= -1; }
        }
    }
    d = t(d);
    for(i=0;i<n;i++) { d = mul(d,U(i,i)); }
    return d;
}
my.det = det;
/**
     * The transpose of a matrix.
     * 
     * @example
> numeric.transpose([[1,2,3],[4,5,6]])
t([[1,4],[2,5],[3,6]])
> numeric.transpose(numeric.t([[1,2,3]],[[4,5,6]]))
t([[1],[2],[3]],[[4],[5],[6]])
     */
function transpose(A) {
    A = (M(t(A)));
    var i,j,m = A.s[0],n = A.s[1],x2=[],y2,c1,c2, x1 = A.x, y1 = A.y;
    if(typeof y1 === "undefined") {
        for(i=0;i<m;i++) {
            c1 = i*n;
            c2 = i;
            for(j=0;j<n;j++) {
                x2[c2] = x1[c1];
                c1++;
                c2+=m;
            }
        }
        return mkT([n,m],x2);
    }
    y2 = [];
    for(i=0;i<m;i++) {
        c1 = i*n;
        c2 = i;
        for(j=0;j<n;j++) {
            x2[c2] = x1[c1];
            y2[c2] = y1[c1];
            c1++;
            c2+=m;
        }
    }
    return mkT([n,m],x2,y2);
}
my.transpose = transpose;
/**
     * The inverse of a matrix
     * 
     * @example
> A=[[2,4,4,4,2,3],[1,3,2,5,1,1],[1,3,3,1,4,3],[3,5,0,3,2,3],[2,1,0,2,3,4],[2,4,3,0,1,2,]]; numeric.dot(numeric.inv(A),A);
t([[1.000     ,-1.066e-14 ,-7.105e-15,-8.882e-15,-2.665e-15,-1.776e-15],
   [-4.441e-16,1.000      ,8.882e-16 ,8.882e-16 ,-2.220e-16,4.441e-16 ],
   [2.220e-16 ,-4.441e-16 ,1.000     ,4.441e-16 ,3.331e-16 ,2.220e-16 ],
   [9.714e-17 ,1.110e-16  ,1.943e-16 ,1.000     ,2.567e-16 ,2.082e-16 ],
   [8.882e-16 ,-3.553e-15 ,0         ,4.441e-16 ,1.000     ,0         ],
   [-8.882e-16,1.776e-15  ,0         ,-8.882e-16,0         ,1.000     ]])
     */
function inv(A) {
    var Z = LUP(A), P = Z.P, n = P.x.length, i;
    var ret = diag(rep(n,1))(P,null);
    for(i=0;i<n;i++) { set(ret,null,i,Usolve(Z.U,Lsolve(Z.L,ret(null,i)))); }
    return ret;
}
my.inv = inv;
/**
     * Solve a linear system.
     * 
     * @example
> numeric.solve([[3,1,2],[5,2,2],[1,6,5]],[11,15,28])
t([1,2.000,3.000])
     */
function solve(A,b) {
    var Z = LUP(A);
    b = V(t(b));
    return Usolve(Z.U,Lsolve(Z.L,b(Z.P)));
}
my.solve = solve;
/**
     * Computes the tensor product of two tensors.
     * 
     * @example
> numeric.tensor([1,2],[3,4])
t([[3,4],[6,8]])
> numeric.tensor(numeric.t(1,2),numeric.t(3,4))
t(-5,10)
     */
function tensor(a,b) {
    a = t(a); b = t(b);
    var s = a.s.concat(b.s), sa = a.s, sb = b.s;
    var ret;
    if(typeof a.y === "undefined" && typeof b.y === "undefined") {
        return (function () {
            var ca = 0, cb = 0, cr = 0, ax = a.x, bx = b.x, rx = [];
            function f1(k) {
                function f2(k) {
                    if(k===sb.length) {
                        rx[cr] = ax[ca]*bx[cb];
                        cb++;
                        cr++;
                        return;
                    }
                    var i;
                    for(i=0;i<sb[k];i++) { f2(k+1); }
                }
                if(k===sa.length) {
                    cb = 0;
                    f2(0);
                    ca++;
                } else {
                    var i;
                    for(i=0;i<sa[k];i++) { f1(k+1); }
                }
            }
            f1(0);
            return mkT(s,rx);
        }());
    }
    var ra = real(a), ia = imag(a), rb = real(b), ib = imag(b), rr, ir;
    rr = sub(tensor(ra,rb),tensor(ia,ib));
    ir = add(tensor(ra,ib),tensor(ia,rb));
    return mkT(rr.s,rr.x,ir.x);
}
my.tensor = tensor;

/**
 * QR decomposition.
 * 
 * @example
> A = [[1,2,3],[4,5,6],[7,8,3]]; qr = numeric.QR(A); numeric.round(numeric.mul(1e6,numeric.sub(numeric.dot(qr.Q,qr.R),A)));
t([[0,0,0],[0,0,0],[0,0,0]])
> A = numeric.random(10,10); qr = numeric.QR(A); numeric.round(numeric.mul(1e6,numeric.sub(numeric.dot(qr.Q,qr.R),A)));
t([[0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0]])
 * @param A
 * @returns
 */
function QR(A) {
    var Q = M(copy(A)), m = Q.s[0], n = Q.s[1], R = rep(n,Q.s[1],0);
    var i,j,foo,bar;
    for(i=0;i<n;i++) {
        foo = Q(null,i);
        for(j=0;j<i;j++) {
            bar = dot(foo,conj(Q(null,j)));
            R(j,i,bar);
            foo = sub(foo,mul(bar,Q(null,j)));
        }
        bar = norm2(foo);
        R(i,i,bar);
        Q(null,i,div(foo,bar));
    }
    return {Q:Q, R:R};
}
my.QR = QR;
