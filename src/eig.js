var maxit = 10000;
function qrit0(x) {
    var qs = [], q, n = x.s[0],i,k, foo, idx, i0 = [0], i1 = [n];
    x = copy(x);
    for(i=n;i>1;i--) {
        q = diag(rep(i,1));
        for(k=0;k<maxit;k++) {
            foo = qrstep(x,q);
            x = foo[0];
            q = foo[1];
            if(abs(x(i-1,i-2)).x[0] <= epsilon * (abs(x(i-1,i-1)).x[0]+abs(x(i-2,i-2)).x[0]))
            { 
                i0[n-i+1] = i0[n-i];
                i1[n-i+1] = i1[n-i]-1;
                idx = run(i-1);
                x = x(idx,idx);
                break;
            }
            if(abs(x(1,0)).x[0] <= epsilon * (abs(x(0,0)).x[0]+abs(x(1,1)).x[0]))
            { 
                i0[n-i+1] = i0[n-i]+1;
                i1[n-i+1] = i1[n-i];
                idx = run(1,i);
                x = x(idx,idx);
                break;
            }
        }
        if(k === maxit) { throw new Error("eig: reached maximum iteration count"); }
        qs[n-i] = q;
    }
    q = qs[0];
    for(i=1;i<qs.length;i++) {
        var idx = run(i0[i],i1[i]);
        set(q,idx,null,dot(qs[i],q(idx,null)));
    }
    return q;
}
function qrit(x) {
    var qs = [], q, n = x.s[0],i,k, foo,q1,q2,i1,i2;
    q = diag(rep(n,1));
    if(n === 1) { return q; }
    x = copy(x);
    for(k=0;k<maxit;k++) {
        for(i=0;i<n-1;i++) {
            if(abs(x(i+1,i)).x[0] <= epsilon * (abs(x(i,i)).x[0]+abs(x(i+1,i+1)).x[0])) { 
                i1 = run(i+1);
                i2 = run(i+1,n);
                q1 = qrit(x(i1,i1));
                q2 = qrit(x(i2,i2));
                set(q,i1,null,dot(q1,q(i1,null)));
                set(q,i2,null,dot(q2,q(i2,null)));
                return q;
            }
        }
        foo = qrstep(x,q);
        x = foo[0];
        q = foo[1];
    }
    if(k === maxit) { throw new Error("eig: reached maximum iteration count"); }
    qs[n-i] = q;
    return q;
}
function ev(U) {
    var n = U.s[0], i, U0, idx, ret = diag(rep(n,1)),b,v,nv;
    for(i=1;i<n;i++) {
        idx = run(i);
        U0 = sub(U(idx,idx),diag(rep(i,U(i,i))));
        b = neg(U(idx,i));
        v = Usolve(U0,b);
        nv = sqrt(add(dot(v,conj(v)),1));
        set(ret,idx,i,div(v,nv));
        set(ret,i,i,div(1,nv));
    }
    return ret;
}
/**
     * Eigenvalues and eigenvectors of a matrix.
     * 
     *  @example
> A = numeric.t([[1,2,3],[4,5,6],[7,8,7]]); foo = numeric.eig(A); 
{d:t([15.02,-0.2217,-1.802]),
 v:t([[0.2488,  0.5956, -0.5718],
      [0.5686, -0.7589, -0.3273],
      [0.7841,  0.2634,  0.7523]])}
     */
function eig(x) {
    x = M(t(x));
    if(x.s[0]!==x.s[1]){ throw new Error("eig: matrix must be square"); }
    var y = copy(x);
    var foo = qrstep(y,diag(rep(x.s[0],1)));
    var q = qrit(foo[0]);
    q = dot(q,foo[1]);
    var d = dot(dot(q,x),conj(transpose(q)));
    return {d:getDiag(d),v:dot(conj(transpose(q)),ev(d))};
}
expo(eig);

