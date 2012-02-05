numeric.Sparse = function Sparse(p,v) { this.p = p; this.v = v; }
numeric.Sparse.scatter = function scatter(i,j,z) {
    var n = numeric.sup(j)+1,m=i.length,jk;
    var p = Array(n),v = Array(n),k;
    for(k=n-1;k!==-1;--k) { p[k] = []; v[k] = []; }
    for(k=0;k!==m;++k) {
        jk = j[k];
        p[jk].push(i[k]);
        v[jk].push(z[k]);
    }
    return new numeric.Sparse(p,v);
}
numeric.Sparse.identity = function identity(n) {
    return numeric.Sparse.scatter(numeric.linspace(0,n-1),numeric.linspace(0,n-1),numeric.rep([n],1));
}
numeric.Sparse.prototype.dim = function dim() {
    var m = 0, i,j,p=this.p,k=p.length,pi,a,b;
    for(i=k-1;i!==-1;--i) {
        pi = p[i];
        a = pi.length;
        for(j=a-1;j!==-1;--j) {
            b = pi[j];
            if(b>m) m = b;
        }
    }
    return [m+1,p.length];
}
numeric.Sparse.prototype.Lsolve = function Lsolve(b,n) {
    if(typeof n === "undefined") { n = b.length; }
    var i,j,k,ret = Array(n), p = this.p, v = this.v, pj,vj,m;
    for(i=0;i<n;++i) { ret[i] = b[i]; }
    for(j=0;j<n;++j) {
        if(ret[j]) {
            pj = p[j];
            vj = v[j];
            m = pj.length;
            for(k=0;k<m;++k) {
                i = pj[k];
                if(i === j) { ret[i] /= vj[k]; break; }
            }
            for(k=0;k<m;++k) {
                i = pj[k];
                if(i>j && i<n) {
                    ret[i] -= vj[k]*ret[j];
                }
            }
        }
    }
    return ret;
}
numeric.Sparse.prototype.LU = function LU() {
    var p = this.p, v = this.v, pj, vj, n = p.length,m;
    var i,j,k, L = numeric.Sparse.identity(n), Up = Array(n), Uv = Array(n),uj,t,Lpj,Lvj;
    var foo = Array(n);
    for(j=0;j<n;++j) {
        pj = p[j];
        vj = v[j];
        m = pj.length;
        t = numeric.rep([n-j],0);
        for(k=0;k<m;k++) {
            i = pj[k];
            if(i>=j) t[i-j] = vj[k];
        }
        if(j!==0) {
            for(k=n-1;k!==-1;--k) foo[k] = 0;
            for(k=0;k<m;++k) {
                i = pj[k];
                if(i<j) foo[i] = vj[k];
            }
            uj = L.Lsolve(foo,j);
            var a,b,c,Lpb,Lvb;
            for(b=j-1;b!==-1;--b) {
                Lpb = L.p[b];
                Lvb = L.v[b];
                m = Lpb.length;
                for(c=m-1;c!==-1;--c) {
                    a = Lpb[c];
                    if(b < a) t[a-j] -= Lvb[c]*uj[b];
                }
            }
        } else uj = [];
        Up[j] = []; Uv[j] = [];
        for(i=0;i<uj.length;++i) {
            if(uj[i]) { Up[j].push(i); Uv[j].push(uj[i]); }
        }
        Up[j].push(i); Uv[j].push(t[0]);
        Lpj = [j];
        Lvj = [1];
        for(i=1;i<t.length;++i) {
            if(t[i]) { Lpj.push(j+i); Lvj.push(t[i]/t[0]); }
        }
        L.p[j] = Lpj;
        L.v[j] = Lvj;
    }
    return {L:L, U:new numeric.Sparse(Up,Uv)};
}
numeric.Sparse.prototype.dotV = function dotV(x) {
    var p = this.p, v = this.v, m = (this.dim())[0], n = x.length,xj;
    var i,j,k,pj,vj,a, ret = numeric.rep([m],0);
    for(j=0;j<n;++j) {
        pj = p[j];
        vj = v[j];
        a = pj.length;
        xj = x[j];
        for(k=a-1;k!==-1;--k) {
            ret[pj[k]] += vj[k]*xj;
        }
    }
    return ret;
}
numeric.Sparse.prototype.dotM = function dotM(A) {
    var u,v,n = A.p.length, m = (A.dim())[1],Api,Avi,a;
    var i,j,k;
    var Rp = Array(n), Rv = Array(n);
    for(i=0;i<n;++i) {
        u = numeric.rep([m],0);
        Api = A.p[i];
        Avi = A.v[i];
        a = Api.length;
        for(k=0;k<a;++k) u[Api[k]] = Avi[k];
        v = this.dotV(u);
        Api = [];
        Avi = [];
        for(j=0;j<m;++j) {
            if(v[j]) { Api.push(j); Avi.push(v[j]); }
        }
        Rp[i] = Api;
        Rv[i] = Avi;
    }
    return new numeric.Sparse(Rp,Rv);
}
numeric.Sparse.prototype.dot = function dot(z) {
    if(z instanceof numeric.Sparse) return this.dotM(z);
    return this.dotV(z);
}

