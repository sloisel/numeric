/*
 * Some more correctness tests
<pre>
> Q = [[22,19,0],[19,66,42],[0,42,54]]; A = [[119,185,7],[191,37,133],[86,53,85],[138,158,89],[150,97,121],[86,152,12],[130,78,63],[22,54,153]]; c = [-1765,-2757,-1302]; b = [-11025,-15883,-8037,-13207,-13673,-8328,-11137,-4591]; x = [-70.0000,-14.0000,-15.0000]; x1 = numeric.QP(Q,c,A,b); numeric.round(numeric.mul(1000,numeric.sub(x,x1)));
t([0,0,0])
> Q = [[87,-11,61,54],[-11,44,3,-7],[61,3,111,74],[54,-7,74,53]]; A = [[43,33,31,59],[50,123,76,90],[177,196,32,84],[139,34,150,71],[110,51,172,111],[37,79,69,147],[42,15,136,84],[15,135,58,85],[181,80,105,25],[140,195,165,5],[110,80,118,57],[62,123,66,63]]; c = [-12767,-3422,-17977,-12165]; b = [-11693,-26482,-37454,-29875,-33541,-23421,-20944,-23397,-30671,-43705,-28711,-25065]; x = [-55.4631,-130.8364,-103.9239,-29.9804]; x1 = numeric.QP(Q,c,A,b); numeric.round(numeric.mul(1000,numeric.sub(x,x1)));
t([0,0,0,0])
</pre>
 */
/**
 * Minimizes 0.5*x'Qx + c'x subject to Ax <= b.
 * 
 * @example
> numeric.QP([[1,0],[0,2]],[-1,-2],[[1,1]],[2])
t([1,1])
 */
function QP(Q,c,A,b,maxit) {

    function simplex(A,b,c,basis,maxiter,pairs) {
        A = M(R(t(A))); b = V(R(t(b))); c = V(R(t(c))); basis = V(R(t(basis)));
        var count,i,j,k,m=A.s[0],n=A.s[1],foo, all = run(m), idx, z = rep(m-1,0);
        if(m!== b.s[0] || n !== c.s[0]) { throw new Error("simplex: internal error"); }
        // Pricing out
        for(k=0;k<basis.x.length;k++) {
            j = basis.x[k];
            c = sub(c,mul(c(j),A(k,null)));
            c(j,0);
        }
        for(count=0;count<maxiter;count++) {
            for(j=0;j<n;j++) { if(c(j).x[0]>0 && basis.x.indexOf(pairs.x[j]) === -1) break; }
            if(j === n) {
                return {A:A, b:b, c:c, basis:basis}; 
            }
            k = -1;
            foo = Infinity;
            for(i=0;i<m;i++) {
                if(A(i,j).x[0] > 0 && b(i).x[0]/A(i,j).x[0] < foo) {
                    k = i;
                    foo = b(i).x[0]/A(i,j).x[0];
                }
            }
            if(foo === Infinity) { throw new Error("simplex: minimum is -Infinity"); }
            i = k;
            basis(i,j);
            b(i,div(b(i),A(i,j)));
            A(i,null,div(A(i,null),A(i,j)));
            idx = setDiff(all,[i]);
            b(idx,sub(b(idx),mul(A(idx,j),b(i))));
            for(k=0;k<m;k++) {
                if(k===i) { continue; }
                A(k,null,sub(A(k,null),mul(A(i,null),A(k,j))));
                A(k,j,0);
            }
            c = sub(c,mul(c(j),A(i,null)));
            c(j,0);
        }
        throw new Error("simplex: maximum iteration count reached");
    }

    function solution(sol) {
        var b = sol.b, basis = sol.basis;
        var n = sol.A.s[1], ret = rep(n,0),i;
        ret(basis,b);
        return ret;
    }

    function phase1(Q,A,b,c,maxit) {
        var m = A.s[0], n = Q.s[0], i;
        var X = block([2,4],Q,transpose(A),diag(rep(n,-1)),rep(n,m,0),
                            A,rep(m,m,0)  ,rep(m,n,0)     ,diag(rep(m,1)));
        var b1 = block([2],neg(c),b);
        var p = X.s[0], q = X.s[1];
        var c1 = block([2],rep(q,0),rep(n+m,-1));
        for(i=0;i<m+n;i++) {
            if(b1(i).x[0]<0) {
                b1(i,neg(b1(i)));
                X(i,null,neg(X(i,null)));
            }
        }
        var X1 = block([1,2],X,diag(rep(n+m,1)));
        var pairs = block([5],run(n+m,2*n+m),run(2*n+m,2*n+2*m),run(0,n),run(n,n+m),rep(n+m,-1));
        var foo = simplex(X1,b1,c1,run(X.s[1],X.s[1]+n+m),maxit,pairs);
        return solution(foo);
    }

    Q = M(R(t(Q))); A = M(R(t(A))); b = V(R(t(b))); c = V(R(t(c)));
    var m = A.s[0], n = Q.s[0];
    if(m!==b.s[0] || n!==A.s[1] || n!==Q.s[1] || n!==c.s[0])
    { throw new Error("QP: Q, A, b, c must have matching sizes"); }
    if(typeof maxit === "undefined") { maxit = 10000; }
    var I = diag(rep(n,1));
    var Q1 = block([2,2],Q,neg(Q),neg(Q),Q);
    var c1 = block([2],c,neg(c));
    var A1 = block([1,2],A,neg(A));
    var p = Q1.s[0];
    var Q2 = block([2,2],Q1,rep(p,m,0),rep(m,p,0),rep(m,m,0));
    var c2 = block([2],c1,rep(m,0));
    var A2 = block([1,2],A1,diag(rep(m,1)));
    var bar = phase1(Q2,A2,b,c2,maxit);
    return sub(bar(run(n)),bar(run(n,2*n)));
}
my.QP = QP;


